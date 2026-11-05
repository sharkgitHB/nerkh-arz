// Shared type for the Electron preload bridge (window.desktopApp)
export interface DesktopAppBridge {
  isDesktop: boolean;
  platform: string;
  version: string;
  onUpdateMessage: (cb: (msg: UpdateMessage) => void) => () => void;
  installUpdate: () => Promise<void>;
  toggleWidget: () => Promise<boolean>;
  onWidgetClosed: (cb: () => void) => () => void;
}

export interface UpdateMessage {
  type: "available" | "progress" | "downloaded";
  version?: string;
  percent?: number;
}

declare global {
  interface Window {
    desktopApp?: DesktopAppBridge;
  }
}
