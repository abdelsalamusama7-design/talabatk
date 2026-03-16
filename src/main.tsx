import { createRoot } from "react-dom/client";
import "./lib/install-prompt"; // Capture install prompt as early as possible
import App from "./App.tsx";
import "./index.css";

// Initialize theme before render
if (localStorage.getItem("theme") === "dark") {
  document.documentElement.classList.add("dark");
}

createRoot(document.getElementById("root")!).render(<App />);
