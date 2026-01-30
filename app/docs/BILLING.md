# Billing & Monetization System

## Overview

This document describes the billing and monetization system for the Urgency Timer Shopify app. The system includes subscription management, plan enforcement, and usage tracking.

## Architecture

### Components

1. **Billing API** (`app/routes/api.billing.subscribe.tsx`)
   - Handles subscription creation
   - Redirects to Shopify billing confirmation
   - Updates shop plan status

2. **Webhook Handler** (`app/routes/webhooks.app_subscriptions.update.tsx`)
   - Processes subscription status changes
   - Updates billing status in database
   - Handles trial periods

3. **Plan Enforcement** (`app/utils/plan-check.server.ts`)
   - Validates feature access
   - Checks view limits
   - Enforces plan restrictions

4. **Timer Validation** (`app/utils/timer/plan-validator.server.ts`)
   - Validates timer creation against plans
   - Provides upgrade prompts
   - Checks publishing permissions

## Plan Tiers

### Free Plan
- **Price**: $0
- **Monthly Views**: 1,000
- **Features**:
  - Unlimited product page timers
  - Unlimited top/bottom bar timers

### Starter Plan
- **Price**: $6.99/month or $67.08/year (save 20%)
- **Monthly Views**: 10,000
- **Features**:
  - Everything in Free
  - Unlimited landing page timers
  - Scheduled timers
  - Recurring timers
- **Trial**: 7 days free

### Essential Plan
- **Price**: $9.99/month or $95.88/year (save 20%)
- **Monthly Views**: 50,000
- **Features**:
  - Everything in Starter
  - Unlimited cart page timers
  - Unlimited email timers
  - Product tag targeting
  - Geolocation targeting
  - Translations
- **Trial**: 7 days free

### Professional Plan
- **Price**: $29.99/month or $287.88/year (save 20%)
- **Monthly Views**: Unlimited
- **Features**:
  - All premium features
  - Unlimited views
- **Trial**: 7 days free

## Implementation Details

### Subscription Flow

1. **User selects plan** on `/plans` page
2. **POST to `/api/billing/subscribe`** with plan details
3. **System validates** plan configuration
4. **Shopify billing API** creates subscription
5. **User redirected** to Shopify confirmation page
6. **User confirms** subscription
7. **Webhook received** at `/webhooks/app_subscriptions/update`
8. **Database updated** with subscription status
9. **User redirected** back to app with success message

### Database Schema

```prisma
model Shop {
  id             String    @id @default(cuid())
  shopDomain     String    @unique
  
  // Plan & Billing
  currentPlan    String    @default("free")
  planStartDate  DateTime  @default(now())
  subscriptionId String?
  
  // Usage Tracking
  monthlyViews   Int       @default(0)
  viewsResetAt   DateTime  @default(now())
  
  // Billing Status
  billingStatus  String    @default("active")
  trialEndsAt    DateTime?
  
  // ... other fields
}
```

### Usage Tracking

Views are tracked in the `Shop.monthlyViews` field:

```typescript
// Increment views
await incrementShopViews(shopDomain);

// Check limit
const exceeded = await hasExceededViewLimit(shopDomain);

// Reset monthly (called by cron job)
await resetMonthlyViews(shopDomain);
```

### Feature Access Control

```typescript
// Check if feature is available
const hasAccess = await hasFeatureAccess(shopDomain, "landingPageTimers");

// Validate timer configuration
const validation = await validateTimerConfig(shopDomain, {
  type: "landing-page",
  isRecurring: true,
  geolocation: "specific-countries"
});

if (!validation.valid) {
  console.log(validation.errors);
}
```

### Plan Limits Configuration

Defined in `app/utils/plan-check.server.ts`:

```typescript
export const PLAN_LIMITS = {
  free: {
    monthlyViews: 1000,
    features: {
      productTimers: true,
      topBarTimers: true,
      landingPageTimers: false,
      // ... other features
    }
  },
  // ... other plans
}
```

## API Endpoints

### POST `/api/billing/subscribe`

Creates a new subscription.

**Request Body**:
```typescript
{
  planId: "starter" | "essential" | "professional",
  billingCycle: "MONTHLY" | "ANNUAL"
}
```

**Response**:
- Redirects to Shopify billing confirmation URL

**Errors**:
- `400`: Invalid plan or already subscribed
- `401`: Unauthorized
- `500`: Server error

### POST `/webhooks/app_subscriptions/update`

Webhook endpoint for subscription updates (Shopify only).

