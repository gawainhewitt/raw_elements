// in future add ability to dynamically assign keys

// sizing and resizing dynamically is happening in css #mycanvas and #parentdiv - overrides what's happening in here


let numberOfButtons = 1;// automatically generate circular synth based on this

let endedTouches = []; // array to store ended touches in
let buttonPositions = []; // position to draw the buttons
let buttonState = [0]; //store state of the buttons
let buttonColour  = "rgba(255, 0, 0, 0.25)"; // colour of the buttons at any given time
let buttonOffColour = "rgba(255, 0, 0, 0.25)"; // default off colours
let buttonOnColour = "rgba(0, 255, 0, 0.25)"; // default on colours
let radius; // radius of the buttons
let offsetT; // to store the difference between x and y readings once menus are taken into account
let r; // radius of the circle around which the buttons will be drawn
let angle = 0; // variable within which to store the angle of each button as we draw it
let step; // this will be calculated and determine the gap between each button around the circle
let ongoingTouches = []; // array to copy the ongoing touch info into
let notes = []; // notes for the synth in this example
var allTheNotes =  ["C1", "C#1", "D1", "D#1", "E1", "F1", "F#1", "G1", "G#1", "A1", "A#1", "B1",
                    "C2", "C#2", "D2", "D#2", "E2", "F2", "F#2", "G2", "G#2", "A2", "A#2", "B2",
                    "C3", "C#3", "D3", "D#3", "E3", "F3", "F#3", "G3", "G#3", "A3", "A#3", "B3",
                    "C4", "C#4", "D4", "D#4", "E4", "F4", "F#4", "G4", "G#4", "A4", "A#4", "B4",
                    "C5", "C#5", "D5", "D#5", "E5", "F5", "F#5", "G5", "G#5", "A5", "A#5", "B5",
                    "C6", "C#6", "D6", "D#6", "E6", "F6", "F#6", "G6", "G#6", "A6", "A#6", "B6",
                    "C7", "C#7", "D7", "D#7", "E7", "F7", "F#7", "G7", "G#7", "A7", "A#7", "B7",
                    "C8", "C#8", "D8", "D#8", "E8", "F8", "F#8", "G8", "G#8", "A8", "A#8", "B8"]; // all the notes available to us in the code
var major = [0,2,4,5,7,9,11,12,14]; // intervals for a major scale for 9 notes
var pentatonic = [0,2,4,7,9,12,14,16,19]; // intervals for a pentatonic scale for 9 notes
var minor = [0,2,3,5,7,8,10,12,14]; // intervals for a minor scale for 9 notes
var majorBlues = [0,2,3,4,7,9,12,14,15]; // intervals for a major blues scale for 9 notes
var minorBlues = [0,3,5,6,7,10,12,15,17]; // intervals for a minor scale for 9 notes
var scales = ["default", pentatonic, major, minor, majorBlues, minorBlues];
var scale; // variable to store the scale in
var theKey = 0; // this variable sets the default key on load
var octave = 36; //set the default octave on load
let synth; // variable within which to create the synth
let soundOn = false; // have we instigated Tone.start() yet? (needed to allow sound)
let whichKey = [0,0,0,0,0,0,0,0,0]; // array ensures only one trigger per qwerty click
let mouseState = []; // variable to store mouse clicks and drags in
let mouseClick = false;
let welcome = true;
let load = true;
let words = "off";
const crossFade1 = new Tone.CrossFade(); // top bottom left
const crossFade2 = new Tone.CrossFade(); // top bottom right
const crossFade3 = new Tone.CrossFade().toDestination(); // fade between the two
crossFade1.connect(crossFade3.a); // connect one crossfade to another
crossFade2.connect(crossFade3.b); // connect one crossfade to another
const player1 = new Tone.Player();
const player2 = new Tone.Player();
const player3 = new Tone.Player();
const player4 = new Tone.Player();
const player5 = new Tone.Player().toDestination();
let people = ['h', 'j', 'm', 'r']; // initial of participants
let one; // to store random file name in (without extension)
let two; // to store random file name in (without extension)
let three; // to store random file name in (without extension)
let four; // to store random file name in (without extension)
let five = "firebeat"; // beat for this element
let fileArray = []; // array of the random generated files
let buffers; // where we load the sounds
let element = "f"; // which element is this one?
let elementWord = "FIRE";
let image1;
let image2;
let image3;
let image4;

