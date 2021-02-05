
var info = true;    // this tells us whether to display the info screen or not
var ongoingTouches = []; // to store ongoing touches in for multitouch
const now = Tone.now(); // time variable to tell the tone.js when to play - i.e play now! (when function called for example)
var notes = ["C3", "D3", "E3", "G3", "A3", "C4", "D4", "E4", "G4"];    // array containing our musical notes that we are currently using (tone.js will respond to these as is)
var whichClicked = [0,0,0,0,0,0,0,0,0];
var whichKey = [0,0,0,0,0,0,0,0,0];

document.addEventListener("DOMContentLoaded", startup); // adding an event listener to the document which fires once the DOM is loaded and then triggers the startup function

function startup() {
  for(var i = 0; i < 4; i++) {    // loop through the divs containing images and add event listeners
    var el = document.getElementById("image"+i);
    el.addEventListener("touchstart", handleStart, false);
    el.addEventListener("touchend", handleEnd, false);
    el.addEventListener("touchcancel", handleCancel, false);
    el.addEventListener("touchmove", handleMove, false);
    }
  for(var i = 0; i < 4; i++) {    // loop through the divs containing images and add event listeners
    var el = document.getElementById("image"+i);
    el.addEventListener("mousedown", handleMouseDown);
    el.addEventListener("mouseup", handleMouseUp);
    }
}

function hideLoadScreen() {
  document.getElementById('loadscreen').style.visibility="hidden";
  var welcome = document.getElementById('welcomescreen');
  welcome.style.visibility="visible";
  welcome.addEventListener("click", start);
  welcome.addEventListener("touchstart", start);
}

function start() {
  document.getElementById('welcomescreen').style.visibility="hidden";
  if(info === true) { // is the info screen on?
    Tone.start(); // we need this to allow audio to start. probably best to put it on a different button soon though
    info = false;
  }
}

function handleMouseDown(evt) {

  if(info === true) { // is the info screen on?
    Tone.start(); // we need this to allow audio to start. probably best to put it on a different button soon though
    info = false;
  }

  evt.preventDefault();

  var elem = this.id; //returns the id of the element that triggered the mouse event
  console.log("mouseDown id "+elem); //debugging

  for(var i = 0; i < 9; i++) { // for loop to check which element it is and get a number to send to the synth
    if(elem === "image"+i){ // this looks confusing because the id name also contains "i" - see that HTML
      playSynth(i); // call the playSynth function
      whichClicked[i] = 1; //store the click in an array as a boolean true
    }
  }

}

function handleMouseUp() {

  var elem = this.id; //returns the id of the element that triggered the mouse event
  console.log("mouseUp id "+elem); //debugging
  for(var i = 0; i < 9; i++) { // for loop to check which click is ending and get a number to send to the synth
    if(whichClicked[i] === 1){
      stopSynth(i); // call the stopSynth function
      whichClicked[i] = 0;//set the click state in an array as a boolean false
    }
  }

}

  function handleStart(evt) { // this function handles touchstart
    evt.preventDefault(); // prevent default touch actions like scroll

    if(info === true) { // is the info screen on?
      Tone.start(); // we need this to allow audio to start. probably best to put it on a different button soon though
      info = false;
    }

    console.log("touchstart."); //debugging
    var touches = evt.changedTouches; //assign the changedTouches to an array called touches
    ongoingTouches.push(copyTouch(touches[0])); //copy the new touch into the ongoingTouches array
    var elem = evt.targetTouches[0].target.id; //returns the id of the element that triggered the touch
    console.log("image id = "+elem); //debugging
    for(var i = 0; i < 9; i++) { // for loop to check which element it is and get a number to send to the synth
      if(elem === "i"+i){ // this looks confusing because the id name also contains "i" - see that HTML
        playSynth(i); // call the playSynth function
      }
    }
  }

  function handleMove(evt) { // this function handles touchmove
    evt.preventDefault(); // prevent default touch actions like scroll
    var touches = evt.changedTouches; //assign the changedTouches to an array called touches

    for (var i = 0; i < touches.length; i++) {

      var idx = ongoingTouchIndexById(touches[i].identifier); //call a function that will compare this touch against the list and assign the return to idx

      if (idx >= 0) { // did we get a match?
        // console.log("continuing touch "+idx); // debugging

        ongoingTouches.splice(idx, 1, copyTouch(touches[i]));  // swap in the new touch record
        // console.log(".");
      } else { // no match
        console.log("can't figure out which touch to continue");
      }
    }
  }

  function handleEnd(evt) {  // this function handles touchend
    evt.preventDefault(); // prevent default touch actions like scroll

    var touches = evt.changedTouches; //assign the changedTouches to an array called touches
    var elem = touches[0].target.id //returns the id of the element that triggered the touch (that has just ended)
    console.log("ended image id = "+elem); //debugging
    for(var i = 0; i < 9; i++) { //get a number to end the right note
        if(elem === "i"+i){
          stopSynth(i); // call stopSynth
        }
      }
    for (var i = 0; i < touches.length; i++) {

      var idx = ongoingTouchIndexById(touches[i].identifier); //call a function that will compare this touch against the list and assign the return to idx

      if (idx >= 0) { // did we get a match?
        console.log("touchend "+idx);
        ongoingTouches.splice(idx, 1);  // remove it; we're done
      } else { // no match
        console.log("can't figure out which touch to end");
      }
    }
  }

  function handleCancel(evt) { // this handles touchcancel
    evt.preventDefault();  // prevent default touch actions like scroll
    console.log("touchcancel."); //debugging
    var touches = evt.changedTouches; //assign the changedTouches to an array called touches

    for (var i = 0; i < touches.length; i++) {
      var idx = ongoingTouchIndexById(touches[i].identifier); //call a function that will compare this touch against the list and assign the return to idx
      ongoingTouches.splice(idx, 1);  // remove it; we're done
    }
  }


  function copyTouch({ identifier, pageX, pageY }) { // this function is used to facilitate copying touch ID properties
    return { identifier, pageX, pageY };
  }

  function ongoingTouchIndexById(idToFind) { //compares the more complex stuff to give a simple answer to the question "which touch"
    for (var i = 0; i < ongoingTouches.length; i++) {
      var id = ongoingTouches[i].identifier;

      if (id == idToFind) {
        return i;
      }
    }
    return -1;    // not found
  }

//following is to do with sound and image management

const sampler = new Tone.Sampler({
	urls: {
    C4: "ha1.mp3"
	},
	baseUrl: "/sounds/",
	onload: () => {
    hideLoadScreen();
  }
}).toDestination();

sampler.set({
  release: 8
});

function playSynth(i) {
  sampler.triggerAttack(notes[i], Tone.now());
  document.getElementById(`i${i}`).style.backgroundColor="magenta";
}

var col = ["rgb(255, 255, 0)", "rgb(200, 200, 0)", "rgb(255, 255, 0)", "rgb(200, 200, 0)", "rgb(255, 255, 0)", "rgb(200, 200, 0)", "rgb(255, 255, 0)", "rgb(200, 200, 0)", "rgb(255, 255, 0)"]; //colour of button

function stopSynth(i) {
  sampler.triggerRelease(notes[i], Tone.now());
  document.getElementById(`i${i}`).style.backgroundColor=col[i];
}
