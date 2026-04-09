const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60_000; // 1 minute
const RATE_LIMIT_MAX = 30; // max requests per window per IP

function isRateLimited(ip) {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now - entry.start > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(ip, { start: now, count: 1 });
    return false;
  }

  entry.count++;
  if (entry.count > RATE_LIMIT_MAX) return true;
  return false;
}

// Clean up stale entries every 5 minutes
if (typeof globalThis.__geoRateLimitCleanup === "undefined") {
  globalThis.__geoRateLimitCleanup = setInterval(() => {
    const now = Date.now();
    for (const [ip, entry] of rateLimitMap) {
      if (now - entry.start > RATE_LIMIT_WINDOW * 2) rateLimitMap.delete(ip);
    }
  }, 300_000);
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const cp = searchParams.get("cp");

  // Validate: must be exactly 5 digits
  if (!cp || !/^\d{5}$/.test(cp)) {
    return Response.json([], { status: 400 });
  }

  // Rate limiting
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (isRateLimited(ip)) {
    return Response.json({ error: "Too many requests" }, { status: 429 });
  }

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
