document.addEventListener('DOMContentLoaded', () => {
    // Function to format date to "dd MMMM yyyy"
    function formatDate(date) {
        const options = { day: 'numeric', month: 'long', year: 'numeric', locale: 'id-ID' };
        return new Intl.DateTimeFormat('id-ID', options).format(date);
    }

    // Update the date display
    const dateDisplay = document.getElementById('date-display'); // Ensure this ID matches your HTML
    const currentDate = new Date();
    const formattedDate = formatDate(currentDate);
    if (dateDisplay) {
        dateDisplay.textContent = formattedDate;
    }

    // Handle button click events
    const buttons = document.querySelectorAll('.w-full.lg\\:w-1\\/4 ul li button');

    buttons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            buttons.forEach(btn => btn.classList.remove('active'));

            // Add active class to the clicked button
            this.classList.add('active');
        });
    });

    const nodeButtons = document.querySelectorAll('.node-button'); // Add this class to your Node buttons in HTML
    nodeButtons.forEach(button => {
        button.addEventListener('click', function() {
            nodeButtons.forEach(btn => btn.classList.remove('bg-[#0067B2]', 'text-white'));
            nodeButtons.forEach(btn => btn.classList.add('text-[#0067B2]', 'bg-white'));
            this.classList.add('bg-[#0067B2]', 'text-white');
            this.classList.remove('text-[#0067B2]', 'bg-white');
        });
    });
});