function preload() {
  do { // keep generating random names until 4 different ones
    assignNames();
  } while(checkForDuplicates(fileArray));

  console.log(`one = ${one}`);
  console.log(`two = ${two}`);
  console.log(`three = ${three}`);
  console.log(`four = ${four}`);
  console.log(`five = ${five}`);

  image1 = loadImage(`/images/${one}.jpg`);
  image2 = loadImage(`/images/${two}.jpg`);
  image3 = loadImage(`/images/${three}.jpg`);
  image4 = loadImage(`/images/${four}.jpg`);

  buffers = new Tone.ToneAudioBuffers({
    urls: {
      A1: `${one}.mp3`,
      A2: `${two}.mp3`,
      A3: `${three}.mp3`,
      A4: `${four}.mp3`,
      A5: `${five}.mp3`,
    },
    //onload:  () => welcomeScreen(), // initial screen for project - also allows an elegant place to put in the Tone.start() command.,
    baseUrl: "/sounds/"
  });
}

function setup() {  // setup p5
  step = TWO_PI/numberOfButtons; // in radians the equivalent of 360/6 - this will be used to draw the circles position
  console.log(`step = ${step}`);
  scale = pentatonic; // sets the default scale on load

  document.addEventListener('keydown', handleKeyDown); //add listener for keyboard input
  document.addEventListener('keyup', handleKeyUp); //add listener for keyboard input

  let masterDiv = document.getElementById("container");
  let divPos = masterDiv.getBoundingClientRect(); //The returned value is a DOMRect object which is the smallest rectangle which contains the entire element, including its padding and border-width. The left, top, right, bottom, x, y, width, and height properties describe the position and size of the overall rectangle in pixels.
  let masterLeft = divPos.left; // distance from left of screen to left edge of bounding box
  let masterRight = divPos.right; // distance from left of screen to the right edge of bounding box
  let cnvDimension = masterRight - masterLeft; // size of div -however in some cases this is wrong, so i am now using css !important to set the size and sca;ing - but have kept this to work out size of other elements if needed

  console.log("canvas size = " + cnvDimension);

  let cnv = createCanvas(cnvDimension, cnvDimension); // create canvas - because i'm now using css size and !important this sizing actually reduntant
  cnv.id('mycanvas'); // assign id to the canvas so i can style it - this is where the css dynamic sizing is applied
  cnv.parent('p5parent'); //put the canvas in a div with this id if needed - this also needs to be sized

  // *** add vanilla JS event listeners for touch which i want to use in place of the p5 ones as I believe that they are significantly faster
  let el = document.getElementById("p5parent");
  el.addEventListener("touchstart", handleStart, false);
  el.addEventListener("touchend", handleEnd, false);
  el.addEventListener("touchcancel", handleCancel, false);
  el.addEventListener("touchmove", handleMove, false);
  el.addEventListener("mousedown", handleMouseDown);
  el.addEventListener("mouseup", handleMouseUp);
  el.addEventListener("mousemove", handleMouseMove);
  offsetT = el.getBoundingClientRect(); // get the size and position of the p5parent div so i can use offset top to work out where touch and mouse actually need to be

  colorMode(RGB); // specify HSB colormode and set the range to be between 0 and numberOfButtons
  noStroke(); // no stroke on the drawings

  radius = width/8;
  r = width/3;

  for (let i = 0; i < numberOfButtons; i++) { // for each button build mouseState default array
    mouseState.push(0);
  }

  if (window.DeviceOrientationEvent) {      // if device orientation changes we recalculate the offsetT variable
    window.addEventListener("deviceorientation", handleOrientationEvent);
  }

  welcomeScreen();

  createButtonPositions(); // generate the default array info depending on number of buttons

}

function handleOrientationEvent() {
  let el = document.getElementById("p5parent");
  offsetT = el.getBoundingClientRect(); // get the size and position of the p5parent div so i can use offset top to work out where touch and mouse actually need to be
}

function loadScreen() {
  background(200); // background is grey (remember 5 is maximum because of the setup of colorMode)
  textSize(32);
  textAlign(CENTER, CENTER);
  text("loading", width/10, height/10, (width/10) * 8, (height/10) * 8);
}

