"""Adapt aXel's supplied PSP, retaining meshes/UVs, then render fixed 2.5D layers.

blender -b --factory-startup --disable-autoexec --python scripts/psp/build_scene.py -- --preview
Omit --preview to save the editable scene and export all production layers.
"""

import bpy, math, os, sys
from pathlib import Path
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[2]
sys.dont_write_bytecode = True
sys.path.insert(0, str(Path(__file__).resolve().parent))
from render_layers import write_layout, render, export_layers

SOURCE = ROOT / "assets-source/psp"
OUT = ROOT / "src/assets/images/psp"
(OUT / "buttons").mkdir(parents=True, exist_ok=True)
(ROOT / ".verification/optix").mkdir(parents=True, exist_ok=True)
os.environ["OPTIX_CACHE_PATH"] = str(ROOT / ".verification/optix")
PREVIEW = "--preview" in sys.argv
SIZE = (1620, 698)
bpy.ops.wm.open_mainfile(
    filepath=str(SOURCE / "PSP-original.blend"), load_ui=False, use_scripts=False
)
s = bpy.context.scene
s.render.engine = "CYCLES"
s.cycles.samples = 24 if PREVIEW else 48
s.cycles.use_denoising = True
if "--cpu" not in sys.argv:
    try:
        prefs = bpy.context.preferences.addons["cycles"].preferences
        prefs.compute_device_type = "OPTIX"
        prefs.get_devices()
        devices = [d for d in prefs.devices if d.type == "OPTIX"]
        if devices:
            for d in prefs.devices:
                d.use = d in devices
            s.cycles.device = "GPU"
    except Exception:
        pass  # Blender without a compatible GPU uses the CPU renderer.
s.render.resolution_x, s.render.resolution_y = SIZE
s.render.resolution_percentage = 65 if PREVIEW else 100
s.render.film_transparent = True
s.render.image_settings.file_format = "WEBP"
s.render.image_settings.color_mode = "RGBA"
s.render.image_settings.quality = 95
s.use_nodes = False
s.view_settings.view_transform = "AgX"
s.world.use_nodes = True
s.world.node_tree.nodes.clear()
bg = s.world.node_tree.nodes.new("ShaderNodeBackground")
bg.inputs["Color"].default_value = (0.20, 0.24, 0.34, 1)
bg.inputs["Strength"].default_value = 0.35
wo = s.world.node_tree.nodes.new("ShaderNodeOutputWorld")
s.world.node_tree.links.new(bg.outputs[0], wo.inputs["Surface"])

# Drop only the old studio, floor and cameras. Original PSP geometry is retained.
for o in list(bpy.data.objects):
    if o.type in ("LIGHT", "CAMERA") or o.name in (
        "Floor",
        "Plane.001",
        "Plane.002",
        "Plane.006",
        "Plane.007",
        "Cube.002",
    ):
        bpy.data.objects.remove(o, do_unlink=True)
root = bpy.data.collections.new("PSP_ROOT")
s.collection.children.link(root)
groups = {
    name: bpy.data.collections.new(name)
    for name in (
        "BODY",
        "SCREEN",
        "DPAD",
        "ACTION_BUTTONS",
        "SYSTEM_BUTTONS",
        "ANALOG",
        "REFLECTIONS",
        "SHADOWS",
        "STUDIO",
    )
}
for c in groups.values():
    root.children.link(c)


def group(o, name):
    for c in list(o.users_collection):
        c.objects.unlink(o)
    groups[name].objects.link(o)


# Bake original object transforms so all edits/pressed travel share world axes.
for o in list(bpy.data.objects):
    if o.type == "MESH":
        o.data.transform(o.matrix_world)
        o.matrix_world.identity()
        for mod in o.modifiers:
            if mod.type == "SUBSURF":
                mod.levels = 3
                mod.render_levels = 3
        for p in o.data.polygons:
            p.use_smooth = True
        group(o, "BODY")


