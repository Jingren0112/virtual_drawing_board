let video;
let flag=0;
let handpose;
let hand;
var drawings = [];
let phand;
var bgColor, shapeColor, shapeWidth,reset,handMode, mouseMode; //selections for the drawing board
var mode=true;
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
  createP('Background Color').parent(optTitle);
  createP('Width').parent(optTitle);
  var optValue = createDiv().parent(opts).style('margin: 20px 40px; width:50px');
  shapeColor = createColorPicker('#ffffff').parent(optValue);
  bgColor = createColorPicker('#000000').parent(optValue).style('margin-top:10px');
  shapeWidth = createSelect(false).parent(optValue).style('margin-top:10px');
  shapeWidth.option('1');
  shapeWidth.option('2');
  shapeWidth.option('3');
  shapeWidth.option('4');
  shapeWidth.option('5');
  shapeWidth.selected('2');
  reset = createButton('reset').parent(opts).style('width:70px');
  mouseMode = createButton('mouse mode').parent(opts).style('width:70px');
  handMode = createButton('hand mode').parent(opts).style('width:70px');
}


function gotPoses(poses) {
    hand=poses;
}

function draw() {
  background(bgColor.value());
  reset.mousePressed(function(){
    drawings=[];
  });
  mouseMode.mousePressed(function(){
    mode=true;
  });
  handMode.mousePressed(function(){
    mode=false;
  });
  image(video,640,0,640,480);
  if(mode==true){
    if(mouseIsPressed){
      let drawing = new mouseDraw(shapeColor.value(),shapeWidth.value());
      drawings.push(drawing);
    }
  }
  else{
    if(typeof hand!=='undefined'&&hand.length>0){
      if(typeof phand ==='undefined'){
        phand=hand;
      }else{
        if(hand[0].landmarks[4][1]>hand[0].landmarks[8][1]&&hand[0].landmarks[3][1]>hand[0].landmarks[7][1]&&hand[0].landmarks[2][1]>hand[0].landmarks[6][1]&&hand[0].landmarks[1][1]>hand[0].landmarks[5][1]){
          let drawing = new handDraw(hand[0].landmarks[8][0],hand[0].landmarks[8][1],phand[0].landmarks[8][0],phand[0].landmarks[8][1],shapeColor.value(),shapeWidth.value());
          drawings.push(drawing);
          phand=hand;
        }
      }
    }
  }
  for(let drawing of drawings){
    drawing.drawLine();
  }
}



function keyTyped() {
  if (key === 's') {
    saveCanvas('output', 'png');
  }
}

class mouseDraw{
  constructor(shapeColor,shapeWidth){
    this.px=pwinMouseX;
    this.py = pwinMouseY;
    this.x = winMouseX;
    this.y = winMouseY;
    this.shapeColor=shapeColor;
    this.shapeWidth=shapeWidth;
}
  drawLine(){
    stroke(this.shapeColor);
    strokeWeight(this.shapeWidth);
    line(this.px,this.py,this.x,this.y);
  }
}


class handDraw{
  constructor(px,py,x,y,shapeColor, shapeWidth){
     this.px = px;
     this.py = py;
     this.x = x;
     this.y = y;
     this.shapeColor = shapeColor;
     this.shapeWidth = shapeWidth;
}
  drawLine(){
    stroke(this.shapeColor);
    strokeWeight(this.shapeColor);
    line(this.px,this.py,this.x,this.y);
  }
}
