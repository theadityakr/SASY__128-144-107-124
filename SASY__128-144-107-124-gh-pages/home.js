
module.exports = function(app){
  app.get("/",function(req,res){
    res.render("home.ejs");
  });
  app.get("/home",function(req,res){
    res.redirect("/");
  });
    //other routes..
}
