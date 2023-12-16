
loadDataForCurrentDomain();

function loadDataForCurrentDomain() {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (tabs.length > 0) {
      let url = new URL(tabs[0].url);
      let domain = url.hostname;

      chrome.storage.local.get([domain], function (result) {
        if (result[domain] && (result[domain].endpoints.length > 0 || result[domain].secrets.length > 0 || result[domain].params.length > 0)) {
          // Data exists for this domain, display the data container
          document.getElementById('data-container').style.display = "block";
          document.getElementById('start-container').style.display = "none";
          console.log('result[domain]', result[domain]);
          loadDomainDataToUI(result[domain]['endpoints'], 'endpoints');
          loadDomainDataToUI(result[domain]['secrets'], 'secrets');
          loadDomainDataToUI(result[domain]['params'], 'params');
        } else {
          // No data for this domain, display the start container
          document.getElementById('data-container').style.display = "none";
          document.getElementById('start-container').style.display = "block";
        }
      });
    }
  });
}

function loadDomainDataToUI(dataArray, dataType) {
  let resultsDiv = document.getElementById(dataType + "-results");
  resultsDiv.textContent = ''; // Clear the div here

  if (dataArray && dataArray.length > 0) {
    dataArray.forEach(function (dataObj) {
      appendDataToDiv(dataObj, dataType);
    });
  } else {
    resultsDiv.style.display = 'block';
    resultsDiv.textContent = 'No ' + dataType + ' found.';
  }
}


function appendDataToDiv(dataObj, dataType) {
  switch (dataType) {
    case 'endpoints':
      appendEndpointToResultsDiv(dataObj, document.getElementById('endpoints-results'));
      break;
    case 'secrets':
      appendSecretToResultsDiv(dataObj, document.getElementById('secrets-results'));
      break;
    case 'params':
      appendEndpointToParamsDiv(dataObj, document.getElementById('params-results'));
      break;
    default:
      console.log('Unknown data type:', dataType);
  }
}


// Initiate Finder
// document.getElementById('find-endpoints').addEventListener('click', function () {
//   document.getElementById('data-container').style.display = "block"
//   document.getElementById('start-container').style.display = "none"
//   document.getElementById('loader').style.display = "block"

//   chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
//     const activeTab = tabs[0];

//     // First, execute endpoint_finder.js
//     chrome.scripting.executeScript({
//       target: { tabId: activeTab.id },
//       files: ['endpoint_finder.js']
//     }, function () {
//       // Once the first script has executed, execute secrets_finder.js
//       chrome.scripting.executeScript({
//         target: { tabId: activeTab.id },
//         files: ['secrets_finder.js']
//       });
//     });
//   });

// });


// Initiate Finder With Setting Domain
document.getElementById('find-endpoints').addEventListener('click', function () {
  document.getElementById('data-container').style.display = "block";
  document.getElementById('start-container').style.display = "none";
  document.getElementById('loader').style.display = "block";

  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const activeTab = tabs[0];

    // Store the domain of the current tab
    let url = new URL(activeTab.url);
    let domain = url.hostname;

    // Initialize domain data structure
    chrome.storage.local.get([domain], function (result) {
      if (!result[domain]) {
        chrome.storage.local.set({ [domain]: { 'endpoints': [], 'params': [], 'secrets': [] } });
      }
    });

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


// document.getElementById('clear-results').addEventListener('click', function () {
//   chrome.storage.local.set({ endpoints: [], secrets: [] }, function () {
//     document.getElementById('results').textContent = '';
//     document.getElementById('secrets').textContent = '';
//     document.getElementById('params').textContent = '';
//     document.getElementById('data-container').style.display = 'none';
//     document.getElementById('start-container').style.display = 'block';
//   });
// });

document.getElementById('clear-results').addEventListener('click', function () {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (tabs.length > 0) {
      let url = new URL(tabs[0].url);
      let domain = url.hostname;

      // Delete the domain data completely
      chrome.storage.local.remove(domain, function () {
        document.getElementById('endpoints-results').textContent = '';
        document.getElementById('secrets-results').textContent = '';
        document.getElementById('params-results').textContent = '';
        document.getElementById('data-container').style.display = 'none';
        document.getElementById('start-container').style.display = 'block';
      });
    }
  });
});

