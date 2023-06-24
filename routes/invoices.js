const db = require("../db");
const express = require("express");
const router = new express.Router();

router.get("/", async function (req, res, next) {
    try {
      const results = await db.query(
            `SELECT id, comp_code, amt, paid, add_date, paid_date FROM invoices`);
  
      return res.json(results.rows);
    }
    catch (err) {
      return next(err);
    }
  });
  
  
router.get("/:id", async function (req, res, next) {
    try {
      const id = req.params.id;
      
      const results = await db.query(`
      SELECT i.id, i.comp_code, i.amt, i.paid, i.add_date, i.paid_date, c.name AS company_name
      FROM invoices AS i
      JOIN companies AS c ON i.comp_code = c.code
      WHERE i.id = $1
    `, [id]);
  
      return res.json(results.rows[0]);
    }
  
    catch (err) {
      return next(err);
    }
});

router.post("/", async function (req, res, next) {
    try {
      const { comp_code, amt } = req.body;
  
      const result = await db.query(
            `INSERT INTO invoices (comp_code, amt) 
             VALUES ($1, $2)
             RETURNING id, comp_code, amt, paid, add_date, paid_date`,
          [comp_code, amt]
      );
  
      return res.status(201).json(result.rows[0]);
    }
  
    catch (err) {
      return next(err);
    }
  });

router.put("/:id", async function (req, res, next) {
    try {
        const { id } = req.params;
        const { amt } = req.body;
  
        const result = await db.query(
            `UPDATE invoices 
             SET amt = $1
             WHERE id = $2
             RETURNING id, comp_code, amt`,
             [amt, id]
          );
  
      return res.json(result.rows[0]);
    }
  
    catch (err) {
      return next(err);
    }
  });

  router.delete("/:id", async function (req, res, next) {
    try {
      const result = await db.query(
          "DELETE FROM invoices WHERE id = $1",
          [req.params.id]
      );
  
      return res.json({message: "Deleted"});
    }
  
    catch (err) {
      return next(err);
    }
  });

module.exports = router;