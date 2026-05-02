const URL = "./"; 
let model, webcam, maxPredictions;
let isAnalysing = false;

// Elementler
const welcome = document.getElementById('welcome-screen');
const cameraS = document.getElementById('camera-screen');
const success = document.getElementById('success-screen');
const overlay = document.getElementById('overlay-panel');

async function startSystem() {
    model = await tmImage.load(URL + "model.json", URL + "metadata.json");
    maxPredictions = model.getTotalClasses();

    webcam = new tmImage.Webcam(window.innerWidth, window.innerHeight, false);
    await webcam.setup({ facingMode: "environment" });
    await webcam.play();

    document.getElementById("webcam-container").appendChild(webcam.canvas);
    isAnalysing = true;
    window.requestAnimationFrame(updateFrame);
}

async function updateFrame() {
    if (isAnalysing) {
        webcam.update();
        await scan();
        window.requestAnimationFrame(updateFrame);
    }
}

async function scan() {
    const prediction = await model.predict(webcam.canvas);
    
    for (let i = 0; i < maxPredictions; i++) {
        // %60'ın üzerinde bir eşleşme bulana kadar sessizce çalışır
        if (prediction[i].probability > 0.60) {
            isAnalysing = false; // Taramayı durdur ve paneli göster
            displayMatch(prediction[i].className);
            break;
        }
    }
}

function displayMatch(name) {
    const nameText = document.getElementById('waste-name');
    const icon = document.getElementById('waste-icon');
    
    nameText.innerText = name.toUpperCase();
    
    // Türlere göre hızlı ikon atama
    if(name.includes("Plastik")) icon.innerText = "🥤";
    else if(name.includes("Karton") || name.includes("Kağıt")) icon.innerText = "📦";
    else if(name.includes("Cam")) icon.innerText = "🍾";
    else icon.innerText = "♻️";

    overlay.classList.remove('hidden');
}

// Buton Etkileşimleri
document.getElementById('start-btn').addEventListener('click', () => {
    welcome.classList.add('hidden');
    cameraS.classList.remove('hidden');
    startSystem();
});

document.getElementById('retry-btn').addEventListener('click', () => {
    overlay.classList.add('hidden');
    isAnalysing = true;
    window.requestAnimationFrame(updateFrame);
});

document.getElementById('confirm-btn').addEventListener('click', () => {
    webcam.stop();
    cameraS.classList.add('hidden');
    success.classList.remove('hidden');
});

document.getElementById('restart-btn').addEventListener('click', () => {
    success.classList.add('hidden');
    welcome.classList.remove('hidden');
    overlay.classList.add('hidden');
});