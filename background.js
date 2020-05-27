chrome.runtime.onInstalled.addListener(function() {
    // Initialize plugin on install
    console.log("Installed plugin")
    chrome.storage.sync.set(
        {
            'increaseSpeedKey': 'D',
            'decreaseSpeedKey': 'S',
            'toggleOverlayKey': 'Q',
            'speedModifier': 0.2,
            'persistentCurrentSpeed': 1.0,
            'persistentSpeed': true,
            'showOverlay': true
        }
    );
});

chrome.runtime.onMessage.addListener(function(request) {
    if (request.type === 'console') {
        console.log(request.message)
    }
});