
function updateHeaterStatus(nodeId, status) {
    fetch(`http://192.168.156.150:3000/actions/${nodeId}`, {
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


function updateCylinderDisplay(nodeId, status) {
   
    const nodeElement = document.querySelector(`.node${nodeId}`);
    let color;

    
    if (status === 'ON') {
        color = 'rgba(211, 10, 10, 0.7)'; // Merah untuk ON
    } else if (status === 'OFF') {
        color = 'rgba(0, 16, 160, 0.8)'; // Biru untuk OFF
    } else if (status === 'AUTO') {
        
        checkAndSetAutoHeaterStatus(nodeId);
        return; 
    }

    
    if (nodeElement) {
        nodeElement.style.backgroundColor = color;
    }
}


function setupHeaterControls() {
    document.querySelectorAll('input[type="radio"]').forEach(input => {
        input.addEventListener('change', (event) => {
            const nodeId = event.target.name.split('_')[2]; 
            const status = event.target.value.split('_')[0].toUpperCase(); 
            updateHeaterStatus(nodeId, status);
        });
    });
}


function checkAndSetAutoHeaterStatus(nodeId) {
 
    fetch(`http://192.168.156.150:3000/actions/auto/${nodeId}`) 
        .then(response => response.json())
        .then(data => {
           
            const color = data.status === 'ON' ? 'rgba(211, 10, 10, 0.7)' : 'rgba(0, 16, 160, 0.8)';
            const nodeElement = document.querySelector(`.node${nodeId}`);
            nodeElement.style.backgroundColor = color;
        })
        .catch(error => console.error('Error:', error));
}


document.addEventListener('DOMContentLoaded', () => {
    setupHeaterControls();
  
    const mixerCheckbox = document.getElementById('kontrol_pengaduk');
    mixerCheckbox.addEventListener('change', (event) => {
        const nodeId = event.target.value; // This should be '3' for mixer
        const status = event.target.checked ? 'ON' : 'OFF';
        updateHeaterStatus(nodeId, status);
    });
    checkAndSetAutoHeaterStatus(1);
    checkAndSetAutoHeaterStatus(2);
});
