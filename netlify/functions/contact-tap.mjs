const contactTypes = new Set(['mobile', 'landline', 'whatsapp']);

export default async function recordContactTap(request) {
  if (request.method !== 'POST') return new Response(null, { status: 405 });
  if (request.headers.get('origin') !== new URL(request.url).origin) {
    return new Response(null, { status: 403 });
  }
  const type = await request.text();
  if (!contactTypes.has(type)) return new Response(null, { status: 400 });
  console.info(JSON.stringify({ event: 'contact_tap', type }));
  return new Response(null, { status: 204 });
}
