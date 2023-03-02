var canvas,ctx;
var mouseX,mouseY,mouseDown=0;
var touchX,touchY;



function init()
{
    canvas = document.getElementById('sketchpad');
    
    ctx = canvas.getContext('2d');
    ctx.fillStyle = "black";
    ctx.fillRect(0,0,canvas.width,canvas.height);
    if(ctx)
    {
        canvas.addEventListener('mousedown', sketchpad_mouseDown, false);          
        canvas.addEventListener('mousemove', sketchpad_mouseMove, false);          
        window.addEventListener('mouseup', sketchpad_mouseUp, false);           
        canvas.addEventListener('touchstart', sketchpad_touchStart,false);
        canvas.addEventListener('touchmove', sketchpad_touchMove, false); 
    }
}


function draw(ctx,x,y,size,isDown)
{
    if(isDown)
    {   
        ctx.beginPath();
        ctx.strokeStyle = "white";    
        ctx.lineWidth = '15';   
        ctx.lineJoin = ctx.lineCap = 'round';    
        ctx.moveTo(lastX, lastY);      
        ctx.lineTo(x,y);   
        ctx.closePath();    
        ctx.stroke();    
    }   
  
  lastX = x; 
  lastY = y; 
}




function sketchpad_mouseDown() {
    mouseDown=1;    
    draw(ctx,mouseX,mouseY,12, false );
}


function sketchpad_mouseUp() {    
    mouseDown=0;
}


function sketchpad_mouseMove(e) {
    getMousePos(e);
    if (mouseDown==1) {
        draw(ctx,mouseX,mouseY,12, true);
    }
}


function getMousePos(e) 
{    
    if (!e)        
      var e = event;     
    if (e.offsetX) {        
      mouseX = e.offsetX;        
      mouseY = e.offsetY;    
    }    
    else if (e.layerX) {        
      mouseX = e.layerX;        
      mouseY = e.layerY;    
    } 
}

/
function sketchpad_touchStart() {     
    getTouchPos();    
    draw(ctx,touchX,touchY,12, false);    
    //this prevents scrolling of screen when user draws
    event.preventDefault();
}


//it is activated when user drags in sketchpad
//it calls draw with true flag to enable drawing

function sketchpad_touchMove(e) {     
    getTouchPos(e);    
    draw(ctx,touchX,touchY,12, true);    
    event.preventDefault();
}

//it is used to find point in the sketchpad where user has
//touched

function getTouchPos(e) {    
    if (!e)        
    var e = event;     
    if(e.touches) {   
        //it length is used to find  
        //how many fingers has touched    
      if (e.touches.length == 1) {            
        var touch = e.touches[0];            
        touchX=touch.pageX-touch.target.offsetLeft;               
        touchY=touch.pageY-touch.target.offsetTop;        
      }
    }
}

//clearing the sketchpad
//on click of clear button it fills backg with black color

document.getElementById('clear_button').addEventListener("click",  
                                             function(){  
    ctx.clearRect(0, 0, canvas.width, canvas.height);  
    ctx.fillStyle = "black"; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);
});


//integrating  CANVAS  with CNN MODEL


//loading the model

//the base url of website in which our 
//web app is deployed is obtained from window.location.origin
//the json file is loaded using async function

var base_url = window.location.origin;
let model;
(async function(){  
    console.log("model loading...");  
    model = await tf.loadLayersModel("  https://pooja-varadarajan.github.io/RAPmachinelearning_new/models/model.json")
    console.log("model loaded..");
})();

//preprocessing model

/*
the digit sketched is passed as image to model
so as to predict the value of it

*/

function preprocessCanvas(image) { 
   
    //resizing the input image to target size of (1, 28, 28) 
    //tf.browser.fromPixels() method, to create a tensor that will flow into the first layer of the model
    //tf.image.resizeNearestNeighbor() function resizes a batch of 3D images to a new shape
    //tf.mean() function is used to compute the mean of elements across the dimensions of the tensor
    //tf.toFloat() function casts the array to type float
    //The tensor.div() function is used to divide the array or tensor by the maximum RGB value(255)
    let tensor = tf.browser.fromPixels(image).resizeNearestNeighbor([28, 28]).mean(2).expandDims(2).expandDims().toFloat(); 
    console.log(tensor.shape); 
    return tensor.div(255.0);
}

//Prediction
//canvas.toDataURL() : returns 
//image in format specified default png
//than send to preprocess function
//await makes program wait until mmodel prediction
//displayLabel to display result
document.getElementById('predict_button').addEventListener("click",async function(){     
    var imageData = canvas.toDataURL();    
    let tensor = preprocessCanvas(canvas); 
    console.log(tensor)   
    let predictions = await model.predict(tensor).data();  
    console.log(predictions)  
    let results = Array.from(predictions);    
    displayLabel(results);    
    console.log(results);
});


//output
function displayLabel(data) { 
    var max = data[0];    
    var maxIndex = 0;     
    for (var i = 1; i < data.length; i++) {        
      if (data[i] > max) {            
        maxIndex = i;            
        max = data[i];        
      }
    }
document.getElementById('result1').innerHTML = maxIndex;
document.getElementById('result').innerHTML = maxIndex;  
document.getElementById('confidence').innerHTML = "Confidence: "+(max*100).toFixed(2) + "%";
}
