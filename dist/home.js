//pointless comment
var info = 0;
var el = document.getElementById("welcomescreen");
el.addEventListener("click", handleMouseDown);

function handleMouseDown(e) {
  if(info === 0){
    document.getElementById('welcomescreen').innerHTML="<p>Participants on this course composed original sound and music, twinning them with their own artwork, all on the theme of the elements. The project was conceived and designed by the group to allow audience members to explore the piece interactively, travelling to soundworlds on the screen as they might have in a physical installation. Every time you enter a world the installation randomly selects new work to explore, allowing for an immersive and ever changing experience. Enjoy!</p> <p>Composer credits: Rowan Bhatti, Hani Malcolm Ibrahim, James Gibbons-Macgregor, Mayura Uthayakumaran, Timur Wilson<br><br>Coded by Gawain Hewitt for Raw Sounds</p><h3> Touch or click <br>screen</h3>";
    info = 1;
  }else if(info === 1) {
    document.getElementById('welcomescreen').innerHTML="<h3>Raw Elements<br></h3><p>Touch or click an image to enter each element <br> move mouse or finger to change sound balance</p><p>On iPhone you will need to <br>switch silent mode off on the <br>side of your phone</p><h3> Touch or click <br>screen to start</h3>";
    info = 2;

  }else if(info === 2) {
    e.stopPropagation();
    document.getElementById('welcomescreen').innerHTML="";
    let pictures = document.getElementsByClassName('image');
    for(let i = 0; i < pictures.length; i++) {
      pictures[i].style.visibility="visible";
    }
  }
}