def pbr(name, color, rough=0.26, metal=0, texture=None):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    n = m.node_tree.nodes
    n.clear()
    links = m.node_tree.links
    out = n.new("ShaderNodeOutputMaterial")
    bs = n.new("ShaderNodeBsdfPrincipled")
    bs.inputs["Base Color"].default_value = (*color, 1)
    bs.inputs["Roughness"].default_value = rough
    bs.inputs["Metallic"].default_value = metal
    bs.inputs["Coat Weight"].default_value = 0.24
    bs.inputs["Coat Roughness"].default_value = 0.22
    links.new(bs.outputs["BSDF"], out.inputs["Surface"])
    if texture:
        # Preserve original UV inscriptions: red background -> graphite,
        # white details -> cool silver. This changes the material, not the render.
        im = n.new("ShaderNodeTexImage")
        im.image = bpy.data.images[texture]
        sep = n.new("ShaderNodeSeparateColor")
        links.new(im.outputs["Color"], sep.inputs["Color"])
        ramp = n.new("ShaderNodeValToRGB")
        ramp.color_ramp.elements[0].position = 0.025
        ramp.color_ramp.elements[0].color = (*color, 1)
        ramp.color_ramp.elements[1].position = 0.7
        ramp.color_ramp.elements[1].color = (0.48, 0.64, 0.83, 1)
        links.new(sep.outputs["Green"], ramp.inputs[0])
        links.new(ramp.outputs[0], bs.inputs["Base Color"])
    noise = n.new("ShaderNodeTexNoise")
    noise.inputs["Scale"].default_value = 240
    bump = n.new("ShaderNodeBump")
    bump.inputs["Strength"].default_value = 0.10
    bump.inputs["Distance"].default_value = 0.002
    links.new(noise.outputs["Fac"], bump.inputs["Height"])
    links.new(bump.outputs["Normal"], bs.inputs["Normal"])
    return m


shell = pbr(
    "Graphite / original UV silver legends",
    (0.002, 0.003, 0.005),
    0.26,
    0.05,
    "bodyuv4.png",
)
shell.node_tree.nodes.get("Principled BSDF").inputs["Coat Weight"].default_value = 0.06
shell.node_tree.nodes.get("Principled BSDF").inputs[
    "Specular IOR Level"
].default_value = 0.24
black = pbr("Satin black recesses", (0.004, 0.006, 0.009), 0.4)
chrome = pbr(
    "Polished silver / blue studio reflections", (0.48, 0.57, 0.68), 0.22, 0.93
)
edge = pbr("Smoked shoulder chrome", (0.10, 0.14, 0.21), 0.20, 0.72)
button = pbr(
    "Black buttons / ice blue original symbols",
    (0.008, 0.012, 0.019),
    0.25,
    0.15,
    "buttonuv3.png",
)
dpadmat = pbr(
    "Black directional pad / original symbols",
    (0.006, 0.009, 0.014),
    0.3,
    0.05,
    "pspuv3.png",
)
analogmat = pbr(
    "Textured analog rubber", (0.003, 0.005, 0.008), 0.7, 0, "dbuttonuv.png"
)
maps = {
    "Material.001": shell,
    "border": chrome,
    "Chrome": chrome,
    "Material.002": edge,
    "buttons": button,
    "dpad": dpadmat,
    "dbutton": analogmat,
    "home": pbr("Home legend", (0.005, 0.008, 0.014), 0.32, 0, "homeuv.png"),
    "start": pbr("Start legend", (0.005, 0.008, 0.014), 0.32, 0, "startuv.png"),
    "select": pbr("Select legend", (0.005, 0.008, 0.014), 0.32, 0, "selectuv.png"),
    "otherbuttons": pbr(
        "System legends", (0.005, 0.008, 0.014), 0.3, 0, "otherbuttonsuv.png"
    ),
}
for o in bpy.data.objects:
    if o.type == "MESH":
        for slot in o.material_slots:
            if slot.material and slot.material.name in maps:
                slot.material = maps[slot.material.name]
for name in ("Circle.001", "Circle.002"):
    bpy.data.objects[name].data.materials.clear()
    bpy.data.objects[name].data.materials.append(black)

# Expand the central display area, proportionately compressing the side wings.
cx = -0.4218878


def widen(x):
    left, right = -1.6100945, 0.7663189
    if left <= x <= right:
        return cx + (x - cx) * 1.12
    if x < left:
        return (cx + (left - cx) * 1.12) + (x - left) * 0.87
    return (cx + (right - cx) * 1.12) + (x - right) * 0.87


for o in bpy.data.objects:
    if o.type == "MESH":
        for v in o.data.vertices:
            v.co.x = widen(v.co.x)

