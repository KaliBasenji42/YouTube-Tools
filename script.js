// Variables and Constants

let video = document.querySelector('video');

let skipAd;

let trueRand;
let URLs = [];

// Functions

function loadURLs() {
  
  vids = document.getElementsByClassName('playlist-items style-scope ytd-playlist-panel-renderer')[2].children;
  
  out = [];
  
  for(let i = 0; i < vids.length; i++) {
    
    child = vids[i].getElementsByClassName('yt-simple-endpoint style-scope ytd-playlist-panel-video-renderer')[0];
    
    try {
      
      out.push(child.getAttribute('href'));
      
    }
    
    catch(err) {console.log('Error in loadURLs: ' + err);}
      
  }
  
  return out;
  
}

function randPL() {
  
  if(URLs.length > 0) {
    
    rand = Math.floor(Math.random() * URLs.length);
    console.log('Redirect to: ' + URLs[rand]);
    
    window.location.href = URLs[rand];
    
  }
  
}

function loadSkipAd() {
  
  skipAd = document.getElementsByClassName('ytp-skip-ad-button')[0];
  console.log('Skip Ad:');
  console.log(skipAd);
  
  send('showSkip req');
  
}

function send(msg) {
  
  chrome.runtime.sendMessage({action: msg});
  
  chrome.tabs.query({}, (tabs) => {
    
    for(let i = 0; i < tabs.length; i++) {
      
      chrome.tabs.sendMessage(tabs[i].id, {action: msg});
      
    }
    
  });
  
  console.log('Script sent: ' + msg);
  
}

// Load Data

const loadTimeout = setTimeout(() => {
  
  send('trueRand req');
  loadSkipAd();
  
}, 1000);

// Events

video.addEventListener('ended', () => {
  
  if(trueRand) randPL();
  
});

document.addEventListener('keypress', () => {
  
  if(event.key == 's') loadSkipAd();
  
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  
  console.log('Script recived: ' + request.action);
  
  if(request.action === 'showSkip true') skipAd.style.display = 'block';
  
  if(request.action === 'trueRand true') {
    URLs = loadURLs();
    trueRand = true;
  }
  
});
