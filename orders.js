// routes/orders.js
import { Router } from "express";
import { query } from "../db.js";

const router = Router();

// List with customer name
router.get("/", async (req, res) => {
  try {
    const rows = await query(
      `SELECT o.id, o.order_date, o.status, o.customer_id, u.full_name AS customer_name, u.username AS customer_username,
              o.total_amount, o.payment_method
       FROM orders o
       LEFT JOIN users u ON u.id = o.customer_id
       ORDER BY o.id DESC
       LIMIT 200`
    );
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { order_date, status, customer_id, total_amount, payment_method } = req.body;
    if (!order_date || !status || !customer_id || total_amount === undefined || !payment_method) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const r = await query(
      `INSERT INTO orders (order_date, status, customer_id, total_amount, payment_method)
       VALUES (?, ?, ?, ?, ?)`,
      [order_date, status, customer_id, total_amount, payment_method]
    );
    const row = await query(`SELECT * FROM orders WHERE id = ?`, [r.insertId]);
    res.status(201).json(row[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to create order" });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { order_date, status, customer_id, total_amount, payment_method } = req.body;
    await query(
      `UPDATE orders SET
         order_date = COALESCE(?, order_date),
         status = COALESCE(?, status),
         customer_id = COALESCE(?, customer_id),
         total_amount = COALESCE(?, total_amount),
         payment_method = COALESCE(?, payment_method)
       WHERE id = ?`,
      [order_date, status, customer_id, total_amount, payment_method, id]
    );
    const row = await query(`SELECT * FROM orders WHERE id = ?`, [id]);
    if (!row.length) return res.status(404).json({ error: "Not found" });
    res.json(row[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to update order" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await query(`DELETE FROM orders WHERE id = ?`, [id]);
    res.status(204).end();
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to delete order" });
  }
});

export default router;
