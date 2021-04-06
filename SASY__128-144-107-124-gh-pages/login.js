// require('server');
const mongoose =require("mongoose");
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
module.exports = function(app){


  const User= mongoose.model("User");

  app.get("/login",function(req,res){

    if(req.isAuthenticated())
    {
      res.redirect("/profile");
    }
    else
    res.render("login.ejs");
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
              if(user.status=="Inactive") { return res.render('login.ejs',{message:req.session.message}); }

              req.logIn(user, function(err) {
                if (err) { return next(err); }
                return res.redirect('/profile');
              });
            })(req, res, next);

        }
      })

  });
    //other routes..
}
