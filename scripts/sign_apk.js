import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { ApkSigner, SigningKey } from 'apk_sign_ts';

const __filename = fileURLToPath(import.meta.url);

/**
 * Loads or ephemerally generates signing credentials.
 * CRITICAL SECURITY: Never stores private keys inside the project repository.
 */
function getSigningCredentials() {
  // Option 1: Provided via environment variables (CI/CD or production pipeline)
  if (process.env.APK_SIGNING_KEY && process.env.APK_SIGNING_CERT) {
    return {
      privateKey: process.env.APK_SIGNING_KEY,
      certificate: process.env.APK_SIGNING_CERT,
    };
  }

  // Option 2: Provided via external secure path outside the repo
  if (process.env.APK_KEY_PATH && process.env.APK_CERT_PATH) {
    if (fs.existsSync(process.env.APK_KEY_PATH) && fs.existsSync(process.env.APK_CERT_PATH)) {
      return {
        privateKey: fs.readFileSync(process.env.APK_KEY_PATH, 'utf8'),
        certificate: fs.readFileSync(process.env.APK_CERT_PATH, 'utf8'),
      };
    }
  }

  // Option 3: Ephemeral isolated generation in /tmp (completely outside project workspace)
  const tmpKey = '/tmp/qubits_signing_key.pem';
  const tmpCert = '/tmp/qubits_signing_cert.pem';

  if (!fs.existsSync(tmpKey) || !fs.existsSync(tmpCert)) {
    console.log('[APK Signer] Generating ephemeral build key in /tmp (isolated from repo)...');
    execSync(
      `openssl req -x509 -newkey rsa:2048 -keyout "${tmpKey}" -out "${tmpCert}" -days 1000 -nodes -subj "/CN=Qubits Solar/O=Qubits/C=IN" 2>/dev/null`
    );
  }

  return {
    privateKey: fs.readFileSync(tmpKey, 'utf8'),
    certificate: fs.readFileSync(tmpCert, 'utf8'),
  };
}

export async function signApkFile(inputApkPath, outputApkPath) {
  const { privateKey, certificate } = getSigningCredentials();

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
      if (fs.existsSync('dist')) {
        fs.copyFileSync(output, 'dist/qubits-solar.apk');
      }
    })
    .catch((err) => {
      console.error('[APK Signer Error]:', err);
      process.exit(1);
    });
}
