// document.getElementById('search-endpoints').addEventListener('input', function (e) {
//     const searchQuery = e.target.value.toLowerCase();
//     const endpointsElements = document.querySelectorAll('#endpoints-results div');
//     endpointsElements.forEach(elem => {
//         const endpoint = elem.textContent.toLowerCase();
//         if (endpoint.includes(searchQuery)) {
//             elem.style.display = '';
//         } else {
//             elem.style.display = 'none';
//         }
//     });
// });

// document.getElementById('search-secrets').addEventListener('input', function (e) {
//     const searchQuery = e.target.value.toLowerCase();
//     const secretsElements = document.querySelectorAll('#secrets-results div');
//     secretsElements.forEach(elem => {
//       const secret = elem.textContent.toLowerCase();
//       if (secret.includes(searchQuery)) {
//         elem.style.display = '';
//       } else {
//         elem.style.display = 'none';
//       }
//     });
//   });


function setupSearch(inputId, resultsContainerId) {
    document.getElementById(inputId).addEventListener('input', function (e) {
        const searchQuery = e.target.value.toLowerCase();
        const resultsElements = document.querySelectorAll(`#${resultsContainerId} div`);
        resultsElements.forEach(elem => {
            const text = elem.textContent.toLowerCase();
            elem.style.display = text.includes(searchQuery) ? '' : 'none';
        });
    });
}

// Setup search for each tab
setupSearch('search-endpoints', 'endpoints-results');
setupSearch('search-secrets', 'secrets-results');
setupSearch('search-params', 'params-results');
