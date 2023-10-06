

document.querySelectorAll('.tab-button').forEach(button => {
  button.addEventListener('click', function () {
    // Remove active class from all tab buttons
    document.querySelectorAll('.tab-button').forEach(btn => {
      btn.classList.remove('active');
    });
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(content => {
      content.style.display = 'none';
    });
    // Set the clicked tab button as active
    this.classList.add('active');
    // Display the corresponding tab content
    document.getElementById(this.dataset.tab).style.display = 'block';
  });
});

document.getElementById('find-endpoints').addEventListener('click', function() {
  document.getElementById('find-endpoints').style.display = "none"
  document.getElementById('loader').style.display = "block"
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    const activeTab = tabs[0];

    console.log('Executing endpoint_finder.js');

    chrome.scripting.executeScript({
      target: { tabId: activeTab.id },
      files: ['endpoint_finder.js']
    });
  });
});


document.getElementById('copy-all').addEventListener('click', function () {
  chrome.storage.local.get(['endpoints'], function (result) {
    var text = result.endpoints.map(e => e.endpoint).join('\n');
    navigator.clipboard.writeText(text).then(function () {
      document.getElementById('copy-msg').style.display = 'block'
      setTimeout(()=>{
        document.getElementById('copy-msg').style.display = 'none'
      },1000)
    });
  });
});

document.getElementById('clear-results').addEventListener('click', function () {
  chrome.storage.local.set({ endpoints: [] }, function () {
    document.getElementById('results').textContent = '';
    document.getElementById('results').style.display = 'none';
    
    document.getElementById('copy-all').style.display = 'none';
    document.getElementById('clear-results').style.display = 'none';
  });
});

function appendEndpointToResultsDiv(endpointObj, resultsDiv) {
  var endpointElement = document.createElement('div');
  endpointElement.classList.add('url-box');
  endpointElement.style.border = "1px solid #ddd";
  endpointElement.style.padding = "10px";
  endpointElement.style.marginBottom = "10px";
  endpointElement.style.borderRadius = "5px";
  
  var a = document.createElement('a');
  a.classList.add('url-link');
  a.textContent = endpointObj.endpoint;
  a.href = "#";
  a.style.textDecoration = "none";
  a.style.color = "red";
  a.style.marginRight = "10px";
  a.addEventListener('click', function (e) {
    e.preventDefault();
    chrome.tabs.create({ url: endpointObj.endpoint });
  });

  var sourceLink = document.createElement('a');
  sourceLink.classList.add('source-link');

  sourceLink.textContent = '(found in ' + endpointObj.source + ')';
  sourceLink.href = endpointObj.source;
  sourceLink.target = "_blank";
  sourceLink.style.color = "gray";

  endpointElement.appendChild(a);
  endpointElement.appendChild(sourceLink);

  resultsDiv.appendChild(endpointElement);
}

// load previous results
chrome.storage.local.get(['endpoints'], function (result) {
  var resultsDiv = document.getElementById('results');
  if (result.endpoints && result.endpoints.length > 0) {
    resultsDiv.style.display = 'block';
    document.getElementById('copy-all').style.display = 'block';
    document.getElementById('clear-results').style.display = 'block';
    result.endpoints.forEach(function (endpointObj) {
      appendEndpointToResultsDiv(endpointObj, resultsDiv);
    });
  }
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "returnResults") {
    var resultsDiv = document.getElementById('results');
    resultsDiv.textContent = '';
    resultsDiv.style.display = 'block';
    document.getElementById('loader').style.display = "none"
    document.getElementById('find-endpoints').style.display = "block"
    document.getElementById('copy-all').style.display = 'block';
    document.getElementById('clear-results').style.display = 'block';
    let uniqueEndpoints = Array.from(new Set(request.data.map(JSON.stringify))).map(JSON.parse);
    chrome.storage.local.set({ endpoints: uniqueEndpoints }, function () {
      uniqueEndpoints.forEach(function (endpointObj) {
        appendEndpointToResultsDiv(endpointObj, resultsDiv);
      });
    });
  }
});

// function updateButtonVisibility() {
//   // Check if results set has any entries
//   console.log('Checking results visibility', results);
//   if (results && results.size > 0) {
//       document.getElementById("find-endpoints").style.display = "none";
//   } else {
//       document.getElementById("find-endpoints").style.display = "block";
//   }
// }

// // Call this function after any operation that might modify the results
// updateButtonVisibility();