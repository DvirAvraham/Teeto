

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

// Initiate Endpoint Finder
document.getElementById('find-endpoints').addEventListener('click', function () {
  document.getElementById('find-endpoints').style.display = "none"
  document.getElementById('loader').style.display = "block"
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const activeTab = tabs[0];

    // First, execute endpoint_finder.js
    chrome.scripting.executeScript({
      target: { tabId: activeTab.id },
      files: ['endpoint_finder.js']
    }, function () {
      // Once the first script has executed, execute secrets_finder.js
      chrome.scripting.executeScript({
        target: { tabId: activeTab.id },
        files: ['secrets_finder.js']
      });
    });
  });

});

//Initiate Parameter Finder
document.getElementById('find-params').addEventListener('click', function () {
  // document.getElementById('find-parameters').style.display = "none"
  // document.getElementById('loader-params').style.display = "block"
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const activeTab = tabs[0];

    // First, execute endpoint_finder.js
    chrome.scripting.executeScript({
      target: { tabId: activeTab.id },
      files: ['parameter_finder.js']
    });
  });

});


document.getElementById('copy-all').addEventListener('click', function () {
  chrome.storage.local.get(['endpoints'], function (result) {
    var text = result.endpoints.map(e => e.endpoint).join('\n');
    navigator.clipboard.writeText(text).then(function () {
      document.getElementById('copy-msg').style.display = 'block'
      setTimeout(() => {
        document.getElementById('copy-msg').style.display = 'none'
      }, 1000)
    });
  });
});


document.getElementById('export-all').addEventListener('click', function () {
  console.log('exporting');
  chrome.storage.local.get(['endpoints'], function (result) {
    // Adding CSV headers for 'endpoint' and 'source'
    var csvContent = "Endpoint,Source\n"; // CSV headers
    // Converting each endpoint object to CSV format
    result.endpoints.forEach(function (e) {
      var row = `${e.endpoint},${e.source}`; // Create a CSV row
      csvContent += row + "\n";
    });

    // Creating a Blob for the CSV content
    var blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    // Using FileSaver.js's saveAs function to save the CSV file
    saveAs(blob, "endpoints.csv");
  });
});

document.getElementById('export-all-secrets').addEventListener('click', function () {
  console.log('exporting');
  chrome.storage.local.get(['secrets'], function (result) {
    // Adding CSV headers for 'endpoint' and 'source'
    var csvContent = "Type,Secret\n"; // CSV headers
    // Converting each endpoint object to CSV format
    result.secrets.forEach(function (e) {
      var row = `${e.name},${e.secret}`; // Create a CSV row
      csvContent += row + "\n";
    });

    // Creating a Blob for the CSV content
    var blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    // Using FileSaver.js's saveAs function to save the CSV file
    saveAs(blob, "secrets.csv");
  });
});


// Export all endpoints to a txt file
// document.getElementById('export-all').addEventListener('click', function () {
//   console.log('exporting');
//   chrome.storage.local.get(['endpoints'], function (result) {
//     var text = result.endpoints.map(e => e.endpoint).join('\n');
//     var blob = new Blob([text], { type: "text/plain;charset=utf-8" });
//     saveAs(blob, "endpoints.txt");
//   });
// });

function saveAs(blob, filename) {
  var link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}

document.getElementById('clear-results').addEventListener('click', function () {
  chrome.storage.local.set({ endpoints: [], secrets: [] }, function () {
    document.getElementById('results').textContent = '';
    document.getElementById('secrets').textContent = '';
    document.getElementById('results').style.display = 'none';
    document.getElementById('secrets').style.display = 'none';
    document.getElementById('export-all').style.display = 'none';
    document.getElementById('export-all-secrets').style.display = 'none';
    document.getElementById('copy-all').style.display = 'none';
    document.getElementById('clear-results').style.display = 'none';
  });
});

function appendEndpointToResultsDiv(endpointObj, resultsDiv) {
  var endpointElement = document.createElement('div');
  endpointElement.classList.add('url-box');
  // endpointElement.style.border = "1px solid #ddd";
  // endpointElement.style.padding = "10px";
  // endpointElement.style.marginBottom = "10px";
  // endpointElement.style.borderRadius = "5px";

  var a = document.createElement('a');
  a.classList.add('url-link');
  a.textContent = endpointObj.endpoint;
  a.href = "#";
  a.addEventListener('click', function (e) {
    e.preventDefault();
    chrome.tabs.create({ url: endpointObj.endpoint });
  });

  // var sourceLink = document.createElement('a');
  // sourceLink.classList.add('source-link');

  // sourceLink.textContent = '(found in ' + endpointObj.source + ')';
  // sourceLink.href = endpointObj.source;
  // sourceLink.target = "_blank";
  // sourceLink.style.color = "gray";

  endpointElement.appendChild(a);
  // endpointElement.appendChild(sourceLink);

  resultsDiv.appendChild(endpointElement);
}

