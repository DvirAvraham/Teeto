(function () {
  const scripts = document.getElementsByTagName("script");
  const secretsRegex = [
    { "Cloudinary": "cloudinary://.*" },
    { "Firebase URL": ".*firebaseio\\.com" },
    { "Slack Token": "(xox[p|b|o|a]-[0-9]{12}-[0-9]{12}-[0-9]{12}-[a-z0-9]{32})" },
    { "RSA private key": "-----BEGIN RSA PRIVATE KEY-----" },
    { "SSH (DSA) private key": "-----BEGIN DSA PRIVATE KEY-----" },
    { "SSH (EC) private key": "-----BEGIN EC PRIVATE KEY-----" },
    { "PGP private key block": "-----BEGIN PGP PRIVATE KEY BLOCK-----" },
    { "Amazon AWS Access Key ID": "AKIA[0-9A-Z]{16}" },
    { "Amazon MWS Auth Token": "amzn\\.mws\\.[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}" },
    { "AWS API Key": "AKIA[0-9A-Z]{16}" },
    { "Facebook Access Token": "EAACEdEose0cBA[0-9A-Za-z]+" },
    { "Facebook OAuth": "[f|F][a|A][c|C][e|E][b|B][o|O][o|O][k|K].*['|\"][0-9a-f]{32}['|\"]" },
    { "GitHub": "[g|G][i|I][t|T][h|H][u|U][b|B].*['|\"][0-9a-zA-Z]{35},40}['|\"]" },
    { "Generic API Key": "[a|A][p|P][i|I][_]?[k|K][e|E][y|Y].*['|\"][0-9a-zA-Z]{32},45}['|\"]" },
    { "Generic Secret": "[s|S][e|E][c|C][r|R][e|E][t|T].*['|\"][0-9a-zA-Z]{32},45}['|\"]" },
    { "Google API Key": "AIza[0-9A-Za-z\\-_]{35}" },
    { "Google Cloud Platform OAuth": "[0-9]+-[0-9A-Za-z_]{32}\\.apps\\.googleusercontent\\.com" },
    { "Google Drive OAuth": "[0-9]+-[0-9A-Za-z_]{32}\\.apps\\.googleusercontent\\.com" },
    { "Google (GCP) Service-account": "\"type\": \"service_account\"" },
    { "Google Gmail OAuth": "[0-9]+-[0-9A-Za-z_]{32}\\.apps\\.googleusercontent\\.com" },
    { "Google OAuth Access Token": "ya29\\.[0-9A-Za-z\\-_]+" },
    { "Google YouTube OAuth": "[0-9]+-[0-9A-Za-z_]{32}\\.apps\\.googleusercontent\\.com" },
    { "Heroku API Key": "[h|H][e|E][r|R][o|O][k|K][u|U].*[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}" },
    { "MailChimp API Key": "[0-9a-f]{32}-us[0-9]{1},2}" },
    { "Mailgun API Key": "key-[0-9a-zA-Z]{32}" },
    { "Password in URL": "[a-zA-Z]{3},10}://[^/\\s:@]{3},20}:[^/\\s:@]{3},20}@.{1},100}[\"'\\s]" },
    { "PayPal Braintree Access Token": "access_token\\$production\\$[0-9a-z]{16}\\$[0-9a-f]{32}" },
    { "Picatic API Key": "sk_live_[0-9a-z]{32}" },
    { "Slack Webhook": "https://hooks.slack.com/services/T[a-zA-Z0-9_]{8}/B[a-zA-Z0-9_]{8}/[a-zA-Z0-9_]{24}" },
    { "Stripe API Key": "sk_live_[0-9a-zA-Z]{24}" },
    { "Stripe Restricted API Key": "rk_live_[0-9a-zA-Z]{24}" },
    { "Square Access Token": "sq0atp-[0-9A-Za-z\\-_]{22}" },
    { "Square OAuth Secret": "sq0csp-[0-9A-Za-z\\-_]{43}" },
    { "Twilio API Key": "SK[0-9a-fA-F]{32}" },
    { "Twitter Access Token": "[t|T][w|W][i|I][t|T][t|T][e|E][r|R].*[1-9][0-9]+-[0-9a-zA-Z]{40}" },
    { "Twitter OAuth": "[t|T][w|W][i|I][t|T][t|T][e|E][r|R].*['|\"][0-9a-zA-Z]{35},44}['|\"]" }
  ]

  const secretsResults = new Set;

  function addSecret(secretToAdd) {
      secretsResults.add({ name: secretToAdd.name, secret: secretToAdd.secret });
  }

  function fetchAndTestRegex(scriptSrc) {
    fetch(scriptSrc)
      .then(function (response) {
        return response.text()
      })
      .then(function (scriptContent) {
        for (const regex of secretsRegex) {
          const value = Object.values(regex)[0];
          const key = Object.keys(regex)[0];
          var matches = scriptContent.matchAll(value);
          for (const match of matches) {
            isExist(match[0]) || addSecret({ name: key, secret: match[0] })
          }
        }
      })
      .catch(function (error) {
        console.log("An error occurred: ", error)
      });
  }

  for (var i = 0; i < scripts.length; i++) {
    var scriptSrc = scripts[i].src;
    if (scriptSrc != "") {
      fetchAndTestRegex(scriptSrc);
    }
  }

  const pageContent = document.documentElement.outerHTML;

  for (const regex of secretsRegex) {
    const value = Object.values(regex)[0];
    const key = Object.keys(regex)[0];
    var matches = pageContent.matchAll(value);
    for (const match of matches) {
      isExist(match[0]) || addSecret({ name: key, secret: match[0] })
    }
  }

  function isExist(secretToAdd){
    return Array.from(secretsResults).some(result => result.secret === secretToAdd);
  }
  function writeResults() {
    const output = Array.from(secretsResults).sort(function (a, b) {
      return a.endpoint.localeCompare(b.endpoint);
    });
    return output;
  }

  new Promise(resolve => setTimeout(resolve, 3e3)).then(() =>
    chrome.runtime.sendMessage({ action: "returnSecrets", data: writeResults() }))

})();


