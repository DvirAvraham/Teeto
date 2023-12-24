document.addEventListener('DOMContentLoaded', function () {
  initializeDropdowns(['dropdown-1', 'dropdown-2', 'dropdown-3']);
  getCurrentDomain(domain => {
    setupDomainSpecificListeners(domain);
  });
});

function getCurrentDomain(callback) {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (tabs.length === 0 || !tabs[0].url) {
      console.error('Error: No active tab found.');
      return;
    }
    const url = new URL(tabs[0].url);
    const domain = url.hostname;
    callback(domain);
  });
}


function initializeDropdowns(dropdownIds) {
  dropdownIds.forEach(id => {
    const dropdown = document.getElementById(id);
    if (dropdown) initializeDropdown(dropdown);
  });
}

function setupDomainSpecificListeners(domain) {
  chrome.storage.local.get([domain], function (result) {
    const domainData = result[domain];
    if (!domainData) {
      console.error(`No data found for domain: ${domain}`);
      return;
    }

    // Setup event listeners for domain-specific actions
    removeExistingListeners();

    document.getElementById('copy-all').addEventListener('click', () => copyData(domainData.endpoints, e => e.endpoint));
    document.getElementById('export-all').addEventListener('click', () => exportData(domainData.endpoints, ["Endpoint", "Source"], e => [e.endpoint, e.source]));
    document.getElementById('export-all-secrets').addEventListener('click', () => exportData(domainData.secrets, ["Name", "Secret"], e => [e.name, e.secret]));
    document.getElementById('copy-all-params').addEventListener('click', () => copyToClipboard(domainData.params.join('\n')));
    document.getElementById('copy-params-query').addEventListener('click', () => copyParamsAsQuery(domainData.params));
  });
}

function removeExistingListeners() {
  const elements = ['copy-all', 'export-all', 'export-all-secrets', 'copy-all-params', 'copy-params-query'];
  elements.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      const newElement = element.cloneNode(true);
      element.parentNode.replaceChild(newElement, element);
    }
  });
}

function initializeDropdown(dropdown) {
  const selectedOption = dropdown.querySelector('.selected-option');
  const optionsContainer = dropdown.querySelector('.options-container');

  selectedOption.addEventListener('click', event => {
    optionsContainer.style.display = optionsContainer.style.display === 'block' ? 'none' : 'block';
    event.stopPropagation();
  });

  document.addEventListener('click', event => {
    if (!dropdown.contains(event.target)) {
      optionsContainer.style.display = 'none';
    }
  });
}

function copyData(dataArray, mapFunction) {
  if (!dataArray) {
    console.error(`Data not found`);
    return;
  }
  const text = dataArray.map(mapFunction).join('\n');
  copyToClipboard(text);
}


function exportData(dataArray, headers, mapFunction) {
  if (!dataArray) {
    console.error(`Data not found`);
    return;
  }
  let csvContent = headers.join(",") + "\n";
  dataArray.forEach(item => {
    csvContent += mapFunction(item).join(",") + "\n";
  });
  saveAs(new Blob([csvContent], { type: "text/csv;charset=utf-8" }), 'export.csv');
}

function copyParamsAsQuery(params) {
  if (!params || !Array.isArray(params)) {
    console.error('Params are not available or not in expected format.');
    return;
  }
  const queryString = params.map((param, index) => `${encodeURIComponent(param)}=XNLV${index + 1}`).join('&');
  copyToClipboard(queryString);
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    document.getElementById('copy-msg').style.display = 'block';
    setTimeout(() => document.getElementById('copy-msg').style.display = 'none', 1000);
  }).catch(error => console.error('Error copying text: ', error));
}

function saveAs(blob, filename) {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}
