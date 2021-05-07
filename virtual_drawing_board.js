let video;
let handpose;                                                  //hand position detection array
let hand;                                                      //result of detection
let phand;                                                      //previous hand position
var bgColor, shapeColor, shapeWidth,reset,handMode, mouseMode; //selections for the drawing board
var mode=true;                                                //switching mode
var square, circle, triangle;                                            //select shape
let sqr=false;
let handFirstSqr=true;                  //flag for the first vertex of hand draw sqr
let x=-1,y=-1,px=-1,py=-1;
let hx=-1,hy=-1,phx=-1,phy=-1;        //variables for hand draw sqr
let handFinished=true;
let time=0;
let pTime=0;
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
  mouseMode = createButton('mouse mode').parent(buttonOpt).style('width:75px;margin-top:10px;');
  handMode = createButton('hand mode').parent(buttonOpt).style('width:75px; margin-top:10px');
  var buttonOpt2 = createDiv().parent(opts).style('margin:10px 40px; width:75px');
  square = createButton('square').parent(buttonOpt2).style('width:75px');
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
  mouseMode.mousePressed(function(){
    mode=true;
  });
  handMode.mousePressed(function(){
    mode=false;
  });
  square.mousePressed(function(){
    sqr=true;
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
            console.log(pTime);
            console.log(time);
            if(handFirstSqr==true&&handFinished==true){
              console.log('first point!');
              drawSquare(X,Y,0);
              handFinished=false;
            } else if(abs(pX-X)<10&&abs(pY-Y)<40&&handFinished==false&&(time-pTime)>3){
              console.log('finished');
               handFinished=true; 
               pTime=time;
            } else if(abs(pX-X)<10&&abs(pY-Y)>40&&handFinished==true&&handFirstSqr!=true){
              console.log('started!');
              handFinished=false;
              handFirstSqr=true;
            } else if(handFinished==false){
              console.log('drawing!');
               drawSquare(X,Y,1);
            }
          } else{
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
    hx=hpx=X;
    hy=hpy=Y;
    handFirstSqr=false;
  } else{
    if(X>phx&&Y>phy){
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
    }else if(X<hx||mouseY<hy){
      phx=hx;
      phy=hy;
    }
  }
}


function keyTyped() {
  if (key === 's') {
    saveCanvas('output', 'png');
  }
}
