import { json, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import prisma from "../db.server";
import { validateProxyRequest } from "../utils/proxy.server";

export async function loader(_: LoaderFunctionArgs) {
  return json({ error: "Method Not Allowed" }, { status: 405 });
}

export async function action({ request }: ActionFunctionArgs) {
  const validation = validateProxyRequest(request);
  const url = new URL(request.url);
  const isDev = process.env.NODE_ENV === "development";
  const shopParam = url.searchParams.get("shop");

  if (!validation.isValid && (!isDev || !shopParam)) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  const shop = validation.shop || shopParam!;

  if (request.method !== "POST") {
    return json({ error: "Method Not Allowed" }, { status: 405 });
  }

  let payload: any;
  try {
    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      payload = await request.json();
    } else {
      const formData = await request.formData();
      payload = Object.fromEntries(formData);
    }
  } catch {
    return json({ error: "Invalid request body" }, { status: 400 });
  }

  const timerId = String(payload?.timerId || "").trim();
  if (!timerId) {
    return json({ error: "Missing required field: timerId" }, { status: 400 });
  }

  try {
    const timer = await prisma.timer.findFirst({
      where: { id: timerId, shop },
      select: { id: true },
    });

    if (!timer) {
      return json({ error: "Timer not found for this shop" }, { status: 404 });
    }

    await prisma.timer.update({
      where: { id: timerId },
      data: { isPublished: false },
    });

    return json({ success: true });
  } catch (err) {
    console.error("[proxy.unpublish] Error:", err);
    return json({ error: "Failed to unpublish timer" }, { status: 500 });
  }
}
