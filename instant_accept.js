// require('server');
const mongoose =require("mongoose");
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const nodemailer = require('nodemailer');
var QRCode = require('qrcode')
module.exports = function(app){


  const User= mongoose.model("User");


  app.get("/instant_accept",function(req,res){
  // console.log(req.user.username);

      res.redirect("/profile");

  });
  app.post("/instant_accept",function(req,res){
  // console.log(req.user.username);
   var username=req.body.instant_accept;

   // var x=new Date(Date.now());
   // x.setMilliseconds(0);
   // today=x.toLocaleString();
   var today = new Date(Date.now());
   var dd = today.getDate();
   var mm = today.getMonth() + 1;
   var yyyy = today.getFullYear();
   if (dd < 10) {
     dd = '0' + dd
   }
   if (mm < 10) {
     mm = '0' + mm
   }

   today = yyyy + '-' + mm + '-' + dd;
   console.log(today);

   var time = new Date(Date.now());
   var min = time.getMinutes();
   var sec= time.getSeconds();
   var hr=time.getHours();
   var ss="";
   if(hr==0){
     hr=12;
     ss="AM";
   }
   else if(hr<12){
     // hr=12;
     ss="AM";
   }
   else if(hr==12){
     ss="PM";
   }
   else if(hr>12){
     hr=hr-12;
     ss="PM";
   }
   time= hr+":"+min+":"+sec+" "+ss;
   console.log(time);

   today=today+" "+time;
   console.log(today);
   User.findOne({username:username},function(err,user){
     if(err)
     {
       console.log(err)
     }
     else{
       if(user && user.status=="pending")
       {
           User.updateOne({username:req.body.instant_accept},{status:"active",inDate:today},function(){
             QRCode.toDataURL(username,function(err,img){
             var transporter = nodemailer.createTransport({
               service: 'gmail',
               auth: {
                 user: process.env.GMAIL_ID,
                 pass: process.env.GMAIL_PASS
               }
             });
             var mailOptions = {
               from: process.env.GMAIL_ID,
               to: user.email,
               subject: 'Status Update',
               text: 'Your Visit has been Confirmed!!. Your status has been set to active. Now, you can use your QR code to successfully enter the building.\nYou can also check your status at your profile. You can use your username ( '+username+' ) and password to login. Here is the link of the website: https://vms-sasy.herokuapp.com/. Your QR code is attached herewith, you can see the same on your profile',
               attachDataUrls: true,
               attachments:[
                 {
                   filename:"qrcode.png",
                   path:img,
                 }
               ]
             };

             transporter.sendMail(mailOptions, function(error, info){
               if (error) {
                 console.log(error);
               } else {
                 console.log('Email sent: ' + info.response);
               }
             });
           });
                 User.find({username:{ $regex: /^v/ }},function(err,check){
                 if(err)
                 console.log(err);
                 else{
                   var pUsers=[];
                   for(var item=0;item<check.length;item++)
                   {
                     if(check[item].status=="pending")
                     {
                       pUsers.push(check[item]);
                     }
                   }
                   // console.log(user.email);

                   req.session.message={
                     type:'success',
                     intro:'Status Updated',
                     message:'Visitor request accepted. Status set to active.'
                   }
                   res.render("pendingRequests.ejs",{Admin_Name:req.user.name,details:pUsers,message:req.session.message});
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
             var pUsers=[];
             for(var item=0;item<check.length;item++)
             {
               if(check[item].status=="pending")
               {
                 pUsers.push(check[item]);
               }
             }
                 // User.find({username:{ $regex: /^v/ }},function(err,check){
                 //   if(err)
                 //   console.log(err);
                 //   else{
                     req.session.message={
                       type:'danger',
                       intro:'Invalid ID',
                       message:'Enter valid visitor ID'
                     }
                       res.render("pendingRequests.ejs",{Admin_Name:req.user.name,details:pUsers,message:req.session.message});
                       // res.alert("NOT VALID ID")
                   }
                 });
                 // res.alert("Enter valid id");

               }
             }
           })
   });


    //other routes..
}
