// Teachable Machine model bağlantınız (Modelinizi export edip URL'yi buraya yapıştırın)
// Eğer dosyalar Drive'daysa, model.json, metadata.json ve weights.bin aynı klasörde olmalı
const URL = "./"; 

let model, webcam, labelContainer, maxPredictions;

// Ekran Kontrolleri
const welcomeScreen = document.getElementById('welcome-screen');
const cameraScreen = document.getElementById('camera-screen');
const successScreen = document.getElementById('success-screen');
const resultPopup = document.getElementById('result-popup');



async function init() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    // ARKA KAMERA AYARLARI
    // Flip: false yapıyoruz çünkü arka kamera ayna görüntüsü gerektirmez.
    const flip = false; 
    
    // Mobil uyumlu genişlik/yükseklik
    const width = window.innerWidth * 0.9;
    const height = window.innerWidth * 0.9;

    webcam = new tmImage.Webcam(width, height, flip); 

    // .setup() içine 'facingMode: "environment"' ekleyerek arka kamerayı zorluyoruz
    try {
        await webcam.setup({ facingMode: "environment" }); 
        await webcam.play();
        window.requestAnimationFrame(loop);
        document.getElementById("webcam-container").appendChild(webcam.canvas);
    } catch (err) {
        console.error("Kamera başlatılamadı: ", err);
        alert("Kamera izni verilmeli veya cihazda arka kamera bulunamadı.");
    }
}



async function loop() {
    webcam.update(); 
    await predict();
    window.requestAnimationFrame(loop);
}

let isPopupActive = false; // Pop-up'ın açık olup olmadığını takip eder

async function predict() {
    if (isPopupActive) return; // Pop-up açıksa yeni tahmin yapma

    const prediction = await model.predict(webcam.canvas);
    
    for (let i = 0; i < maxPredictions; i++) {
        if (prediction[i].probability > 0.85) {
            isPopupActive = true; // Tahmin başarılı, kilidi aktifleştir
            showPopup(prediction[i].className);
        }
    }
}

function showPopup(wasteType) {
    document.getElementById('waste-name').innerText = "Bu bir " + wasteType + "!";
    
    // Türlere göre yönlendirme
    let instruction = "Uygun kutuya atın.";
    if(wasteType === "Plastik") instruction = "Sarı kutuya atılmalı.";
    else if(wasteType === "Karton") instruction = "Mavi kutuya atılmalı.";
    
    document.getElementById('waste-instruction').innerText = instruction;
    resultPopup.classList.remove('hidden');
}

// Butona tıklandığında pop-up'ı kapat ve yeni tarama için kilidi kaldır
document.getElementById('action-btn').addEventListener('click', () => {
    resultPopup.classList.add('hidden');
    isPopupActive = false; // Yeni taramalara izin ver
    
    // Opsiyonel: Direkt tebrik ekranına geçmek yerine taramaya devam edebilirsin
    // successScreen.classList.remove('hidden'); // Eğer bu satırı silersen sürekli tarama yapabilir
});

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