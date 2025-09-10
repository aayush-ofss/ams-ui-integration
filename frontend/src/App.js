// src/App.js
import React, { useRef, useState, useEffect } from "react";

const darkBg = "#1e2130";
const boxBg = "#26283a";
const border = "1px solid #3a3b4d";
const accent = "#2458ed";

// Default folders per branch (pointing to directories)
const defaultFolders = {
  LBG: "/Lloyds banking Group",
  // TD: "/default_logs/TD/"
};

function App() {
  const [workspace, setWorkspace] = useState("LBG");
  const [file, setFile] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [prompt, setPrompt] = useState("");
  const [output, setOutput] = useState("");
  const ws = useRef(null);

  // Connect WebSocket on mount
  useEffect(() => {
    ws.current = new window.WebSocket("ws://localhost:8080");
    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setOutput((old) =>
        old + (data.role === "system" ? "" : "\n") + data.role + ": " + data.message
      );
    };
    return () => ws.current && ws.current.close();
  }, []);

  const handleExecute = () => {
    if (ws.current && prompt.trim()) {
      ws.current.send(JSON.stringify({ message: prompt }));
      setOutput("");
    }
  };

  const handleClear = () => {
    setPrompt("");
    setOutput("");
  };

  const handleFileUpload = (e) => {
    setUploadedFiles(Array.from(e.target.files));
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: darkBg,
        padding: 32,
        color: "#fff",
        fontFamily: "Segoe UI, Arial, sans-serif"
      }}
    >
      <h2 style={{ fontWeight: 600, marginBottom: 12 }}>GURU</h2>
      <div style={{ display: "flex", gap: 20 }}>
        {/* Left controls */}
        <div
          style={{
            background: boxBg,
            border,
            flex: 1,
            padding: 16,
            borderRadius: 8,
            minWidth: 350,
            maxWidth: 470
          }}
        >
          {/* Workspace selection */}
          <div style={{ marginBottom: 10 }}>
            <label>Workspace</label>
            <select
              style={selectStyle}
              value={workspace}
              onChange={(e) => setWorkspace(e.target.value)}
            >
              <option>LBG</option>
              <option>TD</option>
            </select>
            <button style={{ ...btnStyle, marginLeft: 8 }}>Refresh</button>
          </div>

          {/* Default folder */}
          <div style={{ marginBottom: 10 }}>
            <h4>Default Folder in {workspace}:</h4>
            <ul>
              <li>
                <a
                  href={defaultFolders[workspace]}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open {workspace} Logs Folder
                </a>
              </li>
            </ul>
          </div>

          {/* Upload new log files */}
          <div style={{ marginBottom: 10 }}>
            <label>Upload log files</label>
            <input
              type="file"
              multiple
              style={{ color: "#fff" }}
              onChange={handleFileUpload}
            />
            <ul>
              {uploadedFiles.map((f, i) => (
                <li key={i}>{f.name}</li>
              ))}
            </ul>
          </div>

          {/* Prompt input */}
          <div style={{ marginBottom: 10 }}>
            <label>Prompt</label>
            <textarea
              style={textareaStyle}
              rows={6}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter your prompt..."
            />
            <div style={{ fontSize: 12, color: "#bbb" }}>
              {prompt.length} / 32000
            </div>
            <div style={{ marginTop: 8 }}>
              <button style={btnStyle} onClick={handleExecute}>
                Execute
              </button>
              <button
                style={{ ...btnStyle, background: "#363b5b", color: "#fff", marginLeft: 8 }}
                onClick={handleClear}
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Right output */}
        <div
          style={{
            background: boxBg,
            border,
            flex: 1,
            minHeight: 320,
            borderRadius: 8,
            padding: 16
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Output</div>
          <div
            style={{
              background: "#181927",
              borderRadius: 4,
              padding: 12,
              minHeight: 60,
              color: "#d6d6d6",
              fontFamily: "monospace"
            }}
          >
            {output || "Waiting for response..."}
          </div>
        </div>
      </div>

      {/* Optional: History section */}
      <div
        style={{
          marginTop: 32,
          background: boxBg,
          border,
          padding: 16,
          borderRadius: 8,
          maxWidth: 600
        }}
      >
        <div style={{ fontWeight: 600 }}>History</div>
        <button style={btnStyle}>Refresh</button>
      </div>
    </div>
  );
}

// Reusable style snippets
const btnStyle = {
  background: "#2458ed",
  color: "#fff",
  border: "none",
  padding: "7px 18px",
  borderRadius: 6,
  fontSize: 15,
  cursor: "pointer",
  fontWeight: 500
};
const selectStyle = {
  background: "#1e2130",
  color: "#fff",
  padding: "7px 9px",
  border: "1px solid #3a3b4d",
  borderRadius: 6,
  marginLeft: 10,
  fontSize: 15,
  minWidth: 80
};
const inputStyle = {
  background: "#1e2130",
  color: "#fff",
  border: "1px solid #3a3b4d",
  borderRadius: 6,
  padding: "7px 10px",
  fontSize: 15,
  width: "100%",
  marginTop: 6,
  marginBottom: 6
};
const textareaStyle = {
  ...inputStyle,
  fontFamily: "monospace",
  minHeight: 90,
  resize: "vertical",
  width: "100%"
};

export default App;
