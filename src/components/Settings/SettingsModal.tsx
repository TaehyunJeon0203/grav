import { useSettingsStore } from "../../stores/settingsStore";
import { SUPPORTED_IDES } from "../../types/ide";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal = ({ isOpen, onClose }: SettingsModalProps) => {
  const { selectedIdeId, setSelectedIdeId } = useSettingsStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-neutral-800 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">설정</h2>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">기본 IDE</label>
          <div className="space-y-2">
            {SUPPORTED_IDES.map((ide) => (
              <label
                key={ide.id}
                className="flex items-center space-x-2 p-2 rounded hover:bg-neutral-700 cursor-pointer"
              >
                <input
                  type="radio"
                  name="ide"
                  value={ide.id}
                  checked={selectedIdeId === ide.id}
                  onChange={(e) => setSelectedIdeId(e.target.value as any)}
                  className="text-blue-600"
                />
                <span>{ide.name}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};
