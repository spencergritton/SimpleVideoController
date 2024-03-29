// Settings stores plugin storage so calls are not async to get needed info
var settings = {};
var videos = undefined;

// Runs before page change on SPA's with persistent speed to remove event
// listeners from DOM
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	if (request.message === 'url_change') {
		if (settings.persistentSpeed) {
			removeOverlaysAndListeners();
		}
	}
});

runContentScript(); // Run on page load

// Main function that runs the content script. This is called either when a new URL is
// detected inside the current website or if the user navigates to a new website entirely
// Unsure why these are distinct events.. (further research needed)
function runContentScript() {
	videos = document.getElementsByTagName('video');

	// Set settings object to chrome storage
	chrome.storage.sync.get(null, function (items) {
		settings = items;

		// Initialize speedometer
		initializeOverlay();

		// If persistent speed, set all videos on page to persistent speed
		// Timeout set because on SPA updates youtube will set videos back to their default rate
		// There is definitely a better way to do this...
		setTimeout(() => {
			if (settings.persistentSpeed) {
				for (const video of videos) {
					video.playbackRate = settings.persistentCurrentSpeed;
				}
			}
		}, 1000);

		// Add event listeners for keydowns to trigger plugin functionality
		var doc = Array(document)[0];

		doc.removeEventListener('keydown', keypress);
		doc.addEventListener('keydown', keypress, false);
	});
}

// Creates the speed overlay in the top left side of the video player
function initializeOverlay() {
	const svcDivs = document.getElementsByClassName('svc-div');
	if (svcDivs.length > 0) {
		// If there are already svcDivs (like on a URL change on youtube)
		// Delete them all then add them back fresh
		removeOverlaysAndListeners();
	}

	// Create overlay for each video on the page
	for (const video of videos) {
		// Create overlay div
		let svcDiv = document.createElement('DIV');
		svcDiv.className = 'svc-div';
		svcDiv.style.position = 'absolute';
		svcDiv.style.top = '8px';
		svcDiv.style.left = '8px';
		svcDiv.style.zIndex = 1;
		svcDiv.style.backgroundColor = 'black';
		svcDiv.style.opacity = 0.5;
		svcDiv.style.borderRadius = '2px';

		// Create text inside overlay
		let text = document.createElement('P');

		if (settings.persistentSpeed) {
			text.innerText = '' + settings.persistentCurrentSpeed.toFixed(2);
		} else {
			text.innerText = video.playbackRate.toFixed(2);
		}
		text.className = 'svc-p';
		text.style.position = 'relative';
		text.style.color = 'white';
		text.style.marginBottom = '2px';
		text.style.marginTop = '2px';
		text.style.marginLeft = '5px';
		text.style.marginRight = '5px';

		// Append text to overlay and overlay to DOM
		svcDiv.appendChild(text);
		if (!settings.showOverlay) {
			svcDiv.style.display = 'none';
		}
		video.parentNode.insertAdjacentElement('afterbegin', svcDiv);
	}
}

// Function called when key is pressed to attempt to call hotkey/shortcut
function keypress(event) {
	log(event);
	let key = event.key.toUpperCase();

	// Ignore key press if modified
	if (
		!event.getModifierState ||
		event.getModifierState('Alt') ||
		event.getModifierState('Control') ||
		event.getModifierState('Fn') ||
		event.getModifierState('Meta') ||
		event.getModifierState('Hyper') ||
		event.getModifierState('OS')
	) {
		log('Keydown event ignored due to active modifier');
		return;
	}

	// Ignore key press if user is typing in a field
	if (
		event.target.nodeName === 'INPUT' ||
		event.target.nodeName === 'TEXTAREA' ||
		event.target.isContentEditable
	) {
		log('Keydown event ignored due to typing in a field',);
		return;
	}

	// Ignore key press if there there is no video controller
	if (document.getElementsByClassName('svc-div').length === 0) {
		log('Keydown event ignored due to no video controller on page',);
		return;
	}

	executeKeyPress(key, videos);
}

// Tests if the given key press matches any known key combos
// If matching then execute whatever the key should do
function executeKeyPress(key, videos) {
	if (key === settings.increaseSpeedKey) {
		for (const video of videos) {
			let svcPs = video.parentElement.getElementsByClassName('svc-p');
			if (svcPs.length === 1) {
				let svcP = svcPs[0];
				let newSpeed = video.playbackRate + settings.speedModifier;
				if (newSpeed <= 5) {
					video.playbackRate = newSpeed;
					svcP.innerText = newSpeed.toFixed(2);
					chrome.storage.sync.set({
						persistentCurrentSpeed: newSpeed,
					});
				}
			}
		}
	} else if (key === settings.decreaseSpeedKey) {
		for (const video of videos) {
			let svcPs = video.parentElement.getElementsByClassName('svc-p');
			if (svcPs.length === 1) {
				let svcP = svcPs[0];
				let newSpeed = video.playbackRate - settings.speedModifier;
				if (newSpeed >= 0.1) {
					video.playbackRate = newSpeed;
					svcP.innerText = newSpeed.toFixed(2);
					chrome.storage.sync.set({
						persistentCurrentSpeed: newSpeed,
					});
				}
			}
		}
	} else if (key === settings.toggleOverlayKey) {
		const svcDIVs = document.getElementsByClassName('svc-div');
		for (const div of svcDIVs) {
			div.style.display = settings.showOverlay ? 'none' : 'block';
		}
		chrome.storage.sync.set({ showOverlay: !settings.showOverlay });
		settings.showOverlay = !settings.showOverlay;
	} else {
		log('Input key matches no given key combos');
		return;
	}
}

function removeOverlaysAndListeners() {
	let overlays = document.getElementsByClassName('svc-div');
	for (const div of overlays) {
		div.remove();
	}

	var docs = Array(document);
	docs.forEach(function (doc) {
		doc.removeEventListener('keydown', keypress);
	});
}

function log(message) {
	if (settings.logLevel === 0) {
		return;
	} else {
		console.log(message);
		chrome.runtime.sendMessage({ type: 'console', message: message });
	}
}