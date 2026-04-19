const UPSTREAM = "https://registry.modelcontextprotocol.io/v0/servers";
const CUSTOM_SERVERS = require("../data/custom-servers.json");

async function fetchAll() {
  const servers = [];
  let offset = 0;
  const limit = 100;

  while (true) {
    const res = await fetch(`${UPSTREAM}?limit=${limit}&offset=${offset}`, {
      headers: {
        "Accept": "application/json",
        "User-Agent": "mcp-registry-merger/1.0 (github-actions)"
      }
    });

    if (!res.ok) {
      throw new Error(`Upstream returned ${res.status}: ${await res.text()}`);
    }
    const data = await res.json();
    if (!data.servers?.length) break;
    servers.push(...data.servers);
    if (data.servers.length < limit) break;
    offset += limit;
  }

  return servers;
}

(async () => {
  const upstream = await fetchAll();
  const merged = { servers: [...upstream, ...CUSTOM_SERVERS] };

  // Pretty-print mit 2 Spaces Einrückung
  process.stdout.write(JSON.stringify(merged, null, 2) + "\n");
})();