function welcomeScreen() {
  load = false;
  background (170, 174, 182); // background is grey (remember 5 is maximum because of the setup of colorMode)
  textSize(100);
  textAlign(CENTER, CENTER);
  text(`${elementWord}`, width/2, height/5);
  textSize(32);
  text(`Click to enter. Centre button starts sound. Move to explore the soundworld. Press back button to start again`, width/10, height/10, (width/10) * 8, (height/10) * 8);
  // text('Press the back button on your browser to start again', width/10, height/4, (width/10) * 8, (height/10) * 8)

}

function createButtonPositions() {

    //convert polar coordinates to cartesian coordinates
    let _x = r * sin(angle);
    let _y = r * cos(angle);
    let theNote = scale[0] + octave + theKey; // the note plus the octave plus the offset from the key menu


    //create our buttonPositions array
    buttonPositions.push({
      x: width/2,
      y: height/2
    });

    buttonState.push(0); //create default state of the buttons array
    notes.push(allTheNotes[theNote]); //create the scale that we are using

    //increase angle by step size
    angle = angle + step;

  console.log(notes);
  console.log("offset height = " + offsetT.top);
}



function draw() {  // p5 draw function - the traditional way to do this in p5 - this is called 60 times a second so needed if want to animate
    if(!welcome){

    background(90); // background is grey

    image(image1, 0, 0, width/2, height/2);
    image(image2, 0, height/2, width/2, height/2);
    image(image3, width/2, 0, width/2, height/2);
    image(image4, width/2, height/2, width/2, height/2);

    for (let i = 0; i < buttonPositions.length; i++) {
      fill(buttonColour);
      ellipse(buttonPositions[i].x, buttonPositions[i].y, radius * 2);
      fill(255);
      text(words, buttonPositions[i].x, buttonPositions[i].y);
    }

    fill(120, 0, 120, 100); //
    ellipse(mouseX, mouseY, 100); //make a circle at the position of the touch

    }

    let xCrossFade = mouseX/width;
    if(xCrossFade > 0 && xCrossFade < 1) {
      crossFade3.fade.value = xCrossFade;
    }

    let yCrossFade = mouseY/height;
    if(yCrossFade > 0 && yCrossFade < 1) {
      crossFade1.fade.value = yCrossFade;
      crossFade2.fade.value = yCrossFade;
    }

}

function assignNames(){
  one = people[rand(4)]+element+(rand(3) +1);
  two = people[rand(4)]+element+(rand(3) +1);
  three = people[rand(4)]+element+(rand(3) +1);
  four = people[rand(4)]+element+(rand(3) +1);
  fileArray = [one, two, three, four];
  console.log(checkForDuplicates(fileArray));
}

function checkForDuplicates(array) { // returns true if there is a duplicate and false if not
  return new Set(array).size !== array.length // because a set can't have a duplicate, so if there is a duplicate it won't be the same size as the array
}


function rand(maxLimit) { // generates random number between 0 to maxLimit-1
  let rand = Math.random() * maxLimit;
  return Math.floor(rand);
}

function startAudio() {
    Tone.start(); // we need this to allow audio to start.
    welcome = false;
    soundOn = true;
    player1.connect(crossFade1.a);
    player1.buffer = buffers.get("A1");
    player1.set(
      {
        "mute": false,
        "volume": 0,
        "autostart": false,
        "fadeIn": 11,
        "fadeOut": 2,
        "loop": true,
        "loopEnd": 6.842,
        "loopStart": 0,
        "playbackRate": 1,
        "reverse": false
      }
    );
    player2.connect(crossFade1.b);
    player2.buffer = buffers.get("A2");
    player2.set(
      {
        "mute": false,
        "volume": 0,
        "autostart": false,
        "fadeIn": 11,
        "fadeOut": 2,
        "loop": true,
        "loopEnd": 6.842,
        "loopStart": 0,
        "playbackRate": 1,
        "reverse": false
      }
    );
    player3.connect(crossFade2.a);
    player3.buffer = buffers.get("A3");
    player3.set(
      {
        "mute": false,
        "volume": 0,
        "autostart": false,
        "fadeIn": 11,
        "fadeOut": 2,
        "loop": true,
        "loopEnd": 6.842,
        "loopStart": 0,
        "playbackRate": 1,
        "reverse": false
      }
    );
    player4.connect(crossFade2.b);
    player4.buffer = buffers.get("A4");
    player4.set(
      {
        "mute": false,
        "volume": 0,
        "autostart": false,
        "fadeIn": 11,
        "fadeOut": 2,
        "loop": true,
        "loopEnd": 6.842,
        "loopStart": 0,
        "playbackRate": 1,
        "reverse": false
      }
    );
    player5.buffer = buffers.get("A5");
    player5.set(
      {
        "mute": false,
        "volume": -10,
        "autostart": false,
        "fadeIn": 11,
        "fadeOut": 2,
        "loop": true,
        "loopEnd": 6.842,
        "loopStart": 0,
        "playbackRate": 1,
        "reverse": false
      }
    );
    crossFade1.fade.value = 0.5;
    crossFade2.fade.value = 0.5;
    crossFade3.fade.value = 0.5;
}

