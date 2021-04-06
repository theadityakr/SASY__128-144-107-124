// require('server');
const mongoose =require("mongoose");
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
var QRCode = require('qrcode')
module.exports = function(app){


  const User= mongoose.model("User");


  app.get("/visitor_update_by_visitor",function(req,res){
    res.redirect("/Profile");
  });


  app.post("/visitor_update_by_visitor",function(req,res){
    var username=req.body.username;
    console.log(username);  //v1000001
    console.log(req.user.name); //Saloni

    User.findOne({username:username},function(err,user){
      if(err)
      {
        console.log(err)
      }
      else{
        if(user)
        {
            User.updateOne({username:req.body.username},{name:req.body.name,email:req.body.email,mobile:req.body.mobile,address:req.body.address},function(){
                  User.find({username:{ $regex: /^v/ }},function(err,check){
                  if(err)
                  console.log(err);
                  else{
                    // console.log(user.email);
                    user={
                      "name":req.body.name,
                      "sex":req.body.sex,
                      "username":req.body.username,
                      "address":req.body.address,
                      "email":req.body.email,
                      "mobile":req.body.mobile,
                      "aadhar":req.body.aadhar,
                      "password":"",
                      "status":""
                    };
                    req.session.message={
                      type:'success',
                      intro:'Updated',
                      message:'Your details updated successfully'
                    }

                    res.render("visitor_profile.ejs",{Visitor_Name:req.user.name,visitor:user,message:req.session.message});

                    // res.redirect("/");
                  }
                })
                // res.redirect("/profile");
            });
        }


      }
    })
  });
    //other routes..
}
