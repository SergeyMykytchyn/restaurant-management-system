const express = require('express');
const connection = require('../connection');
const auth = require('../services/authentication');
const checkRole = require('../services/checkRole');

const router = express.Router();

router.post('/add', auth.authenticateToken, checkRole, (req, res) => {
  const category = req.body;
  const query = "insert into category (name) values(?)";
  connection.query(query, [category.name], (err) => {
    if (!err) {
      res.status(200).json({ message: "Category added successfully" });
    } else {
      res.status(500).json(err);
    }
  });
});

router.get('/get', auth.authenticateToken, (req, res) => {
  const query = "select * from category order by name";
  connection.query(query, (err, results) => {
    if (!err) {
      res.status(200).json(results);
    } else {
      res.status(500).json(err);
    }
  });
});

router.patch('/update', auth.authenticateToken, checkRole, (req, res) => {
  const product = req.body;
  const query = "update category set name=? where id=?";
  connection.query(query, [product.name, product.id], (err, results) => {
    if (!err) {
      if (results.affectedRows == 0) {
        res.status(404).json({ message: "Category id was not found" });
      } else {
        res.status(200).json({ message: "Category updated successfully" });
      }
    } else {
      res.status(500).json(err);
    }
  });
});

module.exports = router;
