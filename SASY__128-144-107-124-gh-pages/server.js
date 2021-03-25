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
var flash = require('express-flash');
const app=express();

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

app.use(flash());
mongoose.connect("mongodb://localhost:27017/todo",{useNewUrlParser:true, useUnifiedTopology: true });
mongoose.set("useCreateIndex", true);
const connection = mongoose.connection;
connection.once('open', () => {
    console.log("MongoDB database connection established successfully");
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
  forgetPass:String
});

usersSchema.plugin(passportLocalMongoose);

const User=new mongoose.model("User",usersSchema);

passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});
app.use((req,res,next)=>{
  res.locals.message=req.session.message;
  delete req.session.message;
  next();
})

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
        var max=1000001;
        for(var i=0;i<check.length;i++)
        {
          console.log(max);

          var name=check[i].username.slice(1,check[i].username.length);
          var x=Number(name);

          if(x>max)
          max=x;
        }
        console.log(max);
        start=max+1;
        console.log("Visitors Stored");
        console.log(check);
      }
      return;
    }
  })
};

// User.register({username: "ayash123"}, "ysk", (err, user) => {
//   if(err){
//       console.log(err);
//   }
// });

app.get("/",function(req,res){
  res.render("home.ejs");
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
  res.render("login.ejs");
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
    res.render("signup.ejs");
  }
  else
  {
    res.redirect("/login");
  }

});

app.get("/search_visitor",function(req,res){
  res.redirect("/admin_profile");
});
app.get("/del_visitor",function(req,res){
  res.redirect("/Profile");
});
app.get("/visitor_update_by_admin",function(req,res){
  res.redirect("/Profile");
});
app.get("/visitor_update_by_visitor",function(req,res){
  res.redirect("/Profile");
});

app.get("/forgetPass",function(req,res){
  res.render("forgetPass.ejs");
});


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
              res.render("visitor_profile.ejs",{Visitor_Name:username,visitor:user});
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

app.post("/login",function(req,res,next)
{
  var email=req.body.username;
  var pass=req.body.password;
  var x=0;

    const user= new User({
      username:req.body.username,
      password:req.body.password
    });
    req.login(user,function(err){
      if(err)
      {
        console.log(err);
      }
      else{
        req.session.message={
          type:'danger',
          intro:'Invalid Credentials',
          message:'Your Id or password is wrong'
        }
            passport.authenticate('local', function(err, user, info) {
            if (err) { return next(err); }
            if (!user) { return res.render('login.ejs',{message:req.session.message}); }
            req.logIn(user, function(err) {
              if (err) { return next(err); }
              return res.redirect('/profile');
            });
          })(req, res, next);

      }
    })

});

app.post("/signup",function(req,res)
{
  var vName=req.body.name;

  var vAddress=req.body.address;
  var vEmail=req.body.email;
  var vMobile=req.body.mobile;
  var vAadhar=req.body.aadhar
  var vPass=req.body.pass;
  var vSex=req.body.sex;

  var vId=start.toString();
  // var vId=id.toString();
  vId="v"+vId;

  start=start+1;
  // vId="v"+parseString(start);
  // parse
  console.log(vId);

  User.register({username:vId}, vPass, (err, user) => {
    if(err){
        console.log(err);
    }
    else
    {
      // Sending email
      User.updateOne({username:vId},{
        name: vName,
        sex: vSex,
        address: vAddress,
        email: vEmail,
        mobile: vMobile,
        aadhar: vAadhar,
        status: "active",
        forgetPass:undefined
      },function(err,check){
        if(err)
        console.log(err);
        else{
          console.log("UPDATED")
          var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: 'vms.sasy@gmail.com',
              pass: 'sasy2019'
            }
          });

          var mailOptions = {
            from: 'vms.sasy@gmail.com',
            to: vEmail,
            subject: 'Registration on VMS',
            text: 'Thanks for registration',
            attachments:[{
              path:__dirname+'/website-design-ideas-start-with-grayscale-768x530.jpg',
              // path:__dirname+'/'
            }]
          };

          transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
            }
          });
          req.session.message={
            type:'success',
            intro:'Registration Success',
            message:'Visitor registered successfully'
          }
          res.render("signup.ejs",{message:req.session.message});

        }
      });


      // passport.authenticate("local")(req,res,function(){
      //   // res.redirect("/home");
      //   // res.send("AUTHENTICATED");
      //   res.redirect("/profile");
      // })
    }
  });

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
                  req.session.message={
                    type:'success',
                    intro:'Updated',
                    message:'Visitor details updated successfully'
                  }
                  res.render("admin_profile.ejs",{Admin_Name:req.user.name,details:check,visitor:user,message:req.session.message});
                  // res.redirect("/");
                }
              })
              // res.redirect("/profile");
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
                  user: 'vms.sasy@gmail.com',
                  pass: 'sasy2019'
                }
              });
              var link="http://localhost:3000/reset/"+token;
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

app.listen(3000,function(){
  console.log("server started on port 3000");
});
