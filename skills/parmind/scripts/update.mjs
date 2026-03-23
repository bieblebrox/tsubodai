#!/usr/bin/env node
/**
 * Parmind skill self-updater
 *
 * Downloads the latest CLI bundle (and SKILL.md if present) from the GitHub
 * release at NebulaeSoft/sirius @ parmind-skill/dev-latest and replaces local
 * files in-place. Writes a version.json to record what was installed.
 *
 * Usage (from the OpenClaw workspace root):
 *   node skills/parmind/scripts/update.mjs
 *
 * Requires: GITHUB_TOKEN env var — a GitHub PAT with read access to
 * NebulaeSoft/sirius. Add it to the parmind skill env in openclaw.json.
 */

import { chmod, rename, writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SKILL_DIR = join(__dirname, '..');

const REPO  = 'NebulaeSoft/sirius';
const TAG   = 'parmind-skill/dev-latest';

// Release asset filename → local path relative to skill root.
// Add entries here when new assets are added to the release.
const ASSET_MAP = {
  'parmind-cli.mjs':   'scripts/parmind-cli.mjs',
  'require-shim.cjs':  'scripts/require-shim.cjs',
  'SKILL.md':          'SKILL.md',
};

function apiHeaders() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error('GITHUB_TOKEN env var is not set. Add it to the parmind skill env in openclaw.json.');
  return {
    Authorization:          `Bearer ${token}`,
    Accept:                 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent':           'parmind-skill-updater/1.0',
  };
}

async function fetchJSON(url) {
  const res = await fetch(url, { headers: apiHeaders() });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`GitHub API ${res.status} at ${url}: ${body}`);
  }
  return res.json();
}

async function downloadAsset(asset) {
  const res = await fetch(asset.url, {
    headers: { ...apiHeaders(), Accept: 'application/octet-stream' },
    redirect: 'follow',
  });
  if (!res.ok) throw new Error(`Download failed for ${asset.name}: HTTP ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

async function main() {
  const encodedTag = TAG.replace(/\//g, '%2F');
  const apiUrl = `https://api.github.com/repos/${REPO}/releases/tags/${encodedTag}`;

  process.stdout.write(`Fetching release: ${TAG}\n`);
  const release = await fetchJSON(apiUrl);
  process.stdout.write(`  Release: ${release.name || release.tag_name} (${release.published_at})\n`);
  process.stdout.write(`  Assets:  ${release.assets.map(a => a.name).join(', ')}\n\n`);

  const updated = [];

  for (const asset of release.assets) {
    const localRelPath = ASSET_MAP[asset.name];
    if (!localRelPath) {
      process.stdout.write(`  skip    ${asset.name} (not in ASSET_MAP)\n`);
      continue;
    }

    const destPath = join(SKILL_DIR, localRelPath);
    const tmpPath  = destPath + '.tmp';

    process.stdout.write(`  update  ${asset.name} → ${localRelPath}\n`);
    const data = await downloadAsset(asset);
    await writeFile(tmpPath, data);
    await rename(tmpPath, destPath);

    if (destPath.endsWith('.mjs') || destPath.endsWith('.sh')) {
      await chmod(destPath, 0o755);
    }

    updated.push(asset.name);
  }

  if (updated.length === 0) {
    throw new Error(
      'No recognised assets found in the release. ' +
      'Check that ASSET_MAP entries match the actual asset filenames in the GitHub release.'
    );
  }

  const versionInfo = {
    repo:         REPO,
    tag:          release.tag_name,
    releaseName:  release.name || release.tag_name,
    publishedAt:  release.published_at,
    updatedAt:    new Date().toISOString(),
    updatedFiles: updated,
  };

  await writeFile(
    join(SKILL_DIR, 'version.json'),
    JSON.stringify(versionInfo, null, 2) + '\n'
  );

  process.stdout.write(`\nDone. Updated: ${updated.join(', ')}\n`);
  process.stdout.write(JSON.stringify(versionInfo) + '\n');
}

main().catch(err => {
  process.stderr.write(`Error: ${err.message}\n`);
  process.exit(1);
});
