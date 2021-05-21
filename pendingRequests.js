// require('server');
const mongoose =require("mongoose");
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
var QRCode = require('qrcode')
module.exports = function(app){


  const User= mongoose.model("User");


  app.get("/pendingRequests",function(req,res){
  // console.log(req.user.username);
    if(req.isAuthenticated())
    {
      if(req.user.username[0]=='a')
      {

        findVisitor();
        async function findVisitor(){
          await User.find({username:{ $regex: /^v/ }},function(err,check){
            if(err)
            {
              console.log(err);
            }
            else{
              var pUsers=[];
              for(var item=0;item<check.length;item++)
              {
                if(check[item].status=="pending")
                {
                  pUsers.push(check[item]);
                }
              }

                res.render("pendingRequests.ejs",{Admin_Name:req.user.name,details:pUsers});

            }
          })
        };
      }
      else{
        res.redirect("/profile");
      }

    }
      // res.render("admin_profile");
    else{
      res.redirect("/login");
    }
  });

    //other routes..
}
