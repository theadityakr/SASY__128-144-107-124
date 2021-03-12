//jshint esversion:6

const express =require("express");
const bodyParser = require("body-parser");
const request =require("request");
const mongoose =require("mongoose");

const app =express();
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todo",{useNewUrlParser:true});

const adminsSchema=new mongoose.Schema ({
  name:String,
  id:String,
  pass:String
});

const visitorsSchema=new mongoose.Schema ({
  name:String,
  sex:String,
  address:String,
  email:String,
  mobile:String,
  aadhar:String,
  pass:String,
});

const Admin=mongoose.model("Admin",adminsSchema);
const Visitor=mongoose.model("Visitor",visitorsSchema);
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
  res.sendfile(__dirname+"/rlex-login.html");
});

app.get("/rlex-signup.html",function(req,res){
  res.sendfile(__dirname+"/rlex-signup.html");
});

app.post("/",function(req,res)
{
  var email=req.body.myemail;
  var pass=req.body.password;
  // console.log(req.body["password"]);
  Admin.findOne({id:email},function(err,check){
    if(err)
    {
      console.log(err);
    }
    else{
      if(check)
      {
        if(check.pass==pass)
        res.send("Login Success");
        else
        res.send("Invalid pass");
      }
    }
  })
  Visitor.findOne({name:email},function(err,check){
    if(err)
    {
      console.log(err);
    }
    else{
      if(check)
      {
        if(check.pass==pass)
        res.send("Login Success");
        else
        res.send("Invalid pass");
      }
    }
  })

  // if(Admin.findOne({id:email})==null)
  res.send("Invalid ID");

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
  if( vRadiofemale=="on")
  vSex="Male";
  else
  sex="Female";

  const visitor=new Visitor({
    name: vName,
    sex: vSex,
    address: vAddress,
    email: vEmail,
    mobile: vMobile,
    aadhar: vAadhar,
    pass: vPass,
  });

 visitor.save();
  res.send("Registration Success Proceed to login");


  // res.redirect("/");
});

app.listen(3000,function(){
  console.log("server started on port 3000");
});
