export async function POST(request: Request): Promise<Response> {
  try {
    const body = (await request.json()) as { kind?: string; url?: string; message?: string };
    if (
      (body.kind === "pageerror" || body.kind === "unhandledrejection") &&
      typeof body.url === "string" &&
      typeof body.message === "string"
    ) {
      const path = new URL(body.url).pathname;
      console.log(`[diag] ${body.kind} :: ${path} :: ${body.message.slice(0, 200).replace(/\s+/g, " ")}`);
      return new Response(null, { status: 204 });
    }
    return new Response("invalid payload", { status: 400 });
  } catch {
    return new Response("invalid payload", { status: 400 });
  }
}