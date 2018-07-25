import * as messaging from "messaging";
import { display } from "display";
import { vibration } from "haptics";
import document from "document";

let view1 = document.getElementById("main");
let view2 = document.getElementById("alt");
let view3 = document.getElementById("error");
let mylabel = document.getElementById("mylabel");
let mybutton = document.getElementById("mybutton");
let foods = [];
let tiles = [];
let count = 0;
var timeout;

for (let i = 0; i < 20; i++) {
  let tile = document.getElementById(`foods-${i}`);
  if (tile) {
    tiles.push(tile);
  };
};

restartSearch();

mybutton.onclick = function(evt){
  mylabel.style.opacity = 0;
  mybutton.text = "connecting..";
  mybutton.style.fill = "gold";
  count = 0;
  restartSearch();
}

function restartSearch(){
    if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
      messaging.peerSocket.send("Go!");
      mybutton.text = "Searching..";
      mybutton.style.fill = "fb-blue";
      mybutton.enabled = false;
    }else{ 
      timeout = setTimeout(restartSearch, 2 * 1000);
      count++;
      if(count == 3){
        mylabel.style.opacity = 1;        
        mybutton.text = "Try Again";
        mybutton.style.fill = "red";
        vibration.start("nudge");    
        display.poke();
        clearTimeout(timeout);
      }
    }
}

messaging.peerSocket.onmessage = function(response) {  
  if(response.data.type == "names"){
    foods = response.data.foods;
    var foodsList = document.getElementById("foodsList");

    tiles.forEach((element, index) => {
      tiles[index].getElementById("destination").text = foods[index].name;
      tiles[index].getElementById("distance").text = " " + foods[index].cuisines;
    });  

    if(foods.length == 0){
      tiles[0].getElementById("destination").text = "0 Results found."
      tiles[0].getElementById("distance").text = "try again later"
    }

    document.getElementById("foodsList").redraw();
    view1.style.display = "none";
    view2.style.display = "inline";  
    vibration.start("bump");    
    display.poke();    
  }else{
    console.log(JSON.stringify(response));
    mybutton.text = "Error, Try Again";
    mybutton.style.fill = "red";
    mybutton.enabled = true;
    vibration.start("nudge");    
    display.poke();    
  }
}


