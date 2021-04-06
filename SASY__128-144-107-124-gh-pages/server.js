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
var QRCode = require('qrcode')
const app=express();

app.use(express.static("public"));
app.set("view-engine","ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(session({
  secret:process.env.SECRET,
  resave:false,
  saveUninitialized: false
}));


app.use(passport.initialize());
app.use(passport.session());

app.use(flash());
mongoose.connect("mongodb://localhost:27017/todo",{useNewUrlParser:true, useUnifiedTopology: true });
// mongoose.connect(process.env.DATABASE_URL,{useNewUrlParser:true, useUnifiedTopology: true });
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
  forgetPass:String,
  inDate:String,
  outDate:String,
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

require('./login')(app);

require('./home')(app);

require('./logout')(app);

require('./search_visitor')(app);

require('./profiles')(app);

require('./del_visitor')(app);

require('./visitor_update_by_admin')(app);

require('./visitor_update_by_visitor')(app);

require('./forgetPass')(app);

require('./resetPass')(app);





//SIGNUP
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
  var d=new Date(Date.now());
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
        forgetPass:undefined,
        inDate:d,
        outDate:""
      },function(err,check){
        if(err)
        console.log(err);
        else{
          // console.log("UPDATED")
          var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: process.env.GMAIL_ID,
              pass: process.env.GMAIL_PASS
            }
          });


            QRCode.toDataURL(vId,function(err,img){


            var mailOptions = {
              from: 'vms.sasy@gmail.com',
              to: vEmail,
              subject: 'Registration on VMS',
              // text: 'Thanks for registration',
              attachDataUrls: true,
              html:'<img src="'+img+'">'
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
              }
            });
            req.session.message={
              type:'success',
              intro:'Registration Success',
              message:'Visitor registered successfully'
            }
            res.render("signup.ejs",{message:req.session.message});
          })
        }
      });

    }
  });

});


app.listen( process.env.PORT || 3000,function(){
  console.log("server started on port 3000");
});
