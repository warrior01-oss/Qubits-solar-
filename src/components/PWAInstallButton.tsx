import React, { useState } from 'react';
import { Download, Smartphone } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { InstallAPKModal } from './InstallAPKModal';

interface PWAInstallButtonProps {
  variant?: 'header' | 'hero' | 'floating';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'header',
  className = '',
}) => {
  const { isInstallable, isInstalled } = usePWAInstall();
  const [showModal, setShowModal] = useState(false);

  // If already installed and running standalone, hide ambient prompt
  if (isInstalled) {
    return null;
  }

  const handleClick = () => {
    setShowModal(true);
  };

  if (variant === 'hero') {
    return (
      <>
        <button
          type="button"
          onClick={handleClick}
          className={`flex items-center gap-2 px-5 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-[#0B4F9C] border-2 border-[#0B4F9C]/30 hover:border-[#0B4F9C] font-bold text-xs sm:text-sm transition-all shadow-md group ${className}`}
          title="Download Qubits Solar .APK"
        >
          <Download className="w-4 h-4 text-[#F58220] group-hover:translate-y-0.5 transition-transform" />
          <span>Download .APK</span>
        </button>

        <InstallAPKModal isOpen={showModal} onClose={() => setShowModal(false)} />
      </>
    );
  }

  // Header button
  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-50 hover:bg-blue-100 text-[#0B4F9C] border border-blue-200 transition-all ${className}`}
        title="Download Qubits Solar .APK"
      >
        <Download className="w-3.5 h-3.5 text-[#F58220]" />
        <span>Download .APK</span>
      </button>

      <InstallAPKModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  );
};
