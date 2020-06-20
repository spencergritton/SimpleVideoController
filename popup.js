const root = document.getElementById('root');
const increaseSpeedKey = document.getElementById('increaseSpeedKey');
const decreaseSpeedKey = document.getElementById('decreaseSpeedKey');
const toggleOverlayKey = document.getElementById('toggleOverlayKey');
const speedModifier = document.getElementById('speedModifier');
const persistentSpeed = document.getElementById('persistentSpeed');
const showOverlay = document.getElementById('showOverlay');
const keyBindingRegex = /[a-zA-Z0-9,./;'\[\]\-_=+{}:"<>?|\\]+/

// Run when popup.html loads
initializeValues();
function initializeValues() {
    chrome.storage.sync.get(['increaseSpeedKey'], function (data) {
        increaseSpeedKey.value = data.increaseSpeedKey
    });
    chrome.storage.sync.get(['decreaseSpeedKey'], function (data) {
        decreaseSpeedKey.value = data.decreaseSpeedKey
    });
    chrome.storage.sync.get(['toggleOverlayKey'], function (data) {
        toggleOverlayKey.value = data.toggleOverlayKey
    });
    chrome.storage.sync.get(['speedModifier'], function (data) {
        speedModifier.value = data.speedModifier
    });
    chrome.storage.sync.get(['persistentSpeed'], function (data) {
        persistentSpeed.checked = data.persistentSpeed
    });
    chrome.storage.sync.get(['showOverlay'], function (data) {
        showOverlay.checked = data.showOverlay
    });
}

// Listen for speed modifier changes
speedModifier.addEventListener('change', (e) => {
    const newSpeedModifier = e.target.valueAsNumber

    // Don't change if user inputs invalid speed
    if (newSpeedModifier == null || isNaN(newSpeedModifier) || newSpeedModifier == undefined) {
        chrome.storage.sync.get(['speedModifier'], function (data) {
            speedModifier.value = data.speedModifier
        })
    }
    // Change default speed if user inputs valid speed
    else {
        chrome.storage.sync.set( {'speedModifier': newSpeedModifier} );
    }
});

// Listen for persistent speed checkbox changes
persistentSpeed.addEventListener('change', (e) => {
    const newPersistentSpeed = e.target.checked
    chrome.storage.sync.set( {'persistentSpeed': newPersistentSpeed} );
    chrome.runtime.sendMessage({'type': 'refresh'});
});

// Listen for show overlay checkbox changes
showOverlay.addEventListener('change', (e) => {
    const newShowOverlay = e.target.checked
    chrome.storage.sync.set( {'showOverlay': newShowOverlay} );
});

// Listen for increase speed key changes
increaseSpeedKey.addEventListener('keydown', (e) => {
    const key = e.key.toUpperCase();
    if (key === 'TAB') { return; }
    e.preventDefault();

    if (key.length === 1 && key !== decreaseSpeedKey.value && key !== toggleOverlayKey.value && keyBindingRegex.test(key)) {
        increaseSpeedKey.value = key
        chrome.storage.sync.set( {'increaseSpeedKey': key} );
    }
});

// Listen for decrease speed key changes
decreaseSpeedKey.addEventListener('keydown', (e) => {
    const key = e.key.toUpperCase()
    if (key === 'TAB') { return; }
    e.preventDefault();
    
    if (key.length === 1 && key !== increaseSpeedKey.value && key !== toggleOverlayKey.value && keyBindingRegex.test(key)) {
        decreaseSpeedKey.value = key
        chrome.storage.sync.set( {'decreaseSpeedKey': key} );
    }
});

// Listen for toggle overlay key changes
toggleOverlayKey.addEventListener('keydown', (e) => {
    const key = e.key.toUpperCase()
    if (key === 'TAB') { return; }
    e.preventDefault();
    
    if (key.length === 1 && key !== increaseSpeedKey.value && key !== decreaseSpeedKey.value && keyBindingRegex.test(key)) {
        toggleOverlayKey.value = key
        chrome.storage.sync.set( {'toggleOverlayKey': key} );
    }
});