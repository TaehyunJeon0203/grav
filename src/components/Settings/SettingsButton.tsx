import { useState } from "react";
import { SettingsModal } from "./SettingsModal";
import { Cog6ToothIcon } from "@heroicons/react/24/outline";

export const SettingsButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 hover:bg-neutral-700 rounded-lg transition-colors"
        title="설정"
      >
        <Cog6ToothIcon className="w-5 h-5" />
      </button>

      <SettingsModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};
