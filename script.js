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

// ... (Model yükleme ve init fonksiyonları aynı)

async function predict() {
    const prediction = await model.predict(webcam.canvas);
    
    // En yüksek olasılığa sahip tahmini bul
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

    // Eğer güven oranı %85 üzerindeyse içeriği güncelle
    if (pred.probability > 0.85) {
        nameEl.innerText = pred.className;
        btn.classList.remove('hidden');
        
        // Sınıfa göre renk ve talimat değiştir
        panel.className = ""; // Temizle
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
        // Belirsiz durum (Ekranda net bir şey yoksa)
        nameEl.innerText = "Atık Aranıyor...";
        instrEl.innerText = "Lütfen atığı net bir şekilde gösterin.";
        panel.className = ""; 
        btn.classList.add('hidden');
    }
}

// "Kutuya Attım" butonu ile tebrik ekranına geçiş
document.getElementById('confirm-btn').addEventListener('click', () => {
    webcam.stop();
    cameraScreen.classList.add('hidden');
    successScreen.classList.remove('hidden');
});

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