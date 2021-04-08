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

function search_user_id(){

var x= document.getElementById("user_id_input").value;

//search for userid in database  and print the detaisl in the place

}

function extend_admin(){


var x=document.getElementById("leaving_time").value;
console.log(x);
//replace replace leaving time with it

}


if ( window.history.replaceState ) {
  window.history.replaceState( null, null, window.location.href );
}
