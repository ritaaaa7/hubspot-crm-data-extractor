# HubSpot CRM Data Extractor – Chrome Extension

## 📌 Overview
A Chrome Extension built using Manifest V3 that extracts Contacts, Deals, and Tasks from a live HubSpot CRM page using DOM scraping and displays them in a React-based popup dashboard.

> ⚠️ No HubSpot APIs are used. Extraction is done purely from visible DOM as per assignment instructions.

---

## 🚀 Features
- Extract Contacts, Deals, and Tasks
- React popup dashboard
- Tab-based navigation
- Persistent local storage
- View & delete individual records
- Last sync timestamp
- Clean Manifest V3 architecture

---

## 🧱 Tech Stack
- Chrome Extension (Manifest V3)
- React (Vite)
- JavaScript
- chrome.storage.local


---

## 🛠 Installation
1. Clone repository
2. Run:
   ```bash
   cd ui
   npm install
   npm run build
3. Open Chrome → Extensions → Load Unpacked
4.Select project root folder

🧪 How It Works

-User opens HubSpot CRM page
-Content script scrapes visible DOM rows
-Popup sends extraction message
-Data is stored in chrome.storage.local
-React dashboard renders stored data

💾 Storage Schema
{
  contacts: [],
  deals: [],
  tasks: [],
  lastSync: timestamp
}
