// Initialize plugin on install
chrome.runtime.onInstalled.addListener(function () {
	console.log('Installed plugin');
	chrome.storage.sync.set({
		increaseSpeedKey: 'D',
		decreaseSpeedKey: 'S',
		toggleOverlayKey: 'Q',
		speedModifier: 0.1,
		persistentCurrentSpeed: 1.0,
		persistentSpeed: true,
		showOverlay: true,
		logLevel: 1,
	});
});

// Listens for updates on SPA's and executes content script when update occurs
chrome.webNavigation.onHistoryStateUpdated.addListener(
	debounce(function () {
		chrome.tabs.executeScript(null, { file: 'content.js' });
	}, 250)
);

// Listen for messages from content script
chrome.runtime.onMessage.addListener(function (request) {
	if (request.type === 'console') {
		console.log(request.message);
	}

	// Listen for request to refresh current page
	else if (request.type === 'refresh') {
		chrome.tabs.query(
			{ active: true, currentWindow: true },
			function (arrayOfTabs) {
				var code = 'window.location.reload();';
				chrome.tabs.executeScript(arrayOfTabs[0].id, { code: code });
			}
		);
	}
});

// Debounce waits a given time period to call a function if it is called many times
function debounce(func, wait, immediate) {
	var timeout;

	return function executedFunction() {
		var context = this;
		var args = arguments;

		var later = function () {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};

		var callNow = immediate && !timeout;

		clearTimeout(timeout);

		timeout = setTimeout(later, wait);

		if (callNow) func.apply(context, args);
	};
}

// Listens for URL changes on SPA's (before they change DOM)
// If url change send message to content script telling it to clear event listeners
// before page update
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
	if (changeInfo.url) {
		chrome.tabs.sendMessage(tabId, {
			message: 'url_change',
		});
	}
});
