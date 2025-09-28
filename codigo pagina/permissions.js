// routes/permissions.js
import { Router } from "express";
import { query } from "../db.js";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const rows = await query(
      `SELECT p.id, p.role_id, r.name AS role_name, p.permission
       FROM permissions p
       LEFT JOIN roles r ON r.id = p.role_id
       ORDER BY p.id ASC`
    );
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to fetch permissions" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { role_id, permission } = req.body;
    if (!role_id || !permission) return res.status(400).json({ error: "'role_id' and 'permission' are required" });
    const r = await query(`INSERT INTO permissions (role_id, permission) VALUES (?, ?)`, [role_id, permission]);
    const row = await query(`SELECT * FROM permissions WHERE id = ?`, [r.insertId]);
    res.status(201).json(row[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to create permission" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await query(`DELETE FROM permissions WHERE id = ?`, [id]);
    res.status(204).end();
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to delete permission" });
  }
});

export default router;
