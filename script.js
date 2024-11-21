const startButton = document.getElementById('start-button');
const level = document.getElementById('level');
const decibelsDisplay = document.getElementById('current-decibels');
const avgDisplay = document.getElementById('avg');
const maxDisplay = document.getElementById('max');
const environmentText = document.getElementById('environment-text');

let audioContext, analyser, microphone;
let maxValue = 0;
let running = true;

async function startMeter() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioContext = new AudioContext();
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;

        microphone = audioContext.createMediaStreamSource(stream);
        microphone.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        function updateMeter() {
            if (!running) return;

            analyser.getByteFrequencyData(dataArray);

            const sum = dataArray.reduce((a, b) => a + b, 0);
            const average = sum / dataArray.length;

            // Adjust the mapping to make it easier to reach 120 dB
            const dB = Math.min(Math.max((average / 200) * 130, 0), 130); // Increased sensitivity by lowering divisor from 256 to 200

            // Update max value
            if (dB > maxValue) maxValue = dB;

            // Determine environment
            let environment = "SIUUUUUUUUU";
            if (dB > 90) environment = "+1 point";
            if (dB > 110) environment = "+2 points";
            if (dB > 120) environment = "+3 points";

            // Update UI
            level.style.height = `${(dB / 130) * 100}%`;
            decibelsDisplay.textContent = `${Math.round(dB)} dB`;
            avgDisplay.textContent = average.toFixed(1);
            maxDisplay.textContent = maxValue.toFixed(1);
            environmentText.textContent = environment;

            requestAnimationFrame(updateMeter);
        }

        updateMeter();
    } catch (error) {
        console.error("Error accessing microphone:", error);
        alert("Please allow microphone access to use the decibel meter.");
    }
}

// Control buttons
document.getElementById("pause").addEventListener("click", () => (running = false));
document.getElementById("stop").addEventListener("click", () => location.reload());

startButton.addEventListener("click", () => {
    if (!audioContext) {
        running = true;
        startMeter();
    }
});
