import { useEffect, useState } from "react";

const TABS = ["contacts", "deals", "tasks"];

export default function App() {
  const [activeTab, setActiveTab] = useState("contacts");

  const [data, setData] = useState({
    contacts: [],
    deals: [],
    tasks: [],
    lastSync: null
  });

  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selected, setSelected] = useState(null);

  // ---------------- LOAD DATA ON POPUP OPEN ----------------
  useEffect(() => {
    chrome.storage.local.get("hubspot_data", res => {
      if (res.hubspot_data) {
        setData(res.hubspot_data);
      }
    });
  }, []);

  // ---------------- EXTRACT NOW (FIXED) ----------------
  const extractNow = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      if (!tab?.id) return;

      chrome.tabs.sendMessage(
        tab.id,
        { type: `EXTRACT_${activeTab.toUpperCase()}` },
        response => {
          if (!response || !Array.isArray(response.data)) return;

          chrome.storage.local.get("hubspot_data", res => {
            const store = res.hubspot_data || {
              contacts: [],
              deals: [],
              tasks: [],
              lastSync: null
            };

            store[activeTab] = response.data;
            store.lastSync = Date.now();

            chrome.storage.local.set({ hubspot_data: store }, () => {
              setData(store);          // ✅ SINGLE SOURCE OF TRUTH
              setSearch("");
              setSuggestions([]);
              setSelected(null);
            });
          });
        }
      );
    });
  };

  const exportAsJSON = () => {
  chrome.storage.local.get("hubspot_data", res => {
    if (!res.hubspot_data) return;

    const blob = new Blob(
      [JSON.stringify(res.hubspot_data, null, 2)],
      { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = "hubspot_data.json";
    a.click();

    URL.revokeObjectURL(url);
  });
};

  // ---------------- DELETE RECORD ----------------
  const deleteItem = index => {
    chrome.storage.local.get("hubspot_data", res => {
      const store = res.hubspot_data;
      if (!store) return;

      store[activeTab].splice(index, 1);

      chrome.storage.local.set({ hubspot_data: store }, () => {
        setData(store);
        setSelected(null);
      });
    });
  };

  // ---------------- FILTERED LIST ----------------
  const list = data[activeTab].filter(item =>
    JSON.stringify(item)
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  // ---------------- UI ----------------
  return (
    <div style={styles.container}>
      <h2>HubSpot CRM Dashboard</h2>

      {/* TABS */}
      <div style={styles.tabs}>
        {TABS.map(tab => (
          <button
            key={tab}
            style={{
              ...styles.tab,
              background: activeTab === tab ? "#2563eb" : "#e5e7eb",
              color: activeTab === tab ? "#fff" : "#000"
            }}
            onClick={() => {
              setActiveTab(tab);
              setSearch("");
              setSelected(null);
              setSuggestions([]);
            }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* SEARCH + EXTRACT */}
      <div style={styles.row}>
        <input
          style={styles.input}
          placeholder="Search..."
          value={search}
          onChange={e => {
            const val = e.target.value;
            setSearch(val);

            if (!val) {
              setSuggestions([]);
              return;
            }

            setSuggestions(
              data[activeTab].filter(item =>
                JSON.stringify(item)
                  .toLowerCase()
                  .includes(val.toLowerCase())
              )
            );
          }}
        />

        <button style={styles.extractBtn} onClick={extractNow}>
          Extract Now
        </button>
      </div>
<button
  style={{
    background: "#4b5563",
    color: "#fff",
    border: "none",
    padding: "6px 8px",
    borderRadius: 4,
    cursor: "pointer"
  }}
  onClick={exportAsJSON}
>
  Export JSON
</button>

      {/* SUGGESTIONS */}
      {suggestions.length > 0 && (
        <div style={styles.suggestions}>
          {suggestions.map((item, i) => (
            <div
              key={i}
              style={styles.suggestionItem}
              onClick={() => {
                setSearch(item.name || item.title || "");
                setSelected(item);
                setSuggestions([]);
              }}
            >
              {item.name || item.title}
            </div>
          ))}
        </div>
      )}

      {/* LIST */}
      <div style={styles.list}>
        {list.map((item, i) => (
          <div
            key={i}
            style={styles.listItem}
            onClick={() => setSelected(item)}
          >
            <span>{item.name || item.title}</span>
            <span
              style={styles.delete}
              onClick={e => {
                e.stopPropagation();
                deleteItem(i);
              }}
            >
              ✕
            </span>
          </div>
        ))}
      </div>

      {/* DETAILS PANEL */}
      {selected && (
        <div style={styles.details}>
          <b>Details</b>
          {Object.entries(selected).map(([key, val]) => (
            <div key={key}>
              <b>{key}:</b> {val || "—"}
            </div>
          ))}
        </div>
      )}

      {/* FOOTER */}
      <div style={styles.footer}>
        Last Sync:{" "}
        {data.lastSync
          ? new Date(data.lastSync).toLocaleString()
          : "—"}
      </div>
    </div>
  );
}

/* ---------------- STYLES ---------------- */

const styles = {
  container: {
    width: 320,
    padding: 10,
    fontFamily: "sans-serif"
  },
  tabs: {
    display: "flex",
    gap: 6,
    marginBottom: 8
  },
  tab: {
    flex: 1,
    border: "none",
    padding: 6,
    cursor: "pointer",
    borderRadius: 4
  },
  row: {
    display: "flex",
    gap: 6,
    marginBottom: 6
  },
  input: {
    flex: 1,
    padding: 6,
    fontSize: 12
  },
  extractBtn: {
    background: "#16a34a",
    color: "#fff",
    border: "none",
    padding: "6px 8px",
    borderRadius: 4,
    cursor: "pointer"
  },
  suggestions: {
    border: "1px solid #ddd",
    maxHeight: 100,
    overflow: "auto",
    marginBottom: 6
  },
  suggestionItem: {
    padding: 6,
    cursor: "pointer"
  },
  list: {
    border: "1px solid #ddd",
    maxHeight: 120,
    overflow: "auto",
    padding: 6
  },
  listItem: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 4,
    cursor: "pointer"
  },
  delete: {
    color: "red",
    cursor: "pointer"
  },
  details: {
    marginTop: 8,
    border: "1px solid #ddd",
    padding: 6,
    fontSize: 12,
    background: "#f9fafb"
  },
  footer: {
    marginTop: 8,
    fontSize: 11,
    color: "#555"
  }
};
