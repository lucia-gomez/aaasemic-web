chrome.runtime.onInstalled.addListener(() => {
  chrome.action.setBadgeText({
    text: "OFF",
  });
});

chrome.action.onClicked.addListener(async (tab) => {
  const prevState = await chrome.action.getBadgeText({ tabId: tab.id });
  const nextState = prevState === "ON" ? "OFF" : "ON";

  await chrome.action.setBadgeText({
    tabId: tab.id,
    text: nextState,
  });

  if (nextState === "ON") {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (fontUrl) => {
        if (document.getElementById("asemic-font-style")) return;

        const style = document.createElement("style");
        style.id = "asemic-font-style";
        style.textContent = `
          @font-face {
            font-family: "Asemic";
            src: url("${fontUrl}") format("truetype");
            font-weight: normal;
            font-style: normal;
          }
        `;
        document.head.appendChild(style);
      },
      args: [chrome.runtime.getURL("./fonts/pixel-small.ttf")],
    });

    await chrome.scripting.insertCSS({
      files: ["main.css"],
      target: { tabId: tab.id },
    });
  } else if (nextState === "OFF") {
    await chrome.scripting.removeCSS({
      files: ["main.css"],
      target: { tabId: tab.id },
    });
  }
});
