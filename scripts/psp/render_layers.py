"""Shared Blender export: one fixed camera, one coordinate space, two button states."""

import json
import math
import bpy
from bpy_extras.object_utils import world_to_camera_view


def write_layout(scene, output, controls):
    camera = scene.camera
    width, height = scene.render.resolution_x, scene.render.resolution_y

    def project(point):
        p = world_to_camera_view(scene, camera, point)
        return [round(p.x * width, 4), round((1 - p.y) * height, 4)]

    bpy.context.view_layer.update()
    corners = [
        bpy.data.objects[f"ScreenCorner{letter}"].matrix_world.translation
        for letter in "ABCD"
    ]
    manifest = {
        "width": width,
        "height": height,
        "screen": {
            "width": 480,
            "height": 272,
            "corners": [project(v) for v in corners],
        },
        "buttons": {},
        "camera": {
            "type": camera.data.type,
            "location": list(camera.location),
            "rotationRadians": list(camera.rotation_euler),
            "lens": camera.data.lens,
            "sensorWidth": camera.data.sensor_width,
            "shift": [camera.data.shift_x, camera.data.shift_y],
        },
        "modelSource": "PSP red by aXel / CC BY 3.0",
    }
    for key, objects in controls.items():
        points = [
            project(o.matrix_world @ v.co)
            for o in objects
            if o.type == "MESH"
            for v in o.data.vertices
        ]
        xs, ys = [p[0] for p in points], [p[1] for p in points]
        pad = 8
        manifest["buttons"][key] = {
            "x": math.floor(min(xs)) - pad,
            "y": math.floor(min(ys)) - pad,
            "width": math.ceil(max(xs)) - math.floor(min(xs)) + 2 * pad,
            "height": math.ceil(max(ys)) - math.floor(min(ys)) + 2 * pad,
            "idle": f"buttons/{key}-idle.webp",
            "pressed": f"buttons/{key}-pressed.webp",
        }
    (output / "layout.json").write_text(json.dumps(manifest, indent=2) + "\n")
    return manifest


def render(scene, path):
    scene.render.filepath = str(path)
    bpy.ops.render.render(write_still=True)


def export_layers(scene, output, controls):
    ground = bpy.data.objects["Shadow catcher"]
    glass = bpy.data.objects["ScreenGlass"]
    visual = [
        o
        for o in bpy.data.objects
        if o.type in ("MESH", "CURVE", "FONT") and o != ground
    ]
    saved = [
        (o, o.hide_render, o.visible_camera, o.location.copy())
        for o in visual + [ground]
    ]
    buttons = [o for objects in controls.values() for o in objects]
    scene.render.resolution_percentage = 100
    try:
        ground.hide_render = True
        glass.hide_render = True
        for obj in visual:
            obj.visible_camera = True
        for obj in buttons:
            obj.hide_render = True
        render(scene, output / "psp-body.webp")
        for obj in buttons:
            obj.hide_render = False
        # Invisible to primary rays, still present in reflected/shadow rays.
        for obj in visual:
            obj.visible_camera = False
        for key, objects in controls.items():
            for obj in objects:
                obj.visible_camera = True
            render(scene, output / f"buttons/{key}-idle.webp")
            for obj in objects:
                obj.location.y += 0.016
            render(scene, output / f"buttons/{key}-pressed.webp")
            for obj in objects:
                obj.location.y -= 0.016
                obj.visible_camera = False
        glass.hide_render = False
        glass.visible_camera = True
        render(scene, output / "psp-screen-glass.webp")
        glass.hide_render = True
        glass.visible_camera = False
        ground.hide_render = False
        render(scene, output / "psp-shadow.webp")
        ground.hide_render = True
        for obj in visual:
            if obj.name.startswith("ChromeEdges"):
                obj.visible_camera = True
        render(scene, output / "psp-reflections.webp")
    finally:
        for obj, hidden, visible, location in saved:
            obj.hide_render = hidden
            obj.visible_camera = visible
            obj.location = location
    print("PSP_EXPORT_COMPLETE", flush=True)
