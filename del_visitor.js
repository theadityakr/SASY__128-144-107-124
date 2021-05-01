// require('server');
const mongoose =require("mongoose");
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const nodemailer = require('nodemailer');
var QRCode = require('qrcode')
module.exports = function(app){


  const User= mongoose.model("User");


  app.get("/del_visitor",function(req,res){
    res.redirect("/Profile");
  });

  app.post("/del_visitor",function(req,res){
    var username=req.body.username;
    console.log(username);
    console.log(req.user.name);

    // username=username.slice(1,username.length);
    // console.log(username);
    User.findOne({username:username},function(err,user){
      if(err)
      {
        console.log(err)
      }
      else{
        if(user)
        {
          var d=new Date(Date.now());
            User.updateOne({username:req.body.username},{status:"Inactive",outDate:d},function(){
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
                subject: 'Thanks for your Visit',
                text: 'Thanks for visiting the building. Your username has been deactivated successfully\nYou can no longer use your username and password to login to your profile',
                attachDataUrls: true,
                // html:'<b>Thanks for visiting the building.</b>'+
                //      'Your username has been deactivated successfully<br>'+
                //      'You can no logner use your username and password to login to <a href="https://vms-sasy.herokuapp.com/" target="_blank">VMS</a>'
              };

              transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                  console.log(error);
                } else {
                  console.log('Email sent: ' + info.response);
                }
              });
                  User.find({username:{ $regex: /^v/ }},function(err,check){
                  if(err)
                  console.log(err);
                  else{
                    // console.log(user.email);
                    user={
                      "name":"",
                      "sex":"",
                      "username":"",
                      "address":"",
                      "email":"",
                      "mobile":"",
                      "aadhar":"",
                      "password":"",
                      "status":""
                    };
                    req.session.message={
                      type:'success',
                      intro:'deactivate',
                      message:'Visitor ID deactivated successfully'
                    }
                    res.render("admin_profile.ejs",{Admin_Name:req.user.name,details:check,visitor:user,message:req.session.message});
                    // res.redirect("/");
                  }
                })
            });
        }
        else{

          //USER DOES NPT EXIST MESSAGE
          User.find({username:{ $regex: /^v/ }},function(err,check){
            if(err)
            console.log(err);
            else{
                  user={
                    "name":"",
                    "sex":"",
                    "username":"",
                    "address":"",
                    "email":"",
                    "mobile":"",
                    "aadhar":"",
                    "password":"",
                    "status":""
                  };
                  User.find({username:{ $regex: /^v/ }},function(err,check){
                    if(err)
                    console.log(err);
                    else{
                      req.session.message={
                        type:'danger',
                        intro:'Invalid ID',
                        message:'Enter valid visitor ID'
                      }
                        res.render("admin_profile.ejs",{Admin_Name:req.user.name,details:check,visitor:user,message:req.session.message});
                        // res.alert("NOT VALID ID")
                    }
                  });
                  // res.alert("Enter valid id");

                }
              })
        }

      }
    })
  });
    //other routes..
}