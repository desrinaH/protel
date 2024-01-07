document.addEventListener('DOMContentLoaded', () => {
    // Function to format date to "dd MMMM yyyy"
    function formatDate(date) {
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        return new Intl.DateTimeFormat('id-ID', options).format(date);
    }

    // Update the date display
    const dateDisplay = document.getElementById('date-display');
    if (dateDisplay) {
        const currentDate = new Date();
        dateDisplay.textContent = formatDate(currentDate);
    }

        // Define the nodeButtons and rangeButtons variable at the top scope
        const nodeButtons = document.querySelectorAll('.node-button');
        const rangeButtons = document.querySelectorAll('.range-button');

           // Initialize Highcharts chart
    const chart = Highcharts.chart('container', {
        chart: {
            type: 'line',
        },
        title: {
            text: 'Real-time Temperature Data'
        },
        xAxis: {
            type: 'datetime',
            title: {
                text: 'Time'
            }
        },
        yAxis: {
            title: {
                text: 'Temperature (°C)'
            }
        },
        series: [{
            name: 'Temperature',
            data: []
        }]
    });

    let dataFetchInterval; // To keep track of the interval

    // Function to start fetching data every second
    function startDataFetch(nodeId, range) {
        if (dataFetchInterval) {
            clearInterval(dataFetchInterval); // Clear the existing interval
        }
        dataFetchInterval = setInterval(() => {
            updateChartData(nodeId, range);
        }, 1000); // Set to fetch every second
    }

// Function to fetch data and update chart
function updateChartData(nodeId, range) {
    const apiEndpoint = `http://192.168.156.150:3000/sensorsread/${range}/${nodeId}`;
    fetch(apiEndpoint)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok: ' + response.statusText);
            }
            return response.json(); // This parses the JSON of the response
        })
        .then(data => {
            const timezoneOffset = 25200000; // Offset for WIB in milliseconds (7 hours)
            const processedData = data.map(item => {
                // Add the timezone offset here
                return [new Date(item.timestamp).getTime() + timezoneOffset, item.avg_temp];
            });
            chart.series[0].setData(processedData, true, true, false);
        })
        .catch(error => console.error('Error fetching data:', error));
}


    // Add event listeners for node buttons
    nodeButtons.forEach(button => {
        button.addEventListener('click', function() {
             // Toggle button active state
            nodeButtons.forEach(btn => {
                btn.classList.remove('bg-[#0067B2]', 'text-white');
                btn.classList.add('text-[#0067B2]', 'bg-white');
            });
            this.classList.add('bg-[#0067B2]', 'text-white');
            this.classList.remove('text-[#0067B2]', 'bg-white');

            const nodeId = this.getAttribute('data-node-id');
            const activeRangeButton = document.querySelector('.range-button.active');
            const range = activeRangeButton ? activeRangeButton.getAttribute('data-range') : 'tensecond';
            startDataFetch(nodeId, range);
        });
    });

    // Add event listeners for range filter buttons
// Add event listeners for range filter buttons
rangeButtons.forEach(button => {
    button.addEventListener('click', function() {
        // Remove active class from all buttons
        rangeButtons.forEach(btn => btn.classList.remove('active'));
        // Add active class to the clicked button
        this.classList.add('active');

        const activeNodeButton = document.querySelector('.node-button.bg-[#0067B2]');
        const nodeId = activeNodeButton ? activeNodeButton.getAttribute('data-node-id') : 'defaultNodeId';
        const range = this.getAttribute('data-range');
        startDataFetch(nodeId, range);
    });
});


    // Start the data fetch for the default node and range when the page loads
    const defaultNodeId = nodeButtons.length > 0 ? nodeButtons[0].getAttribute('data-node-id') : 'defaultNodeId';
    const defaultRange = 'tensecond'; // Replace with the default range if necessary
    startDataFetch(defaultNodeId, defaultRange);
});