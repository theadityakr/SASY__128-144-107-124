//jshint esversion:6

const express =require("express");
const bodyParser = require("body-parser");
const request =require("request");
const mongoose =require("mongoose");
var nodemailer = require('nodemailer');

const app =express();
app.set("view-engine","ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));


mongoose.connect("mongodb://localhost:27017/todo",{useNewUrlParser:true});

const adminsSchema=new mongoose.Schema ({
  name:String,
  id:String,
  pass:String
});

const visitorsSchema=new mongoose.Schema ({
  name:String,
  sex:String,
  id:String,
  address:String,
  email:String,
  mobile:String,
  aadhar:String,
  pass:String,
  status:String
});

const Admin=mongoose.model("Admin",adminsSchema);
const Visitor=mongoose.model("Visitor",visitorsSchema);

var start=1000001;
findVisitor();
async function findVisitor(){
  await Visitor.find({},function(err,check){
    if(err)
    {
      console.log(err);
    }
    else{
      start=Number(check[0].id)+1;
      console.log("Visitors Stored");
      return;
    }
  })
};
console.log(start);
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
// for(var i=0;i<collection.length;i++)
// {
//   emails.push(collection[i].email);
//   passwords.push(collections[i].pass);
// }



app.get("/",function(req,res){
  res.sendFile(__dirname+"/rlex-login.html");
});

app.get("/rlex-signup.html",function(req,res){
  res.sendFile(__dirname+"/rlex-signup.html");
});

var detail=[
  {name:"ysk",
  id:"HH",
  email:"JJJ",
  address:"sdsjdhs",
  sex:"Male",
  mobile:"7563458"}
]

app.post("/",function(req,res)
{
  var email=req.body.myemail;
  var pass=req.body.password;
  var x=0;

  var b=email[0];
  email=email.slice(1,email.length);

  if(b=="a")
  findAdmin();
  else if(b=="v")
  findVisitor();


  //Search in admin table
  async function findAdmin(){
   Admin.findOne({id:email},function(err,check){
    if(err)
    {
      console.log(err);
    }
    else{
      if(check)
      {
        if(check.pass==pass)
        {
          res.render("admin_profile.ejs",{Admin_Name:check.name, details:detail});
          return;
        }
        else
        {
          res.send("Invalid pass");
          return;
        }
      }
      else
      {
        res.send("Invalid ID");
        return;
      }
    }
  })
}


//Search in visitor table
async function findVisitor(){
  await Visitor.findOne({id:email},function(err,check){
    if(err)
    {
      console.log(err);
    }
    else{
      if(check)
      {
        if(check.pass==pass && check.status=="active")
        {
          res.send("Login Success");
          return;
        }
        else
        {
          res.send("Invalid pass");
          return;
        }
      }
      else
      {
        res.send("Invalid ID");
        return;
      }
    }
  })
}

});

app.post("/rlex-signup.html",function(req,res)
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

  const visitor=new Visitor({
    name: vName,
    sex: vSex,
    address: vAddress,
    email: vEmail,
    mobile: vMobile,
    aadhar: vAadhar,
    id:vId,
    pass: vPass,
    status: "active"
  });

 visitor.save();

 //Sending email
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


 res.send("Registration Success Proceed to login. Your id is: "+vId);

  // res.redirect("/");
});

app.listen(3000,function(){
  console.log("server started on port 3000");
});