// load previous results
// chrome.storage.local.get(['endpoints'], function (result) {
//   var resultsDiv = document.getElementById('results');
//   resultsDiv.style.display = 'block';
//   if (result.endpoints && result.endpoints.length > 0) {
//     document.getElementById('copy-all').style.display = 'flex';
//     document.getElementById('export-all').style.display = 'flex';
//     document.getElementById('clear-results').style.display = 'block';
//     document.getElementById('data-container').style.display = "block"
//     document.getElementById('start-container').style.display = "none"
//     result.endpoints.forEach(function (endpointObj) {
//       appendEndpointToResultsDiv(endpointObj, resultsDiv);
//     });
//   } else {
//     // If no urls are stored, display the 'No urls found.' message
//     document.getElementById('copy-all').style.display = 'none';
//     document.getElementById('export-all').style.display = 'none';
//     resultsDiv.textContent = 'No urls found.';

//   }
// });

// // load previous secrets
// chrome.storage.local.get(['secrets'], function (result) {
//   console.log('load previous secrets', result);
//   let secretsDiv = document.getElementById('secrets-results');
//   console.log('secretsDiv in load previous secrets ', secretsDiv);
//   secretsDiv.style.display = 'block';

//   if (result.secrets && result.secrets.length > 0) {
//     console.log('secrets found', result.secrets);
//     // document.getElementById('copy-all-secrets').style.display = 'block';
//     document.getElementById('export-all-secrets').style.display = 'flex';
//     document.getElementById('data-container').style.display = "block"
//     document.getElementById('start-container').style.display = "none"
//     result.secrets.forEach(function (secretObj) {
//       appendSecretToResultsDiv(secretObj, secretsDiv);
//     });
//   } else {
//     document.getElementById('export-all-secrets').style.display = 'none';
//     secretsDiv.textContent = 'No secrets found.';
//   }
// });

// //load previous params
// chrome.storage.local.get(['params'], function (result) {
//   let paramsDiv = document.getElementById('params-results');
//   paramsDiv.style.display = 'block';

//   if (result.params && result.params.length > 0) {
//     console.log('params found', result.params);
//     // document.getElementById('copy-all-secrets').style.display = 'block';
//     // document.getElementById('export-all-params').style.display = 'flex';
//     document.getElementById('data-container').style.display = "block"
//     document.getElementById('start-container').style.display = "none"
//     result.params.forEach(function (paramsObj) {
//       appendEndpointToParamsDiv(paramsObj, paramsDiv);
//     });
//   } else {
//     // If no params are stored, display the 'No params found.' message
//     console.log('No params found.');
//     document.getElementById('export-all-params').style.display = 'none';
//     paramsDiv.textContent = 'No params found.';
//   }
// }
// );

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log("Received data for", request.action, request.data);

  switch (request.action) {
    case "returnResults":
      handleReturnResults(request);
      break;
    case "returnParams":
      handleReturnParams(request);
      break;
    case "returnSecrets":
      handleReturnSecrets(request);
      break;
    default:
      console.log("Unknown action:", request.action);
  }
});


function handleReturnResults(request) {
  document.getElementById('loader').style.display = "none";
  let resultsDiv = document.getElementById('endpoints-results');

  let uniqueEndpoints = Array.from(new Set(request.data.map(JSON.stringify))).map(JSON.parse);
  // storeDataUnderDomain('endpoints', uniqueEndpoints);
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (tabs.length > 0) {
      let url = new URL(tabs[0].url);
      let domain = url.hostname;

      chrome.storage.local.get([domain], function (result) {
        console.log('result[domain] in handleReturnResults', result[domain]);

        let domainData = result[domain] || { 'endpoints': [], 'params': [], 'secrets': [] };
        domainData['endpoints'] = uniqueEndpoints;
        chrome.storage.local.set({ [domain]: domainData });
      });
    }
  });

  uniqueEndpoints.forEach(function (endpointObj) {
    appendEndpointToResultsDiv(endpointObj, resultsDiv);
  });
}

