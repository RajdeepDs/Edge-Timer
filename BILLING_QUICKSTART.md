# Billing System - Quick Start Guide

## 🚀 Overview

The billing system is now fully implemented! This guide will help you get started quickly.

## ✅ What's Included

- **4 Plan Tiers**: Free, Starter ($6.99), Essential ($9.99), Professional ($29.99)
- **7-Day Free Trial** on all paid plans
- **Monthly & Annual Billing** (save 20% on annual)
- **Automatic Feature Enforcement** based on plan
- **View Limit Tracking** with automatic resets
- **Webhook Integration** for subscription updates

## 🎯 Quick Setup (5 Minutes)

### 1. Deploy & Register Webhooks
```bash
shopify app deploy
```

This registers the `app_subscriptions/update` webhook automatically.

### 2. Verify Webhook Registration
```bash
shopify webhooks list
```

You should see:
- `app/uninstalled`
- `app/scopes_update`
- `app_subscriptions/update` ✨ NEW

### 3. Test in Development
```bash
shopify app dev
```

Navigate to `/plans` in your app to see the pricing page.

## 📋 Testing the Subscription Flow

### Step-by-Step Test

1. **Go to Plans Page**
   - URL: `https://your-app.com/plans`
   - You should see your current plan (Free)

2. **Select a Plan**
   - Choose "Billed Monthly" or "Billed Yearly"
   - Click "Start FREE 7-day trial" on any paid plan

3. **Shopify Billing**
   - You'll be redirected to Shopify's billing confirmation
   - In development, it's a test charge (no real money)
   - Click "Approve" or "Subscribe"

4. **Return to App**
   - You'll be redirected back to `/plans?success=true&plan=starter`
   - Success banner appears
   - Your plan is now active with trial

5. **Verify in Database**
   ```bash
   bunx prisma studio
   ```
   - Open `Shop` table
   - Check: `currentPlan`, `subscriptionId`, `trialEndsAt`

## 🔧 Common Use Cases

### Check if User Can Access Feature

```typescript
import { hasFeatureAccess } from "~/utils/plan-check.server";

// In your loader or action
const canUseLandingPage = await hasFeatureAccess(
  session.shop,
  "landingPageTimers"
);

if (!canUseLandingPage) {
  return json({ error: "Upgrade to Starter to use landing page timers" });
}
```

### Validate Timer Creation

```typescript
import { validateTimerCreation } from "~/utils/timer/plan-validator.server";

const validation = await validateTimerCreation(session.shop, {
  type: "cart-page",
  isRecurring: true,
  geolocation: "specific-countries",
});

if (!validation.valid) {
  return json({ errors: validation.errors }, { status: 400 });
}
```

### Check View Limit

```typescript
import { hasExceededViewLimit } from "~/utils/plan-check.server";

const exceeded = await hasExceededViewLimit(session.shop);

if (exceeded) {
  return json({ error: "Monthly view limit reached. Please upgrade." });
}
```

### Show Usage in UI

```typescript
import UsageIndicator from "~/components/billing/usage-indicator";

// In your component
<UsageIndicator
  currentUsage={shop.monthlyViews}
  limit={viewLimit}
  planName={shop.currentPlan}
  showUpgradePrompt={true}
/>
```

### Show Upgrade Banner

```typescript
import UpgradeBanner from "~/components/billing/upgrade-banner";

{viewLimitExceeded && (
  <UpgradeBanner
    title="Monthly view limit reached"
    message="Upgrade to continue using all features"
    recommendedPlan="Essential"
  />
)}
```

## 📊 Plan Feature Reference

| Feature | Free | Starter | Essential | Pro |
|---------|------|---------|-----------|-----|
| Monthly Views | 1K | 10K | 50K | ∞ |
| Product Timers | ✅ | ✅ | ✅ | ✅ |
| Top Bar | ✅ | ✅ | ✅ | ✅ |
| Landing Page | ❌ | ✅ | ✅ | ✅ |
| Cart Page | ❌ | ❌ | ✅ | ✅ |
| Scheduled | ❌ | ✅ | ✅ | ✅ |
| Recurring | ❌ | ✅ | ✅ | ✅ |
| Geolocation | ❌ | ❌ | ✅ | ✅ |
| Tags | ❌ | ❌ | ✅ | ✅ |

## 🎨 UI Components Locations

```
app/components/
├── billing/
│   ├── upgrade-banner.tsx      # Warning banner for limits
│   └── usage-indicator.tsx     # Usage progress bar
└── plans/
    └── plan-card.tsx           # Plan selection card
```

## 🔗 API Endpoints

### POST `/api/billing/subscribe`
Creates a new subscription.

**Body:**
```json
{
  "planId": "starter",
  "billingCycle": "MONTHLY"
}
```

**Response:** Redirects to Shopify billing confirmation

### POST `/webhooks/app_subscriptions/update`
Webhook for subscription updates (Shopify only).

## 🐛 Troubleshooting

### Subscription Not Working?

1. **Check Webhook Registration**
   ```bash
   shopify webhooks list
   ```

2. **Check Database**
   ```bash
   bunx prisma studio
   ```
   Look at `Shop` table for your test shop

3. **Check Logs**
   Look in terminal for:
   - `Subscription created: ...`
   - `Subscription ACTIVE: ...`

4. **Re-deploy if Needed**
   ```bash
   shopify app deploy
   ```

### Features Not Unlocking?

Check shop's current plan:
```typescript
const shop = await db.shop.findUnique({
  where: { shopDomain: "example.myshopify.com" }
});
console.log(shop.currentPlan, shop.billingStatus);
```

Should show: `{ currentPlan: "starter", billingStatus: "active" }`

### View Limit Issues?

Reset manually if needed:
```typescript
import { resetMonthlyViews } from "~/utils/shop.server";
await resetMonthlyViews("example.myshopify.com");
```

## 📚 Documentation

- **Full Docs**: `app/docs/BILLING.md`
- **Implementation Details**: `PHASE_3_IMPLEMENTATION.md`
- **Testing Checklist**: `BILLING_CHECKLIST.md`

## 🎯 Next Steps

1. ✅ Test subscription flow in development
2. ✅ Verify webhooks are firing
3. ✅ Test all plan tiers
4. ✅ Check feature enforcement
5. ✅ Monitor view limits
6. 🚀 Deploy to production!

## 💡 Pro Tips

1. **Use Test Mode in Development**
   - Set `NODE_ENV=development`
   - Shopify creates test charges (no real billing)

2. **Monitor Usage**
   - Track `Shop.monthlyViews` regularly
   - Set up alerts for limit warnings

3. **Feature Flags**
   - Use `hasFeatureAccess()` everywhere
   - Never trust client-side checks

4. **Error Handling**
   - Always validate before timer creation
   - Show clear upgrade prompts

5. **User Experience**
   - Show trial countdown
   - Warn at 80% usage
   - Make upgrades easy

## 🔥 Quick Commands

```bash
# Start development
shopify app dev

# Deploy to production
shopify app deploy

# Check webhooks
shopify webhooks list

# Open database
bunx prisma studio

# Run migrations
bunx prisma migrate dev

# Check diagnostics
npm run lint
```

## 🎉 You're Ready!

The billing system is production-ready. All you need to do is:
1. Test the subscription flow
2. Deploy to Shopify
3. Start monetizing!

For questions or issues, check the full documentation in `app/docs/BILLING.md`.

---

**Happy Billing! 💰**