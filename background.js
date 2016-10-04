//extractDomain(url) is taken From
//http://stackoverflow.com/questions/8498592/extract-root-domain-name-from-string
function extractDomain(url) {
    var domain;
    //find & remove protocol (http, ftp, etc.) and get domain
    if (url.indexOf("://") > -1) {
        domain = url.split('/')[2];
    }
    else {
        domain = url.split('/')[0];
    }

    //find & remove port number
    domain = domain.split(':')[0];

    return domain;
}

//isValidURL(url) is taken From
//http://stackoverflow.com/a/23528594/827842
function isValidURL(url) {
    var encodedURL = encodeURIComponent(url);
    var isValid = false;
    $.ajax({
      url: "http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20html%20where%20url%3D%22" + encodedURL + "%22&format=json",
      type: "get",
      async: false,
      dataType: "json",
      success: function(data) {
        isValid = data.query.results != null;
      },
      error: function(){
        isValid = false;
      }
    });
    return isValid;
}
chrome.tabs.onUpdated.addListener(function(id, changeInfo, tab){
  var url = extractDomain(tab.url);

  //try to minimize the amount of times we do the check
  if(changeInfo.status === "complete"){
    //testing the domain exists...
    if(isValidURL(tab.url)){
      //try to find the url in storage
      chrome.storage.sync.get(url, function(result){
        if(result[url]===undefined){
          //domain not found in storage, so store it.
          var storeURL = {};
          storeURL[url] = 1;
          chrome.storage.sync.set(storeURL, function(){
            //show notification
            chrome.notifications.create("new-url found", {
              type:"image",
              iconUrl:"img/icon2-128.png",
              title:"New website discovered!",
              message:"You've discovered a new website and increased your scoring capacity!",
              imageUrl:"img/internet.jpg"
            });
          });
        }else{
          //domain has been found in storage, so do nothing.
        }
      });
    }
  }
});

chrome.alarms.create("update-score", {
  periodInMinutes:10
});
chrome.alarms.onAlarm.addListener(function(alarm){
  if(alarm.name==="update-score"){
    //calculate the score the user has earned
    //sync.get(null) should give us all of the keys stored.
    chrome.storage.sync.get(null, function(result){
      //Find how much we should increment the score by
      var scoreIncr = Object.keys(result).length;
      //get the current score
      chrome.storage.sync.get('score', function(result){
        //handle the first ever score update
        if (result.score===undefined) result.score = 0;
        //get new value of score
        var updatedScore = result.score+scoreIncr;
        //store new value
        chrome.storage.sync.set({score:updatedScore}, function(){
          //show notification
          chrome.notifications.create("update-score", {
            type:"image",
            iconUrl:"img/icon1-128.png",
            title:"New Score!",
            message:"You've earned "+scoreIncr+" more points! Your new score is "+updatedScore,
            imageUrl:"img/thumbs.jpg"
          });
        });
      });
    });
  }
});