function handleReturnParams(request) {
  document.getElementById('loader').style.display = "none";
  let paramsDiv = document.getElementById('params-results');

  let uniqueParams = Array.from(new Set(request.data.map(JSON.stringify))).map(JSON.parse);
  if (uniqueParams.length === 0) {
    secretsDiv.textContent = 'No secrets found.';
    return;
  }
  // storeDataUnderDomain('params', uniqueParams);
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (tabs.length > 0) {
      let url = new URL(tabs[0].url);
      let domain = url.hostname;

      chrome.storage.local.get([domain], function (result) {
        console.log('result[domain] in handleReturnParams', result[domain]);


        let domainData = result[domain] || { 'endpoints': [], 'params': [], 'secrets': [] };
        domainData['params'] = uniqueParams;

        chrome.storage.local.set({ [domain]: domainData });
      });
    }
  });

  uniqueParams.forEach(function (paramObj) {
    appendEndpointToParamsDiv(paramObj, paramsDiv);
  });
}

function handleReturnSecrets(request) {
  document.getElementById('loader').style.display = "none";
  let secretsDiv = document.getElementById('secrets-results');

  let uniqueSecrets = Array.from(new Set(request.data.map(JSON.stringify))).map(JSON.parse);

  if (uniqueSecrets.length === 0) {
    secretsDiv.textContent = 'No secrets found.';
    return;
  }

  // storeDataUnderDomain('secrets', uniqueSecrets);
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (tabs.length > 0) {
      let url = new URL(tabs[0].url);
      let domain = url.hostname;

      chrome.storage.local.get([domain], function (result) {
        console.log('result[domain] in handleReturnSecrets', result[domain]);

        let domainData = result[domain] || { 'endpoints': [], 'params': [], 'secrets': [] };
        domainData['secrets'] = uniqueSecrets;

        chrome.storage.local.set({ [domain]: domainData });
      });
    }
  });

  uniqueSecrets.forEach(function (secretObj) {
    appendSecretToResultsDiv(secretObj, secretsDiv);
  });
}


// function handleReturnResults(request) {
//   // document.getElementById('urls-loader').style.display = "none";

//   document.getElementById('loader').style.display = "none";
//   let resultsDiv = document.getElementById('results');
//   resultsDiv.textContent = '';
//   resultsDiv.style.display = 'block';

//   let uniqueEndpoints = Array.from(new Set(request.data.map(JSON.stringify))).map(JSON.parse);
//   chrome.storage.local.set({ endpoints: uniqueEndpoints }, function () {
//     uniqueEndpoints.forEach(function (endpointObj) {
//       appendEndpointToResultsDiv(endpointObj, resultsDiv);
//     });
//   });
// }

// function handleReturnParams(request) {
//   // document.getElementById('params-loader').style.display = "none";

//   let paramsDiv = document.getElementById('params');
//   paramsDiv.textContent = '';
//   paramsDiv.style.display = 'block';
//   document.getElementById('loader').style.display = "none";

//   let uniqueParams = Array.from(new Set(request.data.map(JSON.stringify))).map(JSON.parse);
//   chrome.storage.local.set({ params: uniqueParams }, function () {
//     uniqueParams.forEach(function (paramObj) {
//       appendEndpointToParamsDiv(paramObj, paramsDiv);
//     });
//   });
// }

// function handleReturnSecrets(request) {
//   // document.getElementById('secrets-loader').style.display = "none";

//   let secretsDiv = document.getElementById('secrets');
//   secretsDiv.textContent = '';
//   secretsDiv.style.display = 'block';

//   let uniqueSecrets = Array.from(new Set(request.data.map(JSON.stringify))).map(JSON.parse);

//   if (uniqueSecrets.length === 0) {
//     secretsDiv.textContent = 'No secrets found.';
//     return;
//   }

//   chrome.storage.local.set({ secrets: uniqueSecrets }, function () {
//     uniqueSecrets.forEach(function (secretObj) {
//       appendSecretToResultsDiv(secretObj, secretsDiv);
//     });
//   });
// }

function appendEndpointToResultsDiv(endpointObj, resultsDiv) {
  resultsDiv.style.display = 'block';
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
  secretsDiv.style.display = 'block';
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

function appendEndpointToParamsDiv(paramsObj, paramsDiv) {
  paramsDiv.style.display = 'block';
  let paramsElement = document.createElement('div');
  paramsElement.className = 'params';

  let paramsName = document.createElement('p');
  let paramsText = document.createElement('p');

  paramsName.className = 'params-name';
  paramsText.className = 'params-text';

  paramsText.textContent = paramsObj;

  paramsElement.appendChild(paramsName);
  paramsElement.appendChild(paramsText);

  paramsDiv.appendChild(paramsElement);
}

