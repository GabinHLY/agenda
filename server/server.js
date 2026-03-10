import cors from "cors";
import express from "express";
import { authMiddleware, hashPassword, signToken, verifyPassword } from "./auth.js";
import { db } from "./db/database.js";

const app = express();
const PORT = Number(process.env.PORT || 8787);

const EMPTY_PLANNER = { tasks: [], notes: {} };

app.use(cors());
app.use(express.json({ limit: "2mb" }));

function normalizePlannerData(raw) {
  if (!raw || !Array.isArray(raw.tasks) || typeof raw.notes !== "object") {
    return { ...EMPTY_PLANNER };
  }

  return {
    tasks: raw.tasks,
    notes: raw.notes || {},
  };
}

function parsePlannerPayload(payload) {
  try {
    return normalizePlannerData(JSON.parse(payload));
  } catch {
    return { ...EMPTY_PLANNER };
  }
}

function getSharedMembership(userId) {
  return db
    .prepare(
      `
      SELECT
        s.id,
        s.code,
        s.name,
        s.owner_user_id,
        owner.name AS owner_name
      FROM shared_planner_spaces s
      INNER JOIN shared_planner_members m ON m.shared_space_id = s.id
      INNER JOIN users owner ON owner.id = s.owner_user_id
      WHERE m.user_id = ?
      LIMIT 1
      `
    )
    .get(userId);
}

function getSharedMembers(sharedSpaceId) {
  return db
    .prepare(
      `
      SELECT u.id, u.name, u.email
      FROM shared_planner_members m
      INNER JOIN users u ON u.id = m.user_id
      WHERE m.shared_space_id = ?
      ORDER BY u.name ASC
      `
    )
    .all(sharedSpaceId);
}

function buildSharingPayload(userId) {
  const membership = getSharedMembership(userId);
  if (!membership) {
    return { sharing: null, shared: null };
  }

  const sharedRow = db
    .prepare("SELECT payload FROM shared_planner_data WHERE shared_space_id = ?")
    .get(membership.id);

  return {
    sharing: {
      spaceId: membership.id,
      code: membership.code,
      name: membership.name,
      ownerUserId: membership.owner_user_id,
      ownerName: membership.owner_name,
      members: getSharedMembers(membership.id),
    },
    shared: sharedRow ? parsePlannerPayload(sharedRow.payload) : { ...EMPTY_PLANNER },
  };
}

function createShareCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

app.get("/", (_req, res) => {
  res.status(200).json({
    ok: true,
    service: "calendar-api",
    message: "API is running. The frontend should be served by the reverse proxy.",
    health: "/api/health",
  });
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/api/auth/register", (req, res) => {
  const { email, password, name } = req.body || {};

  if (!email || !password || !name) {
    return res.status(400).json({ message: "name, email and password are required" });
  }

  if (String(password).length < 6) {
    return res.status(400).json({ message: "password must be at least 6 characters" });
  }

  const cleanEmail = String(email).trim().toLowerCase();
  const cleanName = String(name).trim();

  try {
    const insert = db.prepare(
      "INSERT INTO users (email, name, password_hash, created_at) VALUES (?, ?, ?, ?)"
    );
    const result = insert.run(cleanEmail, cleanName, hashPassword(password), new Date().toISOString());
    const user = { id: result.lastInsertRowid, email: cleanEmail, name: cleanName };

    db.prepare("INSERT INTO planner_data (user_id, payload, updated_at) VALUES (?, ?, ?)").run(
      user.id,
      JSON.stringify({ tasks: [], notes: {} }),
      new Date().toISOString()
    );

    return res.status(201).json({ token: signToken(user), user });
  } catch (error) {
    if (String(error.message || "").includes("UNIQUE")) {
      return res.status(409).json({ message: "email already used" });
    }
    return res.status(500).json({ message: "registration failed" });
  }
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ message: "email and password are required" });
  }

  const cleanEmail = String(email).trim().toLowerCase();
  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(cleanEmail);

  if (!user || !verifyPassword(password, user.password_hash)) {
    return res.status(401).json({ message: "invalid credentials" });
  }

  const safeUser = { id: user.id, email: user.email, name: user.name };
  return res.json({ token: signToken(safeUser), user: safeUser });
});

app.get("/api/auth/me", authMiddleware, (req, res) => {
  const user = db.prepare("SELECT id, email, name FROM users WHERE id = ?").get(req.user.sub);
  if (!user) return res.status(404).json({ message: "user not found" });
  return res.json({ user });
});

app.get("/api/planner", authMiddleware, (req, res) => {
  const row = db.prepare("SELECT payload FROM planner_data WHERE user_id = ?").get(req.user.sub);
  const personal = row ? parsePlannerPayload(row.payload) : { ...EMPTY_PLANNER };
  const { sharing, shared } = buildSharingPayload(req.user.sub);

  return res.json({ personal, sharing, shared });
});

