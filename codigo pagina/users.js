// routes/users.js
import { Router } from "express";
import { query } from "../db.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const rows = await query(
      `SELECT u.id, u.username, u.full_name, u.avatar, u.contact_info, u.role_id, r.name AS role_name
       FROM users u
       LEFT JOIN roles r ON r.id = u.role_id
       ORDER BY u.id DESC
       LIMIT 200`
    );
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { username, full_name, avatar, contact_info, role_id } = req.body;
    if (!username || !role_id) return res.status(400).json({ error: "'username' and 'role_id' are required" });
    const r = await query(`INSERT INTO users (username, password_hash, full_name, avatar, contact_info, role_id)
                           VALUES (?, '***placeholder***', ?, ?, ?, ?)`,
                          [username, full_name || null, avatar || null, contact_info || null, role_id]);
    const row = await query(`SELECT id, username, full_name, avatar, contact_info, role_id FROM users WHERE id = ?`, [r.insertId]);
    res.status(201).json(row[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to create user" });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { username, full_name, avatar, contact_info, role_id } = req.body;
    await query(`UPDATE users SET username = COALESCE(?, username),
                                  full_name = COALESCE(?, full_name),
                                  avatar = COALESCE(?, avatar),
                                  contact_info = COALESCE(?, contact_info),
                                  role_id = COALESCE(?, role_id)
                WHERE id = ?`,
                [username, full_name, avatar, contact_info, role_id, id]);
    const row = await query(`SELECT id, username, full_name, avatar, contact_info, role_id FROM users WHERE id = ?`, [id]);
    if (!row.length) return res.status(404).json({ error: "Not found" });
    res.json(row[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to update user" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await query(`DELETE FROM users WHERE id = ?`, [id]);
    res.status(204).end();
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

export default router;
