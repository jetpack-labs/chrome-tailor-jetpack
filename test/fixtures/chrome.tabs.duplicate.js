
document.addEventListener('DOMContentLoaded', function() {
  chrome.tabs.getCurrent((tab) => {

    chrome.tabs.duplicate(tab.id, () => {
      chrome.tabs.duplicate(tab.id);
    });
  });
});
