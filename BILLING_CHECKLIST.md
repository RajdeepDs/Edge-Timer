# Billing & Monetization - Testing Checklist

## ✅ Pre-Deployment Verification

### Files Created
- [ ] `app/routes/api.billing.subscribe.tsx`
- [ ] `app/routes/webhooks.app_subscriptions.update.tsx`
- [ ] `app/utils/plan-check.server.ts`
- [ ] `app/utils/timer/plan-validator.server.ts`
- [ ] `app/config/billing.ts`
- [ ] `app/components/billing/upgrade-banner.tsx`
- [ ] `app/components/billing/usage-indicator.tsx`
- [ ] `app/docs/BILLING.md`

### Files Updated
- [ ] `app/routes/_layout.plans.tsx` - Added loader and billing actions
- [ ] `app/components/plans/plan-card.tsx` - Added subscribe functionality
- [ ] `shopify.app.toml` - Added webhook subscription

### Database
- [ ] Migration created: `20260130154954_add_billing_fields`
- [ ] Migration applied successfully
- [ ] Shop model has all billing fields

---

## 🧪 Development Testing

### 1. Subscription Creation Flow

#### Monthly Subscription
- [ ] Navigate to `/plans` page
- [ ] Select "Billed Monthly" option
- [ ] Click "Start FREE 7-day trial" on Starter plan
- [ ] Verify redirect to Shopify billing page
- [ ] Confirm subscription in Shopify
- [ ] Verify redirect back to `/plans?success=true&plan=starter`
- [ ] Check success banner appears
- [ ] Verify database: `Shop.currentPlan = "starter"`
- [ ] Verify database: `Shop.trialEndsAt` is 7 days from now
- [ ] Verify database: `Shop.subscriptionId` is populated

#### Annual Subscription
- [ ] Select "Billed Yearly - Save 20%" option
- [ ] Click "Start FREE 7-day trial" on Essential plan
- [ ] Verify pricing shows annual amount
- [ ] Complete subscription flow
- [ ] Verify correct annual pricing charged

### 2. Webhook Processing

#### Subscription Activated
- [ ] Trigger `app_subscriptions/update` webhook with status `ACTIVE`
- [ ] Verify `Shop.billingStatus = "active"`
- [ ] Verify `Shop.currentPlan` matches subscription
- [ ] Check console logs for success message

#### Subscription Cancelled
- [ ] Cancel subscription in Shopify admin
- [ ] Verify webhook received
- [ ] Verify `Shop.billingStatus = "cancelled"`
- [ ] Verify `Shop.currentPlan = "free"` (downgraded)
- [ ] Check console logs

#### Subscription Frozen
- [ ] Trigger webhook with status `FROZEN`
- [ ] Verify `Shop.billingStatus = "paused"`
- [ ] Verify plan remains unchanged

### 3. Plan Enforcement

#### View Limits
- [ ] Free plan: Verify 1,000 view limit
  ```typescript
  // In your code
  const limit = getPlanViewLimit("free");
  console.log(limit); // Should be 1000
  ```
- [ ] Starter plan: Verify 10,000 view limit
- [ ] Essential plan: Verify 50,000 view limit
- [ ] Professional plan: Verify unlimited (-1)

#### Feature Access - Free Plan
- [ ] ✅ Can create product-page timers
- [ ] ✅ Can create top-bottom-bar timers
- [ ] ❌ Cannot create landing-page timers
- [ ] ❌ Cannot create cart-page timers
- [ ] ❌ Cannot use scheduled timers
- [ ] ❌ Cannot use recurring timers
- [ ] ❌ Cannot use geolocation
- [ ] ❌ Cannot use product tags

#### Feature Access - Starter Plan
- [ ] ✅ Can create landing-page timers
- [ ] ✅ Can use scheduled timers
- [ ] ✅ Can use recurring timers
- [ ] ❌ Cannot create cart-page timers
- [ ] ❌ Cannot use geolocation
- [ ] ❌ Cannot use product tags

#### Feature Access - Essential Plan
- [ ] ✅ Can create all timer types
- [ ] ✅ Can use geolocation
- [ ] ✅ Can use product tags
- [ ] Monthly view limit: 50,000

#### Feature Access - Professional Plan
- [ ] ✅ Can create all timer types
- [ ] ✅ Unlimited views
- [ ] ✅ All features unlocked

### 4. Timer Validation

#### Create Timer with Restrictions
```typescript
// Test in your timer creation route
const validation = await validateTimerCreation("example.myshopify.com", {
  type: "landing-page",
  isRecurring: true,
  geolocation: "specific-countries",
});
```

- [ ] Free plan → landing-page = error
- [ ] Free plan → recurring = error
- [ ] Free plan → geolocation = error
- [ ] Starter plan → landing-page = success
- [ ] Starter plan → cart-page = error
- [ ] Essential plan → all features = success

#### Publish Timer Checks
- [ ] Cannot publish when view limit exceeded
- [ ] Cannot publish restricted timer type
- [ ] Can publish when all validations pass

### 5. UI Components

#### Plans Page
- [ ] Current plan shows correctly
- [ ] Usage progress bar displays
- [ ] Trial status shows if active
- [ ] Monthly/Annual toggle works
- [ ] Current plan button is disabled
- [ ] Downgrade buttons are disabled
- [ ] Subscribe button shows loading state
- [ ] Success banner appears after subscription

#### Usage Indicator
- [ ] Shows current usage / limit
- [ ] Progress bar fills correctly
- [ ] Shows warning at 80% usage
- [ ] Shows critical at 100% usage
- [ ] Handles unlimited plans (∞)
- [ ] Upgrade prompt appears when needed

#### Upgrade Banner
- [ ] Displays warning tone
- [ ] Navigate to /plans on button click
- [ ] Dismissible when onDismiss provided
- [ ] Shows recommended plan

