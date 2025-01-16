export const openInIde = async (path: string, command: string) => {
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
