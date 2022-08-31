// Initialize plugin on install
browser.runtime.onInstalled.addListener(function () {
	console.log('Installed plugin');
	browser.storage.local.set({
		increaseSpeedKey: 'D',
		decreaseSpeedKey: 'S',
		toggleOverlayKey: 'Q',
		speedModifier: 0.1,
		persistentCurrentSpeed: 1.0,
		persistentSpeed: true,
		showOverlay: true,
		logLevel: 0,
	});
});

// Listens for updates on SPA's and executes content script when update occurs
browser.webNavigation.onHistoryStateUpdated.addListener(
	debounce(function () {
		browser.tabs.executeScript(null, { file: 'content.js' });
	}, 250)
);

// Listen for messages from content script
browser.runtime.onMessage.addListener(function (request) {
	// Logger
	if (request.type === 'console') {
		console.log(request.message);
	}
	// Listen for request to refresh current page
	else if (request.type === 'refresh') {
		browser.tabs.query(
			{ active: true, currentWindow: true },
			function (arrayOfTabs) {
				var code = 'window.location.reload();';
				browser.tabs.executeScript(arrayOfTabs[0].id, { code: code });
			}
		);
	}
});

// Debounce helper
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
browser.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
	if (changeInfo.url) {
		browser.tabs.sendMessage(tabId, {
			message: 'url_change',
		});
	}
});
