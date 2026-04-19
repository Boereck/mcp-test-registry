const UPSTREAM = "https://registry.modelcontextprotocol.io/v0.1/servers";

let CUSTOM_SERVERS = [];
try {
  CUSTOM_SERVERS = require("../data/custom-servers.json");
} catch {
  // Datei existiert nicht – kein Problem
}

async function fetchAll() {
  const servers = [];
  let cursor = null;

  while (true) {
    const url = cursor
      ? `${UPSTREAM}?limit=100&cursor=${encodeURIComponent(cursor)}`
      : `${UPSTREAM}?limit=100`;

    const res = await fetch(url, {
      headers: {
        "Accept": "application/json",
        "User-Agent": "mcp-registry-merger/1.0 (github-actions)"
      }
    });

    if (!res.ok) {
      throw new Error(`Upstream returned ${res.status}: ${await res.text()}`);
    }

    const data = await res.json();
    servers.push(...(data.servers ?? []));

    cursor = data.metadata?.nextCursor ?? null;
    if (!cursor) break;
  }

  return servers;
}

(async () => {
  const upstream = await fetchAll();
  const merged = { servers: [...upstream, ...CUSTOM_SERVERS] };
  process.stdout.write(JSON.stringify(merged, null, 2) + "\n");
})();