
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
    resultsDiv.style.display = 'flex';
    resultsDiv.textContent = 'No ' + dataType + ' found.';
    resultsDiv.style.alignItems = 'center';
    resultsDiv.style.justifyContent = 'center';
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

// Initiate Finder With Setting Domain
document.getElementById('find-endpoints').addEventListener('click', function () {
  document.getElementById('data-container').style.display = "block";
  document.getElementById('start-container').style.display = "none";
  document.getElementById('endpoints-loader').style.display = "flex";
  document.getElementById('params-loader').style.display = "flex";
  document.getElementById('secrets-loader').style.display = "flex";

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

document.getElementById('clear-results').addEventListener('click', function () {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (tabs.length > 0) {
      let url = new URL(tabs[0].url);
      let domain = url.hostname;

      // Delete the domain data completely
      chrome.storage.local.remove(domain, function () {
        document.getElementById('endpoints-results').style.display = 'none';
        document.getElementById('secrets-results').style.display = 'none';
        document.getElementById('params-results').style.display = 'none';
        document.getElementById('data-container').style.display = 'none';
        document.getElementById('start-container').style.display = 'block';
      });
    }
  });
});

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
  // document.getElementById('loader').style.display = "none";
  let resultsDiv = document.getElementById('endpoints-results');
  document.getElementById('endpoints-loader').style.display = "none";


  let uniqueEndpoints = Array.from(new Set(request.data.map(JSON.stringify))).map(JSON.parse);
  if (uniqueEndpoints.length === 0) {
    resultsDiv.textContent = 'No endpoints found.';
    resultsDiv.style.display = 'flex';
    resultsDiv.style.alignItems = 'center';
    resultsDiv.style.justifyContent = 'center';
    return;
  } else {
    resultsDiv.style.display = 'block';
    resultsDiv.textContent = '';
  }
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
  // document.getElementById('loader').style.display = "none";
  let paramsDiv = document.getElementById('params-results');
  document.getElementById('params-loader').style.display = "none";
  // paramsDiv.textContent = '';
  // paramsDiv.style.display = 'block';

  let uniqueParams = Array.from(new Set(request.data.map(JSON.stringify))).map(JSON.parse);
  if (uniqueParams.length === 0) {
    paramsDiv.textContent = 'No params found.';
    paramsDiv.style.display = 'flex';
    paramsDiv.style.alignItems = 'center';
    paramsDiv.style.justifyContent = 'center';
    return;
  } else {
    paramsDiv.style.display = 'block';
    paramsDiv.textContent = '';
    // document.getElementById('secrets-loader').style.display = "flex";
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
  // document.getElementById('loader').style.display = "none";
  let secretsDiv = document.getElementById('secrets-results');
  document.getElementById('secrets-loader').style.display = "none";
  // secretsDiv.textContent = '';
  // secretsDiv.style.display = 'block';

  let uniqueSecrets = Array.from(new Set(request.data.map(JSON.stringify))).map(JSON.parse);

  if (uniqueSecrets.length === 0) {
    secretsDiv.textContent = 'No secrets found.';
    secretsDiv.style.display = 'flex';
    secretsDiv.style.alignItems = 'center';
    secretsDiv.style.justifyContent = 'center';
    return;
  } else {
    secretsDiv.style.display = 'block';
    secretsDiv.textContent = '';
  }

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

function appendEndpointToResultsDiv(endpointObj, resultsDiv) {
  resultsDiv.style.display = 'block';
  var endpointElement = document.createElement('div');
  endpointElement.classList.add('url-box');

  var a = document.createElement('a');
  a.classList.add('url-link');
  a.textContent = endpointObj.endpoint;
  a.href = "#";
  a.addEventListener('click', function (e) {
    e.preventDefault();
    chrome.tabs.create({ url: endpointObj.endpoint });
  });

  endpointElement.appendChild(a);
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

