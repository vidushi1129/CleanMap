// ── In-memory store (swap with DB adapter later) ──────────────────────
// Replace this module with a DB adapter (MongoDB/PostgreSQL) for production.
// The API surface (getAll, getById, create, update, remove) stays the same.

const { v4: uuid } = require("uuid");

const SEED = [
  {
    id: "s1",
    lat: 13.0827, lng: 80.2707,
    severity: "High",
    description: "Massive garbage pile near Central Station — mixed waste and plastic bags overflowing the bin",
    imageUrl: null,
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
    status: "IN_PROGRESS",
    reporter: "Bhavya",
    claimedBy: "Lakshmi",
    location: "Guindy Park, Chennai, Tamil Nadu",
    timestamp: Date.now() - 10_800_000,
  },
];

let db = [...SEED];

const store = {
  getAll:    ()       => [...db].sort((a, b) => b.timestamp - a.timestamp),
  getById:   (id)     => db.find(r => r.id === id) || null,
  create:    (data)   => {
    const report = { id: uuid(), timestamp: Date.now(), status: "PENDING", claimedBy: null, ...data };
    db.unshift(report);
    return report;
  },
  update:    (id, patch) => {
    const idx = db.findIndex(r => r.id === id);
    if (idx === -1) return null;
    db[idx] = { ...db[idx], ...patch };
    return db[idx];
  },
  remove:    (id)     => {
    const idx = db.findIndex(r => r.id === id);
    if (idx === -1) return false;
    db.splice(idx, 1);
    return true;
  },
  stats: () => ({
    total:      db.length,
    pending:    db.filter(r => r.status === "PENDING").length,
    inProgress: db.filter(r => r.status === "IN_PROGRESS").length,
    cleaned:    db.filter(r => r.status === "CLEANED").length,
  }),
};

module.exports = store;
