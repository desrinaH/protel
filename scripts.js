document.addEventListener('DOMContentLoaded', function() {
    // Tempatkan kode untuk mengupdate suhu dan warna tabung di sini
    const updateTemperature = (sectionId, temperature) => {
        const tempIndicator = document.getElementById(sectionId);
        const circle = tempIndicator.querySelector('.circle');
        // Hitung persentase berdasarkan suhu, misalnya:
        const percentage = (temperature / 100) * 100; // asumsikan suhu maks adalah 100
        circle.style.background = `conic-gradient(green ${percentage}%, #ddd 0)`;
        // Ubah teks untuk menampilkan suhu aktual
        circle.textContent = `${temperature}°C`;
    };

    const updateTankColor = (temperature) => {
        const oilTank = document.getElementById('oilTank');
        if (temperature < 50) {
            oilTank.style.backgroundColor = 'blue';
        } else {
            oilTank.style.backgroundColor = 'red';
        }
    };

    const stirrerToggle = document.getElementById('stirrer-toggle');
    stirrerToggle.addEventListener('change', function() {
        if(this.checked) {
            console.log('Pengaduk dihidupkan');
            // Tambahkan kode untuk menghidupkan pengaduk
        } else {
            console.log('Pengaduk dimatikan');
            // Tambahkan kode untuk mematikan pengaduk
        }
    });

    // Contoh pemanggilan fungsi update
    updateTemperature('section1', 70); // Misal suhu 70°C
    updateTemperature('section2', 70);
    updateTemperature('section3', 60);
    updateTankColor(70); // Misal suhu tank 70°C
});
