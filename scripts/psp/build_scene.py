"""Adapt the supplied Sony PSP FBX to the existing fixed 2.5D composition.

blender -b --factory-startup --disable-autoexec --python scripts/psp/build_scene.py
Flags after --: --preview (staged only), --staging, --save-only, --cpu.
The former working model and exports remain in assets-source/psp/legacy-v1.
"""

import math
import os
import sys
from pathlib import Path
import bpy
from mathutils import Matrix, Vector

ROOT = Path(__file__).resolve().parents[2]
sys.dont_write_bytecode = True
sys.path.insert(0, str(Path(__file__).resolve().parent))
from render_layers import write_layout, render, export_layers

SOURCE = ROOT / "assets-source/psp"
MODEL = SOURCE / "model-v2"
PREVIEW = "--preview" in sys.argv
STAGING = PREVIEW or "--staging" in sys.argv
OUT = ROOT / (
    ".verification/psp-model-v2/rendered" if STAGING else "src/assets/images/psp"
)
(OUT / "buttons").mkdir(parents=True, exist_ok=True)
(ROOT / ".verification/optix").mkdir(parents=True, exist_ok=True)
os.environ["OPTIX_CACHE_PATH"] = str(ROOT / ".verification/optix")

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.fbx(filepath=str(MODEL / "psp_low_final.fbx"), use_anim=False)
scene = bpy.context.scene
scene["psp_model_source"] = (
    "Sony PSP by Ilya Ostrovsky (strov) / CC Attribution / Sketchfab"
)
scene["psp_press_travel"] = 0.016
scene["psp_shadow_opacity"] = 0.55

# The FBX facade is pitched 45 degrees. Bake the normalization so the existing
# exporter still depresses controls along +Y, independently of imported origins.
rotation = Matrix.Rotation(math.pi / 4, 4, "X")
original_objects = [
    obj for obj in bpy.data.objects if obj.type == "MESH" and obj.name != "ground"
]
for obj in original_objects:
    obj.data.transform(rotation @ obj.matrix_world)
    obj.parent = None
    obj.matrix_world.identity()
    obj["source_mesh"] = obj.name
for obj in list(bpy.data.objects):
    if obj not in original_objects:
        bpy.data.objects.remove(obj, do_unlink=True)

root = bpy.data.collections.new("PSP_ROOT")
scene.collection.children.link(root)
groups = {}
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
):
    groups[name] = bpy.data.collections.new(name)
    root.children.link(groups[name])


def group(obj, name):
    for collection in list(obj.users_collection):
        collection.objects.unlink(obj)
    groups[name].objects.link(obj)


for obj in original_objects:
    group(obj, "BODY")

# Reuse the working display plane and calibrated camera. The supplied mesh is
# adapted to this frame; web layout and React state are not used to compensate.
left, right = -0.047259196639060974, 0.04699507728219032
bottom, top = -0.0015805531293153763, 0.05141345411539078
target_left, target_right = -1.772465705871582, 0.9286899566650391
target_bottom, target_top = 0.3342224657535553, 1.6434509754180908
screen_y = -0.30799999833106995


def normalize(point):
    x, y, z = point
    if x < left:
        x = target_left + (x - left) * 24.5
    elif x > right:
        x = target_right + (x - right) * 19.5
    else:
        x = target_left + (x - left) / (right - left) * (target_right - target_left)
    z = target_bottom + (z - bottom) / (top - bottom) * (target_top - target_bottom)
    if z > target_top:
        z = target_top + (z - target_top) * 0.70
    if z < target_bottom:
        z = target_bottom + (z - target_bottom) * 0.60
    y = screen_y + (y + 0.03245572187) * 17
    return Vector((x, y, z))


