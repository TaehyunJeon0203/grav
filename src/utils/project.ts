import { useSettingsStore } from "../stores/settingsStore";

export const openInIde = async (path: string) => {
  const { getSelectedIde } = useSettingsStore.getState();
  const selectedIde = getSelectedIde();

  // 개발 환경에서는 mac 명령어 사용
  const command = selectedIde.command.mac;

  // 개발 환경에서는 console.log만 출력
  if (!window.electron) {
    console.log("Opening project:", { path, command });
    return;
  }

  try {
    await window.electron.openInIde(path, command);
  } catch (error) {
    console.error("Failed to open IDE:", error);
  }
};
