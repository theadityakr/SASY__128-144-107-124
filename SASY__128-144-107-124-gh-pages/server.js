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
const crypto = require('crypto');

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

const usersSchema=new mongoose.Schema({
  username:String,
  password:String,
  name:String,
  sex:String,
  address:String,
  email:String,
  mobile:String,
  aadhar:String,
  status:String,
  forgetPass:String,
})

adminsSchema.plugin(passportLocalMongoose);
visitorsSchema.plugin(passportLocalMongoose);
usersSchema.plugin(passportLocalMongoose);

const Admin=mongoose.model("Admin",adminsSchema);
const Visitor=mongoose.model("Visitor",visitorsSchema);
const User=mongoose.model("User",usersSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
//
// passport.use(Visitor.createStrategy());
// passport.serializeUser(Visitor.serializeUser());
// passport.deserializeUser(Visitor.deserializeUser());

var start=1000001;

findVisitor();
async function findVisitor(){
  await User.find({username:{ $regex: /^v/ }},function(err,check){
    if(err)
    {
      console.log(err);
    }
    else{
      if(check.length>0)
      {
        var username=check[check.length-1].username.slice(1,check[check.length-1].username.length);
        start=Number(username)+1;
        console.log("Visitors Stored");
        console.log(check);
      }
      return;
    }
  })
};
console.log(start);
// var f=start.toString();
// console.log(f);
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
//   username: "a1000003"},
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
//     User.register({
//       name: "YSK",
//       username: "a1000003",
//       sex:"Male",
//       address:"",
//       email:"",
//       mobile:"",
//       aadhar:"",
//       status:"",
//       forgetPass:undefined,
//     },
//       "y",
//       function(err,user){
//         if(err)
//         {
//           console.log(err);
//           // res.redirect("/register");
//         }
//         else{
//           // passport.authenticate("local")(req,res,function(){
//             console.log("User registered");
//             // res.redirect("admin_profile");
//           }
//         }
//
// );

app.get("/",function(req,res){
  res.sendFile(__dirname+"/home.html");
});
app.get("/home",function(req,res){
  res.redirect("/");
});

app.get("/login",function(req,res){

  if(req.isAuthenticated())
  {
    res.redirect("/profile");
  }
  else
  res.sendFile(__dirname+"/login.html");
});

app.get("/logout",function(req,res){
  if(req.isAuthenticated())
  {
    req.logout();
    res.redirect("/login");
  }
  else
  {
    res.redirect("/login");
  }
});

app.get("/signup",function(req,res){
  if(req.isAuthenticated() && req.user.username[0]=="a")
  {
    // console.log(req.user.username);
    res.sendFile(__dirname+"/signup.html");
  }
  else
  {
    res.redirect("/login");
  }

});

app.get("/search_visitor",function(req,res){
  res.redirect("/admin_profile");
});

app.get("/forgetPass",function(req,res){
  res.sendFile(__dirname+"/forgetPass.html");
});


//RESET
app.get("/reset/:token",function(req,res){
    console.log( req.params.token);
    var forgetPass=req.params.token;
    // res.sendFile(__dirname+"/resetPass.html");

    // // console.log(req.username);
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
        res.send("Invalid link");
      }

    })

});





app.get("/admin_profile",function(req,res){
// console.log(req.user.username);
  if(req.isAuthenticated() )
  {
    console.log(req.params.username);
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
              res.render("visitor_profile.ejs",{Visitor_Name:user.name,visitor:user});
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
  // email=email.slice(1,email.length);
  console.log(email);
  console.log(pass);
  if(b=="a")
  {
    // console.log(pass);
    const user= new User({
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
          console.log("HII admin");
        })
      }
    })
  }
  else if(b=="v")
  {

    const user= new User({
      username:email,
      password:pass
    });
    console.log("visitor id");
    req.login(user,function(err){
      if(err)
      {
        console.log(err);
      }
      else{
            passport.authenticate('localhost')(req,res,function(){
            res.redirect("/visitor_profile");
            console.log("Hiii visitor");
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

  if( vRadiomale=="on")
  vSex="Male";
  else
  sex="Female";
  var vId=start.toString();
  // var vId=id.toString();
  vId="v"+vId;

  start=start+1;
  // vId="v"+parseString(start);
  // parse
  console.log(vId);


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
// console.log(start);
// res.send("R");
 User.register({
   name: vName,
   sex: vSex,
   address: vAddress,
   email: vEmail,
   mobile: vMobile,
   aadhar: vAadhar,
   username:vId,
   status: "active",
   forgetPass:undefined},
   vPass,
   function(err,user){
     if(err)
     {
       console.log(err);
       res.redirect("/signup");
     }
     else{
       passport.authenticate("localhost")(req,res,function(){
         // res.redirect("/home");
         // res.send("AUTHENTICATED");
         res.redirect("/profile");
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
                  "username":"NOT A VALID ID",
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
          User.deleteOne({username:req.body.username},function(){
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
                  res.render("admin_profile.ejs",{Admin_Name:req.user.name,details:check,visitor:user});
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
                  "username":"NOT A VALID ID",
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

app.post("/visitor_update_by_admin",function(req,res){
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
          User.updateOne({username:req.body.username},{name:req.body.name,email:req.body.email,mobile:req.body.mobile,address:req.body.address,staus:req.body.status},function(){
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
                  res.render("admin_profile.ejs",{Admin_Name:req.user.name,details:check,visitor:user});
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
                  "username":"NOT A VALID ID",
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
          User.updateOne({username:username},{forgetPass:token},function(err,check){
            if(err)
            console.log(err)
            else{
              var transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                  user: 'vms.sasy@gmail.com',
                  pass: 'sasy2019'
                }
              });
              var link="http://localhost:3000/reset/"+token;
              var mailOptions = {
                from: 'vms.sasy@gmail.com',
                to: user.email,
                subject: 'Reset Password',
                text: 'Someone has requested to reset your VMS password.\nIf the request is done by you, then tap on the following link to reset your password:\n'+link,
                // attachments:[{
                //   path:__dirname+'/website-design-ideas-start-with-grayscale-768x530.jpg',
                //   // path:__dirname+'/'
                // }]
              };

              transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                  console.log(error);
                } else {
                  console.log('Email sent: ' + info.response);
                  res.redirect(".login");
                }
              });

              // return;
            }
          });

        }
        else{
          res.send("USER NOT FOUND");
          // setTimeout()
        }
      }
    })
  }

});

app.post("/resetPass",function(req,res){

  var username=console.log(req.body.username);
  var newPass=console.log(req.body.pass);
  User.updateOne({username:username},{password:newPass, forgetPass:undefined},function(err){
    if(err)
    console.log(err);
    else
    res.send("PASS CHANGED");

  })

});







app.listen(3000,function(){
  console.log("server started on port 3000");
});
