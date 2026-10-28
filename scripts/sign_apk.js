import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ApkSigner, SigningKey } from 'apk_sign_ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function signApkFile(inputApkPath, outputApkPath) {
  const keyPath = path.join(__dirname, 'qubits_release_key.pem');
  const certPath = path.join(__dirname, 'qubits_release_cert.pem');

  if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
    throw new Error('Signing keys not found in scripts directory.');
  }

  const privateKey = fs.readFileSync(keyPath, 'utf8');
  const certificate = fs.readFileSync(certPath, 'utf8');

  const signingKey = SigningKey.fromPEM(privateKey, certificate);
  const signer = new ApkSigner({
    signingKey,
    jarKeyName: 'CERT',
    digestAlgorithm: 'SHA-256',
  });

  const apkBuffer = new Uint8Array(fs.readFileSync(inputApkPath));
  console.log(`[APK Signer] Signing APK (${apkBuffer.length} bytes)...`);

  const { signedApk } = await signer.sign(apkBuffer);

  fs.writeFileSync(outputApkPath, signedApk);
  console.log(`[APK Signer] Successfully signed APK with v1 + v2 + v3 schemes! (${signedApk.length} bytes) Saved to: ${outputApkPath}`);
}

// Standalone execution
if (process.argv[1] === __filename) {
  const input = process.argv[2] || '/tmp/qubits-solar-unaligned.apk';
  const output = process.argv[3] || 'public/qubits-solar.apk';
  signApkFile(input, output)
    .then(() => {
      // Also copy to dist if present
      if (fs.existsSync('dist')) {
        fs.copyFileSync(output, 'dist/qubits-solar.apk');
      }
    })
    .catch((err) => {
      console.error('[APK Signer Error]:', err);
      process.exit(1);
    });
}
