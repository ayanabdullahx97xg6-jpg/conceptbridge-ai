// Global variables for Teachable Machine model
let model = null;

// Load impact stats from LocalStorage (Feature 04: Impact Dashboard)
let stats = JSON.parse(localStorage.getItem('ecoStats')) || { total: 0, sorted: 0 };

// 1. Connect Teachable Machine Model
document.getElementById('connectBtn')?.addEventListener('click', async () => {
    const modelUrlInput = document.getElementById('modelUrl').value.trim();
    const modelStatus = document.getElementById('modelStatus');

    if (!modelUrlInput) {
        modelStatus.style.color = '#d32f2f';
        modelStatus.innerText = "Please model URL enter karein!";
        return;
    }

    let fullModelUrl = modelUrlInput;
    if (!fullModelUrl.endsWith('/')) {
        fullModelUrl += '/';
    }
    const modelJSON = fullModelUrl + 'model.json';
    const metadataJSON = fullModelUrl + 'metadata.json';

    modelStatus.style.color = '#f57c00';
    modelStatus.innerText = "Connecting to AI model...";

    try {
        model = await window.tmImage.load(modelJSON, metadataJSON);
        modelStatus.style.color = '#2e7d32';
        modelStatus.innerText = "AI model connected successfully!";
    } catch (error) {
        modelStatus.style.color = '#d32f2f';
        modelStatus.innerText = "Connection Failed! URL check karein.";
        console.error(error);
    }
});

// Image Preview logic
document.getElementById('imageInput')?.addEventListener('change', (event) => {
    const file = event.target.files[0];
    const previewContainer = document.getElementById('imagePreviewContainer');
    previewContainer.innerHTML = '';

    if (file) {
        const img = document.createElement('img');
        img.src = URL.createObjectURL(file);
        previewContainer.appendChild(img);
    }
});

// Disposal Guidance Dictionary (Feature 05: English & Roman Urdu Guidance)
const disposalGuide = {
    "Plastic": "<b>English:</b> Clean and dry the plastic item. Place it in the blue recycling bin.<br><b>Roman Urdu:</b> Plastic ko saaf aur khushk karein aur isko recycling bin mein dein.",
    "Paper": "<b>English:</b> Keep paper dry and flatten it before putting it in the recycling bin.<br><b>Roman Urdu:</b> Paper ko khushk rakhein aur fold karke recycling bin mein daalein.",
    "Metal": "<b>English:</b> Rinse metal cans and place them in the metal recycling container.<br><b>Roman Urdu:</b> Metal cans ko dho kar recycling container mein daalein.",
    "Glass": "<b>English:</b> Handle with care, rinse, and place in glass recycling.<br><b>Roman Urdu:</b> Glass ko dhokar ahtiyat se glass recycling mein daalein.",
    "Organic": "<b>English:</b> Compost this item in an organic waste bin.<br><b>Roman Urdu:</b> Yeh organic waste hai, isko compost bin mein daalein."
};

// 2. Analyze Image and Get Guidance
document.getElementById('analyzeBtn')?.addEventListener('click', async () => {
    const fileInput = document.getElementById('imageInput');
    const resultDiv = document.getElementById('result');

    if (!fileInput.files || fileInput.files.length === 0) {
        resultDiv.innerHTML = "Pehle koi image select karein!";
        return;
    }

    if (!model) {
        resultDiv.innerHTML = "Pehle upar apna AI Model connect karein!";
        return;
    }

    resultDiv.innerHTML = "Analyzing image...";

    try {
        const imgElement = document.createElement('img');
        imgElement.src = URL.createObjectURL(fileInput.files[0]);

        imgElement.onload = async () => {
            const predictions = await model.predict(imgElement);
            predictions.sort((a, b) => b.probability - a.probability);
            const bestMatch = predictions[0];

            const materialName = bestMatch.className;
            const confidence = (bestMatch.probability * 100).toFixed(2);

            // Feature 02: Smart Confidence Check (agar confidence 60% se kam ho)
            if (confidence < 60) {
                resultDiv.innerHTML = `<b>Detected:</b> ${materialName} (${confidence}%)<br><br><span style="color: #d32f2f;"><b>Smart Confidence Notice:</b> Prediction uncertain hai! Behtar result ke liye saaf tasveer upload karein.</span>`;
                return;
            }

            // Get disposal guide
            let guide = disposalGuide[materialName] || `<b>English:</b> Dispose of this item responsibly according to local rules.<br><b>Roman Urdu:</b> Is material ko local rules ke mutabiq dispose karein.`;

            resultDiv.innerHTML = `<b>Detected Material:</b> ${materialName} (${confidence}%)<br><br><b>Responsible Disposal:</b><br>${guide}`;

            // Update Impact Dashboard stats
            stats.total += 1;
            stats.sorted += 1;
            localStorage.setItem('ecoStats', JSON.stringify(stats));
        };
    } catch (error) {
        resultDiv.innerHTML = "Analysis Error: " + error.message;
    }
});
