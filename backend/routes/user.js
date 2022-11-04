const express = require('express');
const connection = require('../connection');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const auth = require('../services/authentication');
const checkRole = require('../services/checkRole');

const router = express.Router();

router.post('/signup', (req, res) => {
  const user = req.body;
  let query = "select email, password, role, status from user where email=?";
  connection.query(query, [user.email], (err, results) => {
    if (!err) {
      if (results.length <= 0) {
        query = "insert into user(name, contactNumber, email, password, status, role) value(?,?,?,?,'false','user')";
        connection.query(
          query,
          [user.name, user.contactNumber, user.email, user.password],
          (err) => {
            if (!err) {
              res.status(200).json({ message: "Successfully registered" });
            } else {
              res.status(500).json(err);
            }
          }
        );
      } else {
        res.status(400).json({ message: "Email already exists" });
      }
    } else {
      res.status(500).json(err);
    }
  });
});

router.post('/login', (req, res) => {
  const user = req.body;
  const query = "select email, password, role, status from user where email=?";
  connection.query(query, [user.email], (err, results) => {
    if (!err) {
      if (results.length <= 0 || results[0].password != user.password) {
        res.status(401).json({ message: "Incorrect email or password" });
      } else if (results[0].status === 'false') {
        res.status(401).json(({ message: "Wait for admin approval" }));
      } else if (results[0].password == user.password) {
        const response = { email: results[0].email, role: results[0].role };
        const accessToken = jwt.sign(response, process.env.JWT_SECRET, { expiresIn: '8h' });
        res.status(200).json({ token: accessToken });
      } else {
        res.status(400).json({ message: "Something went wrong" });
      }
    } else {
      res.status(500).json(err);
    }
  });
});

router.post('/forgotPassword', (req, res) => {
  const user = req.body;
  const query = "select email, password from user where email=?";
  connection.query(query, [user.email], (err, results) => {
    if (!err) {
      if (results.length <= 0) {
        res.status(200).json({ message: "Password was send to provided email" });
      } else {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASSWORD
          }
        });

        const mailOptions = {
          from: `Restaurant management system <${process.env.EMAIL}>`,
          to: results[0].email,
          subject: "Password by Restaurant management system",
          html: `<p><b>Your login credentials for Restaurant management system</b><br><b>Email: </b>${results[0].email}<br><b>Password: </b>${results[0].password}</p>`
        };

        transporter.sendMail(mailOptions, (error) => {
          if (error) {
            console.error(error);
          }
        });

        res.status(200).json({ message: "Password was send to provided email" });
      }
    } else {
      res.status(500).json(err);
    }
  });
});

router.get('/get', auth.authenticateToken, checkRole, (req, res) => {
  const query = "select id, name, email, contactNumber, status from user where role='user'";
  connection.query(query, (err, results) => {
    if (!err) {
      res.status(200).json(results);
    } else {
      res.status(500).json(err);
    }
  });
});

router.patch('/update', auth.authenticateToken, checkRole, (req, res) => {
  const user = req.body;
  const query = "update user set status=? where id=?";
  connection.query(query, [user.status, user.id], (err, results) => {
    if (!err) {
      if (results.affectedRows == 0) {
        res.status(404).json({ message: "User id does not exists" });
      } else {
        res.status(200).json({ message: "User updated successfully" });
      }
    } else {
      res.status(500).json(err);
    }
  });
});

router.get('/checkToken', auth.authenticateToken, (req, res) => {
  res.status(200).json({ message: "true" });
});

router.post('/changePassword', auth.authenticateToken, (req, res) => {
  const user = req.body;
  const email = res.locals.email;
  let query = "select * from user where email=? and password=?";
  connection.query(query, [email, user.oldPassword], (err, results) => {
    if (!err) {
      if (results.length <= 0) {
        res.status(400).json({ message: "Incorrect old password" });
      } else {
        query = "update user set password=? where email=?";
        connection.query(query, [user.newPassword, email], (err) => {
          if (!err) {
            res.status(200).json({ message: "Password updated successfully" });
          } else {
            res.status(500).json(err);
          }
        });
      }
    } else {
      res.status(500).json(err);
    }
  });
});

module.exports = router;