for obj in original_objects:
    # Preserve the authored split normals under the piecewise non-uniform warp.
    # Vertex edits alone leave imported normals in the old, unscaled frame.
    source_positions = [vertex.co.copy() for vertex in obj.data.vertices]
    source_normals = [normal.vector.copy() for normal in obj.data.corner_normals]
    for vertex in obj.data.vertices:
        vertex.co = normalize(vertex.co)
    transformed_normals = []
    for loop, normal in zip(obj.data.loops, source_normals):
        position = source_positions[loop.vertex_index]
        scale_x = (
            24.5
            if position.x < left
            else (
                19.5
                if position.x > right
                else (target_right - target_left) / (right - left)
            )
        )
        scale_z = (target_top - target_bottom) / (top - bottom)
        scale_z *= 0.70 if position.z > top else 0.60 if position.z < bottom else 1
        transformed_normals.append(
            Vector((normal.x / scale_x, normal.y / 17, normal.z / scale_z)).normalized()
        )
    obj.data.normals_split_custom_set(transformed_normals)
    obj.data.update()

# Reconstruct all supplied Substance PBR maps, retaining UVs and topology.
images = {}
for key, suffix in [
    ("albedo", "albedo.jpg"),
    ("ao", "AO.jpg"),
    ("roughness", "roughness.jpg"),
    ("metallic", "metallic.jpg"),
    ("normal", "normal.png"),
    ("emissive", "emissive.jpg"),
]:
    image = bpy.data.images.load(
        str(MODEL / "textures" / ("sony_psp_" + suffix)), check_existing=True
    )
    if key not in ("albedo", "emissive"):
        image.colorspace_settings.name = "Non-Color"
    images[key] = image


def pbr_material(name, chrome=False, buttons=False, finish="piano"):
    material = bpy.data.materials.new(name)
    material.use_nodes = True
    nodes, links = material.node_tree.nodes, material.node_tree.links
    nodes.clear()
    output = nodes.new("ShaderNodeOutputMaterial")
    bsdf = nodes.new("ShaderNodeBsdfPrincipled")
    bsdf.inputs["IOR"].default_value = 1.48
    bsdf.inputs["Coat Weight"].default_value = (
        0
        if chrome or finish == "rubber"
        else (
            0.08
            if finish == "system"
            else 0.18 if buttons else 0.10 if finish == "rear" else 0.48
        )
    )
    bsdf.inputs["Coat IOR"].default_value = 1.46
    bsdf.inputs["Coat Roughness"].default_value = 0.12
    bsdf.inputs["Specular IOR Level"].default_value = 0.46
    links.new(bsdf.outputs["BSDF"], output.inputs["Surface"])
    textures = {}
    for key, image in images.items():
        node = nodes.new("ShaderNodeTexImage")
        node.image = image
        node.label = key
        textures[key] = node
    tint = nodes.new("ShaderNodeMixRGB")
    tint.blend_type = "MULTIPLY"
    tint.inputs[0].default_value = 1
    tint.inputs[2].default_value = (
        (0.62, 0.78, 1, 1) if buttons else (0.78, 0.82, 0.88, 1)
    )
    pigment = nodes.new("ShaderNodeGamma")
    pigment.inputs["Gamma"].default_value = 1.12 if buttons else 1.20
    links.new(textures["albedo"].outputs["Color"], pigment.inputs["Color"])
    links.new(pigment.outputs[0], tint.inputs[1])
    ao = nodes.new("ShaderNodeMixRGB")
    ao.blend_type = "MULTIPLY"
    ao.inputs[0].default_value = 0.5
    links.new(tint.outputs[0], ao.inputs[1])
    links.new(textures["ao"].outputs["Color"], ao.inputs[2])
    if chrome:
        bsdf.inputs["Base Color"].default_value = (0.56, 0.59, 0.63, 1)
        metal = nodes.new("ShaderNodeMapRange")
        metal.inputs["To Min"].default_value = 0.94
        metal.inputs["To Max"].default_value = 1
        links.new(textures["metallic"].outputs["Color"], metal.inputs["Value"])
        links.new(metal.outputs["Result"], bsdf.inputs["Metallic"])
    else:
        contact = nodes.new("ShaderNodeAmbientOcclusion")
        contact.inputs["Distance"].default_value = 0.035
        contact.samples = 16
        crevice = nodes.new("ShaderNodeMixRGB")
        crevice.blend_type = "MULTIPLY"
        crevice.inputs[0].default_value = 0.2
        links.new(ao.outputs[0], crevice.inputs[1])
        links.new(contact.outputs["AO"], crevice.inputs[2])
        links.new(crevice.outputs[0], bsdf.inputs["Base Color"])
        # Printed plastic is a dielectric, not a metallic painted surface.
        bsdf.inputs["Metallic"].default_value = 0
    rough = nodes.new("ShaderNodeMapRange")
    rough_min, rough_max = (
        (0.10, 0.22)
        if chrome
        else (
            (0.58, 0.76)
            if finish == "rubber"
            else (
                (0.25, 0.42)
                if finish == "rear"
                else (
                    (0.24, 0.40)
                    if finish == "system"
                    else (0.18, 0.32) if buttons else (0.12, 0.29)
                )
            )
        )
    )
    rough.inputs["To Min"].default_value = rough_min
    rough.inputs["To Max"].default_value = rough_max
    links.new(textures["roughness"].outputs["Color"], rough.inputs["Value"])
    links.new(rough.outputs["Result"], bsdf.inputs["Roughness"])
    normal = nodes.new("ShaderNodeNormalMap")
    normal.inputs["Strength"].default_value = 1 if finish == "rubber" else 0.75
    links.new(textures["normal"].outputs["Color"], normal.inputs["Color"])
    bevel = nodes.new("ShaderNodeBevel")
    bevel.samples = 4
    bevel.inputs["Radius"].default_value = (
        0.0025 if buttons or finish == "rubber" else 0.004
    )
    links.new(normal.outputs["Normal"], bevel.inputs["Normal"])
    links.new(bevel.outputs["Normal"], bsdf.inputs["Normal"])
    links.new(textures["emissive"].outputs["Color"], bsdf.inputs["Emission Color"])
    bsdf.inputs["Emission Strength"].default_value = 0.035 if not buttons else 0
    return material


