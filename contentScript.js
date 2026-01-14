chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "EXTRACT_CONTACTS") {
    sendResponse({ type: "contacts", data: extractContacts() });
  }

  if (msg.type === "EXTRACT_DEALS") {
    sendResponse({ type: "deals", data: extractDeals() });
  }

  if (msg.type === "EXTRACT_TASKS") {
    sendResponse({ type: "tasks", data: extractTasks() });
  }
  if (msg.type === "EXTRACT_DATA") {
    try {
      showStatus("Extracting...", "info");

      const data = extractTableData();

      showStatus("Extraction successful", "success");
      sendResponse({ success: true, data });

    } catch (err) {
      showStatus("Extraction failed", "error");
      sendResponse({ success: false });
    }
  }
});

/* ---------------- CONTACTS ---------------- */
function extractContacts() {
  return [...document.querySelectorAll(
    'span[data-test-id$="-name"]'
  )].map((el, i) => ({
    id: `contact-${i}`,
    name: el.innerText.trim()
  }));
}

/* ---------------- DEALS ---------------- */
function extractDeals() {
  return [...document.querySelectorAll(
    'td[data-test-id*="dealname"]'
  )].map((el, i) => ({
    id: `deal-${i}`,
    name: el.innerText.trim()
  }));
}

/* ---------------- TASKS ---------------- */
function extractTasks() {
  const rows = document.querySelectorAll('tr[data-test-id^="row-"]');
  const tasks = [];

  rows.forEach(row => {
    const link = row.querySelector("a");
    if (!link) return;

    const title = link.innerText.trim();
    if (!title) return;

    tasks.push({
      title,
      dueDate: "" // optional, not visible in table
    });
  });

  return tasks;
}

function showStatus(text, type = "info") {
  // Remove existing badge if any
  const existing = document.getElementById("__hubspot_extract_status__");
  if (existing) existing.remove();

  const host = document.createElement("div");
  host.id = "__hubspot_extract_status__";

  const shadow = host.attachShadow({ mode: "open" });

  shadow.innerHTML = `
    <style>
      .badge {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 10px 14px;
        background: ${
          type === "success"
            ? "#16a34a"
            : type === "error"
            ? "#dc2626"
            : "#2563eb"
        };
        color: white;
        font-size: 13px;
        border-radius: 8px;
        font-family: system-ui, sans-serif;
        z-index: 2147483647; /* MAX z-index */
        box-shadow: 0 4px 10px rgba(0,0,0,0.25);
      }
    </style>
    <div class="badge">${text}</div>
  `;

  document.documentElement.appendChild(host);

  setTimeout(() => {
    host.remove();
  }, 2500);
}
