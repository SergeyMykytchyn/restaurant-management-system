const express = require('express');
const connection = require('../connection');
const auth = require('../services/authentication');
const checkRole = require('../services/checkRole');

const router = express.Router();

router.post('/add', auth.authenticateToken, checkRole, (req, res) => {
  const product = req.body;
  const query = "insert into product(name, categoryId, description, price, status) values(?, ?, ?, ?, 'true')";
  connection.query(
    query,
    [product.name, product.categoryId, product.description, product.price],
    (err) => {
      if (!err) {
        res.status(200).json({ message: "Product added successfully" });
      } else {
        res.status(500).json(err);
      }
    }
  );
});

router.get('/get', auth.authenticateToken, (req, res) => {
  const query = "select p.id, p.name, p.description, p.price, p.status, c.id as categoryId, c.name as categoryName from product as p, category as c where p.categoryId = c.id";
  connection.query(query, (err, results) => {
    if (!err) {
      res.status(200).json(results);
    } else {
      res.status(500).json(err);
    }
  });
});

router.get('/getByCategory/:id', auth.authenticateToken, (req, res) => {
  const id = req.params.id;
  const query = "select id, name from product where categoryId=? and status = 'true'";
  connection.query(query, [id], (err, results) => {
    if (!err) {
      res.status(200).json(results);
    } else {
      res.status(500).json(err);
    }
  });
});

router.get('/getById/:id', auth.authenticateToken, (req, res) => {
  const id = req.params.id;
  const query = "select id, name, description, price from product where id=?";
  connection.query(query, [id], (err, results) => {
    if (!err) {
      res.status(200).json(results[0]);
    } else {
      res.status(500).json(err);
    }
  });
});

router.patch('/update', auth.authenticateToken, checkRole, (req, res) => {
  const product = req.body;
  const query = "update product set name=?, categoryId=?, description=?, price=? where id=?";
  connection.query(
    query,
    [product.name, product.categoryId, product.description, product.price, product.id],
    (err, results) => {
      if (!err) {
        if (results.affectedRows == 0) {
          res.status(404).json({ message: "Product id was not found" });
        } else {
          res.status(200).json({ message: "Product updated successfully" });
        }
      } else {
        res.status(500).json(err);
      }
    }
  );
});

router.delete('/delete/:id', auth.authenticateToken, checkRole, (req, res) => {
  const id = req.params.id;
  const query = "delete from product where id=?";
  connection.query(query, [id], (err, results) => {
    if (!err) {
      if (results.affectedRows == 0) {
        res.status(404).json({ message: "Product id was not found" });
      } else {
        res.status(200).json({ message: "Product deleted successfully" });
      }
    } else {
      res.status(500).json(err);
    }
  })
});

router.patch('/updateStatus', auth.authenticateToken, checkRole, (req, res) => {
  const product = req.body;
  const query = "update product set status=? where id=?";
  connection.query(query, [product.status, product.id], (err, results) => {
    if (!err) {
      if (results.affectedRows == 0) {
        res.status(404).json({ message: "Product id was not found" });
      } else {
        res.status(200).json({ message: "Product status updated successfully" });
      }
    } else {
      res.status(500).json(err);
    }
  });
});

module.exports = router;
