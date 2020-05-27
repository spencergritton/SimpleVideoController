let settings = {}

var videos = document.getElementsByTagName('video') 

// Set settings object to chrome storage
chrome.storage.sync.get(null, function(items) {
    settings = items;

    // If persistent speed, set all videos on page to persistent speed
    if (settings.persistentSpeed) {
        for( const video of videos ){ 
            video.playbackRate = settings.persistentCurrentSpeed;
        }
    }

    // Initialize speedometer
    initializeOverlay();
});

// Add event listeners for keydowns to trigger plugin functionality
var docs = Array(document);
docs.forEach(function (doc) {
    doc.addEventListener(
        "keydown",
        function (event) {
            log(event, 1)
            let key = event.key.toUpperCase();

            // Ignore key press if modified
            if (
                !event.getModifierState ||
                event.getModifierState("Alt") ||
                event.getModifierState("Control") ||
                event.getModifierState("Fn") ||
                event.getModifierState("Meta") ||
                event.getModifierState("Hyper") ||
                event.getModifierState("OS")
            ) {
                log('Keydown event ignored due to active modifier', 1);
                return;
            }

            // Ignore key press if user is typing in a field
            if (
                event.target.nodeName === "INPUT" ||
                event.target.nodeName === "TEXTAREA" ||
                event.target.isContentEditable
            ) {
                log('Keydown event ignored due to typing in a field', 1);
                return;
            }

            // Ignore key press if there there is no video controller
            if (document.getElementsByClassName('svc-div').length === 0) {
                log('Keydown event ignored due to no video controller on page', 1);
                return;
            }

            executeKeyPress(key);
        },
        false
    );
});

// Logger
function log(message, level) {
    if (level === 0) {
        return;
    } else {
        console.log(message)
        chrome.runtime.sendMessage({'type': 'console', 'message': message});
    }
}

// Initialize Overlay
function initializeOverlay() {
    if (document.getElementsByClassName('svc-div').length > 0) {
        log('Already overlay on this page', 1);
        return;
    }

    // Create overlay for each video on page
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
            text.innerText = video.playbackRate
        }
        text.className = 'svc-p';
        text.style.position = 'relative';
        text.style.color = 'red';
        text.style.marginBottom = '2px';
        text.style.marginTop = '2px';
        text.style.marginLeft = '5px';
        text.style.marginRight = '5px';

        // Append text to overlay and overlay to DOM
        svcDiv.appendChild(text);
        if (!settings.showOverlay) { srcDiv.style.display = 'none'; }
        video.parentNode.insertAdjacentElement('afterbegin', svcDiv);
    }
}

// Tests if the given key matches any key combos
// If matching then execute the shortcut

// TODO: FIGURE OUT HOW TO IMPLEMENT PERSISTENT SPEED HERE
function executeKeyPress(key) {
    if (key === settings.increaseSpeedKey) {
        const svcPs = document.getElementsByClassName('svc-p');
        // if (newSpeed > 15) { return; }
        for (const p of svcPs) {
            p.innerText = (parseFloat(p.innerText) + settings.speedModifier).toFixed(2);
        }

        for (const video of videos) {
            video.playbackRate = video.playbackRate + settings.speedModifier
        }
    }
    else if (key === settings.decreaseSpeedKey) {
        const svcPs = document.getElementsByClassName('svc-p');
         // if (newSpeed <= 0) { return; }
        for (const p of svcPs) {
            p.innerText = (parseFloat(p.innerText) - settings.speedModifier).toFixed(2);
        }

        for (const video of videos) {
            video.playbackRate = video.playbackRate - settings.speedModifier
        }
    }
    else if (key === settings.toggleOverlayKey) {
        const svcDIVs = document.getElementsByClassName('svc-div');
        for (const div of svcDIVs) {
            div.style.display = settings.showOverlay ? 'none' : 'block';
        }
        chrome.storage.sync.set({'showOverlay': !settings.showOverlay})
        settings.showOverlay = !settings.showOverlay;
    }
    else {
        log('Input key matches no given key combos', 1);
        return;
    }
}