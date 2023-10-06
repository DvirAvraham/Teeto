(function() {
var scripts = document.getElementsByTagName("script");
var regex1 = /(?<=(\"|\'|\`))\/[a-zA-Z0-9_?&=\/\-\#\.]*(?=(\"|\'|\`))/g;
var regex2 = /^(http|https):\/\/[^ "]+$/g;
var regex3 = /^(http|https):\/\/[^\s/$.?#].[^\s]*$/ig;

var regexList = [regex1, regex2, regex3];


const results = new Set;
const baseUrl = window.location.origin;
const nodeModulesRegex = /node_modules/;

function addResult(path, source) {
  var absoluteUrl = path.startsWith('/') ? baseUrl + path : path;
  absoluteUrl = deleteTrailingSlashes(absoluteUrl)
  const exists = Array.from(results).some(result => result.endpoint === absoluteUrl);
  if (!nodeModulesRegex.test(absoluteUrl) && !exists) {
    results.add({ endpoint: absoluteUrl, source: source });
  }
}

function fetchAndTestRegex(scriptSrc) {
  fetch(scriptSrc)
    .then(function(response){
      return response.text()
    })
    .then(function(scriptContent){
      for(let regex of regexList) {
        var matches = scriptContent.matchAll(regex);
        for(let match of matches) {
          const isSlash = isItSlashe(match[0])
          if ( !isSlash && baseUrl !== match[0] ) addResult(match[0], scriptSrc);
        }
      }
    })
    .catch(function(error){
      console.log("An error occurred: ",error)
    });
}

for(var i = 0; i < scripts.length; i++){
  var scriptSrc = scripts[i].src;
  if(scriptSrc != ""){
    fetchAndTestRegex(scriptSrc);
  }
}

var pageContent = document.documentElement.outerHTML;

for(let regex of regexList) {
  var matches = pageContent.matchAll(regex);
  for(const match of matches) {
    addResult(match[0], 'HTML');
  }
}

function writeResults(){
  const output =  Array.from(results).sort(function(a, b) {
    return a.endpoint.localeCompare(b.endpoint);
  });
  return output;
}

new Promise(resolve => setTimeout(resolve, 3e3)).then(() => 
chrome.runtime.sendMessage({action: "returnResults", data: writeResults()}))
})();

function deleteTrailingSlashes(url) {
  if (!url) return url; 
  if (url.charAt(url.length - 1) === '/') {
    return deleteTrailingSlashes(url.slice(0, -1));
  }
  return url;
}

function isItSlashe(url){
  const regex = /^[\/\\]+$/; 
  return regex.test(url);
}
