# App Proxy Signature Validation Fix

## Problem

Your Shopify App Proxy is returning "Invalid signature" errors in production, preventing the urgency timer from loading on your storefront.

## Root Cause

The HMAC signature validation is failing because the `SHOPIFY_API_SECRET` environment variable is either:
1. Not set in your Render deployment
2. Set to an incorrect value
3. Using a different environment variable name

## Solution

### Step 1: Get Your API Secret Key

1. Go to [Shopify Partner Dashboard](https://partners.shopify.com)
2. Navigate to **Apps** → **Urgency Timer**
3. Click on **Configuration** or **Overview**
4. Find the **API secret key** (NOT the API key)
5. Click "Show" or "Reveal" and copy the entire secret key

### Step 2: Set Environment Variable in Render

1. Log in to your [Render Dashboard](https://dashboard.render.com)
2. Find your "urgency-timer" web service
3. Go to **Environment** tab
4. Add or update the environment variable:
   - **Key**: `SHOPIFY_API_SECRET`
   - **Value**: Paste the API secret key you copied from Shopify Partner Dashboard
5. Click **Save Changes**

### Step 3: Redeploy

Render will automatically redeploy after saving environment variables. Wait for the deployment to complete.

### Step 4: Test the Fix

#### Option 1: Use the Debug Endpoint

Visit this URL in your browser (replace with your actual shop domain):
```
https://your-shop.myshopify.com/apps/urgency-timer/debug
```

This will show you:
- ✅ Whether signature validation is working
- 🔍 Detailed information about the request
- 💡 Specific troubleshooting steps if still failing

#### Option 2: Test Your Timer

1. Go to your Shopify admin
2. Navigate to **Online Store** → **Themes**
3. Click **Customize** on your active theme
4. Go to a product page
5. Add the **Urgency Timer** app block
6. Save and preview
7. Check your browser console for any errors

## Technical Details

### What Changed

I fixed the signature validation in `app/utils/proxy.server.ts` to:

1. **Preserve URL encoding**: Shopify signs the query string in its encoded form
2. **Correct parameter sorting**: Sort parameters alphabetically after removing signature
3. **Use the right environment variable**: Check `SHOPIFY_API_SECRET` first
4. **Better error logging**: See exactly what's failing in production

### Files Modified

- `app/utils/proxy.server.ts` - Fixed HMAC validation logic
- `app/routes/proxy.timers.ts` - Improved error logging
- `app/routes/proxy.debug.ts` - NEW debug endpoint for troubleshooting

### How App Proxy Validation Works

**IMPORTANT**: Shopify only signs the parameters **it** adds to the request. Your custom parameters are not included in the signature!

#### Shopify-Signed Parameters (validated):
- `shop` - The shop domain
- `timestamp` - Request timestamp
- `logged_in_customer_id` - Customer ID (if logged in)
- `path_prefix` - The proxy path prefix (e.g., `/apps/urgency-timer`)
- `signature` - The HMAC signature

#### Custom Parameters (NOT validated):
- `productId` - Added by your JavaScript
- `pageType` - Added by your JavaScript
- `country` - Added by your JavaScript
- `collectionIds` - Added by your JavaScript
- `productTags` - Added by your JavaScript
- Any other parameters you add client-side

#### Validation Process:
1. Shopify proxies the request and adds: `shop`, `timestamp`, `logged_in_customer_id`, `path_prefix`, `signature`
2. Your client-side JS adds: `productId`, `pageType`, `country`, etc.
3. Server extracts **only** the Shopify-signed parameters (ignoring custom ones)
4. Server sorts these parameters alphabetically: `logged_in_customer_id=&path_prefix=/apps/urgency-timer&shop=...&timestamp=...`
5. Server computes HMAC-SHA256 using your API secret key
6. Server compares computed signature with received signature

This is why it's critical that the validation code only uses Shopify's parameters!

## Verification Checklist

- [ ] API secret key copied from Shopify Partner Dashboard
- [ ] `SHOPIFY_API_SECRET` set in Render environment variables
- [ ] Value matches exactly (no extra spaces or quotes)
- [ ] App redeployed successfully
- [ ] Debug endpoint shows ✅ VALID
- [ ] Timer appears on storefront
- [ ] No console errors

## Common Issues

### Issue: "API secret not configured"

**Solution**: The environment variable is not set or misspelled. Must be exactly `SHOPIFY_API_SECRET`.

### Issue: "Invalid signature" persists after setting secret

**Solutions**:
1. Verify the secret matches your app in Partner Dashboard (not from another app)
2. Check for extra spaces or line breaks when copying
3. Make sure you're testing through Shopify's App Proxy URL: `https://your-shop.myshopify.com/apps/urgency-timer/...` (NOT directly to `https://urgency-timer.onrender.com/...`)
4. Clear your browser cache and try again

### Issue: Request going directly to server instead of through Shopify

If your logs show requests to `http://urgency-timer.onrender.com/proxy/timers` instead of coming through Shopify's proxy:

**This is normal!** Shopify proxies the request from `https://your-shop.myshopify.com/apps/urgency-timer/timers` to your server at `http://urgency-timer.onrender.com/proxy/timers`.

The key is that Shopify adds the signature parameters before forwarding the request to your server.

### Issue: Timer still not showing

**Possible causes**:
1. Timer is not published (check in admin)
2. Timer is not active (check in admin)
3. Timer has expired (check end date)
4. Product/page targeting excludes current page
5. Timer is scheduled for future start date

### Issue: Works in development, fails in production

This is expected! Development mode bypasses HMAC validation. Production requires proper `SHOPIFY_API_SECRET`.

## Need More Help?

Check the server logs in Render for detailed error messages:
1. Go to Render Dashboard
2. Click on your web service
3. Click **Logs** tab
4. Look for lines containing `[proxy.timers]` or `[proxy.server]`

The logs will show:
- Received signature
- Computed signature
- HMAC message
- Which environment variable is being used