shell_material = pbr_material("V2 / piano black shell / supplied PBR")
rear_material = pbr_material("V2 / satin rear shell / supplied PBR", finish="rear")
rubber_material = pbr_material("V2 / matte analog grip / supplied PBR", finish="rubber")
chrome_material = pbr_material(
    "V2 / silver middle frame / supplied detail maps", chrome=True
)
button_material = pbr_material("V2 / black controls / blue legends", buttons=True)
system_material = pbr_material(
    "V2 / satin system controls / original legends", buttons=True, finish="system"
)
for obj in original_objects:
    obj.data.materials.clear()
    obj.data.materials.append(shell_material)
for name in ("bottompart_low", "cap_low"):
    bpy.data.objects[name].data.materials[0] = rear_material
front = bpy.data.objects["toppart_low"]
front.data.materials.append(rubber_material)
for polygon in front.data.polygons:
    center = sum(
        (front.data.vertices[index].co for index in polygon.vertices), Vector()
    ) / len(polygon.vertices)
    if (center.x + 2.19072747) ** 2 + (
        center.z - 0.45399523
    ) ** 2 < 0.116**2 and center.y < -0.3255:
        polygon.material_index = 1
middle = bpy.data.objects["middlepart_low"]
middle.name = "ChromeEdges / middlepart_low"
middle.data.materials[0] = chrome_material

# Identities established from normalized geometry and front preview, not names.
mapping = {
    1: "up",
    2: "right",
    3: "down",
    4: "left",
    5: "triangle",
    6: "circle",
    7: "cross",
    8: "square",
    9: "home",
    10: "volume-down",
    11: "volume-up",
    14: "select",
    15: "start",
}
controls = {}
for number, key in mapping.items():
    obj = bpy.data.objects[f"button{number}_low"]
    obj.name = key
    obj["psp_control"] = key
    if number >= 9:
        obj["psp_press_travel"] = 0.004
    obj.data.materials[0] = system_material if number >= 9 else button_material
    category = (
        "DPAD" if number <= 4 else "ACTION_BUTTONS" if number <= 8 else "SYSTEM_BUTTONS"
    )
    group(obj, category)
    controls[key] = [obj]
