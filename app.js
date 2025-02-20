const conversionRates = {
    length: { cm: 0.393701, inch: 2.54 },
    weight: { kg: 2.20462, lb: 0.453592 },
    temperature: {
        celsius: (f) => (f - 32) * 5/9,
        fahrenheit: (c) => (c * 9/5) + 32
    },
    area: { sqm: 10.7639, sqft: 0.092903 },
    volume: { liter: 0.264172, gallon: 3.78541 },
    speed: { kmh: 0.621371, mph: 1.60934 },
    time: { hours: 60, minutes: 1/60 },
    pressure: { bar: 14.5038, psi: 0.0689476 },
    energy: { joule: 0.239006, calorie: 4.184 },
    digital: { mb: 0.001, gb: 1000 },
    fuel: {
        lp100: (mpg) => 235.215 / mpg,
        mpg: (lp100) => 235.215 / lp100
    },
    currency: { usd: 0.85, eur: 1.18 } // Note: Currency rates should be updated regularly
};

let currentCategory = 'length';
let isDarkMode = false;
let isSoundEnabled = true;

const inputs = {
    length: { cm: document.getElementById('cm'), inch: document.getElementById('inch') },
    weight: { kg: document.getElementById('kg'), lb: document.getElementById('lb') },
    temperature: { celsius: document.getElementById('celsius'), fahrenheit: document.getElementById('fahrenheit') },
    area: { sqm: document.getElementById('sqm'), sqft: document.getElementById('sqft') },
    volume: { liter: document.getElementById('liter'), gallon: document.getElementById('gallon') },
    speed: { kmh: document.getElementById('kmh'), mph: document.getElementById('mph') },
    time: { hours: document.getElementById('hours'), minutes: document.getElementById('minutes') },
    pressure: { bar: document.getElementById('bar'), psi: document.getElementById('psi') },
    energy: { joule: document.getElementById('joule'), calorie: document.getElementById('calorie') },
    digital: { mb: document.getElementById('mb'), gb: document.getElementById('gb') },
    fuel: { lp100: document.getElementById('lp100'), mpg: document.getElementById('mpg') },
    currency: { usd: document.getElementById('usd'), eur: document.getElementById('eur') }
};

// Event Listeners
document.querySelectorAll('.tab').forEach(tab => tab.addEventListener('click', switchCategory));
document.querySelectorAll('input').forEach(input => input.addEventListener('input', handleConversion));
document.querySelectorAll('.swap-btn').forEach(btn => btn.addEventListener('click', swapUnits));
document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
document.querySelector('.close').addEventListener('click', closeModal);

function switchCategory(e) {
    currentCategory = e.target.dataset.category;
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    e.target.classList.add('active');
    document.querySelectorAll('.conversion-section').forEach(section => {
        section.classList.toggle('active', section.dataset.category === currentCategory);
    });
    playSound('tab');
}

function handleConversion(e) {
    const inputId = e.target.id;
    const category = currentCategory;
    const value = parseFloat(e.target.value);
    
    if (isNaN(value)) {
        clearOtherInputs(inputId);
        return;
    }

    if (category === 'temperature') {
        handleTemperatureConversion(inputId, value);
    } else if (category === 'fuel') {
        handleFuelConversion(inputId, value);
    } else {
        handleStandardConversion(inputId, value, category);
    }
}

function handleStandardConversion(inputId, value, category) {
    const [fromUnit, toUnit] = inputId === Object.keys(inputs[category])[0] ? 
        [Object.keys(inputs[category])[0], Object.keys(inputs[category])[1]] : 
        [Object.keys(inputs[category])[1], Object.keys(inputs[category])[0]];
    
    const convertedValue = inputId === fromUnit ? 
        value * conversionRates[category][fromUnit] : 
        value / conversionRates[category][toUnit];
    
    inputs[category][toUnit].value = convertedValue.toFixed(2);
    playSound('convert');
}

function handleTemperatureConversion(inputId, value) {
    const isCelsius = inputId === 'celsius';
    const convertedValue = isCelsius ? 
        conversionRates.temperature.fahrenheit(value) : 
        conversionRates.temperature.celsius(value);
    
    inputs.temperature[isCelsius ? 'fahrenheit' : 'celsius'].value = convertedValue.toFixed(1);
    playSound('convert');
}

function handleFuelConversion(inputId, value) {
    const isMPG = inputId === 'mpg';
    const convertedValue = isMPG ? 
        conversionRates.fuel.lp100(value) : 
        conversionRates.fuel.mpg(value);
    
    inputs.fuel[isMPG ? 'lp100' : 'mpg'].value = convertedValue.toFixed(2);
    playSound('convert');
}

function swapUnits() {
    const categoryInputs = inputs[currentCategory];
    const [unit1, unit2] = Object.keys(categoryInputs);
    [categoryInputs[unit1].value, categoryInputs[unit2].value] = 
        [categoryInputs[unit2].value, categoryInputs[unit1].value];
    playSound('swap');
}

function clearOtherInputs(activeInputId) {
    Object.values(inputs[currentCategory]).forEach(input => {
        if (input.id !== activeInputId) input.value = '';
    });
}

function toggleTheme() {
    isDarkMode = !isDarkMode;
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    document.getElementById('theme-toggle').textContent = isDarkMode ? '☀️' : '🌙';
    playSound('toggle');
}

function playSound(type) {
    if (!isSoundEnabled) return;
    
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    let frequency = 440;
    switch(type) {
        case 'convert':
            frequency = 523.25;
            break;
        case 'swap':
            frequency = 659.25;
            break;
        case 'tab':
            frequency = 784;
            break;
        case 'toggle':
            frequency = 392;
            break;
    }
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.3);
}

function showModal(title, message) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-text').textContent = message;
    document.querySelector('.modal').style.display = 'flex';
}

function closeModal() {
    document.querySelector('.modal').style.display = 'none';
}