document.getElementById('analyzeBtn')?.addEventListener('click', async () => {
    const inputData = document.getElementById('inputData').value;
    const resultDiv = document.getElementById('result');

    if (!inputData) {
        resultDiv.innerText = "Please kuch text ya data enter karein!";
        return;
    }

    resultDiv.innerText = "Analyzing...";

    try {
        const response = await fetch('/api/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ prompt: inputData })
        });

        const data = await response.json();
        if (response.ok) {
            resultDiv.innerText = data.result;
        } else {
            resultDiv.innerText = "Error: " + (data.error || "Kuch masla ho gaya hai.");
        }
    } catch (error) {
        resultDiv.innerText = "Network Error: " + error.message;
    }
});
