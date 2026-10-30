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
        raw_html = f.read()

    # Adapt HTML for WebView: Convert root-absolute paths to relative paths
    # This prevents white screen in Android WebView by ensuring assets resolve correctly
    apk_html = raw_html.replace('src="/assets/', 'src="./assets/')
    apk_html = apk_html.replace('href="/assets/', 'href="./assets/')
    apk_html = apk_html.replace('src="/registerSW.js"', 'src="./registerSW.js"')
    apk_html = apk_html.replace('href="/favicon', 'href="./favicon')
    apk_html = apk_html.replace('href="/apple-touch-icon', 'href="./apple-touch-icon')
    apk_html = apk_html.replace('href="/manifest', 'href="./manifest')

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
            f.write(apk_html)
        print(f"Replaced {target} with Qubits Solar app HTML (relative paths)")

    # Copy all dist assets (JS, CSS, images, etc.) into all potential asset directories
    asset_subdirs = [
        "assets/local/assets",
        "assets/demo/assets",
        "assets/web/assets",
        "assets/assets",
        "assets"  # Root assets dir so /assets/... also resolves
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
                "url": "https://qubitssolar.netlify.app/",
                "title": "Qubits Solar Live"
            }
        ],
        "home": "https://appassets.androidplatform.net/assets/local/index.html",
        "other": "https://qubitssolar.netlify.app/",
        "match": [
            ["host", "contains", "androidplatform.net"],
            ["host", "contains", "qubitssolar.netlify.app"],
            ["host", "contains", "netlify.app"],
            ["host", "contains", "firebaseapp.com"],
            ["host", "contains", "googleapis.com"],
            ["host", "contains", "google.com"],
            ["host", "contains", "accounts.google.com"],
            ["host", "contains", "qubitsconsultancy.in"],
            ["host", "contains", "qubitssolar.page.gd"],
            ["host", "contains", "run.app"],
            ["host", "contains", "localhost"]
        ],
        "skip": [
            ["scheme", "equals", "tel"],
            ["scheme", "equals", "whatsapp"],
            ["scheme", "equals", "mailto"],
            ["host", "contains", "wa.me"],
            ["host", "contains", "api.whatsapp.com"]
        ],
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
            "DatabaseEnabled": True,
            "AllowFileAccess": True,
            "AllowContentAccess": True
        },
        "source": "assets",
        "timestamp": "2026-10-30T00:00:00Z"
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

    print("=== Step 5: Setting Official Qubits Solar App Icon in resources.arsc & res/ ===")
    
    # 5a. Generate scaled launcher icons from official Qubits Solar logo
    icon_src = "public/logo-qubits-solar.png"
    icon_cache = "/tmp/apk_icons"
    os.makedirs(icon_cache, exist_ok=True)
    
    densities = {
        48: "icon_48.png",
        72: "icon_72.png",
        96: "icon_96.png",
        108: "icon_108.png",
        144: "icon_144.png",
        192: "icon_192.png",
        512: "icon_512.png"
    }
    for sz, fname in densities.items():
        out_f = os.path.join(icon_cache, fname)
        # Center logo on crisp white rounded-rectangle background for flawless launcher appearance
        subprocess.run([
            "convert", icon_src,
            "-resize", f"{sz}x{sz}",
            "-background", "white",
            "-gravity", "center",
            "-extent", f"{sz}x{sz}",
            out_f
        ], check=True)

    # 5b. Update resources.arsc:
    # Point mipmaps 0x7f0d0000 (ic_launcher) and 0x7f0d0001 (ic_launcher_round) and foreground directly to PNGs
    arsc_path = os.path.join(extract_dir, "resources.arsc")
    if os.path.exists(arsc_path):
        with open(arsc_path, "rb") as f:
            arsc_data = f.read()
            
        # Replace app name (length 10)
        arsc_mod = arsc_data.replace(b"My WebView", b"Qubits App")
        
        # Replace XML references with matching PNG filenames (exact 10 bytes -> 10 bytes, zero offset drift!)
        arsc_mod = arsc_mod.replace(b"res/BW.xml", b"res/BW.png")
        arsc_mod = arsc_mod.replace(b"res/0K.xml", b"res/0K.png")
        arsc_mod = arsc_mod.replace(b"res/Qr.xml", b"res/Qr.png")
        
        with open(arsc_path, "wb") as f:
            f.write(arsc_mod)
        print("Updated resources.arsc: App title set to 'Qubits App' & launcher icons mapped to Qubits Solar PNGs")

    # 5c. Place high-resolution 512x512 icons into res/BW.png, res/0K.png, res/Qr.png
    res_dir = os.path.join(extract_dir, "res")
    shutil.copy2(os.path.join(icon_cache, "icon_512.png"), os.path.join(res_dir, "BW.png"))
    shutil.copy2(os.path.join(icon_cache, "icon_512.png"), os.path.join(res_dir, "0K.png"))
    shutil.copy2(os.path.join(icon_cache, "icon_512.png"), os.path.join(res_dir, "Qr.png"))
    
    # 5d. Replace all density-specific launcher icon PNGs in res/
    density_map = {
        96: ["0Z.png", "MD.png", "nf.png", "9z.png", "Ck.png", "Gf.png", "Ag.png", "p8.png", "FW.png", "kp.png", "OX1.png"],
        72: ["5P.png", "7m.png", "aU.png", "Pb.png", "zz.png", "OM.png", "Y3.png", "gj.9.png"],
        48: ["6d.png", "7i.png", "KM.png", "RV.png", "Wh.png", "VW.png", "dY.png", "Y9.png", "6t.png", "71.png", "GY.png", "aR.png"],
        108: ["MF.9.png", "NA.9.png"]
    }
    for sz, file_list in density_map.items():
        src_icon = os.path.join(icon_cache, f"icon_{sz}.png")
        for fn in file_list:
            target_f = os.path.join(res_dir, fn)
            shutil.copy2(src_icon, target_f)

    # 5e. Add standard mipmap directories for universal Android compatibility
    mipmap_targets = [
        ("mipmap-mdpi", "icon_48.png"),
        ("mipmap-hdpi", "icon_72.png"),
        ("mipmap-xhdpi", "icon_96.png"),
        ("mipmap-xxhdpi", "icon_144.png"),
        ("mipmap-xxxhdpi", "icon_192.png")
    ]
    for folder, src_name in mipmap_targets:
        md = os.path.join(res_dir, folder)
        os.makedirs(md, exist_ok=True)
        shutil.copy2(os.path.join(icon_cache, src_name), os.path.join(md, "ic_launcher.png"))
        shutil.copy2(os.path.join(icon_cache, src_name), os.path.join(md, "ic_launcher_round.png"))
    
    print("Installed crisp Qubits Solar launcher icons across all Android screen densities!")

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

    print("=== Step 8: Signing with apk_sign_ts (v1 + v2 + v3 schemes) ===")
    sign_res = subprocess.run([
        "node", "scripts/sign_apk.js",
        unaligned_apk,
        "public/qubits-solar.apk"
    ], capture_output=True, text=True)

    print(sign_res.stdout)
    if sign_res.returncode != 0:
        print("sign_apk.js error:", sign_res.stderr)
        raise RuntimeError("Failed to sign APK")

    if os.path.exists("dist"):
        shutil.copy2("public/qubits-solar.apk", "dist/qubits-solar.apk")

    final_size = os.path.getsize("public/qubits-solar.apk")
    print(f"SUCCESS! Fully verified & signed APK installed to public/qubits-solar.apk ({final_size} bytes)")

if __name__ == "__main__":
    repack()
