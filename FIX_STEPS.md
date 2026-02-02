# Fix for "Invalid Signature" Error - Step by Step

## Problem Summary

Your Shopify App Proxy is rejecting requests with "Invalid signature" error. This prevents your urgency timer from loading on the storefront.

**Root Cause**: The `SHOPIFY_API_SECRET` environment variable in your Render deployment either:
1. Is not set at all
2. Contains the wrong value
3. Doesn't match your app's API secret key in Shopify Partner Dashboard

---

## Quick Fix (5 minutes)

### Step 1: Get Your API Secret Key

1. Open [Shopify Partner Dashboard](https://partners.shopify.com)
2. Click **Apps** in the left sidebar
3. Find and click **Urgency Timer**
4. Click **Configuration** tab
5. Scroll to **App credentials** section
6. Find **API secret key** (NOT "API key")
7. Click **Show** or **Reveal**
8. **Copy the entire secret key** (it's a long string like `shpss_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)

### Step 2: Set Environment Variable in Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Find your **urgency-timer** web service
3. Click on it to open
4. Click the **Environment** tab on the left
5. Look for `SHOPIFY_API_SECRET`:
   - If it exists: Click **Edit** and paste the new value
   - If it doesn't exist: Click **Add Environment Variable**
     - Key: `SHOPIFY_API_SECRET`
     - Value: Paste the secret key from Step 1
6. Click **Save Changes**

### Step 3: Wait for Deployment

Render will automatically redeploy your app. This takes 2-5 minutes. Wait for the "Live" indicator.

### Step 4: Test

Visit your store and refresh the product page. The timer should now appear!

---

## Verify the Fix (Optional but Recommended)

### Option 1: Use the Debug Endpoint

1. Open your browser
2. Go to: `https://urgency-timer.myshopify.com/apps/urgency-timer/debug`
   (Replace `urgency-timer.myshopify.com` with your actual shop domain)
3. Look for the `status` field at the top
4. Should show: `"status": "✅ VALID"`

If it shows `"status": "❌ INVALID"`, the debug response will tell you exactly what's wrong.

### Option 2: Use the Test Script Locally

1. Open your terminal
2. Navigate to your project: `cd urgency-timer`
3. Run the test with your API secret:
   ```bash
   SHOPIFY_API_SECRET=your_actual_secret_here node test-hmac.cjs
   ```
4. You should see: `✅ SUCCESS! Signatures match!`

If you see `❌ FAILED!`, the secret is still wrong.

---

## Understanding the Error

### What Shopify Signs

When a request comes through Shopify's App Proxy, Shopify adds these parameters and signs them:
- `shop` - Your shop domain
- `timestamp` - Current timestamp
- `logged_in_customer_id` - Customer ID (empty if not logged in)
- `path_prefix` - The proxy path (`/apps/urgency-timer`)
- `signature` - HMAC-SHA256 signature of the above

### What Your App Adds

Your client-side JavaScript adds these parameters (NOT signed by Shopify):
- `productId`
- `pageType`
- `country`
- `collectionIds`
- `productTags`

### The Validation Process

1. Request comes to your server
2. Server extracts ONLY Shopify-signed parameters (ignores your custom ones)
3. Server sorts them alphabetically
4. Server creates message: `logged_in_customer_id=&path_prefix=/apps/urgency-timer&shop=urgency-timer.myshopify.com&timestamp=1770043503`
5. Server computes HMAC-SHA256 using `SHOPIFY_API_SECRET`
6. Server compares computed signature with received signature
7. If they match → ✅ Valid request
8. If they don't match → ❌ Invalid signature error

---

## Common Issues

### Issue: "Still getting Invalid signature after setting secret"

**Solutions**:
1. **Check for typos**: Copy the secret again, make sure no spaces or line breaks
2. **Check the right app**: Make sure you copied from "Urgency Timer" app, not another app
3. **Check Render logs**: The secret might not have updated. Try deleting and re-adding it
4. **Restart the service**: In Render, go to Manual Deploy → Deploy latest commit

### Issue: "I don't see SHOPIFY_API_SECRET in Render"

This is expected if you haven't set it yet. Just add it as a new environment variable.

### Issue: "The debug endpoint shows 'NONE - THIS IS THE PROBLEM!'"

This confirms the environment variable is not set or not being read. Double-check:
1. Variable name is exactly `SHOPIFY_API_SECRET` (case-sensitive)
2. You saved changes in Render
3. The deployment completed successfully
4. You're testing the production URL, not localhost

### Issue: "Timer still doesn't show even with valid signature"

Check these in your Shopify admin:
1. Timer is **Published** (toggle switch on)
2. Timer is **Active** (not paused)
3. Timer hasn't **Expired** (check end date)
4. Timer **Product Selection** includes the product you're testing
5. Timer **Start Date** is in the past or not set

---

## Files Changed

The following files were updated to fix the signature validation:

1. **app/utils/proxy.server.ts** - Fixed to only validate Shopify-signed parameters
2. **app/routes/proxy.timers.ts** - Improved error logging
3. **app/routes/proxy.debug.ts** - NEW debug endpoint
4. **test-hmac.cjs** - NEW test script for local verification

---

## Technical Details

### Before (Wrong)
```javascript
// This was wrong - it tried to validate ALL parameters including custom ones
const message = allParams.sort().join('&');
```

### After (Correct)
```javascript
// Only validate Shopify-signed parameters
const shopifySignedParams = ['shop', 'timestamp', 'logged_in_customer_id', 'path_prefix'];
const signedPairs = shopifySignedParams
  .filter(key => params.has(key))
  .map(key => `${key}=${params.get(key)}`)
  .sort()
  .join('&');
const computed = crypto.createHmac('sha256', apiSecret)
  .update(signedPairs, 'utf8')
  .digest('hex');
```

### Why This Matters

Shopify only signs the parameters IT adds to the request. Your custom parameters (productId, pageType, etc.) are added by your JavaScript AFTER the proxy request, so they're not included in Shopify's signature calculation.

If you try to validate ALL parameters, the signature will never match!

---

## Testing Checklist

After deploying the fix, verify:

- [ ] `SHOPIFY_API_SECRET` is set in Render environment variables
- [ ] Value matches the API secret key from Shopify Partner Dashboard
- [ ] App has been redeployed
- [ ] Debug endpoint shows `✅ VALID`
- [ ] Timer appears on product page
- [ ] No errors in browser console
- [ ] No errors in Render logs

---

## Still Having Issues?

Check Render logs for detailed error messages:

1. Go to Render Dashboard
2. Click your web service
3. Click **Logs** tab
4. Look for lines containing `[proxy.timers]` or `[proxy.server]`

The logs will show:
- Received signature
- Computed signature
- HMAC message used for validation
- Which environment variable is being used

Share these logs if you need additional help.

---

## Success!

If everything is working:
- ✅ Debug endpoint shows VALID
- ✅ Timer appears on your storefront
- ✅ No console errors
- ✅ Analytics tracking works

You're all set! The App Proxy is now properly authenticated.