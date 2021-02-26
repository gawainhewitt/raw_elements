
var info = true;    // this tells us whether to display the info screen or not
var el = document.getElementById("welcomescreen");
el.addEventListener("click", handleMouseDown);



function handleMouseDown() {

  if(info === true) { // is the info screen on?
    document.getElementById('welcomescreen').style.visibility="hidden";
    info = false;
  }

}