function appendSecretToResultsDiv(secretObj, secretsDiv) {
  console.log('secretObj', secretObj);
  let secretElement = document.createElement('div');
  secretElement.className = 'secret';

  let secretName = document.createElement('p');
  let secretText = document.createElement('p');

  secretName.textContent = secretObj.name + ': ';
  secretName.className = 'secret-name';


  secretText.textContent = secretObj.secret;
  secretText.className = 'secret-text';

  secretElement.appendChild(secretName);
  secretElement.appendChild(secretText);

  secretsDiv.appendChild(secretElement);

}


// load previous results
chrome.storage.local.get(['endpoints'], function (result) {
  var resultsDiv = document.getElementById('results');
  resultsDiv.style.display = 'block';
  if (result.endpoints && result.endpoints.length > 0) {
    document.getElementById('copy-all').style.display = 'block';
    document.getElementById('export-all').style.display = 'block';
    document.getElementById('clear-results').style.display = 'block';
    result.endpoints.forEach(function (endpointObj) {
      appendEndpointToResultsDiv(endpointObj, resultsDiv);
    });
  } else {
    // If no urls are stored, display the 'No urls found.' message
    document.getElementById('copy-all').style.display = 'none';
    document.getElementById('export-all').style.display = 'none';
    resultsDiv.textContent = 'No urls found.';

  }
});

// load previous secrets
chrome.storage.local.get(['secrets'], function (result) {
  console.log('load previous secrets', result);
  let secretsDiv = document.getElementById('secrets-results');
  secretsDiv.style.display = 'block';

  if (result.secrets && result.secrets.length > 0) {
    console.log('secrets found', result.secrets);
    // document.getElementById('copy-all-secrets').style.display = 'block';
    // document.getElementById('clear-secrets-results').style.display = 'block';

    result.secrets.forEach(function (secretObj) {
      appendSecretToResultsDiv(secretObj, secretsDiv);
    });
  } else {
    // If no secrets are stored, display the 'No secrets found.' message
    console.log('No secrets found.');
    document.getElementById('export-all-secrets').style.display = 'none';
    secretsDiv.textContent = 'No secrets found.';
  }
});



chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log('request', request);

  if (request.action === "returnResults") {
    var resultsDiv = document.getElementById('results');
    resultsDiv.textContent = '';
    resultsDiv.style.display = 'block';
    document.getElementById('loader').style.display = "none"
    document.getElementById('find-endpoints').style.display = "block"
    document.getElementById('copy-all').style.display = 'block';
    document.getElementById('export-all').style.display = 'block';
    document.getElementById('clear-results').style.display = 'block';
    let uniqueEndpoints = Array.from(new Set(request.data.map(JSON.stringify))).map(JSON.parse);
    chrome.storage.local.set({ endpoints: uniqueEndpoints }, function () {
      uniqueEndpoints.forEach(function (endpointObj) {
        appendEndpointToResultsDiv(endpointObj, resultsDiv);
      });
    });
  }
});

function displayBtns() {

}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log('request', request);
  if (request.action === "returnSecrets") {
    let secretsDiv = document.getElementById('secrets-results');
    secretsDiv.textContent = ''; // Clear the current content
    secretsDiv.style.display = 'block';

    let uniqueSecrets = Array.from(new Set(request.data.map(JSON.stringify))).map(JSON.parse);
    console.log('uniqueSecrets', uniqueSecrets);
    // Check if the list of secrets is empty
    if (uniqueSecrets.length === 0) {
      console.log('No secrets found.');
      secretsDiv.textContent = 'No secrets found.';
      return; // Exit the function early
    }
    // Hide loaders and show relevant buttons if secrets are found
    // document.getElementById('secrets-loader').style.display = "none"
    // document.getElementById('find-secrets').style.display = "block"
    // document.getElementById('copy-all-secrets').style.display = 'block';
    // document.getElementById('clear-secrets-results').style.display = 'block';


    chrome.storage.local.set({ secrets: uniqueSecrets }, function () {
      uniqueSecrets.forEach(function (secretObj) {
        appendSecretToResultsDiv(secretObj, secretsDiv);
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