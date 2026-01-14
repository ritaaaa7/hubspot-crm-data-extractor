
// chrome.runtime.onMessage.addListener((msg, sender) => {
//   if (!msg.type || !msg.data) return;

//   chrome.storage.local.get(["hubspot_data"], (res) => {
//     const store = res.hubspot_data || {
//       contacts: [],
//       deals: [],
//       tasks: [],
//       lastSync: null
//     };

//     // ROUTE DATA CORRECTLY
//     if (msg.type === "contacts") store.contacts = msg.data;
//     if (msg.type === "deals") store.deals = msg.data;
//     if (msg.type === "tasks") store.tasks = msg.data;

//     store.lastSync = Date.now();

//     chrome.storage.local.set({ hubspot_data: store });
//   });
// });

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "EXTRACT_NOW") {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      chrome.tabs.sendMessage(
        tabs[0].id,
        { type: `EXTRACT_${msg.target.toUpperCase()}` },
        (res) => {
          chrome.storage.local.get("hubspot_data", store => {
            const data = store.hubspot_data || { contacts: [], deals: [], tasks: [] };
            data[msg.target] = res?.data || [];
            data.lastSync = Date.now();

            chrome.storage.local.set({ hubspot_data: data }, sendResponse);
          });
        }
      );
    });
    return true;
  }
});