**Payload**:
```typescript
{
  app_subscription: {
    id: string,
    status: "ACTIVE" | "CANCELLED" | "EXPIRED" | "FROZEN" | "PENDING",
    trial_ends_on?: string,
    // ... other fields
  }
}
```

## Webhook Configuration

Register webhooks in `shopify.app.toml`:

```toml
[[webhooks.subscriptions]]
topics = ["app/subscriptions/update"]
uri = "/webhooks/app_subscriptions/update"
```

## Testing

### Development Mode

Set `NODE_ENV=development` to enable test charges:

```typescript
const billingResponse = await billing.request({
  plan: planId,
  isTest: process.env.NODE_ENV === "development",
  returnUrl: "..."
});
```

### Test Scenarios

1. **Free to Paid Upgrade**
   - Select Starter plan
   - Confirm subscription
   - Verify trial period activated
   - Verify features unlocked

2. **Plan Upgrade**
   - From Starter to Essential
   - Verify immediate access to new features
   - Verify view limit increased

3. **Subscription Cancellation**
   - Cancel via Shopify admin
   - Webhook fires
   - Plan downgraded to Free
   - Features locked

4. **Trial Expiration**
   - Wait for trial to end
   - Verify billing starts
   - Verify features remain active

5. **View Limit Exceeded**
   - Reach monthly limit
   - Verify timers still show (cached)
   - Verify new timers can't be published
   - Verify upgrade prompt shown

## Security Considerations

1. **Webhook Validation**: All webhooks are authenticated via Shopify's HMAC validation
2. **Plan Enforcement**: Server-side validation on all timer operations
3. **Subscription Verification**: Double-check billing status before granting access
4. **Test Mode**: Only enabled in development environment

## Error Handling

### Subscription Creation Errors

```typescript
try {
  await billing.request({ ... });
} catch (error) {
  // Log error
  console.error("Billing error:", error);
  
  // Return user-friendly message
  return json({ 
    error: "Failed to create subscription. Please try again." 
  }, { status: 500 });
}
```

### Webhook Processing Errors

```typescript
try {
  await processSubscriptionUpdate(payload);
} catch (error) {
  console.error("Webhook error:", error);
  
  // Return 200 to prevent retries
  return new Response(null, { status: 200 });
}
```

## Monitoring & Analytics

### Key Metrics to Track

1. **Conversion Rate**: Free → Paid subscriptions
2. **Trial Conversion**: Trial → Active subscriptions
3. **Churn Rate**: Cancellations per month
4. **Upgrade Rate**: Plan upgrades
5. **View Usage**: Average views per plan tier
6. **Feature Adoption**: Usage of premium features

### Logging

Important events to log:

```typescript
// Subscription created
console.log(`Subscription created: ${shop} - ${planId}`);

// Subscription updated
console.log(`Subscription ${status}: ${shop} - ${planId}`);

// View limit reached
console.log(`View limit reached: ${shop} - ${plan}`);

// Feature access denied
console.log(`Feature denied: ${shop} - ${feature} - ${plan}`);
```

## Future Enhancements

1. **Usage-Based Pricing**: Charge based on actual views
2. **Custom Plans**: Enterprise plans with custom limits
3. **Add-ons**: Purchase additional views or features
4. **Promotions**: Discount codes and special offers
5. **Grandfathering**: Protect existing users from price changes
6. **Grace Period**: Allow temporary overage
7. **Analytics Dashboard**: Show usage trends and predictions

## Support & Troubleshooting

### Common Issues

**Issue**: Subscription not activating after payment
- **Check**: Webhook received and processed
- **Check**: Database updated
- **Solution**: Manually verify subscription in Shopify admin

**Issue**: Features not unlocking after upgrade
- **Check**: `Shop.currentPlan` in database
- **Check**: `Shop.billingStatus` is "active"
- **Solution**: Re-process webhook or manually update

**Issue**: View limit not resetting
- **Check**: `Shop.viewsResetAt` date
- **Check**: Cron job running
- **Solution**: Manually call `resetMonthlyViews(shop)`

## Related Files

- `/app/routes/api.billing.subscribe.tsx` - Subscription API
- `/app/routes/webhooks.app_subscriptions.update.tsx` - Webhook handler
- `/app/utils/plan-check.server.ts` - Plan enforcement
- `/app/utils/shop.server.ts` - Shop utilities
- `/app/utils/timer/plan-validator.server.ts` - Timer validation
- `/app/config/billing.ts` - Billing configuration
- `/app/config/plans.ts` - Plan definitions
- `/app/routes/_layout.plans.tsx` - Pricing page
- `/app/components/plans/plan-card.tsx` - Plan card component