function handleMouseDown(e) {
  mouseClick = true;
  if(soundOn) {

    for (let i = 0; i < numberOfButtons; i++) { // for each button
      let d = dist(e.offsetX, e.offsetY, buttonPositions[i].x, buttonPositions[i].y); // compare the mouse to the button position -
      if (d < radius) { // is the mouse where a button is?
        mouseState[i] = 1;
      }
      handleMouseAndKeys();
    }
  }else{
    startAudio();
  }
}

function handleMouseUp() {
  mouseClick = false;
  for (let i = 0; i < numberOfButtons; i++) { // for each button
    mouseState[i] = 0;
    }
  handleMouseAndKeys();
}

function handleMouseMove(e) {
  for (let i = 0; i < numberOfButtons; i++) { // for each button
    let d = dist(e.offsetX, e.offsetY, buttonPositions[i].x, buttonPositions[i].y); // compare the mouse to the button position - offset for vertical position in DOM
    if ((d < radius) && (mouseClick === true)) { // is the mouse where a button is and is the button clicked?
      mouseState[i] = 1;
    }else{
      mouseState[i] = 0;
    }
  }
  handleMouseAndKeys();
}

function handleMouseAndKeys() {   // this function ensures only one "on" or "off" between mouse and key interactions
  for (let i = 0; i < numberOfButtons; i++) { // for each button
    if((mouseState[i] === 1) && (whichKey[i] === 0)){ // if the button is on
      playSynth(i); // call play synth for that button
     }else if((mouseState[i] === 0) && (whichKey[i] === 1)){ // if the button is on
      playSynth(i); // call play synth for that button
    }else if ((mouseState[i] === 0) && (whichKey[i] === 0)){ // otherwise if the button is off
      stopSynth(i); // call stopsynth for that button
    }else{
      return;
    }
  }
}

function handleStart(e) {
  e.preventDefault(); // prevent default touch actions like scroll
  if(soundOn){
    let _touches = e.changedTouches; //assign the changedTouches to an array called touches
    ongoingTouches.push(copyTouch(_touches[0])); //copy the new touch into the ongoingTouches array
    console.log(`touchstart ${ongoingTouches}`); // debugging
    touchButton(e);
  }else{
    startAudio();
    let _touches = e.changedTouches; //assign the changedTouches to an array called touches
    ongoingTouches.push(copyTouch(_touches[0])); //copy the new touch into the ongoingTouches array
  }
}

function handleMove(e) {
  e.preventDefault(); // prevent default touch actions like scroll
  let _touches = e.changedTouches; //assign the changedTouches to an array called touches

  for (var i = 0; i < _touches.length; i++) {
    var idx = ongoingTouchIndexById(_touches[i].identifier); //call a function that will compare this touch against the list and assign the return to idx
    if (idx >= 0) { // did we get a match?
      // console.log("continuing touch "+idx); // debugging
    // console.log("index = " + idx);
      ongoingTouches.splice(idx, 1, copyTouch(_touches[i]));  // swap in the new touch record
      // console.log(".");
    } else { // no match
      console.log("can't figure out which touch to continue");
    }
  }
  //touchButton(e);
}

function handleEnd(e) {
  e.preventDefault(); // prevent default touch actions like scroll
  let _touches = e.changedTouches; //assign the changedTouches to an array called touches

  for (var i = 0; i < _touches.length; i++) {

    var idx = ongoingTouchIndexById(_touches[i].identifier); //call a function that will compare this touch against the list and assign the return to idx

    if (idx >= 0) { // did we get a match?
      console.log("touchend "+idx);
      ongoingTouches.splice(idx, 1);  // remove it; we're done
    } else { // no match
      console.log("can't figure out which touch to end");
    }
  }
  //touchButton(e);
    for (let t of e.changedTouches) { // cycle through the changedTouches array
      // console.log("touch id " + t.identifier + // debugging
      //   " released at x: " + t.clientX +
      //   " y: " + t.clientY)
      endedTouches.push({ //create our ended touches array of objects from which we can call .time, .id, .x, .y
        time: millis(),
        id: t.identifier,
        x: t.clientX,
        y: t.clientY
      });
    }
}