for number, name in [
    (12, "Display / decorative original button"),
    (13, "Music / decorative original button"),
]:
    obj = bpy.data.objects[f"button{number}_low"]
    obj.name = name
    obj.data.materials[0] = system_material
    group(obj, "SYSTEM_BUTTONS")

screen = bpy.data.objects["screen_low"]
screen.name = "ScreenOpening"
group(screen, "SCREEN")
holdout = bpy.data.materials.new("V2 / remove baked LCD menu")
holdout.use_nodes = True
nodes = holdout.node_tree.nodes
nodes.clear()
node = nodes.new("ShaderNodeHoldout")
output = nodes.new("ShaderNodeOutputMaterial")
holdout.node_tree.links.new(node.outputs[0], output.inputs["Surface"])
screen.data.materials.clear()
screen.data.materials.append(holdout)
corners = [
    Vector((x, screen_y, z))
    for x, z in [
        (target_left, target_top),
        (target_right, target_top),
        (target_right, target_bottom),
        (target_left, target_bottom),
    ]
]
for letter, point in zip("ABCD", corners):
    marker = bpy.data.objects.new("ScreenCorner" + letter, None)
    groups["SCREEN"].objects.link(marker)
    marker.parent = screen
    marker.location = point
    marker.empty_display_size = 0.025

glass = bpy.data.objects.new("ScreenGlass", screen.data.copy())
groups["REFLECTIONS"].objects.link(glass)
glass.location.y = -0.001
glass.data.materials.clear()
material = bpy.data.materials.new("V2 / clear LCD glass reflection")
material.use_nodes = True
nodes, links = material.node_tree.nodes, material.node_tree.links
nodes.clear()
output = nodes.new("ShaderNodeOutputMaterial")
mix = nodes.new("ShaderNodeMixShader")
fresnel = nodes.new("ShaderNodeFresnel")
fresnel.inputs["IOR"].default_value = 1.46
reflection_weight = nodes.new("ShaderNodeMath")
reflection_weight.operation = "MULTIPLY"
reflection_weight.inputs[1].default_value = 0.32
links.new(fresnel.outputs[0], reflection_weight.inputs[0])
links.new(reflection_weight.outputs[0], mix.inputs[0])
transparent = nodes.new("ShaderNodeBsdfTransparent")
glossy = nodes.new("ShaderNodeBsdfGlossy")
glossy.inputs["Roughness"].default_value = 0.10
links.new(transparent.outputs[0], mix.inputs[1])
links.new(glossy.outputs[0], mix.inputs[2])
links.new(mix.outputs[0], output.inputs["Surface"])
glass.data.materials.append(material)
glass.hide_render = True

scene.render.engine = "CYCLES"
scene.cycles.samples = 48 if PREVIEW else 128
scene.cycles.use_adaptive_sampling = True
scene.cycles.adaptive_threshold = 0.015
scene.cycles.use_denoising = True
scene.cycles.device = "CPU"
if "--cpu" not in sys.argv:
    try:
        prefs = bpy.context.preferences.addons["cycles"].preferences
        prefs.compute_device_type = "OPTIX"
        prefs.get_devices()
        gpu = [device for device in prefs.devices if device.type == "OPTIX"]
        if gpu:
            for device in prefs.devices:
                device.use = device in gpu
            scene.cycles.device = "GPU"
    except Exception:
        pass
