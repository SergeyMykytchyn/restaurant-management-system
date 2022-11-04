const express = require('express');
const connection = require('../connection');
const ejs = require('ejs');
const pdf = require('html-pdf');
const path = require('path');
const fs = require('fs');
const uuid = require('uuid');
const auth = require('../services/authentication');

const router = express.Router();

router.post('/generateReport', auth.authenticateToken, (req, res) => {
  const generatedUuid = uuid.v1();
  const orderDetails = req.body;
  const productDetailsReport = JSON.parse(orderDetails.productDetails);
  const query = "insert into bill(name, uuid, email, contactNumber, paymentMethod, total, productDetails, createdBy) values(?, ?, ?, ?, ?, ?, ?, ?)";
  connection.query(
    query,
    [
      orderDetails.name,
      generatedUuid,
      orderDetails.email,
      orderDetails.contactNumber,
      orderDetails.paymentMethod,
      orderDetails.totalAmount,
      orderDetails.productDetails,
      res.locals.email
    ],
    (err) => {
      if (!err) {
        ejs.renderFile(
          path.join(__dirname, '', 'report.ejs'),
          {
            productDetails: productDetailsReport,
            name: orderDetails.name,
            email: orderDetails.email,
            contactNumber: orderDetails.contactNumber,
            paymentMethod: orderDetails.paymentMethod,
            totalAmount: orderDetails.totalAmount
          },
          (err, results) => {
            if (err) {
              res.status(500).json(err);
            } else {
              pdf.create(results).toFile(`./generated_pdf/${generatedUuid}.pdf`, (err) => {
                if (err) {
                  console.error(err);
                  res.status(500).json(err);
                } else {
                  res.status(200).json({ uuid: generatedUuid });
                }
              });
            }
          }
        );
      } else {
        res.status(500).json(err);
      }
    }
  );
});

router.post('/getPdf', auth.authenticateToken, (req, res) => {
  const orderDetails = req.body;
  const pdfPath = `./generated_pdf/${orderDetails.uuid}.pdf`;  
  if (fs.existsSync(pdfPath)) {
    res.contentType('application/pdf');
    fs.createReadStream(pdfPath).pipe(res);
  } else {
    const productDetailsReport = JSON.parse(orderDetails.productDetails);
    ejs.renderFile(
      path.join(__dirname, '', 'report.ejs'),
      {
        productDetails: productDetailsReport,
        name: orderDetails.name,
        email: orderDetails.email,
        contactNumber: orderDetails.contactNumber,
        paymentMethod: orderDetails.paymentMethod,
        totalAmount: orderDetails.totalAmount
      },
      (err, results) => {
        if (err) {
          res.status(500).json(err);
        } else {
          pdf.create(results).toFile(`./generated_pdf/${orderDetails.uuid}.pdf`, (err) => {
            if (err) {
              console.error(err);
              res.status(500).json(err);
            } else {
              res.contentType('application/pdf');
              fs.createReadStream(pdfPath).pipe(res);
            }
          });
        }
      }
    );
  }
});

router.get('/getBills', auth.authenticateToken, (req, res) => {
  const query = "select * from bill order by id desc";
  connection.query(query, (err, results) => {
    if (!err) {
      res.status(200).json(results);
    } else {
      res.status(500).json(err);
    }
  });
});

router.delete('/delete/:id', auth.authenticateToken, (req, res) => {
  const id = req.params.id;
  const query = "delete from bill where id=?";
  connection.query(query, [id], (err, results) => {
    if (!err) {
      if (results.affectedRows == 0) {
        res.status(404).json({ message: "Bill id was not found" });
      } else {
        res.status(200).json({ message: "Bill deleted successfully" });
      }
    } else {
      res.status(500).json(err);
    }
  });
});

module.exports = router;
