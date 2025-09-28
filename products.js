// routes/products.js
import { Router } from "express";
import { query } from "../db.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const { search = "" } = req.query;
    const rows = await query(
      `SELECT id, name, sku, description, category, unit_price, stock_quantity, image_url, status
       FROM products
       WHERE ? = '' OR name LIKE CONCAT('%', ?, '%') OR sku LIKE CONCAT('%', ?, '%')
       ORDER BY id DESC
       LIMIT 200`,
      [search, search, search]
    );
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, sku, description, category, unit_price, stock_quantity, image_url, status } = req.body;
    if (!name || !sku || unit_price === undefined || stock_quantity === undefined) {
      return res.status(400).json({ error: "'name', 'sku', 'unit_price', 'stock_quantity' are required" });
    }
    const r = await query(
      `INSERT INTO products (name, sku, description, category, unit_price, stock_quantity, image_url, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, sku, description || null, category || null, unit_price, stock_quantity, image_url || null, status || 'Active']
    );
    const row = await query(`SELECT * FROM products WHERE id = ?`, [r.insertId]);
    res.status(201).json(row[0]);
  } catch (e) {
    console.error(e);
    // Likely duplicate SKU
    res.status(500).json({ error: "Failed to create product" });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, sku, description, category, unit_price, stock_quantity, image_url, status } = req.body;
    await query(
      `UPDATE products SET
        name = COALESCE(?, name),
        sku = COALESCE(?, sku),
        description = COALESCE(?, description),
        category = COALESCE(?, category),
        unit_price = COALESCE(?, unit_price),
        stock_quantity = COALESCE(?, stock_quantity),
        image_url = COALESCE(?, image_url),
        status = COALESCE(?, status)
       WHERE id = ?`,
      [name, sku, description, category, unit_price, stock_quantity, image_url, status, id]
    );
    const row = await query(`SELECT * FROM products WHERE id = ?`, [id]);
    if (!row.length) return res.status(404).json({ error: "Not found" });
    res.json(row[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to update product" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await query(`DELETE FROM products WHERE id = ?`, [id]);
    res.status(204).end();
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to delete product" });
  }
});

export default router;
