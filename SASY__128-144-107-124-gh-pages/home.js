
module.exports = function(app){
  app.get("/",function(req,res){
    if(req.isAuthenticated()){
      if(req.user.username[0]=='a')
      {
        res.render("home.ejs",{user:"admin"});
      }
      else
      {
        res.render("home.ejs",{user:"visitor"});
      }
    }
    else
    res.render("home.ejs",{user:"nil"});
  });
  app.get("/home",function(req,res){
    if(req.isAuthenticated()){
      if(req.user.username[0]=='a')
      {
        res.render("home.ejs",{user:"admin"});
      }
      else
      {
        res.render("home.ejs",{user:"visitor"});
      }
    }
    else
    res.render("home.ejs",{user:"nil"});
  });
    //other routes..
}
