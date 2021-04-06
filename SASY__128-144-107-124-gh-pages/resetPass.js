// require('server');
const mongoose =require("mongoose");
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
var QRCode = require('qrcode')
const nodemailer = require('nodemailer');
const crypto = require('crypto');
module.exports = function(app){


  const User= mongoose.model("User");


  //RESET
  app.get("/reset/:token",function(req,res){
      console.log( req.params.token);
      var forgetPass=req.params.token;

      User.findOne({forgetPass:forgetPass},function(err,user){
        if(err)
        {
          console.log(err);
        }
        else{
          if(user){
            console.log(user);
                  res.render("resetPass.ejs",{user:user});
          }
          else
          {
            req.session.message={
            type:'danger',
            intro:'Invalid Link',
            message:'The link you are searching is not valid'
            }
          res.render("forgetPass.ejs",{message:req.session.message});
        }
        }

      })

  });

  app.post("/resetPass",function(req,res){

  console.log(req.body.username);
  console.log(req.body.password);
    var user = new User({username: req.body.username});
    user.setPassword(req.body.password,function(err,user){
      if(err)
      console.log(err);
      else{
        user.save(function(err)
      {
        if(err)
        console.log(err);
        else{
            User.findOne({username:req.body.username},function(err,check){
              if(err)
              console.log(err)
              else{
                var vName=check.name;
                var vAddress=check.address;
                var vEmail=check.email;
                var vMobile=check.mobile;
                var vAadhar=check.aadhar
                var vSex=check.sex;
                var vStatus=check.status;

                User.deleteOne({username:req.body.username},function(err){
                  if(err)
                  console.log(err);
                  else{
                    User.updateOne({username:req.body.username},{
                      name: vName,
                      sex: vSex,
                      address: vAddress,
                      email: vEmail,
                      mobile: vMobile,
                      aadhar: vAadhar,
                      status: vStatus,
                      forgetPass:undefined
                    },function(err){
                      if(err)
                      console.log(err);
                      else{
                        req.session.message={
                          type:'success',
                          intro:'Password Reset',
                          message:'Password changed successfully!! Proceed to login'
                        }
                        res.render("login.ejs",{message:req.session.message});
                      }
                    })
                  }
                })

              }
            })
        }
      });

      }

    })
  });



    //other routes..
}