function handleCancel(e) { // this handles touchcancel
  e.preventDefault();  // prevent default touch actions like scroll
  console.log("touchcancel."); //debugging
  var touches = e.changedTouches; //assign the changedTouches to an array called touches

  for (var i = 0; i < touches.length; i++) {
    var idx = ongoingTouchIndexById(touches[i].identifier); //call a function that will compare this touch against the list and assign the return to idx
    ongoingTouches.splice(idx, 1);  // remove it; we're done
  }
}

function copyTouch({ identifier, clientX, clientY }) { // this function is used to facilitate copying touch ID properties
  return { identifier, clientX, clientY };
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

function touchButton() { // function to handle the touch interface with the buttons

  let _touches = ongoingTouches; //assign the changedTouches to an array called touches
  let _buttonState = []; // array to store buttonstate in

  for(let i = 0; i < numberOfButtons; i++) {
    _buttonState.push(0);
  }

  //**** first let's check if each touch is on a button, and store the state in our local variable */

  // i'm using offset.top to change the touch reference to take into consideration the DOM elements above it. If needed you can do the same with  left, top, right, bottom, x, y, width, height.

  if(_touches.length != 0){ // if the touches array isn't empty
    for (var t = 0; t < _touches.length; t++) {  // for each touch
      for (let i = 0; i < numberOfButtons; i++) { // for each button
        let d = dist(_touches[t].clientX - offsetT.left, _touches[t].clientY - (offsetT.top * 1.1), buttonPositions[i].x, buttonPositions[i].y); // compare the touch to the button position
        if (d < radius) { // is the touch where a button is?
          _buttonState[i] = 1; // the the button is on
        }else{
          _buttonState[i] = _buttonState[i] + 0; // otherwise add a 0 to the state of that button (another toucch might have put it on you see)
        }
      }
    }
  }

  console.log(_buttonState);

  // ********** now our _buttonState array should accurately reflect the state of the touches and buttons so we can do something with it

  for (let i = 0; i < numberOfButtons; i++) { // for each button
    if(_touches.length === 0){ // if there are no touches at all
      stopSynth(i); // call stop synth for each button
    }else if(_buttonState[i] === 1){ // otherwise if the button is on
      playSynth(i); // call play synth for that button
    }else{ // otherwise if the button is off
      stopSynth(i); // call stopsynth for that button
    }
  }
}

keyMap = {
  'KeyQ' : 0,
  'KeyW' : 1,
  'KeyE' : 2,
  'KeyR' : 3,
  'KeyT' : 4,
  'KeyY' : 5,
  'KeyU' : 6,
  'KeyI' : 7,
  'KeyO' : 8
}

function handleKeyDown(e) {

  let key = e.code;
  console.log("keydown "+key); //debugging

  if(soundOn){
    if (key in keyMap) {
      console.log(`this works ${keyMap[key]}`);
      if(whichKey[keyMap[key]] === 0) {
        whichKey[keyMap[key]] = 1;
        handleMouseAndKeys();
      }
    }
  }else{
    startAudio();
  }
}

function handleKeyUp(e) {
  var key = e.code;
  console.log("keyup "+key); //debugging

  if (key in keyMap) {
    console.log(`this works end ${keyMap[key]}`);
    whichKey[keyMap[key]] = 0;
    handleMouseAndKeys();
  }

}

let playerState = false;

function playSynth(i) {
  if(!playerState) { // if the synth is not playing that note at the moment
    player1.start(); // play the note
    player2.start();
    player3.start(); // play the note
    player4.start();
    player5.start();
    playerState = true; // change the array to reflect that the note is playing
    buttonColour = buttonOnColour; //change the colour of the button to on colour
    words = "on";
  }else{
    player1.stop();
    player2.stop();
    player3.stop();
    player4.stop();
    player5.stop();
    playerState = false; // change the array to reflect that the note is playing
    buttonColour = buttonOffColour; //change the colour of the button to off colour
    words = "off";
  }
}

function stopSynth(i) {

}