scene.render.resolution_x = 1620
scene.render.resolution_y = 698
scene.render.resolution_percentage = 100
scene.render.film_transparent = True
scene.render.image_settings.file_format = "WEBP"
scene.render.image_settings.color_mode = "RGBA"
scene.render.image_settings.quality = 95
scene.view_settings.view_transform = "AgX"
world = bpy.data.worlds.new("V2 / cold studio world")
scene.world = world
world.use_nodes = True
world.node_tree.nodes["Background"].inputs["Color"].default_value = (
    0.20,
    0.24,
    0.34,
    1,
)
world.node_tree.nodes["Background"].inputs["Strength"].default_value = 0.22

data = bpy.data.cameras.new("Fixed reference camera")
camera = bpy.data.objects.new("Fixed reference camera", data)
groups["STUDIO"].objects.link(camera)
camera.location = (3.04951810836792, -11.258712768554688, -2.479764938354492)
camera.rotation_euler = (1.8669365644454956, -0.13814565539360046, 0.2649903893470764)
data.type = "PERSP"
data.lens = 99.15277099609375
data.sensor_width = 36
data.shift_x = -0.007639590185135603
data.shift_y = -0.028690390288829803
data.dof.use_dof = False
camera.lock_location = camera.lock_rotation = camera.lock_scale = (True, True, True)
scene.camera = camera


def area(name, position, power, width, height, color, target=(-0.36, 0, 0.95)):
    data = bpy.data.lights.new(name, "AREA")
    data.energy = power
    data.color = color
    data.shape = "RECTANGLE"
    data.size = width
    data.size_y = height
    obj = bpy.data.objects.new(name, data)
    groups["STUDIO"].objects.link(obj)
    obj.location = position
    obj.rotation_euler = (
        (Vector(target) - obj.location).to_track_quat("-Z", "Y").to_euler()
    )


area("Silver key", (-3.2, -4.2, 4.5), 330, 3.4, 1.25, (0.84, 0.90, 1))
area("Blue rim", (-3, 1, 2.8), 260, 2.8, 0.65, (0.24, 0.47, 1))
area("Violet rim", (3, 0.3, 3), 180, 2.6, 0.65, (0.53, 0.36, 1))
area("Front fill", (0, -5, 1.4), 18, 4, 3, (0.72, 0.81, 1))
area(
    "Left reflection strip",
    (-2.8, -4.5, 2.4),
    55,
    0.55,
    3,
    (0.77, 0.86, 1),
    (-1.5, -0.3, 0.9),
)
area(
    "Right reflection strip",
    (3, -3, 2.1),
    65,
    0.35,
    2.4,
    (0.62, 0.67, 1),
    (1.2, -0.3, 0.9),
)

support_normal = Vector((0, -0.45, 1)).normalized()
support_distance = (
    min(
        support_normal.dot(vertex.co)
        for obj in original_objects
        for vertex in obj.data.vertices
    )
    - 0.003
)
bpy.ops.mesh.primitive_plane_add(size=200, location=support_normal * support_distance)
ground = bpy.context.object
ground.rotation_euler = support_normal.to_track_quat("Z", "Y").to_euler()
ground.name = "Shadow catcher"
ground.is_shadow_catcher = True
group(ground, "SHADOWS")
ground.hide_render = True
neutral = bpy.data.materials.new("V2 / neutral shadow receiver")
neutral.use_nodes = True
neutral.node_tree.nodes["Principled BSDF"].inputs["Base Color"].default_value = (
    0.08,
    0.09,
    0.12,
    1,
)
neutral.node_tree.nodes["Principled BSDF"].inputs["Roughness"].default_value = 1
ground.data.materials.append(neutral)

bpy.context.view_layer.update()
write_layout(scene, OUT, controls)
if PREVIEW:
    glass.hide_render = False
    ground.hide_render = False
    render(scene, ROOT / ".verification/psp-model-v2/preview.webp")
else:
    bpy.ops.file.pack_all()
    bpy.context.preferences.filepaths.save_version = 0
    bpy.ops.wm.save_as_mainfile(filepath=str(SOURCE / "PSP-portfolio.blend"))
    if "--save-only" not in sys.argv:
        export_layers(scene, OUT, controls)
