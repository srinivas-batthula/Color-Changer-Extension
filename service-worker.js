// service-worker.js

// Event Listener for Keyboard Shortcut 'Ctrl + Shift + S' to Toggle Theme...
chrome.commands.onCommand.addListener((command) => {
    if (command === "toggle-theme") {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (!tabs || !tabs[0]) return;

            const tabId = tabs[0].id;
            chrome.tabs.sendMessage(tabId, { action: "toggleTheme" });  // Send msg to `content-script.js` to perform action on the current web-page...
        });
    }
});

chrome.runtime.onInstalled.addListener(() => {
    console.log("Color Changer extension installed.");
});
