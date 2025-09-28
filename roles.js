// routes/roles.js
import { Router } from "express";
import { query } from "../db.js";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const rows = await query(`SELECT id, name FROM roles ORDER BY id ASC`);
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to fetch roles" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "'name' is required" });
    const r = await query(`INSERT INTO roles (name) VALUES (?)`, [name]);
    const row = await query(`SELECT id, name FROM roles WHERE id = ?`, [r.insertId]);
    res.status(201).json(row[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to create role" });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    await query(`UPDATE roles SET name = COALESCE(?, name) WHERE id = ?`, [name, id]);
    const row = await query(`SELECT id, name FROM roles WHERE id = ?`, [id]);
    if (!row.length) return res.status(404).json({ error: "Not found" });
    res.json(row[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to update role" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await query(`DELETE FROM roles WHERE id = ?`, [id]);
    res.status(204).end();
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to delete role" });
  }
});

export default router;
