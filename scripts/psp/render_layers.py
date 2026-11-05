"""Shared Blender export: one fixed camera, one coordinate space, two button states."""

import json
import math
import bpy
from bpy_extras.object_utils import world_to_camera_view


def press_distance(scene, obj):
    return obj.get("psp_press_travel", scene.get("psp_press_travel", 0.016))


def write_layout(scene, output, controls, *, persist=True):
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
        "modelSource": scene.get("psp_model_source", "PSP red by aXel / CC BY 3.0"),
    }
    for key, objects in controls.items():
        # Include evaluated geometry and both positions in one shared crop.
        positions = [(obj, obj.location.copy()) for obj in objects]
        points = []
        try:
            for pressed in (False, True):
                for obj, location in positions:
                    obj.location = location.copy()
                    if pressed:
                        obj.location.y += press_distance(scene, obj)
                bpy.context.view_layer.update()
                depsgraph = bpy.context.evaluated_depsgraph_get()
                for obj in objects:
                    evaluated = obj.evaluated_get(depsgraph)
                    mesh = evaluated.to_mesh()
                    if mesh:
                        points.extend(
                            project(evaluated.matrix_world @ vertex.co)
                            for vertex in mesh.vertices
                        )
                        evaluated.to_mesh_clear()
        finally:
            for obj, location in positions:
                obj.location = location
            bpy.context.view_layer.update()
        xs, ys = [p[0] for p in points], [p[1] for p in points]
        pad = 8
        if (
            min(xs) < pad
            or min(ys) < pad
            or max(xs) > width - pad
            or max(ys) > height - pad
        ):
            raise ValueError(f"{key}: control extends beyond the render canvas")
        manifest["buttons"][key] = {
            "x": math.floor(min(xs)) - pad,
            "y": math.floor(min(ys)) - pad,
            "width": math.ceil(max(xs)) - math.floor(min(xs)) + 2 * pad,
            "height": math.ceil(max(ys)) - math.floor(min(ys)) + 2 * pad,
            "idle": f"buttons/{key}-idle.webp",
            "pressed": f"buttons/{key}-pressed.webp",
        }
    if persist:
        (output / "layout.json").write_text(json.dumps(manifest, indent=2) + "\n")
    return manifest


def render(scene, path, region=None):
    settings = scene.render
    names = (
        "use_border",
        "use_crop_to_border",
        "border_min_x",
        "border_max_x",
        "border_min_y",
        "border_max_y",
    )
    saved = {name: getattr(settings, name) for name in names}
    try:
        settings.use_border = region is not None
        if region:
            # Trace only sprite camera rays, retaining the entire scene for lighting.
            # Keep the full canvas so crop coordinates and pixel origins stay exact.
            x, y, width, height = (region[key] for key in ("x", "y", "width", "height"))
            settings.use_crop_to_border = False
            settings.border_min_x = x / settings.resolution_x
            settings.border_max_x = (x + width) / settings.resolution_x
            settings.border_min_y = 1 - (y + height) / settings.resolution_y
            settings.border_max_y = 1 - y / settings.resolution_y
        settings.filepath = str(path)
        bpy.ops.render.render(write_still=True)
    finally:
        for name, value in saved.items():
            setattr(settings, name, value)


def render_isolated(scene, path, subjects, region=None):
    """Retain occlusion by the rest of the console in each compositing layer."""
    visual = [obj for obj in bpy.data.objects if obj.type in ("MESH", "CURVE", "FONT")]
    saved = [
        (obj, obj.hide_render, obj.visible_camera, obj.is_holdout) for obj in visual
    ]
    try:
        for obj in visual:
            obj.hide_render = (
                obj.name in ("ScreenGlass", "Shadow catcher") and obj not in subjects
            )
            obj.visible_camera = True
            obj.is_holdout = obj not in subjects
        render(scene, path, region)
    finally:
        for obj, hidden, visible, holdout in saved:
            obj.hide_render = hidden
            obj.visible_camera = visible
            obj.is_holdout = holdout


def export_reflections(scene, output):
    chrome = [obj for obj in bpy.data.objects if obj.name.startswith("ChromeEdges")]
    render_isolated(scene, output / "psp-reflections.webp", chrome)


def render_shadow(scene, output):
    """A controlled shadow matte for the existing photographic page backdrop."""
    original_tree = scene.compositing_node_group
    original_compositing = scene.render.use_compositing
    tree = bpy.data.node_groups.new("PSP / shadow matte", "CompositorNodeTree")
    try:
        tree.interface.new_socket(
            name="Image", in_out="OUTPUT", socket_type="NodeSocketColor"
        )
        source = tree.nodes.new("CompositorNodeRLayers")
        alpha = tree.nodes.new("CompositorNodeSetAlpha")
        alpha.inputs["Type"].default_value = "Apply Mask"
        alpha.inputs["Alpha"].default_value = scene.get("psp_shadow_opacity", 1.0)
        output_node = tree.nodes.new("NodeGroupOutput")
        tree.links.new(source.outputs["Image"], alpha.inputs["Image"])
        tree.links.new(alpha.outputs["Image"], output_node.inputs["Image"])
        scene.compositing_node_group = tree
        scene.render.use_compositing = True
        render(scene, output / "psp-shadow.webp")
    finally:
        scene.compositing_node_group = original_tree
        scene.render.use_compositing = original_compositing
        bpy.data.node_groups.remove(tree)


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
    layout = write_layout(scene, output, controls, persist=False)
    scene.render.resolution_percentage = 100
    try:
        ground.hide_render = True
        glass.hide_render = True
        for obj in visual:
            obj.visible_camera = True
        for obj in buttons:
            # Retain the buttons' shadows/reflections on their sockets.
            obj.visible_camera = False
        render(scene, output / "psp-body.webp")
        # Invisible to primary rays, still present in reflected/shadow rays.
        for obj in visual:
            obj.visible_camera = False
        for key, objects in controls.items():
            render_isolated(
                scene,
                output / f"buttons/{key}-idle.webp",
                objects,
                layout["buttons"][key],
            )
            for obj in objects:
                obj.location.y += press_distance(scene, obj)
            render_isolated(
                scene,
                output / f"buttons/{key}-pressed.webp",
                objects,
                layout["buttons"][key],
            )
            for obj in objects:
                obj.location.y -= press_distance(scene, obj)
        render_isolated(scene, output / "psp-screen-glass.webp", [glass])
        ground.hide_render = False
        render_shadow(scene, output)
        ground.hide_render = True
        export_reflections(scene, output)
    finally:
        for obj, hidden, visible, location in saved:
            obj.hide_render = hidden
            obj.visible_camera = visible
            obj.location = location
    print("PSP_EXPORT_COMPLETE", flush=True)
