// options/options.js

document.addEventListener("DOMContentLoaded", () => {
    restoreSettings();

    document.getElementById("save-btn").addEventListener("click", saveSettings);
    document.getElementById("reset-btn").addEventListener("click", resetSettings);
    document.getElementById("domain").addEventListener("input", validateDomain);
});

function restoreSettings(bgColor, textColor) {
    document.getElementById("default-bg").value = bgColor || "#ffffff";
    document.getElementById("default-text").value = textColor || "#000000";

    loadHistory();
}

function loadHistory() {
    // Load and display history from storage
    chrome.storage.sync.get(["colorsBySite"], (data) => {
        const colorsBySite = data.colorsBySite || {};
        const historyDiv = document.getElementById("history");

        if (Object.keys(colorsBySite).length === 0) {
            const noHistoryMessage = document.createElement("p");
            noHistoryMessage.textContent = "No saved settings found.";
            noHistoryMessage.style.color = "#6b7280";
            noHistoryMessage.style.textAlign = "center";
            historyDiv.appendChild(noHistoryMessage);
        } else {
            for (const domain in colorsBySite) {
                const colors = colorsBySite[domain];
                const historyItem = document.createElement("div");
                historyItem.className = "history-item";

                const domainSpan = document.createElement("span");
                domainSpan.textContent = domain;

                const swatchesDiv = document.createElement("div");
                swatchesDiv.className = "color-swatches";

                const bgSwatch = document.createElement("div");
                bgSwatch.className = "color-swatch";
                bgSwatch.style.backgroundColor = colors.bgColor;

                const textSwatch = document.createElement("div");
                textSwatch.className = "color-swatch";
                textSwatch.style.backgroundColor = colors.textColor;

                swatchesDiv.appendChild(bgSwatch);
                swatchesDiv.appendChild(textSwatch);

                historyItem.appendChild(domainSpan);
                historyItem.appendChild(swatchesDiv);

                historyDiv.appendChild(historyItem);
            }
        }
    });
}

function saveSettings() {
    const bgColor = document.getElementById("default-bg").value;
    const textColor = document.getElementById("default-text").value;
    const domain = document.getElementById("domain").value;

    chrome.storage.sync.get(["colorsBySite"], (data) => {
        const colorsBySite = data.colorsBySite || {};
        colorsBySite[domain] = { bgColor, textColor };
        chrome.storage.sync.set({ colorsBySite });
        showStatus("Settings saved!");
    });
}

function resetSettings() {
    const domain = document.getElementById("domain").value;

    chrome.storage.sync.get(["colorsBySite"], (data) => {
        const colorsBySite = data.colorsBySite || {};
        delete colorsBySite[domain];
        chrome.storage.sync.set({ colorsBySite });

        document.getElementById("default-bg").value = "#ffffff";
        document.getElementById("default-text").value = "#000000";
        showStatus("Settings reset to default.");
    });
}

function showStatus(message) {
    const status = document.getElementById("status");
    status.textContent = message;
    setTimeout(() => status.textContent = "", 2000);
}

function validateDomain() {
    // A simple, reliable regex for validating a domain name.
    const domainRegex = /^(?!-)(?:[a-zA-Z0-9-]{1,63}\.)+(?:[a-zA-Z]{2,63})$/;

    const domainInput = document.getElementById("domain");
    const validationIcon = document.getElementById("validation-icon");

    const domain = domainInput.value.trim();

    // Clear the icon and result message if the input is empty
    if (domain === "") {
        validationIcon.textContent = "";
        return;
    }

    // Test the input against the regular expression
    if (domainRegex.test(domain)) {
        // If valid, show a green checkmark and a success message
        validationIcon.textContent = "✓";
        validationIcon.className = "validation-icon valid-icon";

        chrome.storage.sync.get(["colorsBySite"], (data) => {
            const siteColors = data.colorsBySite?.[domain];
            console.log(siteColors);
            if (siteColors) {
                restoreSettings(siteColors.bgColor, siteColors.textColor);
            }
        });
    } else {
        // If invalid, show a red cross and an error message
        validationIcon.textContent = "✕";
        validationIcon.className = "validation-icon invalid-icon";
    }
    restoreSettings();
}
