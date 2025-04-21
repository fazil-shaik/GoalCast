import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { Toaster } from "@/components/ui/toaster";

document.title = "GoalCast - Social Accountability Platform";

// Add Meta tags for SEO and social media sharing
const metaTags = [
  { name: "description", content: "Track your goals and stay accountable with public sharing and social media integration" },
  { name: "viewport", content: "width=device-width, initial-scale=1.0, maximum-scale=1" },
  { name: "theme-color", content: "#4f46e5" },
];

metaTags.forEach(tag => {
  const meta = document.createElement("meta");
  Object.entries(tag).forEach(([key, value]) => {
    meta.setAttribute(key, value);
  });
  document.head.appendChild(meta);
});

// Add favicon
const favicon = document.createElement("link");
favicon.rel = "icon";
favicon.href = "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🚀</text></svg>";
document.head.appendChild(favicon);

// Add font stylesheets
const fontLink1 = document.createElement("link");
fontLink1.rel = "stylesheet";
fontLink1.href = "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap";
document.head.appendChild(fontLink1);

const fontLink2 = document.createElement("link");
fontLink2.rel = "stylesheet";
fontLink2.href = "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500&display=swap";
document.head.appendChild(fontLink2);

// Add Remix icons
const remixIcon = document.createElement("link");
remixIcon.rel = "stylesheet";
remixIcon.href = "https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css";
document.head.appendChild(remixIcon);

createRoot(document.getElementById("root")!).render(
  <>
    <App />
    <Toaster />
  </>
);
