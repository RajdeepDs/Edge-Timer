import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import db from "../db.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { payload, session, topic, shop } = await authenticate.webhook(request);

  console.log(`Received ${topic} webhook for ${shop}`);

  try {
    const current = (payload?.current as string[]) || [];

    const scopeString = current.length ? current.join(",") : "";

    if (!current.length) {
      console.warn(
        `Scopes update webhook for ${shop} has empty 'current' payload.`,
      );
      // Still return 200 to acknowledge the webhook and avoid retries
      return new Response();
    }

    if (session) {
      await db.session.update({
        where: { id: session.id },

        data: { scope: scopeString },
      });
    } else {
      // Fallback: update all sessions for this shop if specific session not present
      await db.session.updateMany({
        where: { shop },

        data: { scope: scopeString },
      });
    }

    return new Response();
  } catch (error) {
    console.error(`Error handling ${topic} webhook for ${shop}:`, error);
    // Acknowledge with 200 to prevent repeated retries; error is logged for investigation
    return new Response();
  }
};
