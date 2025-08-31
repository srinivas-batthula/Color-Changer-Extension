// content-script.js

// Apply stored colors immediately to the 'current page'  when the 'content-script' runs...
function applySiteColors() {
    const domain = window.location.hostname;
    console.log("✅ Content-Script loaded on:", domain);

    chrome.storage.sync.get(["colorsBySite"], (data) => {
        const siteColors = data.colorsBySite?.[domain];
        
        if (!siteColors) {            // If the user has not Set any specific colors previously to the current site (As he is viewing this site 1st time), then just Skip...
            chrome.storage.local.set({ themeApplied: false });
        }
        else {
            chrome.storage.local.get(["themeApplied"], (data) => {
                const themeApplied = data.themeApplied;     // themeApplied := true / false

                if (themeApplied) {
                    applyStyles(siteColors.bgColor, siteColors.textColor);
                } else {
                    chrome.storage.local.set({ themeApplied: false });
                }
            });
        }
    });
};

applySiteColors(); // Run immediately

function applyStyles(bgColor, textColor) {
    document.body.style.backgroundColor = bgColor || "";
    document.body.style.color = textColor || "";
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("Content-Script:: chrome.runtime.onMessage.addListener: ", request.action);

    if (request.action === "applyColors") {             // Msg from `popup.js` to apply/reset colors (When user clicks 'apply-btn' in popup)...
        applyStyles(request.bgColor, request.textColor);
        sendResponse({ status: "applied" });
        chrome.storage.local.set({ themeApplied: true });
    }

    if (request.action === "resetColors") {
        applyStyles("", "");
        sendResponse({ status: "reset" });
        chrome.storage.local.set({ themeApplied: false });
    }

    if (request.action === "toggleTheme") {     // Msg from `service-worker.js` to Toggle Theme (When user presses Keyboard Shortcut 'Ctrl + Shift + S')...
        const domain = window.location.hostname;

        chrome.storage.sync.get(["colorsBySite"], (data) => {
            const settings = data.colorsBySite?.[domain];
            if (!settings) return;

            chrome.storage.local.get(["themeApplied"], (data) => {
                const themeApplied = data.themeApplied;     // themeApplied := true / false
                // console.log("themeApplied:", themeApplied);

                if (themeApplied) {
                    applyStyles("", "");
                    chrome.storage.local.set({ themeApplied: false });
                } else {
                    applyStyles(settings.bgColor, settings.textColor);
                    chrome.storage.local.set({ themeApplied: true });
                }
            });
        });
    }
});
