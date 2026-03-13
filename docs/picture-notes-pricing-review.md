# Picture Notes Pricing Review — March 2026

## Objectives
- Keep pricing straightforward so onboarding feels lightweight.
- Preserve all existing storage-based subscriptions (grandfather Bronze/Silver/Gold forever).
- Move all *new* subscribers onto a single plan that already includes native AI features (no toggle).
- Make sure billing plumbing (Stripe + Play Console) can differentiate legacy vs. new entitlements.

## Current State (Legacy Storage Model)
| Plan | Monthly Price | Storage Allocation | Notes |
| --- | --- | --- | --- |
| Free | £0 | First 5 uploads / ~100 MB | No billing relationship; useful for acquisition.
| Bronze | £3.95 | 1 GB | Legacy Android base tier.
| Silver | £5.49 | 3 GB | Same features, only more space.
| Gold | £8.65 | 10 GB | Same features, only more space.

These users stay exactly where they are. We simply don’t expose these SKUs to new signups.

## Design Principles for the New Structure
1. **One paid plan:** AI is native, so the upgrade story must be “unlock the full Picture Notes experience,” not “buy extra modules.”
2. **Fairness:** All existing subscribers retain their plan. If they cancel and rejoin, they land on the new plan.
3. **Value narrative:** Shift the conversation from storage buckets to benefits (auto-organisation, AI recall, richer limits).
4. **Operational simplicity:** Single SKU on each platform + grandfather logic in Merlin.

## Proposed Plan for New Customers
| Plan | Monthly Price (incl. VAT) | Includes | Rationale |
| --- | --- | --- | --- |
| Free | £0 | 100 MB uploads, manual organisation, limited search | Keeps the funnel open; enough runway for users to discover the UI before seeing the upsell.
| Picture Notes Pro | £6.99 | 50 GB pooled storage, unlimited uploads, Merlin AI auto-tags/captions, AI Q&A over notes, reminders, HD export, priority support | Bundles storage + AI, priced between legacy Silver (£5.49) and Gold (£8.65). £6.99 feels premium but still accessible; room for 30–40% gross margin after infra + AI inference cost.

**Annual option:** £69.99 (≈2 months free). Anchors value versus monthly and improves cash flow.

## Legacy Compatibility
- **Stripe:** Flag legacy subs via `metadata.plan=legacy-<tier>`. New checkout flow only exposes the Pro SKU.
- **Google Play:** Keep Bronze/Silver/Gold SKUs for existing play store users, but hide from new listings. Publish `picture-notes-pro` SKU and map entitlement in Merlin.
- **Entitlements:** Merlin service interprets: `legacy` → keep current features; `pro` → unlock AI. If a legacy user wants AI, create an internal migration path (one-click upgrade) that swaps their subscription to Pro with prorated credit.

## Pricing Justification for Bundled AI
- Competitive yardstick: Notion Plus (£8 + £8 for AI), Evernote Personal (€10) with AI as beta, Day One Premium £3 (no AI). Landing at £6.99 positions Picture Notes below premium incumbents while highlighting AI as “built-in,” not a bolt-on.
- Cost model: 50 GB storage ≈ £0.30/mo at scale, inference budget target £1/user/mo (assuming 150 short prompts * £0.006), leaving ~£5.70 gross margin before support/marketing.

## Payment Stack Changes
1. **Stripe:** Create `prod_picture_notes_pro_monthly` + annual price, update Checkout links, configure tax/VAT.
2. **Google Play Billing:** Release new base plan; mark old SKUs as “not available for new buyers.” Ensure RN app handles entitlement updates via BillingClient + Merlin webhook.
3. **Analytics:** Tag cohorts (legacy vs. pro) for revenue reporting.

## Rollout Steps
1. Validate £6.99 positioning with a quick in-app survey / mailing list pulse (target completion: Mar 7).
2. Implement new paywall copy + price table in RN app (Week 2 item from timeline).
3. Configure Stripe + Play SKUs, test entitlements, and QA upgrade/downgrade flows.
4. Announce to legacy users: “Your plan stays the same. Pro unlocks AI + future roadmap.” Encourage voluntary upgrades with a 30-day Pro trial coupon.
