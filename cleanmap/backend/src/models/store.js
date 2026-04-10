// ── In-memory store (swap with DB adapter later) ──────────────────────
// Replace this module with a DB adapter (MongoDB/PostgreSQL) for production.
// The API surface (getAll, getById, create, update, remove) stays the same.

const { v4: uuid } = require("uuid");

// ── Severity-based scoring ────────────────────────────────────────────
const SCORE_MAP = { Low: 10, Medium: 25, High: 50 };

const SEED = [
  {
    id: "s1",
    lat: 13.0827, lng: 80.2707,
    severity: "High",
    description: "Massive garbage pile near Central Station — mixed waste and plastic bags overflowing the bin",
    imageUrl: null,
    afterImageUrl: null,
    status: "PENDING",
    reporter: "Arjun",
    claimedBy: null,
    location: "Chennai Central, Chennai, Tamil Nadu",
    timestamp: Date.now() - 7_200_000,
  },
  {
    id: "s2",
    lat: 13.0604, lng: 80.2496,
    severity: "Medium",
    description: "Overflowing bin outside T. Nagar market — attracting stray dogs and flies",
    imageUrl: null,
    afterImageUrl: null,
    status: "IN_PROGRESS",
    reporter: "Meena",
    claimedBy: "Rahul",
    location: "T. Nagar Market, Chennai, Tamil Nadu",
    timestamp: Date.now() - 18_000_000,
  },
  {
    id: "s3",
    lat: 13.1067, lng: 80.2206,
    severity: "Low",
    description: "Small pile of construction debris on roadside",
    imageUrl: null,
    afterImageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400",
    status: "CLEANED",
    reporter: "Priya",
    claimedBy: "Suresh",
    location: "Ambattur, Chennai, Tamil Nadu",
    timestamp: Date.now() - 86_400_000,
  },
  {
    id: "s4",
    lat: 12.9516, lng: 80.1462,
    severity: "High",
    description: "Open dumping ground near school — hazardous for children, urgent action needed",
    imageUrl: null,
    afterImageUrl: null,
    status: "PENDING",
    reporter: "Kavitha",
    claimedBy: null,
    location: "Tambaram, Chennai, Tamil Nadu",
    timestamp: Date.now() - 3_600_000,
  },
  {
    id: "s5",
    lat: 13.1986, lng: 80.3001,
    severity: "Medium",
    description: "Plastic bags and bottles scattered along canal bank",
    imageUrl: null,
    afterImageUrl: null,
    status: "PENDING",
    reporter: "Dinesh",
    claimedBy: null,
    location: "Ennore Canal, Chennai, Tamil Nadu",
    timestamp: Date.now() - 900_000,
  },
  {
    id: "s6",
    lat: 13.0358, lng: 80.2438,
    severity: "Low",
    description: "Scattered litter near park entrance — paper cups and wrappers",
    imageUrl: null,
    afterImageUrl: null,
    status: "IN_PROGRESS",
    reporter: "Bhavya",
    claimedBy: "Lakshmi",
    location: "Guindy Park, Chennai, Tamil Nadu",
    timestamp: Date.now() - 10_800_000,
  },
];

let db = [...SEED];

// ── SSE subscribers ───────────────────────────────────────────────────
let sseClients = [];

function addSSEClient(res) {
  sseClients.push(res);
  res.on("close", () => {
    sseClients = sseClients.filter((c) => c !== res);
  });
}

function broadcast(event, data) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  sseClients.forEach((client) => {
    try { client.write(payload); } catch {}
  });
}

const store = {
  getAll:    ()       => [...db].sort((a, b) => b.timestamp - a.timestamp),
  getById:   (id)     => db.find(r => r.id === id) || null,
  create:    (data)   => {
    const report = { id: uuid(), timestamp: Date.now(), status: "PENDING", claimedBy: null, afterImageUrl: null, ...data };
    db.unshift(report);
    broadcast("update", { reports: store.getAll(), stats: store.stats(), leaderboard: store.leaderboard() });
    return report;
  },
  update:    (id, patch) => {
    const idx = db.findIndex(r => r.id === id);
    if (idx === -1) return null;
    db[idx] = { ...db[idx], ...patch };
    broadcast("update", { reports: store.getAll(), stats: store.stats(), leaderboard: store.leaderboard() });
    return db[idx];
  },
  remove:    (id)     => {
    const idx = db.findIndex(r => r.id === id);
    if (idx === -1) return false;
    db.splice(idx, 1);
    broadcast("update", { reports: store.getAll(), stats: store.stats(), leaderboard: store.leaderboard() });
    return true;
  },
  stats: () => ({
    total:        db.length,
    pending:      db.filter(r => r.status === "PENDING").length,
    inProgress:   db.filter(r => r.status === "IN_PROGRESS").length,
    cleaned:      db.filter(r => r.status === "CLEANED").length,
    pendingProof: db.filter(r => r.status === "PENDING_PROOF").length,
  }),
  // ── Leaderboard: aggregate by volunteer name ──────────────────────
  leaderboard: () => {
    const map = {};
    db.forEach((r) => {
      if (!r.claimedBy) return;
      if (!map[r.claimedBy]) {
        map[r.claimedBy] = { name: r.claimedBy, cleanups: 0, score: 0 };
      }
      // Only count fully cleaned spots toward leaderboard
      if (r.status === "CLEANED") {
        map[r.claimedBy].cleanups += 1;
        map[r.claimedBy].score += (SCORE_MAP[r.severity] || 0);
      }
      // Also give points for pending proof (they did the work)
      if (r.status === "PENDING_PROOF") {
        map[r.claimedBy].cleanups += 1;
        map[r.claimedBy].score += (SCORE_MAP[r.severity] || 0);
      }
    });
    return Object.values(map)
      .sort((a, b) => b.score - a.score || b.cleanups - a.cleanups)
      .map((v, i) => ({ ...v, rank: i + 1 }));
  },
  // ── Get score for a specific volunteer ────────────────────────────
  volunteerScore: (name) => {
    const lb = store.leaderboard();
    const entry = lb.find(v => v.name === name);
    return entry ? entry.score : 0;
  },
  // SSE helpers
  addSSEClient,
  broadcast,
};

module.exports = store;
