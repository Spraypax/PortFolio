"""Re-export the editable master without rebuilding/overwriting manual model edits.

blender -b --factory-startup --disable-autoexec --python scripts/psp/export_saved.py
Add -- --check to validate the source and coordinates without writing or rendering.
"""

import os
import sys
from pathlib import Path
import bpy

ROOT = Path(__file__).resolve().parents[2]
sys.dont_write_bytecode = True
sys.path.insert(0, str(Path(__file__).resolve().parent))
from render_layers import write_layout, export_layers

cache = ROOT / ".verification/optix"
cache.mkdir(parents=True, exist_ok=True)
os.environ["OPTIX_CACHE_PATH"] = str(cache)
bpy.ops.wm.open_mainfile(
    filepath=str(ROOT / "assets-source/psp/PSP-portfolio.blend"),
    load_ui=False,
    use_scripts=False,
)
scene = bpy.context.scene
controls = {}
for obj in bpy.data.objects:
    key = obj.get("psp_control")
    if key:
        controls.setdefault(key, []).append(obj)
if len(controls) != 13:
    raise ValueError("The source must contain all 13 tagged PSP controls.")
scene.render.resolution_percentage = 100
output = ROOT / "src/assets/images/psp"
manifest = write_layout(scene, output, controls, persist="--check" not in sys.argv)
print(
    "SOURCE_VALIDATED:",
    len(controls),
    "controls;",
    manifest["screen"]["corners"],
    flush=True,
)
if "--check" not in sys.argv:
    # CPU works everywhere; optionally enable the saved OPTIX device when available.
    scene.cycles.device = "CPU"
    if "--cpu" not in sys.argv:
        try:
            prefs = bpy.context.preferences.addons["cycles"].preferences
            prefs.compute_device_type = "OPTIX"
            prefs.get_devices()
            devices = [d for d in prefs.devices if d.type == "OPTIX"]
            if devices:
                for device in prefs.devices:
                    device.use = device in devices
                scene.cycles.device = "GPU"
        except Exception:
            pass
    export_layers(scene, output, controls)
