export type IDEType = "vscode" | "cursor" | "intellij";

export interface IDE {
  id: IDEType;
  name: string;
  command: {
    windows: string;
    mac: string;
  };
}

export const SUPPORTED_IDES: IDE[] = [
  {
    id: "vscode",
    name: "Visual Studio Code",
    command: {
      windows: "code",
      mac: "code",
    },
  },
  {
    id: "cursor",
    name: "Cursor",
    command: {
      windows: "cursor",
      mac: "cursor",
    },
  },
  {
    id: "intellij",
    name: "IntelliJ IDEA",
    command: {
      windows: "idea",
      mac: 'open -a "IntelliJ IDEA"',
    },
  },
];
