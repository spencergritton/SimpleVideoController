// Initialize plugin on install
chrome.runtime.onInstalled.addListener(function() {
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

// Listens for URL changes and sends them to the content script to update page
chrome.tabs.onUpdated.addListener(
    function(tabId, changeInfo, tab) {
        // read changeInfo data and do something with it
        if (changeInfo.url) {
            chrome.tabs.sendMessage( tabId, {
                message: 'url_change',
                url: changeInfo.url
            })
        }
    }
);

// Logger
chrome.runtime.onMessage.addListener(function(request) {
    if (request.type === 'console') {
        console.log(request.message)
    }
});