// require('server');
const mongoose = require("mongoose");
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const nodemailer = require('nodemailer');
var QRCode = require('qrcode')
module.exports = function(app) {


  const User = mongoose.model("User");


  app.get("/checkin", function(req, res) {
    res.redirect("/Profile");
  });

  app.post("/checkin", function(req, res) {
    var username = req.body.username;
    // console.log(username);
    // console.log(req.user.name);

    // username=username.slice(1,username.length);
    // console.log(username);
    User.findOne({
      username: username
    }, function(err, user) {
      if (err) {
        console.log(err)
      } else {
        if (user && user.status == "approved") {

          var today = new Date(Date.now());
          var dd = today.getDate();
          var mm = today.getMonth() + 1;
          var yyyy = today.getFullYear();
          if (dd < 10) {
            dd = '0' + dd
          }
          if (mm < 10) {
            mm = '0' + mm
          }

          today = yyyy + '-' + mm + '-' + dd;
          console.log(today);

          User.updateOne({
            username: req.body.username
          }, {
            status: "active",
            inDate: today
          }, function() {


            QRCode.toDataURL(username, function(err, img) {
            var transporter = nodemailer.createTransport({
              service: 'gmail',
              auth: {
                user: process.env.GMAIL_ID,
                pass: process.env.GMAIL_PASS
              }
            });
            var mailOptions = {
              from: process.env.GMAIL_ID,
              to: user.email,
              subject: 'Status Update',
              text: 'Welcome!! Your status has been changed to active. Now, you can use your QR code to successfully enter the building.\nYou can also check your status at your profile. You can use your username ( '+username+' ) and password to login. Here is the link of the website: https://vms-sasy.herokuapp.com/. Your QR code is attached herewith, you can see the same on your profile',
              attachDataUrls: true,
              attachments: [{
                filename: "qrcode.png",
                path: img,
              }]
              };

            transporter.sendMail(mailOptions, function(error, info) {
              if (error) {
                console.log(error);
              } else {
                console.log('Email sent: ' + info.response);
              }
            });
          })
            User.find({
              username: {
                $regex: /^v/
              }
            }, function(err, check) {
              if (err)
                console.log(err);
              else {
                // console.log(user.email);
                user = {
                  "name": "",
                  "sex": "",
                  "username": "",
                  "address": "",
                  "email": "",
                  "mobile": "",
                  "aadhar": "",
                  "password": "",
                  "status": ""
                };
                req.session.message = {
                  type: 'success',
                  intro: 'Activated',
                  message: 'Visitor ID activated successfully'
                }
                res.render("admin_profile.ejs", {
                  Admin_Name: req.user.name,
                  details: check,
                  visitor: user,
                  message: req.session.message
                });
                // res.redirect("/");
              }
            })
          });
        } else {

          //USER DOES NPT EXIST MESSAGE
          User.find({
            username: {
              $regex: /^v/
            }
          }, function(err, check) {
            if (err)
              console.log(err);
            else {
              user = {
                "name": "",
                "sex": "",
                "username": "",
                "address": "",
                "email": "",
                "mobile": "",
                "aadhar": "",
                "password": "",
                "status": ""
              };

              req.session.message = {
                type: 'danger',
                intro: 'Invalid ID',
                message: 'Enter valid visitor ID'
              }
              res.render("admin_profile.ejs", {
                Admin_Name: req.user.name,
                details: check,
                visitor: user,
                message: req.session.message
              });
              // res.alert("NOT VALID ID")

              // res.alert("Enter valid id");

            }
          })
        }

      }
    })
  });
  //other routes..
}
