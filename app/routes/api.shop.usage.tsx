import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { getShopUsageStats } from "../utils/shop.server";

/**
 * Shop Usage Statistics API endpoint
 * GET /api/shop/usage
 *
 * Returns usage statistics for the authenticated shop including:
 * - Current plan
 * - Monthly view count and limit
 * - Timer count and limit
 * - Limit exceeded flags
 * - Reset dates
 */

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const { session } = await authenticate.admin(request);

    const stats = await getShopUsageStats(session.shop);

    return json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error("Error fetching shop usage stats:", error);
    return json(
      {
        success: false,
        error: "Failed to fetch usage statistics",
      },
      { status: 500 }
    );
  }
}
