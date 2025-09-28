// routes/customer_info.js
import { Router } from "express";
import { query } from "../db.js";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const rows = await query(
      `SELECT c.id, c.user_id, u.username, u.full_name, c.name, c.email, c.phone, c.address
       FROM customer_info c
       LEFT JOIN users u ON u.id = c.user_id
       ORDER BY c.id DESC
       LIMIT 200`
    );
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to fetch customer info" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { user_id, name, email, phone, address } = req.body;
    if (!user_id || !name || !email) return res.status(400).json({ error: "'user_id', 'name', 'email' required" });
    const r = await query(
      `INSERT INTO customer_info (user_id, name, email, phone, address)
       VALUES (?, ?, ?, ?, ?)`,
      [user_id, name, email, phone || null, address || null]
    );
    const row = await query(`SELECT * FROM customer_info WHERE id = ?`, [r.insertId]);
    res.status(201).json(row[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to create customer info" });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id, name, email, phone, address } = req.body;
    await query(
      `UPDATE customer_info SET
        user_id = COALESCE(?, user_id),
        name = COALESCE(?, name),
        email = COALESCE(?, email),
        phone = COALESCE(?, phone),
        address = COALESCE(?, address)
       WHERE id = ?`,
      [user_id, name, email, phone, address, id]
    );
    const row = await query(`SELECT * FROM customer_info WHERE id = ?`, [id]);
    if (!row.length) return res.status(404).json({ error: "Not found" });
    res.json(row[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to update customer info" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await query(`DELETE FROM customer_info WHERE id = ?`, [id]);
    res.status(204).end();
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to delete customer info" });
  }
});

export default router;
