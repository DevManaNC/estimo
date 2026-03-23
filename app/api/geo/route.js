export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const cp = searchParams.get("cp");

  if (!cp || cp.length !== 5) return Response.json([]);

  try {
    const res = await fetch(
      `https://geo.api.gouv.fr/communes?codePostal=${cp}&fields=nom&limit=1`,
      { next: { revalidate: 86400 } }
    );
    const data = await res.json();
    return Response.json(data);
  } catch {
    return Response.json([]);
  }
}