body = bpy.data.objects["body"]
body.name = "MainShell"
screen = bpy.data.objects["screen"]
screen.name = "ScreenOpening"
group(screen, "SCREEN")
screen_corners = [
    Vector((widen(x), -0.308, z))
    for x, z in [
        (-1.6100945, 1.6723446),
        (0.7663189, 1.6723446),
        (0.7663189, 0.308565),
        (-1.6100945, 0.308565),
    ]
]

# Holdout masks the complete display opening even where rear geometry lies behind.
hold = bpy.data.materials.new("Screen aperture holdout")
hold.use_nodes = True
hold.node_tree.nodes.clear()
hn = hold.node_tree.nodes.new("ShaderNodeHoldout")
ho = hold.node_tree.nodes.new("ShaderNodeOutputMaterial")
hold.node_tree.links.new(hn.outputs[0], ho.inputs["Surface"])
for slot in body.material_slots:
    if slot.material and slot.material.name == "screen":
        slot.material = hold
screen.data.materials.clear()
screen.data.materials.append(hold)
for v in screen.data.vertices:
    v.co.y = -0.309


def curve(name, coords, material, radius=0.006, category="BODY", closed=False):
    d = bpy.data.curves.new(name, "CURVE")
    d.dimensions = "3D"
    d.resolution_u = 16
    d.bevel_depth = radius
    d.bevel_resolution = 3
    sp = d.splines.new("POLY")
    sp.points.add(len(coords) - 1)
    for p, co in zip(sp.points, coords):
        p.co = (*co, 1)
    sp.use_cyclic_u = closed
    o = bpy.data.objects.new(name, d)
    groups[category].objects.link(o)
    d.materials.append(material)
    return o


# Physical raised chrome trim follows the original perimeter (not a screen-space stroke).
# Mesh silhouette boundary at its frontmost contour, sampled from evaluated original body.
dg = bpy.context.evaluated_depsgraph_get()
ev = body.evaluated_get(dg)
mesh = ev.to_mesh()
verts = [v.co.copy() for v in mesh.vertices]
contour = []
for i in range(160):
    a = 2 * math.pi * i / 160
    direction = Vector((math.cos(a), 0, math.sin(a)))
    # Radial support is smooth and follows the original shell's rounded outline.
    p = max(verts, key=lambda v: (v.x - cx) * direction.x + (v.z - 0.95) * direction.z)
    if not contour or (p - contour[-1]).length > 0.001:
        contour.append(Vector((p.x, -0.257, p.z)))
ev.to_mesh_clear()
curve("ChromeEdges / front seam", contour, chrome, 0.009, closed=True)
curve(
    "ChromeEdges / rear seam",
    [(v.x, 0.028, v.z) for v in contour],
    chrome,
    0.008,
    closed=True,
)
# Recess rim around LCD from its exact original opening dimensions.
curve(
    "ScreenFrame / inset silver lip",
    [(v.x, -0.311, v.z) for v in screen_corners],
    edge,
    0.009,
    closed=True,
)


def split_loose(obj):
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.mode_set(mode="EDIT")
    bpy.ops.mesh.select_all(action="SELECT")
    bpy.ops.mesh.separate(type="LOOSE")
    bpy.ops.object.mode_set(mode="OBJECT")
    return list(bpy.context.selected_objects)


def center(obj):
    vs = [v.co for v in obj.data.vertices]
    return sum(vs, Vector()) / len(vs)


controls = {}
parts = split_loose(bpy.data.objects["buttons"])
centers = [center(o) for o in parts]
avg = sum(centers, Vector()) / len(centers)
for o, p in zip(parts, centers):
    dx, dz = p.x - avg.x, p.z - avg.z
    key = (
        ("circle" if dx > 0 else "square")
        if abs(dx) > abs(dz)
        else ("triangle" if dz > 0 else "cross")
    )
    o.name = key
    group(o, "ACTION_BUTTONS")
    controls[key] = [o]
parts = split_loose(bpy.data.objects["dpad"])
avg = sum([center(o) for o in parts], Vector()) / len(parts)
for o in parts:
    p = center(o)
    dx, dz = p.x - avg.x, p.z - avg.z
    key = (
        ("right" if dx > 0 else "left")
        if abs(dx) > abs(dz)
        else ("up" if dz > 0 else "down")
    )
    o.name = "dpad-" + key
    group(o, "DPAD")
    controls[key] = [o]
