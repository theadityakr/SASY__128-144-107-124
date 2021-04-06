
module.exports = function(app){

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

    //other routes..
}
