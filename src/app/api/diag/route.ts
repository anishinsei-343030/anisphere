export async function POST(request: Request): Promise<Response> {
  try {
    const body = (await request.json()) as { kind?: string; url?: string; message?: string };
    if (
      (body.kind === "pageerror" || body.kind === "unhandledrejection") &&
      typeof body.url === "string" &&
      typeof body.message === "string"
    ) {
      console.log(`[diag] ${body.kind} :: ${body.url} :: ${body.message.slice(0, 500)}`);
      return new Response(null, { status: 204 });
    }
    return new Response("invalid payload", { status: 400 });
  } catch {
    return new Response("invalid payload", { status: 400 });
  }
}