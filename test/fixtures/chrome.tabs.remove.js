
document.addEventListener('DOMContentLoaded', function() {
  console.log("getting current tab");
  chrome.tabs.getCurrent((tab) => {
    console.log("got current tab " + tab.id);
    console.log("duplicate tab " + tab.id);
    chrome.tabs.duplicate(tab.id, (dupTab) => {
    console.log("duplicated tab " + dupTab.id);
      chrome.tabs.remove(tab.id, () => {
       console.log("removed tab " + tab.id);
        console.log("removing tab " + dupTab.id);
        chrome.tabs.remove(dupTab.id);
      });
    });
  });
});
