//jshint esversion:6

require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const nodemailer = require('nodemailer');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const crypto = require('crypto');
var flash = require('express-flash');
var QRCode = require('qrcode')
var cron = require('node-cron');
const app = express();

app.use(express.static("public"));
app.set("view-engine", "ejs");
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false
}));


app.use(passport.initialize());
app.use(passport.session());

app.use(flash());
// mongoose.connect("mongodb://localhost:27017/todo", {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// });
mongoose.connect(process.env.DATABASE_URL,{useNewUrlParser:true, useUnifiedTopology: true });

mongoose.set("useCreateIndex", true);
const connection = mongoose.connection;
connection.once('open', () => {
  console.log("MongoDB database connection established successfully");
});

// mongoose.connect(process.env.DATABASE_URL , { useNewUrlParser: true, useUnifiedTopology: true  })
//         .then(connect => console.log('connected to mongodb..'))
//         .catch(e => console.log('could not connect to mongodb', e))

const usersSchema = new mongoose.Schema({
  username: String,
  password: String,
  name: String,
  sex: String,
  address: String,
  email: String,
  mobile: String,
  aadhar: String,
  status: String,
  forgetPass: String,
  inDate: String,
  outDate: String,
  reqDate:String,
  url: String
});

usersSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", usersSchema);

passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});
app.use((req, res, next) => {
  res.locals.message = req.session.message;
  delete req.session.message;
  next();
})

var start = 1000001;

findVisitor();
async function findVisitor() {
  await User.find({
    username: {
      $regex: /^v/
    }
  }, function(err, check) {

    if (err) {
      console.log(err);
    } else {
      if (check.length > 0) {
        var username = check[check.length - 1].username.slice(1, check[check.length - 1].username.length);
        var max = 1000001;
        for (var i = 0; i < check.length; i++) {
          console.log(max);

          var name = check[i].username.slice(1, check[i].username.length);
          var x = Number(name);

          if (x > max)
            max = x;
        }
        console.log(max);
        start = max + 1;
        console.log("Visitors Stored");
        console.log(check);
      }
      return;
    }
  })
};
//
// User.register({username: "ayash123"}, "ysk", (err, user) => {
//   if(err){
//       console.log(err);
//   }
// });
// var today = new Date(Date.now());
// var dd = today.getDate();
// var mm = today.getMonth() + 1; //January is 0 so need to add 1 to make it 1!
// var yyyy = today.getFullYear();
// if (dd < 10) {
//   dd = '0' + dd
// }
// if (mm < 10) {
//   mm = '0' + mm
// }
//
// today = yyyy + '-' + mm + '-' + dd;
// console.log(today);

cron.schedule('0 0 0 * * *', () => {
  updateStatus();
  async function updateStatus() {
    await User.find({
      username: {
        $regex: /^v/
      },
      status: "approved"
    }, function(err, check) {

      if (err) {
        console.log(err);
      } else {

        var today = new Date(Date.now());
        var valid = today;
        var dd = today.getDate();
        var mm = today.getMonth() + 1; //January is 0 so need to add 1 to make it 1!
        var yyyy = today.getFullYear();
        if (dd < 10) {
          dd = '0' + dd
        }
        if (mm < 10) {
          mm = '0' + mm
        }

        today = yyyy + '-' + mm + '-' + dd;
        console.log(today);

        valid.setDate(valid.getDate()-2);
        var dd1 = valid.getDate();
        var mm1 = valid.getMonth() + 1; //January is 0 so need to add 1 to make it 1!
        var yyyy1 = valid.getFullYear();
        if (dd1 < 10) {
          dd1 = '0' + dd1
        }
        if (mm1 < 10) {
          mm1 = '0' + mm1
        }

        valid = yyyy1 + '-' + mm1 + '-' + dd1;
        // console.log(today);

        // today.setHours(0, 0, 0, 0);
        //
        //
        // if (check.length > 0) {
        //   for (var i = 0; i < check.length; i++) {
        //
        //     console.log(today)
        //     var compare = check[i].reqDate;
        //     if (compare == today) {
        //       var name = check[i].username;
        //       var email = check[i].email;
        //       User.updateOne({
        //         username: check[i].username
        //       }, {
        //         status: "active"
        //       }, function(err) {
        //         if (err)
        //           console.log(err);
        //         else {
        //           console.log(name);
        //           console.log(email);
        //
        //           QRCode.toDataURL(name, function(err, img) {
        //             var transporter = nodemailer.createTransport({
        //               service: 'gmail',
        //               auth: {
        //                 user: process.env.GMAIL_ID,
        //                 pass: process.env.GMAIL_PASS
        //               }
        //             });
        //
        //             var mailOptions = {
        //               from: process.env.GMAIL_ID,
        //               to: email,
        //               subject: 'Status Update',
        //               text: 'Your Visit has been approved!!. Your status has been set to active. Now, you can use your QR code to successfully enter the building.\nYou can also check your status at your profile. You can use your username ( ' + name + ' ) and password to login. Here is the link of the website: https://vms-sasy.herokuapp.com/. Your QR code is attached herewith, you can see the same on your profile',
        //               attachDataUrls: true,
        //               attachments: [{
        //                 filename: "qrcode.png",
        //                 path: img,
        //               }]
        //               // html:'<b>Thanks for visiting the building.</b>'+
        //               //      'Your username has been deactivated successfully<br>'+
        //               //      'You can no logner use your username and password to login to <a href="https://vms-sasy.herokuapp.com/" target="_blank">VMS</a>'
        //             };
        //
        //             transporter.sendMail(mailOptions, function(error, info) {
        //               if (error) {
        //                 console.log(error);
        //               } else {
        //                 console.log('Email sent: ' + info.response);
        //               }
        //             });
        //
        //           })
        //         }
        //       })
        //     }
        if (check.length > 0) {
          for (var i = 0; i < check.length; i++) {
            var compare = check[i].reqDate;
            if (compare == valid && check[i].inDate=="") {
              var name = check[i].username;
              var email = check[i].email;
              User.updateOne({
                username: check[i].username
              }, {
                status: "Inactive"
              }, function(err) {
                if (err)
                  console.log(err);
                else {
                  console.log(name);
                  console.log(email);

                  QRCode.toDataURL(name, function(err, img) {
                    var transporter = nodemailer.createTransport({
                      service: 'gmail',
                      auth: {
                        user: process.env.GMAIL_ID,
                        pass: process.env.GMAIL_PASS
                      }
                    });

                    var mailOptions = {
                      from: process.env.GMAIL_ID,
                      to: email,
                      subject: 'Status Update',
                      text: 'Your Id has been deactivated because of no visit. You can no longer login to your profile. Kindly Register as a new visiter to get a new Visiit Link to VMS is: https://vms-sasy.herokuapp.com/',

                      // html:'<b>Thanks for visiting the building.</b>'+
                      //      'Your username has been deactivated successfully<br>'+
                      //      'You can no logner use your username and password to login to <a href="https://vms-sasy.herokuapp.com/" target="_blank">VMS</a>'
                    };

                    transporter.sendMail(mailOptions, function(error, info) {
                      if (error) {
                        console.log(error);
                      } else {
                        console.log('Email sent: ' + info.response);
                      }
                    });

                  })
                }
              })
            }
          }
        };
        return;
      }
    })
  };
}, {
  scheduled: true,
  timezone: "Asia/Kolkata"
});

