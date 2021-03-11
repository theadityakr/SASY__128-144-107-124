//jshint esversion:6

const express =require("express");
const bodyParser = require("body-parser");
const request =require("request");
const mongoose =require("mongoose");

const app =express();
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todo",{useNewUrlParser:true});

const adminsSchema={
  name:String,
  id:String,
  pass:String
};

const Admin=mongoose.model("Admin",adminsSchema);

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

app.post("/",function(req,res)
{
  var email=req.body.myemail;
  var pass=req.body.password;
  // console.log(req.body["password"]);
  Admin.find({id:email},function(err,check){
    if(err)
    {
      res.send("INVALID ID");
    }
    else{
      if(check[0].pass==pass)
      res.send("Login Success");
      else
      res.send("Invalid pass");
    }


  })


  // res.redirect("/");
});

app.listen(3000,function(){
  console.log("server started on port 3000");
});
