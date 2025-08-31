// popup/popup.js

function sendMessageToTab(message) {        // Sends Msg to `content-script.js` to Change/Shift colors...
    console.log("sendMessageToTab:: chrome.tabs.sendMessage: ", message.action);

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (!tabs || !tabs[0]) return;

        if (!tabs[0].url.startsWith("http")) {
            alert("This page doesn't support color changes (e.g. Chrome internal pages).");
            return;
        }

        chrome.tabs.sendMessage(tabs[0].id, message, (response) => {    // Sending Msg to `content-script.js` to change colors...
            if (chrome.runtime.lastError) {
                console.warn("Error sending message:", chrome.runtime.lastError.message);
                alert("This page doesn't support color changes (maybe a Chrome internal or restricted site).");
            } else {
                console.log("Response:", response);
            }
        });
    });
}

document.addEventListener("DOMContentLoaded", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const domain = new URL(tabs[0].url).hostname;

        // Load saved colors to display in 'input fields'  on 'popup open' (Default)...
        chrome.storage.sync.get(["colorsBySite"], (data) => {
            const siteColors = data.colorsBySite?.[domain];
            if (siteColors) {
                document.getElementById("bg-color").value = siteColors.bgColor || '';
                document.getElementById("text-color").value = siteColors.textColor || '';
            }
        });

        document.getElementById("apply-colors").addEventListener("click", () => {
            const bgColor = document.getElementById("bg-color").value;
            const textColor = document.getElementById("text-color").value;

            chrome.storage.sync.get(["colorsBySite"], (data) => {
                const colorsBySite = data.colorsBySite || {};
                colorsBySite[domain] = { bgColor, textColor };

                chrome.storage.sync.set({ colorsBySite });
                sendMessageToTab({ action: "applyColors", bgColor, textColor });
            });
        });

        document.getElementById("reset-colors").addEventListener("click", () => {
            chrome.storage.sync.get(["colorsBySite"], (data) => {
                const colorsBySite = data.colorsBySite || {};
                delete colorsBySite[domain];

                chrome.storage.sync.set({ colorsBySite });
                sendMessageToTab({ action: "resetColors" });
            });
        });
    });
});
