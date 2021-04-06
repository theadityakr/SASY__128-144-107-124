// require('server');
const mongoose =require("mongoose");
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
module.exports = function(app){


  const User= mongoose.model("User");


  app.get("/search_visitor",function(req,res){
    res.redirect("/admin_profile");
  });

  app.post("/search_visitor",function(req,res){
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
            User.find({username:{ $regex: /^v/ }},function(err,check){
            if(err)
            console.log(err);
            else{
              // console.log(user.email);
              res.render("admin_profile.ejs",{Admin_Name:req.user.name,details:check,visitor:user});
              // res.redirect("/");
            }
          })
        }
        else{
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
