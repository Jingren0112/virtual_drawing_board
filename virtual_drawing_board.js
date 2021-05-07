let video;
let handpose;                                                  //hand position detection array
let hand;                                                      //result of detection
let phand;                                                      //previous hand position
var bgColor, shapeColor, shapeWidth,reset,switchMode ; //selections for the drawing board
var mode=true;                                                //switching mode
var square, circle, triangle;                                            //select shape
let sqr=false;
let handFirstSqr=true;                  //flag for the first vertex of hand draw sqr
let x=-1,y=-1,px=-1,py=-1;
let hx=-1,hy=-1,phx=-1,phy=-1;        //variables for hand draw sqr
let handFinished=true;
let time=0;
let pTime=0;
let hint; //player instruction to draw square;
let lineMode;          //line button
let ln=true;        //line mode
function setup() {
  createCanvas(1250, 480);
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();
  handpose = ml5.handpose(video);
  handpose.on('predict',gotPoses);
  var opts = createDiv().style('display:flex');
  var optTitle = createDiv().parent(opts);
  createP('Color').parent(optTitle);
  createP('Width').parent(optTitle);
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
  var buttonOpt = createDiv().parent(opts).style('margin:10px 40px; width:75px');
  reset = createButton('reset').parent(buttonOpt).style('width:75px');
  switchMode = createButton('hand mode').parent(buttonOpt).style('width:75px;margin-top:10px;');
  var buttonOpt2 = createDiv().parent(opts).style('margin:10px 40px; width:75px');
  lineMode = createButton('line').parent(buttonOpt2).style('width:75px');
  square = createButton('square').parent(buttonOpt2).style('width:75px;margin-top:10px');
  background(255);
}


function gotPoses(poses) {
    hand=poses;
}

function draw() {
  if(frameCount%60==0){
    time++;
  }
  reset.mousePressed(function(){
    background(255);
    handFirstSqr=true;
    handFinished=true;
    pTime=0;
  });
  switchMode.mousePressed(function(){
    mode=!mode;
    if(mode==true){
      switchMode.html=('handMode',false);
      hint.html('Now is mouseMode',false);
    }else{
      switchMode.html=('mouseMode',false);
      hint.html('Now is handMode',false);
    }
  });
  lineMode.mousePressed(function(){
    sqr=false;
    ln=true;
    hint.html('Now is drawing line',false);
  });
  square.mousePressed(function(){
    sqr=true;
    ln=false;
    hint.html('Now is drawing square',false);
  });
  
  image(video,640,0,640,480);
  if(!mode){
    if(typeof hand!=='undefined'&&hand.length>0){
      if(typeof phand ==='undefined'){
        phand=hand;
      }else{
        if(hand[0].landmarks[4][1]>hand[0].landmarks[8][1]&&hand[0].landmarks[3][1]>hand[0].landmarks[7][1]&&hand[0].landmarks[2][1]>hand[0].landmarks[6][1]&&hand[0].landmarks[1][1]>hand[0].landmarks[5][1]){
          let pX=phand[0].landmarks[8][0],pY=phand[0].landmarks[8][1],X=hand[0].landmarks[8][0],Y=hand[0].landmarks[8][1];
          if(pTime==0){
           pTime=time; 
          }
          if(sqr==true){
            if(handFirstSqr==true&&handFinished==true&&(time-pTime)>1){
              drawSquare(X,Y,0);
              handFinished=false;
              pTime=time;
              hint.html("top vertex selected, move your finger now",false);
           } else if((time-pTime)>1&&abs(pX-X)<10&&abs(pY-Y)<10){
               handFinished=true; 
               handFirstSqr=true;
               phx=phy=hx=hy=-1;
               pTime=time;
              console.log('finished'); 
              hint.html("draw finished, you have 1 second to move your finger to new location to draw new square",false);
          }else if(abs(pX-X)>11&&abs(pY-Y)>11&&handFinished==false&&handFirstSqr!=true){
              console.log('drawing!');
               drawSquare(X,Y,1);
               pTime=time;
          } 
          }else{
            stroke(shapeColor.value());
            strokeWeight(shapeWidth.value());
            line(phand[0].landmarks[8][0],phand[0].landmarks[8][1],hand[0].landmarks[8][0],hand[0].landmarks[8][1]);   
          }
          phand=hand;
        }
      }
    }
  }
}


function mousePressed(){
  if(sqr&&mode){
   if(x<0){
    x=mouseX;
    y=mouseY;
     px=x;
     py=y;
  }
  }
}

function mouseReleased(){
  if(sqr&&mode){
    x=y=py=px=-1;
  }
}

function mouseDragged(){
  if(mode==true&&sqr!==true){
    stroke(shapeColor.value());
    strokeWeight(shapeWidth.value());
    line(mouseX,mouseY,pmouseX,pmouseY);
  } else if(mode==true&&sqr==true){
      if(mouseX>px&&mouseY>py){
      stroke(shapeColor.value());
      fill(255);
      beginShape(QUADS);
      vertex(x,y);
      vertex(x,mouseY);
      vertex(mouseX,mouseY);
      vertex(mouseX,y);
      endShape(CLOSE);
      px=mouseX;
      py=mouseY;
    }else if(mouseX<x||mouseY<y){
      px=x;
      py=y;
    }
  }
}

function drawSquare(X,Y,z){
  if(z==0){
    console.log("X and Y are",X,Y);
    hx=X;
    hy=Y;
    phx=hx;
    phy=hy;
    console.log("hx and hy are",hx,hy);
    handFirstSqr=false;
  } else{
    console.log("hx and hy is",hx,hy);
    console.log("X and Y is",X,Y);
    if(X>phx&&Y>phy&&phx!=-1&&phy!=-1&&hx!=-1&&hy!=-1&&X>hx&&Y>hy){
      stroke(shapeColor.value());
      fill(255);
      beginShape(QUADS);
      vertex(hx,hy);
      vertex(hx,Y);
      vertex(X,Y);
      vertex(X,hy);
      endShape(CLOSE);
      phx=X;
      phy=Y;
    }
  }
}


function keyTyped() {
  if (key === 's') {
    saveCanvas('output', 'png');
  }
}