app.put("/api/planner", authMiddleware, (req, res) => {
  const { data, scope } = req.body || {};
  if (!data || !Array.isArray(data.tasks) || typeof data.notes !== "object") {
    return res.status(400).json({ message: "invalid planner payload" });
  }

  if (scope !== "personal" && scope !== "shared") {
    return res.status(400).json({ message: "invalid planner scope" });
  }

  const payload = JSON.stringify({ tasks: data.tasks, notes: data.notes });
  const updatedAt = new Date().toISOString();

  if (scope === "personal") {
    db.prepare(
      `
        INSERT INTO planner_data (user_id, payload, updated_at)
        VALUES (?, ?, ?)
        ON CONFLICT(user_id) DO UPDATE SET
          payload = excluded.payload,
          updated_at = excluded.updated_at
      `
    ).run(req.user.sub, payload, updatedAt);

    return res.json({ ok: true });
  }

  const membership = getSharedMembership(req.user.sub);
  if (!membership) {
    return res.status(403).json({ message: "shared planner not configured" });
  }

  db.prepare(
    `
      INSERT INTO shared_planner_data (shared_space_id, payload, updated_at)
      VALUES (?, ?, ?)
      ON CONFLICT(shared_space_id) DO UPDATE SET
        payload = excluded.payload,
        updated_at = excluded.updated_at
    `
  ).run(membership.id, payload, updatedAt);

  return res.json({ ok: true });
});

app.post("/api/planner/shared/create", authMiddleware, (req, res) => {
  const existing = getSharedMembership(req.user.sub);
  if (existing) {
    return res.status(409).json({ message: "shared planner already linked" });
  }

  const cleanName = String(req.body?.name || "Planning partage").trim() || "Planning partage";
  const createdAt = new Date().toISOString();

  let code = createShareCode();
  while (db.prepare("SELECT id FROM shared_planner_spaces WHERE code = ?").get(code)) {
    code = createShareCode();
  }

  const spaceInsert = db.prepare(
    `
      INSERT INTO shared_planner_spaces (code, name, owner_user_id, created_at)
      VALUES (?, ?, ?, ?)
    `
  );
  const memberInsert = db.prepare(
    `
      INSERT INTO shared_planner_members (shared_space_id, user_id, joined_at)
      VALUES (?, ?, ?)
    `
  );
  const dataInsert = db.prepare(
    `
      INSERT INTO shared_planner_data (shared_space_id, payload, updated_at)
      VALUES (?, ?, ?)
    `
  );

  const transaction = db.transaction(() => {
    const result = spaceInsert.run(code, cleanName, req.user.sub, createdAt);
    const spaceId = result.lastInsertRowid;
    memberInsert.run(spaceId, req.user.sub, createdAt);
    dataInsert.run(spaceId, JSON.stringify(EMPTY_PLANNER), createdAt);
  });

  transaction();

  const { sharing, shared } = buildSharingPayload(req.user.sub);
  return res.status(201).json({ sharing, shared });
});

app.post("/api/planner/shared/join", authMiddleware, (req, res) => {
  const existing = getSharedMembership(req.user.sub);
  if (existing) {
    return res.status(409).json({ message: "shared planner already linked" });
  }

  const code = String(req.body?.code || "")
    .trim()
    .toUpperCase();

  if (!code) {
    return res.status(400).json({ message: "invite code required" });
  }

  const space = db.prepare("SELECT id FROM shared_planner_spaces WHERE code = ?").get(code);
  if (!space) {
    return res.status(404).json({ message: "shared planner not found" });
  }

  db.prepare(
    `
      INSERT INTO shared_planner_members (shared_space_id, user_id, joined_at)
      VALUES (?, ?, ?)
    `
  ).run(space.id, req.user.sub, new Date().toISOString());

  const { sharing, shared } = buildSharingPayload(req.user.sub);
  return res.json({ sharing, shared });
});

app.delete("/api/planner/shared/leave", authMiddleware, (req, res) => {
  const membership = getSharedMembership(req.user.sub);
  if (!membership) {
    return res.status(404).json({ message: "no shared planner linked" });
  }

  const isOwner = Number(membership.owner_user_id) === Number(req.user.sub);
  const remainingMembers = db
    .prepare(
      "SELECT COUNT(*) AS count FROM shared_planner_members WHERE shared_space_id = ? AND user_id != ?"
    )
    .get(membership.id, req.user.sub);

  const transaction = db.transaction(() => {
    db.prepare("DELETE FROM shared_planner_members WHERE shared_space_id = ? AND user_id = ?").run(
      membership.id,
      req.user.sub
    );

    if (isOwner || Number(remainingMembers.count || 0) === 0) {
      db.prepare("DELETE FROM shared_planner_members WHERE shared_space_id = ?").run(membership.id);
      db.prepare("DELETE FROM shared_planner_data WHERE shared_space_id = ?").run(membership.id);
      db.prepare("DELETE FROM shared_planner_spaces WHERE id = ?").run(membership.id);
    }
  });

  transaction();
  return res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
