// require('server');
const mongoose =require("mongoose");
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
var QRCode = require('qrcode')
const nodemailer = require('nodemailer');
const crypto = require('crypto');
module.exports = function(app){


  const User= mongoose.model("User");


  app.get("/forgetPass",function(req,res){
    res.render("forgetPass.ejs");
  });

  app.post("/forgetPass",function(req,res){
    var username=req.body.username;
    console.log(username);
    var buf = crypto.randomBytes(20);
    var token=buf.toString('hex');
    // console.log(buf.toString('hex'));
    find();
    async function find()
    {
      await User.findOne({username:username},function(err,user){
        if(err)
        console.log(err);
        else{
          if(user){
            console.log(user);
            User.updateOne({username:username},{forgetPass:token},function(err,check){
              if(err)
              console.log(err)
              else{
                var transporter = nodemailer.createTransport({
                  service: 'gmail',
                  auth: {
                    user: process.env.GMAIL_ID,
                    pass: process.env.GMAIL_PASS
                  }
                });
                var link="https://vms-sasy.herokuapp.com/reset/"+token;
                var mailOptions = {
                  from: 'vms.sasy@gmail.com',
                  to: user.email,
                  subject: 'Reset Password',
                  text: 'Someone has requested to reset your VMS password.\nIf the request is done by you, then tap on the following link to reset your password:\n'+link

                };

                transporter.sendMail(mailOptions, function(error, info){
                  if (error) {
                    console.log(error);
                  } else {
                    console.log('Email sent: ' + info.response);
                    req.session.message={
                      type:'success',
                      intro:'Email Sent',
                      message:'Check your email to reset the password'
                    }
                    res.render("login.ejs",{message:req.session.message});
                  }
                });

                // return;
              }
            });

          }
          else{
            req.session.message={
              type:'Danger',
              intro:'Invalid ID',
              message:'Enter valid ID'
            }
            res.render("forgetPass.ejs",{message:req.session.message});
            // setTimeout()
          }
        }
      })
    }

  });


    //other routes..
}
