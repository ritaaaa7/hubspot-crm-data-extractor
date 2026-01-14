chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  chrome.storage.local.get("hubspot_data", (res) => {
    const data = res.hubspot_data || {
      contacts: [],
      deals: [],
      tasks: [],
      lastSync: null
    };

    if (msg.type === "contacts") {
      data.contacts = msg.data;
    }

    if (msg.type === "deals") {
      data.deals = msg.data;
    }

    if (msg.type === "tasks") {
      data.tasks = msg.data;
    }

    data.lastSync = Date.now();

    chrome.storage.local.set({ hubspot_data: data }, () => {
      sendResponse({ success: true });
    });
  });

  return true; // REQUIRED for async storage
});
