(function() {
var scripts = document.getElementsByTagName("script");
var regex1 = /(?<=(\"|\'|\`))\/[a-zA-Z0-9_?&=\/\-\#\.]*(?=(\"|\'|\`))/g;
var regex2 = /^(http|https):\/\/[^ "]+$/g;
var regex3 = /^(http|https):\/\/[^\s/$.?#].[^\s]*$/ig;


var regexList = [regex1, regex2, regex3];


const pathResults = new Set;
const baseUrl = window.location.origin;
const nodeModulesRegex = /node_modules/;

function addPath(path, source) {
  var absoluteUrl = path.startsWith('/') ? baseUrl + path : path;
  absoluteUrl = deleteTrailingSlashes(absoluteUrl)
  const exists = Array.from(pathResults).some(result => result.endpoint === absoluteUrl);
  if (!nodeModulesRegex.test(absoluteUrl) && !exists) {
    pathResults.add({ endpoint: absoluteUrl, source: source });
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
        for(const match of matches) {
          const isSlash = isItSlashe(match[0])
          if ( !isSlash && baseUrl !== match[0] ) addPath(match[0], scriptSrc);
        }
      }
      // for (const regex of secretsRegex) {
      //   const value = Object.values(regex)[0]; 
      //   const key = Object.keys(regex)[0]; 
      //   var matches = scriptContent.matchAll(value);

      //   for(const match of matches) {
      //      console.log(key+' ---> '+match[0]);
      //   }
      // }
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
    addPath(match[0], 'HTML');
  }
}

function writeResults(){
  const output =  Array.from(pathResults).sort(function(a, b) {
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
