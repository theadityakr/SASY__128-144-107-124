


//Get the button:
mybutton = document.getElementById("myBtn");

// When the user scrolls down 20px from the top of the document, show the button
window.onscroll = function() {scrollFunction()};

function scrollFunction() {
  if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
    mybutton.style.display = "block";
  } else {
    mybutton.style.display = "none";
  }
}

// When the user clicks on the button, scroll to the top of the document
function topFunction() {
  document.body.scrollTop = 0; // For Safari
  document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
}

function myFunction(x) {
  x.classList.toggle("change");
}

function myFunction() {
   var element = document.body;
   element.classList.toggle("dark-mode");
}

document.querySelector("#login-button").addEventListener("click",function(){
  //jshint esversion:6
  const mongoose = require('mongoose');
  mongoose.connect("mongodb+srv://admin:<vmsadmin>@cluster0.masu3.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",{ useUnifiedTopology: true , useNewUrlParser: true });


  const fruitSchema=new mongoose.Schema({
    name:{
      type:String,
      required:[true,"why no name?"]
    },
    rating:Number,
    review:String
  });

  const Fruit=mongoose.model("Fruit",fruitSchema);

  const fruit =new Fruit({
    name:"Apple",
    rating:7,
    review: "NICE ONE"
  });


  //Inserting one:
  fruit.save();
  mongoose.connection.close();
  alert("YES");

})

if ( window.history.replaceState ) {
  window.history.replaceState( null, null, window.location.href );
}

// document.querySelector("#login-button").addEventListener("click",function(){
//   alert("YES");
// });
