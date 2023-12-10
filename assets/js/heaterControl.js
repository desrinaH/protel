// Fungsi untuk mengirim status pemanas ke server dan memperbarui tampilan silinder
function updateHeaterStatus(nodeId, status) {
    fetch(`http://10.3.146.122:3000/actions/${nodeId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: status })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        console.log(data);
        // Update the cylinder display after updating the heater status
        updateCylinderDisplay(nodeId, status);
    })
    .catch(error => console.error('Error:', error));
}

// Fungsi untuk mengupdate tampilan silinder berdasarkan status 
function updateCylinderDisplay(nodeId, status) {
    // Select the cylinder element based on nodeId
    const nodeElement = document.querySelector(`.node${nodeId}`);
    let color;

    // Change color based on the status
    if (status === 'ON') {
        color = 'rgba(211, 10, 10, 0.7)'; // Merah untuk ON
    } else if (status === 'OFF') {
        color = 'rgba(0, 16, 160, 0.8)'; // Biru untuk OFF
    } else if (status === 'AUTO') {
        // If AUTO, determine whether the heater is active or not
        // This might require additional information from the server
        checkAndSetAutoHeaterStatus(nodeId);
        return; // Early return since checkAndSetAutoHeaterStatus will handle the color update
    }

    // Set the background color of the cylinder element
    if (nodeElement) {
        nodeElement.style.backgroundColor = color;
    }
}

// Fungsi untuk menambahkan event listener ke radio buttons
function setupHeaterControls() {
    document.querySelectorAll('input[type="radio"]').forEach(input => {
        input.addEventListener('change', (event) => {
            const nodeId = event.target.name.split('_')[2]; // 'pemanas_node_1' becomes '1'
            const status = event.target.value.split('_')[0].toUpperCase(); // 'off_node1' becomes 'OFF'
            updateHeaterStatus(nodeId, status);
        });
    });
}

// Fungsi untuk mengambil status pemanas dari server untuk 'AUTO'
function checkAndSetAutoHeaterStatus(nodeId) {
    // Add the server endpoint to fetch the heater status
    // Placeholder URL below, replace with your actual endpoint
    fetch(`http://10.3.146.122:3000/heater-status/${nodeId}`)
        .then(response => response.json())
        .then(data => {
            // Assuming the server returns an object with a "status" key
            const color = data.status === 'active' ? 'rgba(211, 10, 10, 0.7)' : 'rgba(0, 16, 160, 0.8)';
            const nodeElement = document.querySelector(`.node${nodeId}`);
            nodeElement.style.backgroundColor = color;
        })
        .catch(error => console.error('Error:', error));
}

// Setup event listeners when the document loads
document.addEventListener('DOMContentLoaded', () => {
    setupHeaterControls();
    // Fetch initial heater status for both nodes
    // Assuming you have an endpoint to get the current status
    // If you don't, remove these lines
    checkAndSetAutoHeaterStatus(1);
    checkAndSetAutoHeaterStatus(2);
});
