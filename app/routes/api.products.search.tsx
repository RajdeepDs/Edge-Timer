import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";

/**
 * Product Search API endpoint
 * GET /api/products/search?query=...
 *
 * Used by the product picker component to search for products
 * Returns a list of products matching the search query
 */

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const { admin } = await authenticate.admin(request);

    const url = new URL(request.url);
    const query = url.searchParams.get("query") || "";
    const limit = parseInt(url.searchParams.get("limit") || "10", 10);

    // Build GraphQL query
    const searchQuery = query
      ? `title:${query}* OR sku:${query}* OR tag:${query}*`
      : "";

    const response = await admin.graphql(
      `#graphql
        query searchProducts($query: String!, $first: Int!) {
          products(first: $first, query: $query) {
            edges {
              node {
                id
                title
                handle
                description
                featuredImage {
                  url
                  altText
                }
                priceRangeV2 {
                  minVariantPrice {
                    amount
                    currencyCode
                  }
                  maxVariantPrice {
                    amount
                    currencyCode
                  }
                }
                status
                totalInventory
                tracksInventory
                variantsCount {
                  count
                }
              }
            }
            pageInfo {
              hasNextPage
              endCursor
            }
          }
        }
      `,
      {
        variables: {
          query: searchQuery,
          first: Math.min(limit, 50), // Max 50 products per request
        },
      },
    );

    const data: any = await response.json();

    if (data.errors) {
      console.error("GraphQL errors:", data.errors);
      return json(
        { error: "Failed to search products", details: data.errors },
        { status: 500 },
      );
    }

    // Transform the data to a simpler format
    const products = data.data.products.edges.map((edge: any) => ({
      id: edge.node.id,
      title: edge.node.title,
      handle: edge.node.handle,
      description: edge.node.description,
      image: edge.node.featuredImage?.url || null,
      imageAlt: edge.node.featuredImage?.altText || "",
      price: {
        min: edge.node.priceRangeV2.minVariantPrice.amount,
        max: edge.node.priceRangeV2.maxVariantPrice.amount,
        currencyCode: edge.node.priceRangeV2.minVariantPrice.currencyCode,
      },
      status: edge.node.status,
      inventory: edge.node.totalInventory || 0,
      tracksInventory: edge.node.tracksInventory,
      variantsCount: edge.node.variantsCount?.count || 0,
    }));

    return json({
      products,
      hasNextPage: data.data.products.pageInfo.hasNextPage,
      endCursor: data.data.products.pageInfo.endCursor,
    });
  } catch (error) {
    console.error("Error searching products:", error);
    return json({ error: "Failed to search products" }, { status: 500 });
  }
}
