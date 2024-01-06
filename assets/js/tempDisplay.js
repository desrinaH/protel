function updateTemperatureDisplay(nodeId, avgTemp) {
    const nodeElement = document.querySelector(`.proggress[data-node-id="${nodeId}"]`);

    if (nodeElement) {
        // Perbarui teks dengan suhu baru
        const temperatureElement = nodeElement.querySelector('h3');
        temperatureElement.textContent = `${avgTemp} °C`;

        // Hitung persentase untuk suhu, asumsikan 200 sebagai suhu maksimal
        const percentage = (avgTemp / 200) * 100; 

        // Tetapkan properti CSS --i untuk persentase lingkaran
        nodeElement.style.setProperty('--i', `${percentage}%`);

        // Tetapkan warna untuk lingkaran berdasarkan suhu
        let color;
        if (avgTemp > 175) {
            color = 'red'; // Warna merah untuk suhu di atas 150
        } else if (avgTemp > 135) {
            color = 'orange'; // Warna oranye untuk suhu 101-150
        } else {
            color = '#1C71F1D9'; // Warna biru sebagai default untuk suhu 100 atau kurang
        }
        nodeElement.style.setProperty('--clr', color);
    } else {
        console.error(`Element with Node ID ${nodeId} not found.`);
    }
}


// Fungsi ini dijalankan setelah data di-fetch
function fetchTemperatureData(nodeId) {
    fetch(`http://192.168.156.150:3000/readings/${nodeId}`)
        .then(response => response.json())
        .then(data => {
            if(data.avg_temp) {
                updateTemperatureDisplay(nodeId, data.avg_temp);
            }
        })
        .catch(error => console.error('Error fetching temperature data:', error));
}

// Fungsi polling untuk terus memperbarui data
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
