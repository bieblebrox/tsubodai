# Picture Notes Pricing Review — March 2026

## Context
- Legacy Android tiers (Bronze £3.95 / 1 GB, Silver £5.49 / 3 GB, Gold £8.65 / 10 GB) stay live only for existing users; no new signups can see those SKUs.
- Free tier remains capped at ~100 MB so new users can trial the UX before they need to pay.
- AI is a native feature now, so every paid plan must include Merlin-powered organisation/search rather than selling it as an add-on.

## New Plan Structure
- **Picture Notes Pro — £6.99/mo (incl. VAT)**
  - 50 GB pooled storage + unlimited uploads
  - Merlin AI: auto tags/captions, semantic Q&A over notes, reminders, HD export, priority support
  - Priced between the old Silver and Gold plans, still < Notion Plus + AI or Evernote Personal.
- **Annual option:** £69.99 (≈2 months free) for better cash flow + lower churn risk.

## Rationale
1. **Simplicity:** Single paid SKU keeps Paywall + entitlement logic clean across Stripe + Google Play.
2. **Value story:** Messaging shifts from “buy more GB” to “unlock the complete Picture Notes experience with AI baked in.”
3. **Margin:** Infra estimate ≈£1.30 (storage + inference) → leaves >£5 gross margin for support + marketing.
4. **Competitive placement:** Under-cuts Notion/Evernote AI bundles while feeling premium vs. Day One-level journaling apps.

## Legacy Handling
- Stripe metadata `plan=legacy-<tier>` so we can grandfather gracefully; Pro SKU is the only one exposed to new buyers.
- Google Play keeps Bronze/Silver/Gold base plans hidden from listings but live for existing tokens. New SKU `picture-notes-pro` unlocks the Pro entitlement via Merlin.
- Merlin service interprets entitlements: `legacy` = current benefits, `pro` = full AI bundle. Provide in-app upsell to migrate legacy users voluntarily (prorated credit via Stripe / Play).

## Next Steps
1. Run quick survey / email pulse to validate £6.99 willingness to pay (target: early March).
2. Update RN paywall copy + visuals to focus on Pro plan benefits and clarify AI is included.
3. Create Stripe + Play products/prices, QA purchase + restore flows (RevenueCat picks up legacy Android subs automatically).
4. Announce to legacy users that nothing changes unless they upgrade; offer a 30-day Pro trial coupon to encourage the move.
