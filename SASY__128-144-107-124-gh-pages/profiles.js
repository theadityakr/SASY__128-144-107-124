// require('server');
const mongoose =require("mongoose");
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
var QRCode = require('qrcode')
module.exports = function(app){


  const User= mongoose.model("User");


  app.get("/admin_profile",function(req,res){
  // console.log(req.user.username);
    if(req.isAuthenticated() )
    {
        findVisitor();
        async function findVisitor(){
          await User.find({username:{ $regex: /^v/ }},function(err,check){
            if(err)
            {
              console.log(err);
            }
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
                  "status":"",
                  "forgetPass":undefined,
                };

                res.render("admin_profile.ejs",{Admin_Name:req.user.name,details:check,visitor:user});

            }
          })
        };

    }
      // res.render("admin_profile");
    else{
      res.redirect("/login");
    }
  });

  app.get("/visitor_profile",function(req,res){

    if(req.isAuthenticated())
    {
        var username= req.user.username;
        console.log(username);
        findVisitor();
        async function findVisitor(){
          await User.findOne({username:username},function(err,user){
            if(err)
            {
              console.log(err);
            }
            else{
                 QRCode.toDataURL(req.user.username,function(err,img){
                   res.render("visitor_profile.ejs",{Visitor_Name:username,visitor:user,qr_code:img});
                 });

          }
          })
        };

    }
      // res.render("admin_profile");
    else{
      res.redirect("/login");
    }
  });

  app.get("/profile",function(req,res){
    if(req.isAuthenticated()){
      if(req.user.username[0]=="a")
      {
        res.redirect("/admin_profile");
      }
      else
      res.redirect("/visitor_profile");
    }
    else
    {
      res.redirect("/login");
    }

  });

    //other routes..
}
