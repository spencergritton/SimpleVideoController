const root = document.getElementById('root');
const increaseSpeedKey = document.getElementById('increaseSpeedKey');
const decreaseSpeedKey = document.getElementById('decreaseSpeedKey');
const toggleOverlayKey = document.getElementById('toggleOverlayKey');
const speedModifier = document.getElementById('speedModifier');
const persistentSpeed = document.getElementById('persistentSpeed');
const showOverlay = document.getElementById('showOverlay');
const keyBindingRegex = /[a-zA-Z0-9,./;'\[\]\-_=+{}:"<>?|\\]+/

initializeValues();

// Grabs values from storage to display on the popup controller
function initializeValues() {
    browser.storage.local.get(['increaseSpeedKey'], function (data) {
        increaseSpeedKey.value = data.increaseSpeedKey
    });
    browser.storage.local.get(['decreaseSpeedKey'], function (data) {
        decreaseSpeedKey.value = data.decreaseSpeedKey
    });
    browser.storage.local.get(['toggleOverlayKey'], function (data) {
        toggleOverlayKey.value = data.toggleOverlayKey
    });
    browser.storage.local.get(['speedModifier'], function (data) {
        speedModifier.value = data.speedModifier
    });
    browser.storage.local.get(['persistentSpeed'], function (data) {
        persistentSpeed.checked = data.persistentSpeed
    });
    browser.storage.local.get(['showOverlay'], function (data) {
        showOverlay.checked = data.showOverlay
    });
}

// Listen for speed modifier changes
speedModifier.addEventListener('change', (e) => {
    const newSpeedModifier = e.target.valueAsNumber

    // Don't change if user inputs invalid speed
    if (newSpeedModifier == null || isNaN(newSpeedModifier) || newSpeedModifier == undefined) {
        browser.storage.local.get(['speedModifier'], function (data) {
            speedModifier.value = data.speedModifier
        })
    }
    // Change default speed if user inputs valid speed
    else {
        browser.storage.local.set( {'speedModifier': newSpeedModifier} );
    }
});

// Listen for persistent speed checkbox changes
persistentSpeed.addEventListener('change', (e) => {
    const newPersistentSpeed = e.target.checked
    browser.storage.local.set( {'persistentSpeed': newPersistentSpeed} );
    browser.runtime.sendMessage({'type': 'refresh'});
});

// Listen for show overlay checkbox changes
showOverlay.addEventListener('change', (e) => {
    const newShowOverlay = e.target.checked
    browser.storage.local.set( {'showOverlay': newShowOverlay} );
});

// Listen for increase speed key changes
increaseSpeedKey.addEventListener('keydown', (e) => {
    const key = e.key.toUpperCase();
    if (key === 'TAB') { return; }
    e.preventDefault();

    if (key.length === 1 && key !== decreaseSpeedKey.value && key !== toggleOverlayKey.value && keyBindingRegex.test(key)) {
        increaseSpeedKey.value = key
        browser.storage.local.set( {'increaseSpeedKey': key} );
    }
});

// Listen for decrease speed key changes
decreaseSpeedKey.addEventListener('keydown', (e) => {
    const key = e.key.toUpperCase()
    if (key === 'TAB') { return; }
    e.preventDefault();
    
    if (key.length === 1 && key !== increaseSpeedKey.value && key !== toggleOverlayKey.value && keyBindingRegex.test(key)) {
        decreaseSpeedKey.value = key
        browser.storage.local.set( {'decreaseSpeedKey': key} );
    }
});

// Listen for toggle overlay key changes
toggleOverlayKey.addEventListener('keydown', (e) => {
    const key = e.key.toUpperCase()
    if (key === 'TAB') { return; }
    e.preventDefault();
    
    if (key.length === 1 && key !== increaseSpeedKey.value && key !== decreaseSpeedKey.value && keyBindingRegex.test(key)) {
        toggleOverlayKey.value = key
        browser.storage.local.set( {'toggleOverlayKey': key} );
    }
});