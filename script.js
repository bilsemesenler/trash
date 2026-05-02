const URL = "./"; // model.json, metadata.json ve weights.bin bu dizinde olmalı

let model, webcam, maxPredictions;

const welcomeScreen = document.getElementById('welcome-screen');
const cameraScreen = document.getElementById('camera-screen');
const successScreen = document.getElementById('success-screen');

// SİSTEMİ BAŞLAT
async function init() {
    try {
        const modelURL = URL + "model.json";
        const metadataURL = URL + "metadata.json";

        model = await tmImage.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();

        const flip = false; // Arka kamera için false
        const width = window.innerWidth * 0.9;
        const height = window.innerWidth * 0.9;

        webcam = new tmImage.Webcam(width, height, flip); 
        
        await webcam.setup({ facingMode: "environment" }); // Arka kamera zorlaması
        await webcam.play();
        
        window.requestAnimationFrame(loop);
        
        const container = document.getElementById("webcam-container");
        container.innerHTML = ""; // Varsa temizle
        container.appendChild(webcam.canvas);

        document.getElementById('waste-name').innerText = "Atık Aranıyor...";
        document.getElementById('waste-instruction').innerText = "Lütfen atığı kameraya gösterin.";
    } catch (err) {
        console.error(err);
        alert("Kamera veya Model yüklenemedi. Lütfen HTTPS bağlantısını ve izinleri kontrol edin.");
    }
}

async function loop() {
    webcam.update(); 
    await predict();
    window.requestAnimationFrame(loop);
}

async function predict() {
    if (!model) return;
    const prediction = await model.predict(webcam.canvas);
    
    let highestPred = { className: "", probability: 0 };
    for (let i = 0; i < maxPredictions; i++) {
        if (prediction[i].probability > highestPred.probability) {
            highestPred = prediction[i];
        }
    }
    updateUI(highestPred);
}

function updateUI(pred) {
    const nameEl = document.getElementById('waste-name');
    const instrEl = document.getElementById('waste-instruction');
    const panel = document.getElementById('status-panel');
    const btn = document.getElementById('confirm-btn');

    if (pred.probability > 0.85) {
        nameEl.innerText = pred.className;
        btn.classList.remove('hidden');
        panel.className = ""; // Eski sınıfları temizle

        if (pred.className === "Plastik") {
            panel.classList.add('status-plastik');
            instrEl.innerText = "Sarı atık kutusuna bırakabilirsiniz.";
        } else if (pred.className === "Karton") {
            panel.classList.add('status-karton');
            instrEl.innerText = "Mavi atık kutusuna bırakabilirsiniz.";
        } else if (pred.className === "Cam") {
            panel.classList.add('status-cam');
            instrEl.innerText = "Yeşil atık kutusuna bırakabilirsiniz.";
        }
    } else {
        nameEl.innerText = "Atık Aranıyor...";
        instrEl.innerText = "Lütfen atığı net bir şekilde gösterin.";
        panel.className = ""; 
        btn.classList.add('hidden');
    }
}

// BUTON OLAYLARI (Tek seferde tanımlandı)
document.getElementById('start-btn').addEventListener('click', async () => {
    welcomeScreen.classList.add('hidden');
    cameraScreen.classList.remove('hidden');
    await init();
});

document.getElementById('confirm-btn').addEventListener('click', () => {
    if (webcam) webcam.stop();
    cameraScreen.classList.add('hidden');
    successScreen.classList.remove('hidden');
});

document.getElementById('restart-btn').addEventListener('click', () => {
    successScreen.classList.add('hidden');
    welcomeScreen.classList.remove('hidden');
});