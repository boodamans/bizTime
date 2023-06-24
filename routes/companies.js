const db = require("../db");
const express = require("express");
const router = new express.Router();

router.get("/", async function (req, res, next) {
    try {
      const results = await db.query(
            `SELECT code, name, description FROM companies`);
  
      return res.json(results.rows);
    }
    catch (err) {
      return next(err);
    }
  });
  
  
  router.get("/:code", async function (req, res, next) {
    try {
      let code = req.params.code;
  
      const compResult = await db.query(
            `SELECT code, name, description
             FROM companies
             WHERE code = $1`,
          [code]
      );
  
      const invResult = await db.query(
            `SELECT id
             FROM invoices
             WHERE comp_code = $1`,
          [code]
      );
  
      if (compResult.rows.length === 0) {
        throw new ExpressError(`No such company: ${code}`, 404)
      }
  
      const company = compResult.rows[0];
      const invoices = invResult.rows;
  
      company.invoices = invoices.map(inv => inv.id);
  
      return res.json({"company": company});
    }
  
    catch (err) {
      return next(err);
    }
  });

router.post("/", async function (req, res, next) {
    try {
      const { code, name, description } = req.body;
  
      const result = await db.query(
            `INSERT INTO companies (code, name, description) 
             VALUES ($1, $2, $3)
             RETURNING code, name, description`,
          [code, name, description]
      );
  
      return res.status(201).json(result.rows[0]);
    }
  
    catch (err) {
      return next(err);
    }
  });

router.put("/:code", async function (req, res, next) {
    try {
        const { code } = req.params;
        const { name, description } = req.body;
  
        const result = await db.query(
            `UPDATE companies 
             SET name = $1, description = $2
             WHERE code = $3
             RETURNING code, name, description`,
            [name, description, code]
          );
  
      return res.json(result.rows[0]);
    }
  
    catch (err) {
      return next(err);
    }
  });

  router.delete("/:code", async function (req, res, next) {
    try {
      const result = await db.query(
          "DELETE FROM companies WHERE code = $1",
          [req.params.code]
      );
  
      return res.json({message: "Deleted"});
    }
  
    catch (err) {
      return next(err);
    }
  });

  
module.exports = router;