/*
Popup.js
This file is run when the popup.html file is rendered.
ie. When the user clicks on the extension icon.
*/
//convenienve function to update the UI
function message(val){
  $(".message").text(val);
}

$(document).ready(function(){
  //display the score
  chrome.storage.sync.get('score', function(result){
    if (result.score===undefined) result.score = 0;
    $(".score").text(result.score);
  });
});


//update the displayed score
chrome.storage.onChanged.addListener(function(changes){
  //make sure it was the score that has been changed.
  if(changes['score']!==undefined){
    //get the score
    chrome.storage.sync.get('score', function(result){
      if (result.score===undefined) result.score = 0;
      $(".score").text(result.score);
    });
  }
});
