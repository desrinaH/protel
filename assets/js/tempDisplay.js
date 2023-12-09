// Function to fetch temperature for a node
function fetchTemperature(nodeId) {
    fetch(`http://localhost:3000/readings/${nodeId}`)
        .then(response => response.json())
        .then(data => {
            if(data.length > 0) {
                const latestReading = data[0];
                updateTemperatureDisplay(nodeId, latestReading.temperature);
            }
        })
        .catch(error => console.error('Error:', error));
}

// Function to update temperature display
function updateTemperatureDisplay(nodeId, temperature) {
    const nodeElement = document.querySelector(`.proggress[data-node-id="${nodeId}"]`);
    if (nodeElement) {
        nodeElement.style.setProperty('--i', temperature); // Assuming --i is the CSS variable controlling the graph
        nodeElement.querySelector('h3').textContent = `${temperature} °C`;
    }
}

// Initial fetch
fetchTemperature('node1');
fetchTemperature('node2');

// Set up interval to fetch temperature every 5 seconds
setInterval(() => {
    fetchTemperature('node1');
    fetchTemperature('node2');
}, 5000);