for name, key in [
    ("Plane.004", "home"),
    ("Plane.005", "start"),
    ("Plane.008", "select"),
]:
    o = bpy.data.objects[name]
    o.name = key
    group(o, "SYSTEM_BUTTONS")
    controls[key] = [o]
parts = sorted(split_loose(bpy.data.objects["Circle.005"]), key=lambda o: center(o).x)
for i, o in enumerate(parts):
    key = ["volume-down", "volume-up", "display", "note"][min(i, 3)]
    o.name = key
    group(o, "SYSTEM_BUTTONS")
    if i < 2:
        controls[key] = [o]
analog = bpy.data.objects["Circle"]
analog.name = "Analog"
group(analog, "ANALOG")

# The old 2.61 shell UVs lose the tiny legends when subdivided in modern Blender.
# Restore them as planar printed details, using the supplied texture's PS mark
# and editable type/curves for the other labels.
ink = pbr("Cool silver printed legends", (0.48, 0.59, 0.73), 0.5, 0.15)


def label(name, text, x, z, size, material=ink, owner=None, font=None):
    d = bpy.data.curves.new(name, "FONT")
    d.body = text
    d.align_x = "CENTER"
    d.align_y = "CENTER"
    d.size = size
    d.extrude = 0
    if font:
        d.font = font
    o = bpy.data.objects.new(name, d)
    groups["BODY"].objects.link(o)
    o.location = (x, -0.345, z)
    o.rotation_euler = (math.pi / 2, 0, 0)
    d.materials.append(material)
    if owner:
        controls[owner].append(o)
    return o


sonyfont = (
    bpy.data.fonts.load("C:/Windows/Fonts/timesbd.ttf")
    if Path("C:/Windows/Fonts/timesbd.ttf").exists()
    else None
)
label("SONY print", "SONY", widen(1.14), 1.55, 0.105, font=sonyfont)
for key, text in [("home", "⌂"), ("start", "START"), ("select", "SELECT")]:
    p = center(controls[key][0])
    label(key + " print", text, p.x, p.z, 0.034 if key != "home" else 0.055, owner=key)
label("Volume print", "VOL", widen(-1.07), 0.153, 0.030)
label("Power print", "POWER", widen(1.43), 0.43, 0.024)
label("Hold print", "HOLD", widen(1.43), 0.31, 0.024)
paths = [
    [(0, 0.065), (0.125, 0.065), (0.125, 0.025), (0, 0.025), (0, -0.025)],
    [(0.165, -0.025), (0.23, -0.025), (0.23, 0.065), (0.355, 0.065)],
    [(0.39, 0.065), (0.515, 0.065), (0.515, 0.025), (0.39, 0.025), (0.39, -0.025)],
]
for i, path in enumerate(paths):
    curve(
        "PSP engraved logo " + str(i),
        [(cx - 0.257 + x, -0.334, 0.16 + z) for x, z in path],
        ink,
        0.003,
    )
# PS mark copied directly by UV coordinates from the supplied, packed texture.
dm = bpy.data.materials.new("Original PS decal")
dm.use_nodes = True
dn = dm.node_tree.nodes
dn.clear()
dl = dm.node_tree.links
di = dn.new("ShaderNodeTexImage")
di.image = bpy.data.images["bodyuv4.png"]
ds = dn.new("ShaderNodeSeparateColor")
dl.new(di.outputs["Color"], ds.inputs[0])
dr = dn.new("ShaderNodeMath")
dr.operation = "GREATER_THAN"
dr.inputs[1].default_value = 0.45
dl.new(ds.outputs["Green"], dr.inputs[0])
dt = dn.new("ShaderNodeBsdfTransparent")
dp = dn.new("ShaderNodeBsdfPrincipled")
dp.inputs["Base Color"].default_value = (0.48, 0.59, 0.73, 1)
dp.inputs["Roughness"].default_value = 0.5
dx = dn.new("ShaderNodeMixShader")
do = dn.new("ShaderNodeOutputMaterial")
dl.new(dr.outputs[0], dx.inputs[0])
dl.new(dt.outputs[0], dx.inputs[1])
dl.new(dp.outputs[0], dx.inputs[2])
dl.new(dx.outputs[0], do.inputs[0])
mx = widen(-2.02)
mz = 1.58
dd = bpy.data.meshes.new("PS print plane")
dd.from_pydata(
    [
        (mx - 0.072, -0.332, mz - 0.06),
        (mx + 0.072, -0.332, mz - 0.06),
        (mx + 0.072, -0.332, mz + 0.06),
        (mx - 0.072, -0.332, mz + 0.06),
    ],
    [],
    [(0, 1, 2, 3)],
)
uv = dd.uv_layers.new()
coords = [(0.119, 0.55), (0.157, 0.55), (0.157, 0.62), (0.119, 0.62)]
for lp in dd.loops:
    uv.data[lp.index].uv = coords[lp.vertex_index]
