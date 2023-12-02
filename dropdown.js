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