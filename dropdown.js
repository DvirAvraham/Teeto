document.addEventListener('DOMContentLoaded', function () {
    // Function to initialize dropdown
    function initializeDropdown(dropdown) {
        const selectedOption = dropdown.querySelector('.selected-option');
        const optionsContainer = dropdown.querySelector('.options-container');

        // Toggle dropdown
        selectedOption.addEventListener('click', function (event) {
            console.log('clicked - Toggle dropdown');
            optionsContainer.style.display = optionsContainer.style.display === 'block' ? 'none' : 'block';
            event.stopPropagation(); // Prevents document click listener from immediately closing the dropdown
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', function (e) {
            if (!dropdown.contains(e.target)) {
                optionsContainer.style.display = 'none';
            }
        });
    }

    // Initialize each dropdown
    const dropdown1 = document.getElementById('dropdown-1');
    const dropdown2 = document.getElementById('dropdown-2');
    const dropdown3 = document.getElementById('dropdown-3');

    initializeDropdown(dropdown1);
    initializeDropdown(dropdown2);
    initializeDropdown(dropdown3);
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
  
  document.getElementById('copy-all-params').addEventListener('click', function () {
    chrome.storage.local.get(['params'], function (result) {
      var text = result.params.map(e => e).join('\n');
      navigator.clipboard.writeText(text).then(function () {
        document.getElementById('copy-msg').style.display = 'block'
        setTimeout(() => {
          document.getElementById('copy-msg').style.display = 'none'
        }, 1000)
      });
    });
  });
  
  document.getElementById('copy-params-query').addEventListener('click', function () {
    chrome.storage.local.get(['params'], function (result) {
      // Assuming result.params is an array like ['param1', 'param2', ...]
      if (result.params && Array.isArray(result.params)) {
        // Construct the query string
        let queryString = result.params.map((param, index) =>
          `${encodeURIComponent(param)}=XNLV${index + 1}`
        ).join('&');
  
        // Copy the query string to clipboard
        navigator.clipboard.writeText(queryString).then(function () {
          // Show confirmation message
          document.getElementById('copy-msg').style.display = 'block';
          setTimeout(() => {
            document.getElementById('copy-msg').style.display = 'none';
          }, 1000);
        }).catch(function (error) {
          // Handle errors (e.g., Clipboard API not available)
          console.error('Error copying text: ', error);
        });
      } else {
        console.error('Params are not available or not in expected format.');
      }
    });
  });
  
  
  function saveAs(blob, filename) {
    var link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  }