function updateTemperatureDisplay(nodeId, avgTemp) {
    const nodeElement = document.querySelector(`.proggress[data-node-id="${nodeId}"]`);

    if (nodeElement) {
        
        const temperatureElement = nodeElement.querySelector('h3');
        temperatureElement.textContent = `${avgTemp} °C`;

        
        const percentage = (avgTemp / 200) * 100; 

        
        nodeElement.style.setProperty('--i', `${percentage}%`);

        
        let color;
        if (avgTemp > 175) {
            color = 'red'; 
        } else if (avgTemp > 135) {
            color = 'orange'; 
        } else {
            color = '#1C71F1D9'; 
        }
        nodeElement.style.setProperty('--clr', color);
    } else {
        console.error(`Element with Node ID ${nodeId} not found.`);
    }
}



function fetchTemperatureData(nodeId) {
    fetch(`http://192.168.43.6:3000/readings/${nodeId}`)
        .then(response => response.json())
        .then(data => {
            if(data.avg_temp) {
                updateTemperatureDisplay(nodeId, data.avg_temp);
            }
        })
        .catch(error => console.error('Error fetching temperature data:', error));
}


function startPolling() {
    const nodes = ['1', '2']; // Array dari ID node
    nodes.forEach(nodeId => {
        setInterval(() => {
            fetchTemperatureData(nodeId);
        }, 5000); // Update setiap 5 detik
    });
}

// Mulai polling saat dokumen dimuat
document.addEventListener('DOMContentLoaded', startPolling);
