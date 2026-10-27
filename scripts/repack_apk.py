import os
import shutil
import zipfile
import subprocess
import json

def repack():
    print("=== Step 1: Extracting base APK ===")
    extract_dir = "/tmp/apk_extracted"
    if os.path.exists(extract_dir):
        shutil.rmtree(extract_dir)
    os.makedirs(extract_dir, exist_ok=True)

    with zipfile.ZipFile("public/qubits-solar.apk", "r") as z:
        z.extractall(extract_dir)

    print("=== Step 2: Removing old signature files in META-INF ===")
    meta_inf = os.path.join(extract_dir, "META-INF")
    if os.path.exists(meta_inf):
        for f in os.listdir(meta_inf):
            if f.endswith((".SF", ".RSA", ".DSA", ".EC", ".MF")):
                os.remove(os.path.join(meta_inf, f))
                print(f"Removed signature: {f}")

    print("=== Step 2b: Patching AndroidManifest.xml minSdkVersion ===")
    manifest_path = os.path.join(extract_dir, "AndroidManifest.xml")
    if os.path.exists(manifest_path):
        with open(manifest_path, "rb") as f:
            m_data = bytearray(f.read())
        if len(m_data) > 5296 and m_data[5296] == 31:
            m_data[5296] = 24
            with open(manifest_path, "wb") as f:
                f.write(m_data)
            print("Successfully patched minSdkVersion to 24 (Android 7.0+)")

    print("=== Step 3: Injecting compiled React application ===")
    dist_dir = "dist"
    with open(os.path.join(dist_dir, "index.html"), "r") as f:
        html_content = f.read()

    # Targets to replace with Qubits Solar App
    html_targets = [
        "assets/local/index.html",
        "assets/demo/index.html",
        "assets/web/index.html",
        "assets/index.html"
    ]

    for target in html_targets:
        target_path = os.path.join(extract_dir, target)
        os.makedirs(os.path.dirname(target_path), exist_ok=True)
        with open(target_path, "w") as f:
            f.write(html_content)
        print(f"Replaced {target} with Qubits Solar app HTML")

    # Copy all dist assets (JS, CSS, images, etc.) into various asset subdirs
    asset_subdirs = [
        "assets/local/assets",
        "assets/demo/assets",
        "assets/web/assets",
        "assets/assets"
    ]

    dist_assets_dir = os.path.join(dist_dir, "assets")
    if os.path.exists(dist_assets_dir):
        for item in os.listdir(dist_assets_dir):
            src_file = os.path.join(dist_assets_dir, item)
            for sub in asset_subdirs:
                dest_item = os.path.join(extract_dir, sub, item)
                if os.path.isdir(src_file):
                    if os.path.exists(dest_item):
                        shutil.rmtree(dest_item)
                    shutil.copytree(src_file, dest_item)
                elif os.path.isfile(src_file):
                    os.makedirs(os.path.dirname(dest_item), exist_ok=True)
                    shutil.copy2(src_file, dest_item)
        print("Copied all JS, CSS, and asset subdirectories to APK asset directories")

    # Copy standalone root assets (icons, manifest, etc.)
    root_items = [
        "icon.svg",
        "apple-touch-icon.png",
        "pwa-192x192.png",
        "pwa-512x512.png",
        "pwa-maskable-512x512.png",
        "manifest.json",
        "manifest.webmanifest",
        "registerSW.js",
        "logo-qubits-solar.png",
        "logo-qubits-consultancy.png",
        "favicon.png",
        "favicon.ico"
    ]
    for item in root_items:
        src = os.path.join(dist_dir, item)
        if os.path.exists(src):
            for dest_sub in ["assets/local", "assets/demo", "assets/web", "assets"]:
                d = os.path.join(extract_dir, dest_sub)
                os.makedirs(d, exist_ok=True)
                shutil.copy2(src, os.path.join(d, item))
    print("Copied root icons, manifest, and logos into APK")

    print("=== Step 4: Configuring settings.json & config.json ===")
    settings = {
        "sites": [
            {
                "url": "https://appassets.androidplatform.net/assets/local/index.html",
                "title": "Qubits Solar"
            },
            {
                "url": "https://ais-pre-4whkmgdxijh26u76pt2iah-18167358342.asia-southeast1.run.app",
                "title": "Qubits Solar Online"
            }
        ],
        "home": "https://appassets.androidplatform.net/assets/local/index.html",
        "other": "https://ais-pre-4whkmgdxijh26u76pt2iah-18167358342.asia-southeast1.run.app",
        "match": [
            ["host", "contains", "androidplatform.net"],
            ["host", "contains", "run.app"],
            ["host", "contains", "qubitsconsultancy.in"],
            ["host", "contains", "localhost"]
        ],
        "skip": [],
        "remote_debug": True,
        "console_log": True,
        "js_interface": True,
        "context_menu": False,
        "not_matching": False,
        "local_sites": True,
        "update_zip": "",
        "web_settings": {
            "JavaScriptEnabled": True,
            "DomStorageEnabled": True,
            "DatabaseEnabled": True
        },
        "source": "assets",
        "timestamp": "2026-10-26T00:00:00Z"
    }

    with open(os.path.join(extract_dir, "assets/settings.json"), "w") as f:
        json.dump(settings, f, indent=2)

    config = {
        "sites": {
            "local/index.html": "Qubits Solar"
        },
        "bundles": [],
        "prefix": "https://appassets.androidplatform.net/assets/"
    }

    with open(os.path.join(extract_dir, "assets/local/config.json"), "w") as f:
        json.dump(config, f, indent=2)

    print("=== Step 5: Updating resources.arsc string ===")
    arsc_path = os.path.join(extract_dir, "resources.arsc")
    if os.path.exists(arsc_path):
        with open(arsc_path, "rb") as f:
            arsc_data = f.read()
        # "My WebView" has length 10. Replace with "Qubits App" (length 10)
        arsc_mod = arsc_data.replace(b"My WebView", b"Qubits App")
        with open(arsc_path, "wb") as f:
            f.write(arsc_mod)
        print("Updated app title in resources.arsc to Qubits App")

    print("=== Step 6: Packing unaligned APK ===")
    unaligned_apk = "/tmp/qubits-solar-unaligned.apk"
    if os.path.exists(unaligned_apk):
        os.remove(unaligned_apk)

    # Build ZIP archive
    with zipfile.ZipFile(unaligned_apk, "w") as z_out:
        for root, dirs, files in os.walk(extract_dir):
            for file in sorted(files):
                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, extract_dir)
                
                # Uncompressed files per Android packaging standards
                if rel_path.endswith((".so", ".arsc", ".png")):
                    z_out.write(full_path, rel_path, compress_type=zipfile.ZIP_STORED)
                else:
                    z_out.write(full_path, rel_path, compress_type=zipfile.ZIP_DEFLATED)

    print(f"Packed unaligned APK: {os.path.getsize(unaligned_apk)} bytes")

    print("=== Step 7: Running zipalign ===")
    aligned_apk = "/tmp/qubits-solar-aligned.apk"
    if os.path.exists(aligned_apk):
        os.remove(aligned_apk)

    zipalign_bin = shutil.which("zipalign")
    if zipalign_bin:
        res = subprocess.run([zipalign_bin, "-f", "-p", "4", unaligned_apk, aligned_apk], capture_output=True, text=True)
        if res.returncode != 0:
            print("zipalign stderr:", res.stderr)
            shutil.copy2(unaligned_apk, aligned_apk)
    else:
        print("zipalign not installed, skipping alignment...")
        shutil.copy2(unaligned_apk, aligned_apk)
    print(f"Ready APK: {os.path.getsize(aligned_apk)} bytes")

    print("=== Step 8: Signing with apksigner ===")
    keystore = "/tmp/release.keystore"
    keytool_bin = shutil.which("keytool")
    if keytool_bin and not os.path.exists(keystore):
        print("Generating new release keystore...")
        try:
            subprocess.run([
                keytool_bin, "-genkeypair", "-v",
                "-keystore", keystore,
                "-alias", "qubits-solar",
                "-keyalg", "RSA",
                "-keysize", "2048",
                "-validity", "10000",
                "-storepass", "qubits123",
                "-keypass", "qubits123",
                "-dname", "CN=Qubits Solar, O=Qubits Consultancy, C=IN"
            ], check=True, capture_output=True)
            print("Keystore generated at", keystore)
        except Exception as e:
            print("Keystore generation error:", e)

    apksigner_bin = shutil.which("apksigner")
    if apksigner_bin:
        res = subprocess.run([
            apksigner_bin, "sign",
            "--ks", keystore,
            "--ks-key-alias", "qubits-solar",
            "--ks-pass", "pass:qubits123",
            "--key-pass", "pass:qubits123",
            "--v1-signing-enabled", "true",
            "--v2-signing-enabled", "true",
            "--v3-signing-enabled", "true",
            aligned_apk
        ], capture_output=True, text=True)
        if res.returncode != 0:
            print("apksigner stderr:", res.stderr)
        else:
            print("=== Step 9: Verifying signature ===")
            ver = subprocess.run([apksigner_bin, "verify", "-v", aligned_apk], capture_output=True, text=True)
            print("Verification result:\n", ver.stdout)
    else:
        print("apksigner not found, using packed bundle...")

    print("=== Step 10: Copying final signed APK ===")
    shutil.copy2(aligned_apk, "public/qubits-solar.apk")
    shutil.copy2(aligned_apk, "dist/qubits-solar.apk")
    final_size = os.path.getsize("public/qubits-solar.apk")
    print(f"SUCCESS! Signed APK installed to public/qubits-solar.apk ({final_size} bytes)")

if __name__ == "__main__":
    repack()
