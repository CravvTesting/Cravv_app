/**
 * Prototype diagnostics sink: the client posts screen-state snapshots and errors here, and
 * they show up in Vercel's runtime logs. No personal data: screen ids, layout state, UA.
 */
export async function POST(req: Request) {
  try {
    const body = await req.text();
    console.log("[tara-diag]", body.slice(0, 8000));
  } catch { /* ignore */ }
  return new Response(null, { status: 204 });
}
