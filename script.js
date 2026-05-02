// Model dosyalarınızın bulunduğu klasör yolu. 
// "model.json", "metadata.json" ve "weights.bin" bu klasörde olmalı.
const URL = "./"; 

let model, webcam, maxPredictions;
let isScanning = false;

// Sayfa Elemanları
const welcomeScreen = document.getElementById('welcome-screen');
const cameraScreen = document.getElementById('camera-screen');
const successScreen = document.getElementById('success-screen');
const resultPanel = document.getElementById('result-panel');
const statusLabel = document.getElementById('status-label');

// SİSTEMİ BAŞLAT
async function init() {
    try {
        statusLabel.innerText = "Yapay Zeka Yükleniyor...";
        
        // Modeli yükle
        model = await tmImage.load(URL + "model.json", URL + "metadata.json");
        maxPredictions = model.getTotalClasses();

        // Kamera Ayarları (Arka Kamera)
        const flip = false; 
        webcam = new tmImage.Webcam(350, 350, flip); 
        
        await webcam.setup({ facingMode: "environment" }); 
        await webcam.play();
        
        document.getElementById("webcam-container").innerHTML = ""; // Temizle
        document.getElementById("webcam-container").appendChild(webcam.canvas);
        
        isScanning = true;
        statusLabel.innerText = "Atık Aranıyor...";
        window.requestAnimationFrame(loop);
    } catch (err) {
        console.error(err);
        alert("Kamera başlatılamadı! Lütfen HTTPS kullandığınızdan ve izin verdiğinizden emin olun.");
    }
}

async function loop() {
    if (isScanning) {
        webcam.update(); 
        await predict();
        window.requestAnimationFrame(loop);
    }
}

async function predict() {
    const prediction = await model.predict(webcam.canvas);
    
    for (let i = 0; i < maxPredictions; i++) {
        // %90 üzerinde eşleşme varsa dur ve göster
        if (prediction[i].probability > 0.90) {
            isScanning = false;
            showResult(prediction[i].className);
            break;
        }
    }
}

function showResult(type) {
    const nameEl = document.getElementById('waste-name');
    const instrEl = document.getElementById('waste-instruction');
    const emojiEl = document.getElementById('waste-emoji');
    const panel = document.querySelector('.result-card');
    
    statusLabel.classList.add('hidden');
    resultPanel.classList.remove('hidden');

    // Türlere Göre Dinamik İçerik
    if (type === "Plastik") {
        emojiEl.innerText = "🥤";
        nameEl.innerText = "BU BİR PLASTİK!";
        panel.style.borderTopColor = "#fbbf24"; // Sarı
        instrEl.innerText = "Lütfen SARI renkli plastik atık kutusuna atın.";
    } else if (type === "Karton" || type === "Kağıt") {
        emojiEl.innerText = "📦";
        nameEl.innerText = "BU BİR KARTON!";
        panel.style.borderTopColor = "#3b82f6"; // Mavi
        instrEl.innerText = "Lütfen MAVİ renkli kağıt atık kutusuna atın.";
    } else if (type === "Cam") {
        emojiEl.innerText = "🍾";
        nameEl.innerText = "BU BİR CAM!";
        panel.style.borderTopColor = "#10b981"; // Yeşil
        instrEl.innerText = "Lütfen YEŞİL renkli cam atık kutusuna atın.";
    } else {
        emojiEl.innerText = "♻️";
        nameEl.innerText = type.toUpperCase();
        panel.style.borderTopColor = "#22c55e";
        instrEl.innerText = "Uygun geri dönüşüm kutusuna bırakın.";
    }
}

// ETKİLEŞİMLER
document.getElementById('start-btn').addEventListener('click', () => {
    welcomeScreen.classList.add('hidden');
    cameraScreen.classList.remove('hidden');
    init();
});

document.getElementById('retry-btn').addEventListener('click', () => {
    resultPanel.classList.add('hidden');
    statusLabel.classList.remove('hidden');
    isScanning = true;
    window.requestAnimationFrame(loop);
});

document.getElementById('confirm-btn').addEventListener('click', () => {
    if(webcam) webcam.stop();
    cameraScreen.classList.add('hidden');
    successScreen.classList.remove('hidden');
});

document.getElementById('restart-btn').addEventListener('click', () => {
    successScreen.classList.add('hidden');
    welcomeScreen.classList.remove('hidden');
    resultPanel.classList.add('hidden');
});