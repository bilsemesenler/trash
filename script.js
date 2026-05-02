// Teachable Machine model bağlantınız (Modelinizi export edip URL'yi buraya yapıştırın)
// Eğer dosyalar Drive'daysa, model.json, metadata.json ve weights.bin aynı klasörde olmalı
const URL = "./"; 

let model, webcam, labelContainer, maxPredictions;

// Ekran Kontrolleri
const welcomeScreen = document.getElementById('welcome-screen');
const cameraScreen = document.getElementById('camera-screen');
const successScreen = document.getElementById('success-screen');
const resultPopup = document.getElementById('result-popup');

// Modeli Yükle
async function init() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    // Kamera Ayarları
    const flip = true; 
    webcam = new tmImage.Webcam(window.innerWidth * 0.9, window.innerWidth * 0.9, flip); 
    await webcam.setup(); 
    await webcam.play();
    window.requestAnimationFrame(loop);

    document.getElementById("webcam-container").appendChild(webcam.canvas);
}

async function loop() {
    webcam.update(); 
    await predict();
    window.requestAnimationFrame(loop);
}

async function predict() {
    const prediction = await model.predict(webcam.canvas);
    
    for (let i = 0; i < maxPredictions; i++) {
        // Eğer bir atık türü %90 güvenle tanınırsa pop-up aç
        if (prediction[i].probability > 0.90) {
            showPopup(prediction[i].className);
        }
    }
}

function showPopup(wasteType) {
    // Kamerayı durdurma veya döngüyü askıya alma opsiyoneldir
    document.getElementById('waste-name').innerText = "Bu bir " + wasteType + "!";
    
    // Basit yönlendirme mantığı
    let instruction = "";
    if(wasteType === "Plastik") instruction = "Lütfen Sarı Renkli Geri Dönüşüm Kutusuna atın.";
    else if(wasteType === "Kağıt") instruction = "Lütfen Mavi Renkli Geri Dönüşüm Kutusuna atın.";
    else if(wasteType === "Cam") instruction = "Lütfen Yeşil Renkli Geri Dönüşüm Kutusuna atın.";
    else instruction = "Lütfen uygun atık kutusuna bırakın.";

    document.getElementById('waste-instruction').innerText = instruction;
    resultPopup.classList.remove('hidden');
}

// Buton Etkinlikleri
document.getElementById('start-btn').addEventListener('click', async () => {
    welcomeScreen.classList.add('hidden');
    cameraScreen.classList.remove('hidden');
    await init();
});

document.getElementById('action-btn').addEventListener('click', () => {
    resultPopup.classList.add('hidden');
    cameraScreen.classList.add('hidden');
    successScreen.classList.remove('hidden');
    webcam.stop(); // Pil tasarrufu için kamerayı kapat
});

document.getElementById('restart-btn').addEventListener('click', () => {
    successScreen.classList.add('hidden');
    welcomeScreen.classList.remove('hidden');
});