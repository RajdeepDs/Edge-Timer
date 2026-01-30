import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";

/**
 * Collection Search API endpoint
 * GET /api/collections/search?query=...
 *
 * Used by the collection picker component to search for collections
 * Returns a list of collections matching the search query
 */

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const { admin } = await authenticate.admin(request);

    const url = new URL(request.url);
    const query = url.searchParams.get("query") || "";
    const limit = parseInt(url.searchParams.get("limit") || "10", 10);

    // Build GraphQL query
    const searchQuery = query ? `title:${query}*` : "";

    const response = await admin.graphql(
      `#graphql
        query searchCollections($query: String!, $first: Int!) {
          collections(first: $first, query: $query) {
            edges {
              node {
                id
                title
                handle
                description
                image {
                  url
                  altText
                }
                productsCount {
                  count
                }
                ruleSet {
                  rules {
                    column
                    relation
                    condition
                  }
                  appliedDisjunctively
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
          first: Math.min(limit, 50), // Max 50 collections per request
        },
      },
    );

    const data: any = await response.json();

    if (data.errors) {
      console.error("GraphQL errors:", data.errors);
      return json(
        { error: "Failed to search collections", details: data.errors },
        { status: 500 },
      );
    }

    // Transform the data to a simpler format
    const collections = data.data.collections.edges.map((edge: any) => ({
      id: edge.node.id,
      title: edge.node.title,
      handle: edge.node.handle,
      description: edge.node.description,
      image: edge.node.image?.url || null,
      imageAlt: edge.node.image?.altText || "",
      productsCount: edge.node.productsCount?.count || 0,
      isAutomatic: edge.node.ruleSet?.rules?.length > 0,
    }));

    return json({
      collections,
      hasNextPage: data.data.collections.pageInfo.hasNextPage,
      endCursor: data.data.collections.pageInfo.endCursor,
    });
  } catch (error) {
    console.error("Error searching collections:", error);
    return json({ error: "Failed to search collections" }, { status: 500 });
  }
}
