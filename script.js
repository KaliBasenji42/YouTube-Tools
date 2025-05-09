// Variables and Constants

let video = document.querySelector('video');

let trueRand;
let URLs = [];

// Functions

function loadURLs() {
  
  let potentialLists = document.getElementsByClassName('playlist-items style-scope ytd-playlist-panel-renderer');
  
  for(let elem of potentialLists) {
    if(elem.children.length > 0) list = elem;
  }
  //console.log(list);
  
  vids = list.children;
  
  out = [];
  
  for(let vid of vids) {
    
    let child = vid.getElementsByTagName('a')[0];
    //console.log(child);
    
    try {out.push(child.getAttribute('href'));}
    catch(err) {console.log('Error getting child href: ' + err);}
      
  }
  //console.log(out);
  
  return out;
  
}

function randPL() {
  
  if(URLs.length > 0) {
    
    rand = Math.floor(Math.random() * URLs.length);
    console.log('Redirect to: ' + URLs[rand]);
    
    window.location.href = URLs[rand];
    
  }
  
}

async function getShareURLs(videos) {
  // Clicks each share button and returns list of URLs
  // Send progress info aswell
  
  let out = [];
  let i = 0;
  let failed = [];
  
  for(let vid of videos) {
    
    i++;
    
    try{
      
      // Variables
      let intTime = 100;
      
      // Declare all buttons in scope
      let menuBttn;
      let shareBttn;
      
      // Get menu
      menuBttn = vid.querySelector('yt-icon-button#button.dropdown-trigger.style-scope.ytd-menu-renderer');
      //console.log(menuBttn);
      
      // Click menu
      menuBttn.click();
      
      await new Promise(resolve => {
        let interval = setInterval(() => {
          let menuItems = document.querySelectorAll('ytd-menu-service-item-renderer.style-scope.ytd-menu-popup-renderer');
          for(let item of menuItems) {
            if(item.querySelector('yt-formatted-string').innerText == 'Share') {
              // Get share
              shareBttn = item;
              //console.log(shareBttn);
              
              // Clear
              clearInterval(interval);
              resolve();
            }
          }
        }, intTime);
      });
      
      // Click share
      shareBttn.click();
      
      await new Promise(resolve => {
        let interval = setInterval(() => {
          if(document.querySelector('input#share-url').clientHeight > 0) {
            if(document.querySelector('input#share-url').value != '') {
              // Get URL
              out.push(document.querySelector('input#share-url').value);
              //console.log(document.getElementById('share-url').value);
              
              // Clear
              clearInterval(interval);
              resolve();
            }
          }
        }, intTime);
      });
      
      // Get & click exit
      let exitBttn = document.querySelector('yt-icon-button#close-button');
      //console.log(exitBttn);
      exitBttn.click();
      
      // Report progress
      try {send('script progress ' + i + '/' + videos.length);}
      catch {}
      
    }
    
    catch {
      // Record err
      try {send('script progress Error at ' + i + '/' + videos.length);}
      catch {}
      out.push('Failed to get #' + i + ' of ' + videos.length);
    }
      
  }
  
  //console.log(out);
  return out;
  
}

async function exportPL() {
  
  // Get videos
  
  let vids = document.querySelector('div#contents.style-scope.ytd-playlist-video-list-renderer').children;
  //console.log(vids);
  
  try {send('script progress 0/' + vids.length);}
  catch {}
  
  // Get URLs
  
  let out = await getShareURLs(vids);
  
  let outStr = '';
  
  for(let item of out) {
    outStr = outStr + item + '\n';
  }
  outStr.slice(-1);
  
  console.log('Playlist:')
  console.log(outStr);
  
  // Make download
  
  let blob = new Blob([outStr], {type: 'text/plain'});
  send('script download ' + URL.createObjectURL(blob));
  
  // ✅
  try {send('script progress ' + videos.length + '/' + videos.length + '✅');}
  catch {}
  
}

function send(msg) {
  
  chrome.runtime.sendMessage({action: msg});
  
  chrome.tabs.query({active: true}, (tabs) => {
    
    for(let i = 0; i < tabs.length; i++) {
      
      chrome.tabs.sendMessage(tabs[i].id, {action: msg});
      
    }
    
  });
  
  console.log('Script sent: ' + msg);
  
}

// Load Data

const loadTimeout = setTimeout(() => {
  
  send('script trueRand req');
  
}, 10);

// Events

if(video) {
  
  video.addEventListener('ended', () => {
    
    console.log('Video Ended - Moving to random')
    
    if(trueRand) randPL();
    
  });
  
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  
  console.log('Script recived: ' + request.action);
  
  if(request.action === 'script trueRand false') trueRand = false;
  else if(request.action === 'script trueRand true') {
    URLs = loadURLs();
    console.log('Playlist length: ' + URLs.length);
    trueRand = true;
  }
  else if(request.action === 'popup export') {
    exportPL();
  }
  
});