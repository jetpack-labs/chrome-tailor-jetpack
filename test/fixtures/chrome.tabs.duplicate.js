
document.addEventListener('DOMContentLoaded', function() {
  chrome.tabs.getCurrent((tab) => {
    console.log(tab.url);

    chrome.tabs.duplicate(tab.id, () => {
      chrome.tabs.duplicate(tab.id);
    });
  });
});