decal = bpy.data.objects.new("Original PlayStation print", dd)
groups["BODY"].objects.link(decal)
dd.materials.append(dm)
for x, z in [
    (widen(-1.78), 1.54),
    (widen(0.98), 1.46),
    (widen(-2.27), 0.58),
    (widen(1.50), 0.53),
]:
    bpy.ops.mesh.primitive_uv_sphere_add(
        segments=20, ring_count=8, radius=1, location=(x, -0.323, z)
    )
    o = bpy.context.object
    o.name = "Speaker recess"
    o.scale = (0.031, 0.004, 0.022)
    o.data.materials.append(black)
    group(o, "BODY")

# Fine joystick knurling is real geometry and catches the studio light.
ap = center(analog)
for i in range(-7, 8):
    for j in range(-7, 8):
        dx, dz = i * 0.015, j * 0.015
        if dx * dx + dz * dz < 0.011:
            bpy.ops.mesh.primitive_uv_sphere_add(
                segments=6,
                ring_count=4,
                radius=0.0035,
                location=(ap.x + dx, -0.351, ap.z + dz),
            )
            o = bpy.context.object
            o.name = "Analog knurl"
            o.data.materials.append(black)
            group(o, "ANALOG")

camdata = bpy.data.cameras.new("Fixed reference camera")
cam = bpy.data.objects.new("Fixed reference camera", camdata)
groups["STUDIO"].objects.link(cam)
target = Vector((cx, -0.308, 0.98884))
# Least-squares calibration against the four display corners of the 810x349 reference.
yaw, pitch = 0.306981733, -0.293234740
cam.location = (
    target
    + Vector(
        (
            math.sin(yaw) * math.cos(pitch),
            -math.cos(yaw) * math.cos(pitch),
            math.sin(pitch),
        )
    )
    * 12
)
cam.rotation_euler = (target - cam.location).to_track_quat("-Z", "Y").to_euler()
cam.rotation_euler.rotate_axis("Z", 0.144347704)
camdata.type = "PERSP"
camdata.lens = 99.15277
camdata.sensor_width = 36
camdata.shift_x = -0.00763959
camdata.shift_y = -0.02869039
camdata.dof.use_dof = False
cam.lock_location = (True, True, True)
cam.lock_rotation = (True, True, True)
cam.lock_scale = (True, True, True)
s.camera = cam


def light(name, loc, energy, size, color, target=(-0.36, 0, 0.95), size_y=None):
    d = bpy.data.lights.new(name, "AREA")
    d.energy = energy
    d.color = color
    d.shape = "RECTANGLE"
    d.size = size
    d.size_y = size_y or size
    o = bpy.data.objects.new(name, d)
    groups["STUDIO"].objects.link(o)
    o.location = loc
    o.rotation_euler = (Vector(target) - o.location).to_track_quat("-Z", "Y").to_euler()


light("Softbox / silver key", (-3, -4, 6), 440, 5, (0.78, 0.86, 1), size_y=2)
light("Blue rim", (-3, 1, 2.8), 340, 3, (0.19, 0.40, 1), size_y=1)
light("Violet edge", (3, 0.3, 3), 230, 3, (0.49, 0.32, 1), size_y=1)
light("Front fill", (0, -5, 1.4), 25, 4, (0.60, 0.73, 1), size_y=3)

