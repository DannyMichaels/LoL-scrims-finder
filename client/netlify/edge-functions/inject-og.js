const CACHE = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function fetchBranding(hostname) {
  const cached = CACHE.get(hostname);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return cached.data;
  }

  const apiUrl = Deno.env.get("API_URL");
  const apiKey = Deno.env.get("API_KEY");

  if (!apiUrl) {
    console.error("inject-og: API_URL env var not set");
    return null;
  }

  try {
    const res = await fetch(`${apiUrl}/branding?hostname=${hostname}`, {
      headers: apiKey ? { "x-api-key": apiKey } : {},
    });

    if (!res.ok) return null;

    const data = await res.json();
    CACHE.set(hostname, { data, ts: Date.now() });
    return data;
  } catch (err) {
    console.error("inject-og: Failed to fetch branding:", err);
    return null;
  }
}

export default async function handler(request, context) {
  // Let the request go through to get the original HTML response
  const response = await context.next();

  // Only modify HTML responses
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text/html")) {
    return response;
  }

  const hostname = new URL(request.url).hostname;
  const config = await fetchBranding(hostname);

  if (!config) {
    return response;
  }

  const brandName = config.branding?.brandName || "";
  const logoUrl = config.branding?.logoUrl || "";
  const description = "Find LoL Custom Lobbies!";

  // Resolve logo URL to absolute
  const origin = new URL(request.url).origin;
  const absoluteLogoUrl = logoUrl.startsWith("http")
    ? logoUrl
    : `${origin}${logoUrl}`;

  let html = await response.text();

  // Replace existing og tags or inject new ones
  // og:title
  if (html.includes('property="og:title"')) {
    html = html.replace(
      /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i,
      `<meta property="og:title" content="${brandName}" />`
    );
  } else {
    html = html.replace("</head>", `  <meta property="og:title" content="${brandName}" />\n  </head>`);
  }

  // og:description
  if (html.includes('property="og:description"')) {
    html = html.replace(
      /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i,
      `<meta property="og:description" content="${description}" />`
    );
  } else {
    html = html.replace("</head>", `  <meta property="og:description" content="${description}" />\n  </head>`);
  }

  // og:image
  if (html.includes('property="og:image"')) {
    html = html.replace(
      /<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/i,
      `<meta property="og:image" content="${absoluteLogoUrl}" />`
    );
  } else {
    html = html.replace("</head>", `  <meta property="og:image" content="${absoluteLogoUrl}" />\n  </head>`);
  }

  // og:site_name
  if (html.includes('property="og:site_name"')) {
    html = html.replace(
      /<meta\s+property="og:site_name"\s+content="[^"]*"\s*\/?>/i,
      `<meta property="og:site_name" content="${brandName}" />`
    );
  } else {
    html = html.replace("</head>", `  <meta property="og:site_name" content="${brandName}" />\n  </head>`);
  }

  // <title>
  html = html.replace(
    /<title>[^<]*<\/title>/i,
    `<title>${brandName}</title>`
  );

  // meta description
  html = html.replace(
    /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="description" content="${description}" />`
  );

  return new Response(html, {
    status: response.status,
    headers: response.headers,
  });
}

export const config = {
  path: "/*",
  // Only run on page navigations, not static assets
  excludedPath: ["/static/*", "*.js", "*.css", "*.png", "*.jpg", "*.jpeg", "*.gif", "*.svg", "*.ico", "*.woff", "*.woff2", "*.json", "*.map"],
};