require('./login')(app);

require('./home')(app);

require('./logout')(app);

require('./search_visitor')(app);

require('./profiles')(app);

require('./del_visitor')(app);

require('./visitor_update_by_admin')(app);

require('./visitor_update_by_visitor')(app);

require('./forgetPass')(app);

require('./resetPass')(app);

require('./pendingRequests')(app);

require('./accept_request')(app);

require('./instant_accept')(app);

require('./del_request')(app);

require('./checkin')(app);



//SIGNUP
app.get("/signup", function(req, res) {
  if (req.isAuthenticated()) {
    res.redirect("/profile");
  } else {
    res.render("signup.ejs");
  }

});

app.post("/signup", function(req, res) {
  var vName = req.body.name;

  var vAddress = req.body.address;
  var vEmail = req.body.email;
  var vMobile = req.body.mobile;
  var vAadhar = req.body.aadhar
  var vPass = req.body.pass;
  var vSex = req.body.sex;
  var date = req.body.date;
  console.log(date);

  var vId = start.toString();

  console.log(req.body.url);
  // var vId=id.toString();
  vId = "v" + vId;

  start = start + 1;
  // vId="v"+parseString(start);
  // parse
  console.log(vId);
  // var d=new Date(Date.now());
  User.register({
    username: vId
  }, vPass, (err, user) => {
    if (err) {
      console.log(err);
    } else {
      // Sending email
      User.updateOne({
        username: vId
      }, {
        name: vName,
        sex: vSex,
        address: vAddress,
        email: vEmail,
        mobile: vMobile,
        aadhar: vAadhar,
        status: "pending",
        forgetPass: undefined,
        inDate: "",
        reqDate:date,
        outDate: "",
        url: req.body.url
      }, function(err, check) {
        if (err)
          console.log(err);
        else {
          // console.log("UPDATED")
          var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: process.env.GMAIL_ID,
              pass: process.env.GMAIL_PASS
            }
          });


          QRCode.toDataURL(vId, function(err, img) {


            var mailOptions = {
              from: process.env.GMAIL_ID,
              to: vEmail,
              subject: 'Registration on VMS',
              text: 'Thanks for registration. You have successfully registered. Your username is: ' + vId + '. Your current request to visit is pending. We will keep you updated. You can also check your status at your profile. You can use your username and password to login. Here is the link of the website: https://vms-sasy.herokuapp.com/\n Below is your QR code. You will need to scan this QR to have access to the building once your request is approved and status is set as "active"',
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

          var mailOptions = {
            from: process.env.GMAIL_ID,
            to: process.env.GMAIL_ID,
            subject: 'New pending request',
            text: 'A new visit request has been made under the user id: ' + vId + '. Kindly verify the request and update the same from the Pending Requests section of your profile',
            attachDataUrls: true,

          };

          transporter.sendMail(mailOptions, function(error, info) {
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
            }
          });


          req.session.message = {
            type: 'success',
            intro: 'Registration Success',
            message: 'Your Visit Request Has Been Sent To Admin'
          }
          res.render("login.ejs", {
            message: req.session.message
          });
        }
      });
    }
  });



});


app.listen(process.env.PORT || 3000, function() {
  console.log("server started on port 3000");
});
