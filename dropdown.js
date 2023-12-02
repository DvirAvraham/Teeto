document.addEventListener('DOMContentLoaded', function () {
    const dropdown = document.getElementById('dropdown');
    const selectedOption = dropdown.querySelector('.selected-option');
    const optionsContainer = dropdown.querySelector('.options-container');

    // Toggle dropdown
    selectedOption.addEventListener('click', function () {
        console.log('clicked - Toggle dropdown');
        optionsContainer.style.display = optionsContainer.style.display === 'block' ? 'none' : 'block';
    });


    // Close dropdown when clicking outside
    document.addEventListener('click', function (e) {
        console.log('clicked - Close dropdown');

        if (!dropdown.contains(e.target)) {
            optionsContainer.style.display = 'none';
        }
    });
});