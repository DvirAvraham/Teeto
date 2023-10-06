window.addEventListener('load', function() {
  chrome.storage.local.set({endpoints: []}); // clear endpoints when page is refreshed
});
