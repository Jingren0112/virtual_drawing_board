let video;
let handpose;                                                  //hand position detection array
let hand;                                                      //result of detection
let phand;                                                      //previous hand position
var bgColor, shapeColor, shapeWidth, reset, switchMode ; //selections for the drawing board
var mode=true;                                                //switching mode
var square, circle, triangle;                                            //select shape
let sqr=false;
let handFirstSqr=true;                  //flag for the first vertex of hand draw sqr
let x=-1, y=-1, px=-1, py=-1;            //default location for square
let hx=-1, hy=-1, phx=-1, phy=-1;        //variables for hand draw sqr
let handFinished=true;                    //hand draw square finish flag
let time=0;                              //current time 
let pTime=0;                              //previous updated time
let hint; //player instruction to draw square;
let lineMode;          //line button
let ln=true;        //line mode
let temp;          //temp background
let fillButton;    //fill or no fill
let fillOpt = true;  //flag for fill
function setup() {
  createCanvas(1280, 480);          //create canvas that includes video and drawing board (the video part is for future development)
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();
  handpose = ml5.handpose(video);    //initiate handpose detection
  handpose.on('predict', gotPoses);
  /*function button/selection display section*/
  var opts = createDiv().style('display:flex');
  var optTitle = createDiv().parent(opts);
  createP('Color').parent(optTitle);
  createP('Width').parent(optTitle);
  createP('Fill').parent(optTitle);
  var hintDiv = createDiv().style('display:flex');
  hint = createP('The default of the board is mouse mode drawing line').parent(hintDiv);
  var optValue = createDiv().parent(opts).style('margin: 20px 40px; width:50px');
  shapeColor = createColorPicker('#000000').parent(optValue);
  shapeWidth = createSelect(false).parent(optValue).style('margin-top:10px');
  shapeWidth.option('1');
  shapeWidth.option('2');
  shapeWidth.option('3');
  shapeWidth.option('4');
  shapeWidth.option('5');
  shapeWidth.selected('2');
  shapeFill = createColorPicker('#ffffff').parent(optValue).style('margin-top:10px');
  var buttonOpt = createDiv().parent(opts).style('margin:10px 40px; width:75px');
  reset = createButton('reset').parent(buttonOpt).style('width:75px');
  switchMode = createButton('hand mode').parent(buttonOpt).style('width:75px;margin-top:10px;');
  fillButton = createButton('no fill').parent(buttonOpt).style('width:75px; margin-top:10px');
  var buttonOpt2 = createDiv().parent(opts).style('margin:10px 40px; width:75px');
  lineMode = createButton('line').parent(buttonOpt2).style('width:75px');
  square = createButton('square').parent(buttonOpt2).style('width:75px;margin-top:10px');
  /*background set to white*/
  background(255);
}

/*handpose detection call back function to store result*/
function gotPoses(poses) {
  hand=poses;
}

