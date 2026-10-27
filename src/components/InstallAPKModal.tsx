import React, { useState } from 'react';
import {
  Download,
  Smartphone,
  CheckCircle2,
  ExternalLink,
  X,
  Share2,
  Copy,
  Sparkles,
  ShieldCheck,
  QrCode,
  FileDown,
  Info,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { COMPANY_DETAILS } from '../utils/pricing';

interface InstallAPKModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallAPKModal: React.FC<InstallAPKModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'apk' | 'instant' | 'qr'>('apk');

  if (!isOpen) return null;

  const appUrl = typeof window !== 'undefined' ? window.location.href : 'https://qubitssolar.page.gd';
  const pwaBuilderUrl = `https://www.pwabuilder.com/reportcard?site=${encodeURIComponent(appUrl)}`;

  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(appUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleInstallClick = async () => {
    if (isInstallable) {
      const res = await install();
      if (res) onClose();
    }
  };

  // High-contrast QR code pointing to live URL
  const qrSvgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
    appUrl
  )}&bgcolor=ffffff&color=0b4f9c&margin=2`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl max-w-xl w-full p-4 sm:p-8 space-y-5 sm:space-y-6 shadow-2xl relative my-auto max-h-[92vh] overflow-y-auto text-slate-800">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-800 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="space-y-2 pr-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-semibold text-[#0B4F9C]">
            <Smartphone className="w-3.5 h-3.5" />
            <span>Android APK Package & Direct Download</span>
          </div>
          <div className="flex items-center gap-3">
            <img
              src="/logo-qubits-solar.png"
              alt="Qubits Solar Logo"
              className="w-10 h-10 object-contain rounded-xl bg-slate-50 p-1 border border-slate-200"
            />
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900">
                Download Qubits Solar .APK
              </h2>
              <p className="text-xs text-[#0B4F9C] font-semibold">
                {COMPANY_DETAILS.name} • {COMPANY_DETAILS.subsidiaryText}
              </p>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-slate-600">
            Download the ready-to-install Android APK file or add directly to your home screen as a standalone offline-ready app.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('apk')}
            className={`flex-1 py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'apk'
                ? 'bg-[#0B4F9C] text-white shadow font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>Download .APK</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('instant')}
            className={`flex-1 py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'instant'
                ? 'bg-[#0B4F9C] text-white shadow font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>1-Tap Install</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('qr')}
            className={`flex-1 py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'qr'
                ? 'bg-[#0B4F9C] text-white shadow font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Scan QR Code</span>
          </button>
        </div>

        {/* TAB 1: DIRECT APK DOWNLOAD */}
        {activeTab === 'apk' && (
          <div className="space-y-4 text-xs">
            {/* Primary Download Card */}
            <div className="bg-gradient-to-br from-blue-50 via-white to-amber-50/50 border border-blue-200 rounded-2xl p-5 space-y-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-base text-slate-900">qubits-solar.apk</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded font-bold">
                      FULL OFFLINE APP
                    </span>
                  </div>
                  <p className="text-slate-600 text-xs">
                    Complete Qubits Solar application with express 60-second booking, yield loss calculator, WhatsApp dispatch, and AMC portal.
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-mono text-sm font-bold text-[#0B4F9C]">4.07 MB</div>
                  <div className="text-[10px] text-slate-500">Android 7.0+</div>
                </div>
              </div>

              {/* Direct APK Download Button */}
              <a
                href="/qubits-solar.apk"
                download="qubits-solar.apk"
                className="w-full py-3.5 px-5 rounded-xl bg-[#0B4F9C] hover:bg-[#003d80] text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20 transition-all hover:scale-[1.01]"
              >
                <Download className="w-4 h-4 font-bold" />
                <span>Download qubits-solar.apk (4.07 MB)</span>
              </a>

              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-200">
                <div className="text-slate-600">
                  Package: <span className="font-semibold text-slate-900">com.qubitssolar.app</span>
                </div>
                <div className="text-slate-600 text-right">
                  Engine: <span className="font-semibold text-slate-900">Standalone Offline Bundle</span>
                </div>
              </div>
            </div>

            {/* Sideloading Instructions */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-[#F58220]" />
                <span>How to Install the APK on Your Android Device:</span>
              </div>
              <ol className="space-y-1.5 text-slate-700 list-decimal list-inside text-[11px] leading-relaxed">
                <li>Click the <strong>&quot;Download qubits-solar.apk&quot;</strong> button above.</li>
                <li>When the download finishes, pull down your notification shade or open your <strong>Downloads</strong> folder.</li>
                <li>Tap <code>qubits-solar.apk</code> to install.</li>
                <li>If prompted with <em>&quot;Install unknown apps&quot;</em>, toggle <strong>&quot;Allow from this source&quot;</strong>.</li>
                <li>Tap <strong>Install</strong>. The Qubits Solar icon will appear on your home screen!</li>
              </ol>
            </div>

            {/* Google Play / AAB Note */}
            <div className="flex items-center justify-between text-[11px] text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span>Need Google Play Store package (.aab bundle)?</span>
              <a
                href={pwaBuilderUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#0B4F9C] hover:underline flex items-center gap-1 font-semibold"
              >
                <span>PWABuilder Cloud</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}

        {/* TAB 2: 1-Tap Instant WebAPK Install */}
        {activeTab === 'instant' && (
          <div className="space-y-4 text-xs">
            {isInstalled ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800">
                <CheckCircle2 className="w-6 h-6 shrink-0 text-emerald-600" />
                <div>
                  <div className="font-bold text-sm text-emerald-950">App Already Installed!</div>
                  <p className="text-xs text-emerald-700 mt-0.5">
                    Qubits Solar is already installed on your device in standalone mode.
                  </p>
                </div>
              </div>
            ) : isInstallable ? (
              <div className="p-5 bg-gradient-to-r from-blue-50 to-amber-50/60 border border-blue-200 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-[#0B4F9C] font-bold text-sm">
                  <Sparkles className="w-4 h-4 text-[#F58220]" />
                  <span>Direct Browser Installation Ready</span>
                </div>
                <p className="text-slate-600 leading-relaxed text-xs">
                  Your browser supports direct 1-tap installation. Clicking below installs Qubits Solar directly to your home screen with its dedicated app icon and offline capabilities.
                </p>
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="w-full py-3 px-5 rounded-xl bg-[#0B4F9C] hover:bg-[#003d80] text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20 transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Install Qubits Solar App Now</span>
                </button>
              </div>
            ) : isIOS ? (
              <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-[#0B4F9C]" />
                  <span>Install on iPhone / iPad (iOS Safari)</span>
                </div>
                <ol className="space-y-2 text-slate-700 list-decimal list-inside text-xs leading-relaxed">
                  <li>
                    Tap the <strong>Share button</strong> (square with arrow up) at the bottom of Safari.
                  </li>
                  <li>
                    Scroll down and select <strong>&quot;Add to Home Screen&quot;</strong>.
                  </li>
                  <li>
                    Tap <strong>Add</strong> in the top-right corner. The solar icon will appear on your home screen.
                  </li>
                </ol>
              </div>
            ) : (
              <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-[#0B4F9C]" />
                  <span>How to Install on Android Phone</span>
                </div>
                <ol className="space-y-2 text-slate-700 list-decimal list-inside text-xs leading-relaxed">
                  <li>
                    Open this URL in <strong>Google Chrome</strong> on your Android device.
                  </li>
                  <li>
                    Tap the <strong>three dots menu (⋮)</strong> in the top-right corner.
                  </li>
                  <li>
                    Select <strong>&quot;Install app&quot;</strong> or <strong>&quot;Add to Home screen&quot;</strong>.
                  </li>
                  <li>
                    Confirm install. Android will create an authentic <strong>WebAPK</strong> in your app drawer!
                  </li>
                </ol>
              </div>
            )}

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <div className="text-[11px] text-slate-600">
                <span className="font-semibold text-slate-900">Standalone Performance: </span>
                Zero app store bloat, takes &lt;2 MB storage, and loads instantaneously with offline caching.
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SCAN QR CODE WITH PHONE */}
        {activeTab === 'qr' && (
          <div className="space-y-4 text-xs text-center">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center space-y-4">
              <div className="p-3 bg-white rounded-2xl shadow-md border border-slate-200 flex items-center justify-center">
                <img
                  src={qrSvgUrl}
                  alt="Scan to download APK on Android"
                  className="w-44 h-44 rounded-lg block"
                />
              </div>

              <div className="space-y-1">
                <div className="font-bold text-sm text-slate-900">Scan with Android Camera</div>
                <p className="text-xs text-slate-600 max-w-xs mx-auto">
                  Scan this QR code to download the APK directly on your phone or install it in one tap.
                </p>
              </div>

              {/* Copy URL */}
              <div className="w-full max-w-sm flex items-center gap-2 pt-2">
                <input
                  type="text"
                  readOnly
                  value={appUrl}
                  className="flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-[11px] text-slate-700 truncate"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 bg-[#0B4F9C] hover:bg-[#003d80] text-white rounded-lg text-xs font-semibold flex items-center gap-1 shrink-0"
                >
                  {copied ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
          <span className="text-slate-600">
            Call: <a href={`tel:${COMPANY_DETAILS.phone}`} className="text-[#0B4F9C] font-semibold hover:underline">{COMPANY_DETAILS.phone}</a> | <a href={`tel:${COMPANY_DETAILS.alternatePhone}`} className="text-[#0B4F9C] font-semibold hover:underline">{COMPANY_DETAILS.alternatePhone}</a>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
