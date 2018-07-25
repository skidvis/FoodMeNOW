import * as messaging from "messaging";
import { geolocation } from "geolocation";
import { me } from "companion";
var lat = 0;
var lng = 0;
let foods = [];
let payload = {};
let lastError = {};

messaging.peerSocket.onmessage = function(response) {
  geolocation.getCurrentPosition(locationSuccess, locationError);
}

function locationSuccess(position) {
    if(position.coords){
      lat = position.coords.latitude;
      lng = position.coords.longitude;
    }
    getFood();
}

function locationError(error) {
  console.log("Error: " + error.code,
              "Message: " + error.message);
}

function getFood() {

  fetch("https://developers.zomato.com/api/v2.1/search?count=20&radius=2000&sort=real_distance&order=asc&lat=" + lat + "&lon=" + lng,
  {
    method: "GET",
    headers: {
      "user-key": "YOUR_KEY_HERE"
    }
  })
    .then(function(response) {
      return response.json();
  }).then(function(json) {
    if(json != null && json.code != 404){
      json.restaurants.forEach((element, index) => {
        var newFood = {
          name: element.restaurant.name,
          cuisines: element.restaurant.cuisines
        };
        foods.push(newFood);
      });      
    };
    payload = {"type": "names", "foods": foods};
    sendFoods();
    
  }).catch(function(error) {
      lastError = {"type": "error", "error": error};
      sendError();
    });
}

function sendError(){
    if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
      messaging.peerSocket.send(lastError);
    }else{ 
      setTimeout(sendError, 2 * 1000);
    }
}

function sendFoods(){
    if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
      messaging.peerSocket.send(payload);
    }else{   
      setTimeout(sendFoods, 2 * 1000);
    }
}