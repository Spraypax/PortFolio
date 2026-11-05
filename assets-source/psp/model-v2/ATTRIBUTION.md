# Sony PSP — source attribution

- **Work:** Sony PSP.
- **Creator:** Ilya Ostrovsky, Sketchfab username **@strov**.
- **Source supplied by the portfolio owner:** [Sony PSP on Sketchfab](https://sketchfab.com/3d-models/sony-psp-dca89d10ec304d0cab76837750df7761).
- **Model identifier:** `dca89d10ec304d0cab76837750df7761`.
- **License label verified on the indexed source page:** **CC Attribution / Creative Commons Attribution**.
- **Verification date:** 5 November 2026.

The indexed Sketchfab model page identifies the author, the above license label and the publication date of 17 November 2018. Its description identifies Maya and Substance Painter as the original creation tools. The exact numbered Creative Commons license version could not be confirmed from accessible source metadata. Direct access to the model page returned HTTP 403, and the public metadata endpoint was unavailable through the verification tool. No version-specific Creative Commons URL is asserted here; the source link above is the authoritative model/license reference.

## Supplied files and provenance

The portfolio owner supplied `PSP_Model.7z` locally. The extracted source includes `psp_low_final.fbx` and associated albedo, ambient occlusion, emissive, metallic, normal and roughness maps, plus the original ground-opacity texture. The model and maps are adapted for the portfolio's fixed Blender-rendered 2.5D composition. The React screen and interaction controller are separate portfolio code.

SHA-256 of the supplied archive:

```text
93AAA5C04298737C8EDF14B32FE7B2A5466EF7B45FBD973B8A964F84EEAD0DE8
```

SHA-256 of the extracted FBX before adaptation:

```text
017708E21EA111F3111AFAB3487701CFEE6EBA81927A25CA3E1E2400EB9B46CB
```

Adaptations for the portfolio include material and lighting adjustments, placement/camera calibration, preparation of independent button states and replacement of the baked screen content with an opening for the existing React interface. The detailed pipeline and final changes are documented in `docs/psp-console.md` and the Blender scripts. The original supplied geometry and textures remain attributed to Ilya Ostrovsky.

The running console exposes the creator, Sketchfab model link and verified license label in its **Select / Credits** screen. The former **aXel / PSP red / CC BY 3.0** attribution applies to the preserved legacy model only; it does not describe this replacement model.