### 6. Error Handling

#### Subscription Errors
- [ ] Invalid plan ID → 400 error
- [ ] Missing billing cycle → 400 error
- [ ] GraphQL errors → logged and returned
- [ ] Network errors → handled gracefully

#### Webhook Errors
- [ ] Invalid payload → logged, returns 200
- [ ] Missing shop → logged, returns 200
- [ ] Database errors → logged, returns 200

#### Validation Errors
- [ ] Feature not available → clear error message
- [ ] View limit exceeded → upgrade prompt
- [ ] Multiple errors → all listed

---

## 🚀 Pre-Production Checklist

### Configuration
- [ ] Set `NODE_ENV=production`
- [ ] Verify `SHOPIFY_APP_URL` is correct
- [ ] Check database connection
- [ ] Verify webhook URLs are accessible

### Security
- [ ] Webhooks use HMAC validation ✓ (built-in)
- [ ] API routes require authentication ✓
- [ ] No API keys in code ✓
- [ ] Rate limiting considered

### Monitoring
- [ ] Console logging in place
- [ ] Error tracking setup
- [ ] Usage metrics tracking
- [ ] Subscription event logging

### Documentation
- [ ] `BILLING.md` complete
- [ ] `PHASE_3_IMPLEMENTATION.md` reviewed
- [ ] Code comments added
- [ ] Team briefed on billing flow

---

## 📊 Metrics to Track

### Conversion Metrics
- [ ] Free → Paid conversion rate
- [ ] Trial → Active subscription rate
- [ ] Plan upgrade rate
- [ ] Churn rate

### Usage Metrics
- [ ] Average views per plan
- [ ] View limit breach frequency
- [ ] Feature adoption rates
- [ ] Popular plan tier

### Revenue Metrics
- [ ] MRR (Monthly Recurring Revenue)
- [ ] ARR (Annual Recurring Revenue)
- [ ] ARPU (Average Revenue Per User)
- [ ] LTV (Lifetime Value)

---

## 🐛 Troubleshooting Guide

### Subscription Not Activating
**Symptoms:** User pays but plan doesn't update

**Checks:**
- [ ] Webhook registered in Shopify admin
- [ ] Webhook endpoint accessible (no firewall)
- [ ] Check webhook delivery logs in Shopify
- [ ] Verify database was updated
- [ ] Check console logs for errors

**Solution:**
```typescript
// Manually verify subscription
const shop = await db.shop.findUnique({
  where: { shopDomain: "example.myshopify.com" }
});
console.log(shop.currentPlan, shop.subscriptionId, shop.billingStatus);
```

### Features Not Unlocking
**Symptoms:** Premium features still locked after upgrade

**Checks:**
- [ ] `Shop.currentPlan` matches expected plan
- [ ] `Shop.billingStatus = "active"`
- [ ] Cache cleared (if using)
- [ ] User refreshed page

**Solution:**
```typescript
// Force plan update
await db.shop.update({
  where: { shopDomain: "example.myshopify.com" },
  data: { currentPlan: "essential", billingStatus: "active" }
});
```

### View Limit Not Resetting
**Symptoms:** Monthly views don't reset

**Checks:**
- [ ] `Shop.viewsResetAt` date passed
- [ ] Cron job running
- [ ] Manual reset function works

**Solution:**
```typescript
import { resetMonthlyViews } from "~/utils/shop.server";
await resetMonthlyViews("example.myshopify.com");
```

### Webhook Not Firing
**Symptoms:** No webhook received after subscription change

**Checks:**
- [ ] Webhook registered: `shopify app deploy`
- [ ] Check Shopify admin webhooks page
- [ ] Verify webhook URL is HTTPS
- [ ] Check webhook delivery history

**Solution:**
```bash
# Re-register webhooks
shopify app deploy

# Check webhook registration
shopify webhooks list
```

---

## 📝 Test Scenarios

### Scenario 1: New User Journey
1. Install app (Free plan)
2. Create 2 product timers (allowed)
3. Try to create landing page timer (blocked)
4. See upgrade prompt
5. Navigate to /plans
6. Subscribe to Starter
7. Complete trial
8. Create landing page timer (allowed)

### Scenario 2: Power User Upgrade
1. Start on Starter plan
2. Use recurring timers
3. Approach 10,000 view limit
4. See 80% warning
5. Hit view limit
6. Cannot publish new timers
7. Upgrade to Essential
8. Limit increased to 50,000
9. Can publish again

### Scenario 3: Subscription Cancellation
1. Active on Essential plan
2. Cancel subscription
3. Webhook fires
4. Plan downgrades to Free
5. Premium features locked
6. Existing timers unpublished (optional)
7. Data retained

### Scenario 4: Trial Experience
1. Start 7-day trial
2. Trial banner shows days remaining
3. Access all trial features
4. Trial expires
5. Billing starts automatically
6. Features remain active
7. No interruption

---

## ✨ Success Criteria

- [ ] All subscription flows work end-to-end
- [ ] Webhooks process correctly
- [ ] Feature access enforced properly
- [ ] View limits tracked accurately
- [ ] UI shows correct plan status
- [ ] Error handling is robust
- [ ] Documentation is complete
- [ ] No TypeScript errors
- [ ] No console errors in browser
- [ ] Performance is acceptable (<2s for subscription)

---

## 🎯 Launch Day Checklist

- [ ] All tests passing
- [ ] Production environment configured
- [ ] Webhooks verified in production
- [ ] Test subscription created and verified
- [ ] Support team briefed
- [ ] Rollback plan ready
- [ ] Monitoring dashboard active
- [ ] Analytics tracking enabled

---

**Ready to go live? Make sure all checkboxes are ticked! ✅**