"use client";

// Document Picture-in-Picture helpers (browser floating mode).
// The widget PANEL itself lives in widget-window.tsx and is rendered into
// the PiP document via a React portal from page.tsx.

export interface DocumentPiPWindow {
  window: Window;
}
export interface DocumentPictureInPicture {
  requestWindow: (options?: {
    width?: number;
    height?: number;
  }) => Promise<DocumentPiPWindow>;
  window: Window | null;
}
declare global {
  interface Window {
    documentPictureInPicture?: DocumentPictureInPicture;
  }
}

export function isPipSupported(): boolean {
  // Document PiP requires:
  // 1. Browser support (Chrome 116+, Edge, Android Chrome - NOT iOS Safari, NOT Firefox)
  // 2. Not running in headless mode (headless Chromium opens PiP but it's immediately closed)
  // 3. User activation (caller must be triggered by user click)
  if (typeof window === "undefined") return false;
  if (!window.documentPictureInPicture) return false;
  if (/HeadlessChrome/.test(navigator.userAgent)) return false;
  return true;
}

// Call from a click handler to open a PiP window
export async function openPipWindow(
  language: string,
  onClose: () => void,
): Promise<DocumentPiPWindow | null> {
  if (!isPipSupported()) return null;
  try {
    const newPipWindow = await window.documentPictureInPicture!.requestWindow({
      width: 320,
      height: 420,
    });

    // Verify the window is actually usable (in headless browsers it may open but be closed)
    if (!newPipWindow || newPipWindow.window.closed) {
      return null;
    }

    // Copy stylesheets to PiP window
    const docStyles = document.querySelectorAll(
      'style, link[rel="stylesheet"]',
    );
    docStyles.forEach((node) => {
      const clone = node.cloneNode(true);
      newPipWindow.window.document.head.appendChild(clone);
    });

    const style = newPipWindow.window.document.createElement("style");
    style.textContent = `
      html, body {
        margin: 0; padding: 0;
        background: transparent;
        color: var(--foreground, #1c1c1e);
        font-family: var(--font-vazir), var(--font-sans), -apple-system, sans-serif;
        overflow: hidden;
        user-select: none;
        -webkit-user-select: none;
      }
      body * { box-sizing: border-box; }
    `;
    newPipWindow.window.document.head.appendChild(style);

    const isDark = document.documentElement.classList.contains("dark");
    newPipWindow.window.document.documentElement.classList.toggle("dark", isDark);
    newPipWindow.window.document.documentElement.setAttribute(
      "dir",
      language === "fa" ? "rtl" : "ltr",
    );
    newPipWindow.window.document.documentElement.setAttribute("lang", language);

    newPipWindow.window.addEventListener("pagehide", () => {
      onClose();
    });

    return newPipWindow;
  } catch (e) {
    console.error("PiP failed:", e);
    return null;
  }
}
