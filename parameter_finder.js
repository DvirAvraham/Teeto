(function () {
    const scripts = document.getElementsByTagName('script');
    const paramsRegex = /[?&]([^=&]+)=([^&]*)/g;
    const paramNamesSet = new Set();
  
    function addParamName(paramName) {
      paramNamesSet.add(paramName);
    }
  
    function fetchAndTestRegex(scriptSrc) {
      fetch(scriptSrc)
        .then(function (response) {
          return response.text();
        })
        .then(function (scriptContent) {
          let matches;
          while ((matches = paramsRegex.exec(scriptContent)) !== null) {
            addParamName(matches[1]); // Add the parameter name to the set
          }
        })
        .catch(function (error) {
          console.log('An error occurred: ', error);
        });
    }
  
    // Process each script's src attribute if it exists
    for (let script of scripts) {
      let scriptSrc = script.src;
      if (scriptSrc) {
        fetchAndTestRegex(scriptSrc);
      }
    }
  
    // Also check for parameters within inline scripts and the current page's HTML content
    let inlineScriptContent = Array.from(scripts).map(script => script.textContent).join(' ');
    let pageContent = document.documentElement.outerHTML + inlineScriptContent;
  
    let matches;
    while ((matches = paramsRegex.exec(pageContent)) !== null) {
      addParamName(matches[1]); // Add the parameter name to the set
    }
  
    function writeResults() {
      // Convert the set of parameter names to a sorted array
      return Array.from(paramNamesSet).sort();
    }
  
    // Log the unique parameter names found after a delay to allow for fetch operations to complete
    console.log('Scanning for query string parameter names...');
    new Promise(resolve => setTimeout(resolve, 3000)).then(() => {
      const uniqueParamNames = writeResults();
      console.log('Unique parameter names found:', uniqueParamNames);
      // If you are using this in a Chrome extension, you can send the results to the background page
      chrome.runtime.sendMessage({ action: "returnParameters", data: uniqueParamNames });
    });
  })();
  