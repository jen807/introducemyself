import React from "react";
import ReactDOM from "react-dom/client"; // React 18 방식
import "./index.css";
import App from "./App";

// createRoot 사용
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