function draw() {
  //timer based on frame count
  if (frameCount%60==0) {
    time++;
  }
  //reset button
  reset.mousePressed(function() {
    background(255);
    handFirstSqr=true;
    handFinished=true;
    pTime=0;
  });
  //switch mode button, default mode is mouse mode and display text as hand mode to give user hint
  switchMode.mousePressed(function() {
    mode=!mode;
    if (mode==true) {
      switchMode.html=('handMode', false);
      hint.html('Now is mouseMode', false);
    } else {
      switchMode.html=('mouseMode', false);
      hint.html('Now is handMode', false);
    }
  });
  //line mode button
  lineMode.mousePressed(function() {
    sqr=false;
    ln=true;
    hint.html('Now is drawing line', false);
  });
  //fill option button, default is fill with default selection of color, will display no fill to give user hint. The text will change upon clicking.
  fillButton.mousePressed(function(){
    fillOpt=!fillOpt;
    if(fillOpt==true){
      fillButton.html('no fill',false);
    }else{
      fillButton.html('enable fill',false);
    }
  });
  //square mode button
  square.mousePressed(function() {
    sqr=true;
    ln=false;
    hint.html('Now is drawing square', false);
  }
  );
  //display webcam.
  image(video, 640, 0, 640, 480);
  //hand mode 
  if (!mode) {
    //if hand is detected
    if (typeof hand!=='undefined'&&hand.length>0) {
      if (typeof phand ==='undefined') {
        phand=hand;
      } else {
        //detect if index finger is higher than tumb.
        if (hand[0].landmarks[4][1]>hand[0].landmarks[8][1]&&hand[0].landmarks[3][1]>hand[0].landmarks[7][1]&&hand[0].landmarks[2][1]>hand[0].landmarks[6][1]&&hand[0].landmarks[1][1]>hand[0].landmarks[5][1]) {
          let pX=phand[0].landmarks[8][0], pY=phand[0].landmarks[8][1], X=hand[0].landmarks[8][0], Y=hand[0].landmarks[8][1];
          if (pTime==0) {
            pTime=time;    //set previouse timer
          }
          //square mode on
          if (sqr==true) {    
            /*detect if user has move their index finger more than threhold and time between last movement is more than 1 second.*/
            if (handFirstSqr==true&&handFinished==true&&(time-pTime)>1) {
              drawSquare(X, Y, 0);
              handFinished=false;
              pTime=time;
              hint.html("top vertex selected, move your finger now", false);
            } else if ((time-pTime)>1&&abs(pX-X)<10&&abs(pY-Y)<10) {
              handFinished=true; 
              handFirstSqr=true;
              phx=phy=hx=hy=-1;
              pTime=time;
              hint.html("draw finished, you have 1 second to move your finger to new location to draw new square", false);
            } else if (abs(pX-X)>11&&abs(pY-Y)>11&&handFinished==false&&handFirstSqr!=true) {
              drawSquare(X, Y, 1);
              pTime=time;
            }
          } else {        //line mode
            stroke(shapeColor.value());
            strokeWeight(shapeWidth.value());
            line(phand[0].landmarks[8][0], phand[0].landmarks[8][1], hand[0].landmarks[8][0], hand[0].landmarks[8][1]);
          }
          phand=hand;
        }
      }
    }
  }
}

/*mouse press event to initialize square mode*/
function mousePressed() {
  if (sqr&&mode) {
    if (x<0) {
      x=mouseX;
      y=mouseY;
      px=x;
      py=y;
      temp=get(0,0,640,480);
    }
  }
}

/*mouse released to finish drawing current square in mouse mode*/
function mouseReleased() {
  if (sqr&&mode) {
    x=y=py=px=-1;
  }
}

/**mouse drag to draw the square*/
function mouseDragged() {
  if (mode==true&&sqr!==true) {
    stroke(shapeColor.value());
    strokeWeight(shapeWidth.value());
    line(mouseX, mouseY, pmouseX, pmouseY);
  } else if (mode==true&&sqr==true) { 
    image(temp,0,0,640,480);          //use previous canvas as background to avoid multiple line. To avoid affecting video, image is used to update part of the canvas.
    temp=get(0,0,640,480);
    stroke(shapeColor.value());
    if(fillOpt){
      fill(shapeFill.value());
    }else{
      noFill();
    }
    beginShape(QUADS);              //vertex drawing
    console.log('temp is',temp);
    vertex(x, y);
    vertex(x, mouseY);
    vertex(mouseX, mouseY);
    vertex(mouseX, y);
    endShape(CLOSE);
    px=mouseX;
    py=mouseY;
  }
}


/*hand draw square. */
function drawSquare(X, Y, z) {
  if (z==0) {
    hx=X;
    hy=Y;
    phx=hx;
    phy=hy;
    temp=get(0,0,640,480);
    handFirstSqr=false;
  } else {
    image(temp,0,0,640,480);
    temp=get(0,0,640,480);
    stroke(shapeColor.value());
    if(fillOpt){
      fill(shapeFill.value());
    }else{
      noFill();
    }
    beginShape(QUADS);
    vertex(hx, hy);
    vertex(hx, Y);
    vertex(X, Y);
    vertex(X, hy);
    endShape(CLOSE);
    phx=X;
    phy=Y;
  }
}

/*press 's' to save current canvas as png and download*/
function keyTyped() {
  if (key === 's') {
    saveCanvas('output', 'png');
  }
}