# Separate physical glass with transparent substrate and faint reflected softbox.
glassmesh = bpy.data.meshes.new("LCD glass geometry")
glassmesh.from_pydata([(v.x, -0.313, v.z) for v in screen_corners], [], [(0, 3, 2, 1)])
glassmesh.update()
glass = bpy.data.objects.new("ScreenGlass", glassmesh)
groups["REFLECTIONS"].objects.link(glass)
gm = bpy.data.materials.new("LCD clear glass reflection")
gm.use_nodes = True
gn = gm.node_tree.nodes
gn.clear()
gl = gm.node_tree.links
go = gn.new("ShaderNodeOutputMaterial")
mix = gn.new("ShaderNodeMixShader")
mix.inputs[0].default_value = 0.035
tr = gn.new("ShaderNodeBsdfTransparent")
gs = gn.new("ShaderNodeBsdfGlossy")
gs.inputs["Roughness"].default_value = 0.16
gl.new(tr.outputs[0], mix.inputs[1])
gl.new(gs.outputs[0], mix.inputs[2])
gl.new(mix.outputs[0], go.inputs["Surface"])
glass.data.materials.append(gm)
glass.hide_render = True

# Ground shadow can be exported without showing the console itself (ray visibility).
bpy.ops.mesh.primitive_plane_add(size=200, location=(0, 0, 0.012))
ground = bpy.context.object
ground.name = "Shadow catcher"
ground.is_shadow_catcher = True
group(ground, "SHADOWS")
ground.hide_render = True
ground.data.materials.append(pbr("Neutral shadow receiver", (0.08, 0.09, 0.12), 1))

# Fit the original silhouette to the reference's wide PSP-1000 proportions.
from mathutils import Matrix

fit = (
    Matrix.Translation(Vector((cx, 0, 0.95)))
    @ Matrix.Diagonal((1.014868, 1, 0.96, 1))
    @ Matrix.Translation(Vector((-cx, 0, -0.95)))
)
for o in bpy.data.objects:
    if o.type in ("MESH", "CURVE", "FONT") and o != ground:
        o.matrix_world = fit @ o.matrix_world
screen_corners = [fit @ v for v in screen_corners]

# Refine only the outer wings/margins to the image; the calibrated LCD is fixed.
left_edge = screen_corners[0].x
right_edge = screen_corners[1].x
top_edge = screen_corners[0].z
bottom_edge = screen_corners[2].z


def silhouette(v):
    v = v.copy()
    if v.x < left_edge:
        v.x -= min(1, (left_edge - v.x) / 0.35) * 0.12
    if v.x > right_edge + 0.68:
        v.x -= min(1, (v.x - right_edge - 0.68) / 0.3) * 0.105
    if v.z > top_edge:
        v.z -= min(1, (v.z - top_edge) / 0.18) * 0.055
    if v.z < bottom_edge:
        v.z += min(1, (bottom_edge - v.z) / 0.30) * 0.03
    return v


for o in bpy.data.objects:
    if o == ground or o.type not in ("MESH", "CURVE", "FONT"):
        continue
    inv = o.matrix_world.inverted()
    if o.type == "MESH":
        for v in o.data.vertices:
            v.co = inv @ silhouette(o.matrix_world @ v.co)
    elif o.type == "CURVE":
        for sp in o.data.splines:
            for p in sp.points:
                co = inv @ silhouette(o.matrix_world @ Vector(p.co[:3]))
                p.co = (*co, 1)
    else:
        o.location = silhouette(o.location)

for letter, point in zip("ABCD", screen_corners):
    marker = bpy.data.objects.new("ScreenCorner" + letter, None)
    groups["SCREEN"].objects.link(marker)
    marker.parent = screen
    marker.location = screen.matrix_world.inverted() @ point
    marker.empty_display_size = 0.025
for key, objs in controls.items():
    for o in objs:
        o["psp_control"] = key
write_layout(s, OUT, controls)
print("CONTROLS", list(controls.keys()), flush=True)

if PREVIEW:
    render(s, ROOT / ".verification/psp-adapted-preview.webp")
else:
    # Store a fully editable master with idle button geometry and locked camera.
    bpy.ops.file.pack_all()
    bpy.context.preferences.filepaths.save_version = 0
    bpy.ops.wm.save_as_mainfile(filepath=str(SOURCE / "PSP-portfolio.blend"))
    if "--save-only" not in sys.argv:
        export_layers(s, OUT, controls)
