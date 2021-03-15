//jshint esversion:6
require('dotenv').config();
const express =require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose =require("mongoose");
const nodemailer = require('nodemailer');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');

const app =express();

app.use(express.static("public"));
app.set("view-engine","ejs");
app.use(bodyParser.urlencoded({extended:true}));

app.use(session({
  secret:"Our little secret.",
  resave:false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/todo",{useNewUrlParser:true, useUnifiedTopology: true });

const adminsSchema=new mongoose.Schema ({
  name:String,
  username:String,
  password:String
});

const visitorsSchema=new mongoose.Schema ({
  name:String,
  sex:String,
  username:String,
  address:String,
  email:String,
  mobile:String,
  aadhar:String,
  password:String,
  status:String
});

adminsSchema.plugin(passportLocalMongoose);
visitorsSchema.plugin(passportLocalMongoose);

const Admin=mongoose.model("Admin",adminsSchema);
const Visitor=mongoose.model("Visitor",visitorsSchema);

passport.use(Admin.createStrategy());
passport.serializeUser(Admin.serializeUser());
passport.deserializeUser(Admin.deserializeUser());

passport.use(Visitor.createStrategy());
passport.serializeUser(Visitor.serializeUser());
passport.deserializeUser(Visitor.deserializeUser());

var start=1000001;

findVisitor();
async function findVisitor(){
  await Visitor.find({},function(err,check){
    if(err)
    {
      console.log(err);
    }
    else{
      if(check.length>0)
      {

        start=Number(check[check.length-1].username)+1;
        console.log("Visitors Stored");
        console.log(check);
      }
      return;
    }
  })
};

// const admin1=new Admin({
//   name:"yash",
//   id:"1",
//   pass:"y"
// });
// const admin2=new Admin({
//   name:"shivansh",
//   id:"2",
//   pass:"s"
// });
// const admin3=new Admin({
//   name:"aditya",
//   id:"3",
//   pass:"a"
// });
// Admin.insertMany([admin1,admin2,admin3],function(err){
//   if(err)
//   {
//     console.log(err);
//   }
//   else
//   console.log("Values Inserted");
// });

// Admin.register({
//   name: "YSK",
//   username: "1000003"},
//   "y",
//   function(err,user){
//     if(err)
//     {
//       console.log(err);
//       // res.redirect("/register");
//     }
//     else{
//       // passport.authenticate("local")(req,res,function(){
//         console.log("registered");
//         // res.redirect("admin_profile");
//       }
//     }
//
// );

app.get("/",function(req,res){
  res.sendFile(__dirname+"/home.html");
});

app.get("/login",function(req,res){
  res.sendFile(__dirname+"/login.html");
});

app.get("/signup",function(req,res){
  res.sendFile(__dirname+"/signup.html");
});

app.get("/search_visitor",function(req,res){
  res.redirect("/admin_profile");
});

app.get("/admin_profile",function(req,res){
  if(req.isAuthenticated())
  {
      findVisitor();
      async function findVisitor(){
        await Visitor.find({},function(err,check){
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
                "status":""
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
//
// var detail=[
//   {name:"ysk",
//   id:"HH",
//   email:"JJJ",
//   address:"sdsjdhs",
//   sex:"Male",
//   mobile:"7563458"}
// ]

app.post("/login",function(req,res)
{
  var email=req.body.myemail;
  var pass=req.body.password;
  var x=0;

  var b=email[0];
  email=email.slice(1,email.length);

  if(b=="a")
  {
    // console.log(pass);
    const user= new Admin({
      username:email,
      password:pass
    });
    console.log("admin id");
    req.login(user,function(err){
      if(err)
      {
        console.log(err);
      }
      else{
          passport.authenticate('localhost')(req,res,function(){
            res.redirect("/admin_profile");
          console.log("HII");


          // res.redirect("/home");
        })
      }
    })
  }

//   if(b=="a")
//   findAdmin();
//   else if(b=="v")
//   findVisitor();
//
//
//   //Search in admin table
//   async function findAdmin(){
//    Admin.findOne({username:email},function(err,check){
//     if(err)
//     {
//       console.log(err);
//     }
//     else{
//       if(check)
//       {
//         if(check.pass==pass)
//         {
//           Visitor.find({},function(err,detail){
//             if(err)
//             {
//               console.log(err);
//               return;
//             }
//             else{
//               res.render("admin_profile.ejs",{Admin_Name:check.name, details:detail,id:"abc@abc.com"});
//               return;
//             }
//           })
//
//         }
//         else
//         {
//           res.send("Invalid pass");
//           return;
//         }
//       }
//       else
//       {
//         res.send("Invalid ID");
//         return;
//       }
//     }
//   })
// }
//
//
// //Search in visitor table
// async function findVisitor(){
//   await Visitor.findOne({username:email},function(err,check){
//     if(err)
//     {
//       console.log(err);
//     }
//     else{
//       if(check)
//       {
//         if(check.pass==pass && check.status=="active")
//         {
//           res.send("Login Success");
//           return;
//         }
//         else
//         {
//           res.send("Invalid pass");
//           return;
//         }
//       }
//       else
//       {
//         res.send("Invalid ID");
//         return;
//       }
//     }
//   })
// }

});

app.post("/signup",function(req,res)
{
  var vName=req.body.name;
  var vRadiomale=req.body.radiomale;
  var vRadiofemale=req.body.radiofemale;
  var vAddress=req.body.address;
  var vEmail=req.body.email;
  var vMobile=req.body.mobile;
  var vAadhar=req.body.aadhar
  var vPass=req.body.pass;
  var vSex="";
  if( vRadiofemale=="ON")
  vSex="Male";
  else
  sex="Female";
  var vId=start;
  start=start+1;

  // find();
  // async function find(){
  //
  //   // db.demo141.find().sort({_id:-1}).limit(1);
  // await  Visitor.find({},function(err,check).sort({id:-1}).limit(1){
  //     if(err)
  //     {
  //       console.log(err);
  //     }
  //     else{
  //       if(check)
  //       {
  //         vId=check.id+1;
  //       }
  //     }
  //   })
  // }

 //  const visitor=new Visitor({
 //    name: vName,
 //    sex: vSex,
 //    address: vAddress,
 //    email: vEmail,
 //    mobile: vMobile,
 //    aadhar: vAadhar,
 //    id:vId,
 //    pass: vPass,
 //    status: "active"
 //  });
 //
 // visitor.save();
console.log(start);

 Visitor.register({
   name: vName,
   sex: vSex,
   address: vAddress,
   email: vEmail,
   mobile: vMobile,
   aadhar: vAadhar,
   username:vId,
   status: "active"},
   vPass,
   function(err,user){
     if(err)
     {
       console.log(err);
       res.redirect("/register");
     }
     else{
       passport.authenticate("local")(req,res,function(){
         // res.redirect("/home");
         res.send("AUTHENTICATED");
       })
     }
   }
 );

 // Sending email
 // var transporter = nodemailer.createTransport({
 //   service: 'gmail',
 //   auth: {
 //     user: 'vms.sasy@gmail.com',
 //     pass: 'sasy2019'
 //   }
 // });
 //
 // var mailOptions = {
 //   from: 'vms.sasy@gmail.com',
 //   to: vEmail,
 //   subject: 'Registration on VMS',
 //   text: 'Thanks for registration',
 //   attachments:[{
 //     path:__dirname+'/website-design-ideas-start-with-grayscale-768x530.jpg',
 //     // path:__dirname+'/'
 //   }]
 // };
 //
 // transporter.sendMail(mailOptions, function(error, info){
 //   if (error) {
 //     console.log(error);
 //   } else {
 //     console.log('Email sent: ' + info.response);
 //   }
 // });
 //
 //
 // res.send("Registration Success Proceed to login. Your id is: "+vId);

  // res.redirect("/");
});

app.post("/search_visitor",function(req,res){
  var username=req.body.username;
  console.log(username);
  console.log(req.user.name);

  username=username.slice(1,username.length);
  console.log(username);
  Visitor.findOne({username:username},function(err,user){
    if(err)
    {
      console.log(err)
    }
    else{
      if(user)
      {
          Visitor.find({},function(err,check){
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
        Visitor.find({},function(err,check){
          if(err)
          console.log(err);
          else{
                user={
                  "name":"",
                  "sex":"",
                  "username":"NOT A VALID ID",
                  "address":"",
                  "email":"",
                  "mobile":"",
                  "aadhar":"",
                  "password":"",
                  "status":""
                };
                Visitor.find({},function(err,check){
                  if(err)
                  console.log(err);
                  else{
                      res.render("admin_profile.ejs",{Admin_Name:req.user.name,details:check,visitor:user});
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

// app.get("/modifyVisitorDetails",function(req,res)
// {
//     var vId=req.body.user_id;
//     search();
//     async function search(){
//       await Visior.findOne({username:vId},function(err,check){
//         if(err)
//         console.log(err);
//         else{
//           res.render("admin_profile.ejs",{})
//         }
//       })
//     }
// });




app.listen(3000,function(){
  console.log("server started on port 3000");
});
