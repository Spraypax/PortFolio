# PSP interactive — maintenance

## Périmètre et sources

La PSP occupe l’emplacement existant de `src/sections/hero/PspStage`. Les autres sections, la grille de `Hero`, la navbar, le fond du site, le lecteur musical et les sons d’introduction n’ont pas été modifiés. Sur tablette/mobile, le composant PSP occupe une ligne de la grille existante ; son écran peut être ouvert dans une vue agrandie.

Le modèle v2 est **« Sony PSP » d’Ilya Ostrovsky (@strov)**, fourni localement dans `PSP_Model.7z` et identifié par le propriétaire du portfolio sur [Sketchfab](https://sketchfab.com/3d-models/sony-psp-dca89d10ec304d0cab76837750df7761). La page source indexée indique **CC Attribution / Creative Commons Attribution** ; la version numérotée de la licence n’a pas pu être confirmée. `assets-source/psp/model-v2/ATTRIBUTION.md` conserve les références, les limites de cette vérification et les empreintes des fichiers fournis. Le bouton **Select** affiche le créateur et le lien vers cette source.

Les sources extraites sont conservées dans `assets-source/psp/model-v2/` : `psp_low_final.fbx`, `textures/` et `inventory.json`. Le SHA-256 du FBX avant adaptation est :

```text
017708E21EA111F3111AFAB3487701CFEE6EBA81927A25CA3E1E2400EB9B46CB
```

L’inventaire FBX compte **21 meshes et un objet vide** : le sol d’origine, les trois parties de la coque, le couvercle latéral `cap_low`, l’écran et quinze boutons déjà séparés. Le joystick fait partie de la composante géométrique connectée de `toppart_low` ; `cap_low` est un cache latéral, pas le joystick. Le joystick n’a pas de nouvelle interaction. Chaque mesh possède une couche UV ; l’inventaire ne contient aucun modificateur. Six textures PBR sont fournies : albedo, occlusion ambiante, émissif, métal, normales et rugosité. La texture d’opacité du sol est conservée avec les sources, mais le sol original n’est pas utilisé dans les rendus du portfolio.

`assets-source/psp/PSP-portfolio.blend` est le master adapté et reproductible. `reference.png` conserve la capture donnée par l’utilisateur. L’ancien `PSP-original.blend`, son `original-inventory.json` et `BLENDSWAP_LICENSE.txt` restent conservés : **« PSP red » de aXel / CC BY 3.0** désigne uniquement ce modèle historique, pas le remplacement.

`assets-source/psp/legacy-v1/` sauvegarde l’ancien master `PSP-portfolio.blend`, les quatre scripts Blender/Python, la documentation précédente et `rendered-assets.zip`. Cette archive contient les ressources web précédentes, dont le manifeste et les états de boutons. Aucun de ces fichiers de sauvegarde n’est chargé par le navigateur.

## Travail Blender réalisé

La géométrie et les UV du FBX fourni sont réutilisés. Le sol et l’objet vide importés sont retirés de la scène adaptée ; les vingt meshes de la console sont conservés. L’orientation de façade du FBX est normalisée par une rotation **de +45° autour de X**, appliquée aux coordonnées des vertices avec la transformation initiale des objets. Les origines et transformations des pièces sont ensuite remises à l’identité : les appuis peuvent ainsi continuer à utiliser l’axe +Y commun.

- Adaptation de la géométrie à la dalle et à la caméra existantes, sans déplacement correctif de l’interface React. Les coordonnées source de la dalle sont X = −0,0472591966 à 0,0469950773 et Z = −0,0015805531 à 0,0514134541, après normalisation d’orientation. Elles sont projetées dans le repère cible X = **−1,7724657059 à 0,9286899567**, Z = **0,3342224658 à 1,6434509754**, avec Y de dalle = **−0,3079999983**.
- Les portions latérales hors dalle sont redimensionnées depuis leurs bords respectifs avec des coefficients **24,5 à gauche et 19,5 à droite**. Les marges au-dessus et au-dessous de la dalle sont comprimées respectivement par **0,70 et 0,60**. La profondeur utilise `Y = −0,3079999983 + (Ysource + 0,03245572187) × 17`.
- Correction des normales personnalisées importées sous cette déformation non uniforme : chaque normale est transformée par l’inverse transposée du Jacobien local, ici les composantes divisées par les coefficients X/Y/Z correspondants, puis renormalisée. Les normales de coins restent personnalisées ; les coordonnées des vertices, les UV et la topologie ne sont pas modifiés par ce réglage de réalisme.
- Reconstruction de matériaux Principled distincts pour la façade noire brillante, l’arrière satiné, les commandes, les boutons système, le grip analogique et le chrome. Albedo et émissif restent en couleur ; AO, métal, rugosité et normales sont lus en données linéaires (`Non-Color`). Les six cartes 4096 × 4096 restent intégrées au master, sans retouche des fichiers sources. Le mesh `middlepart_low` devient `ChromeEdges / middlepart_low`.
- Conservation des treize identifiants de commande déjà utilisés par React. Les quatre directions et les quatre boutons d’action étant déjà séparés, aucune découpe approximative du D-pad n’est nécessaire. Les boutons source **12 (Display) et 13 (Music) restent décoratifs**, sans nouvelle fonction ni zone interactive.
- Remplacement du matériau de `screen_low`, renommé `ScreenOpening`, par un matériau **Holdout** qui retire le menu LCD peint du rendu. Une vitre transparente séparée fournit les reflets. Le fond affiché par React reste l’illustration dédiée existante, générée avec ImageGen : ville nocturne bleue, galaxie, lune et silhouette assise. Ce fond ne remplace pas celui du portfolio.

Les collections sous `PSP_ROOT` restent `BODY`, `SCREEN`, `DPAD`, `ACTION_BUTTONS`, `SYSTEM_BUTTONS`, `ANALOG`, `REFLECTIONS`, `SHADOWS`, `STUDIO`. Chaque pièce interactive porte une propriété `psp_control`, et les meshes importés conservent leur nom source dans `source_mesh`. La correspondance est explicite dans `build_scene.py` :

| Mesh source                    | Identifiant existant                    |
| ------------------------------ | --------------------------------------- |
| `button1_low` à `button4_low`  | `up`, `right`, `down`, `left`           |
| `button5_low` à `button8_low`  | `triangle`, `circle`, `cross`, `square` |
| `button9_low` à `button11_low` | `home`, `volume-down`, `volume-up`      |
| `button14_low`, `button15_low` | `select`, `start`                       |

### Matériaux et détails de surface

Les valeurs suivantes sont définies dans `pbr_material()` ; la rugosité fournie est remappée dans chaque intervalle :

| Surface                          | Rugosité  | Poids du vernis | Métal  |
| -------------------------------- | --------- | --------------- | ------ |
| Façade noire brillante           | 0,12–0,29 | 0,48            | 0      |
| Arrière et cache latéral satinés | 0,25–0,42 | 0,10            | 0      |
| D-pad et boutons d’action        | 0,18–0,32 | 0,18            | 0      |
| Boutons système                  | 0,24–0,40 | 0,08            | 0      |
| Grip analogique mat              | 0,58–0,76 | 0               | 0      |
| Cadre argenté                    | 0,10–0,22 | 0               | 0,94–1 |

Le plastique est traité comme un diélectrique. Le shader utilise un IOR de 1,48, un niveau spéculaire de 0,46 et, lorsqu’il est présent, un vernis d’IOR 1,46 et de rugosité 0,12. L’albedo passe par un gamma de 1,20 pour la coque ou 1,12 pour les commandes, puis une teinte froide. L’AO fournie contribue à 50 % ; les matériaux non métalliques ajoutent 20 % d’occlusion locale calculée, avec une distance de 0,035 et 16 échantillons. L’émission est limitée à 0,035 hors commandes et nulle sur celles-ci.

La carte de normales a une intensité de 0,75, ou 1 pour le grip. Un **[nœud de shader Bevel](https://docs.blender.org/manual/en/latest/render/shader_nodes/input/bevel.html)**, avec quatre échantillons et un rayon de 0,004 unité, adoucit les reflets d’arête ; le rayon passe à 0,0025 pour les boutons et le grip. Il ne s’agit **pas d’un modificateur géométrique** : ce nœud ne crée pas de chanfreins dans la silhouette et n’ajoute aucun vertex. Il augmente le coût du rendu Cycles, sans coût 3D dans le navigateur.

Le matériau caoutchouc est affecté aux faces existantes du joystick par sélection spatiale de leur centre : cercle de rayon **0,116**, centré en X/Z = **−2,19072747 / 0,45399523**, et Y < **−0,3255**. Il n’y a ni découpe ni déplacement de cette géométrie. La saillie centrale mesurée est d’environ 0,01728 unité devant la façade locale.

La vitre mélange transparence et réflexion selon **Fresnel, IOR 1,46, multiplié par 0,32** ; sa rugosité réfléchissante est de 0,10. Elle reste un calque indépendant devant le contenu React.

### Fidélité et limites observées

Les comparaisons d’aperçus avant/après montrent un noir plus profond, des reflets directionnels plus lisibles autour de l’écran et une meilleure perception du relief des commandes. La seconde candidate réduit la brillance des boutons système et du reflet gauche par rapport à la première. Ces observations ne constituent pas une certification de photoréalisme ni une reproduction exacte de la référence : celle-ci présente un plastique plus finement texturé et satiné, des symboles plus bleutés et des détails différents.

Une [comparaison visuelle conservée dans le repository](images/psp-realism-comparison.webp) présente la référence, l’état avant réglage et la composition au moment de la validation du réalisme. Cette capture historique inclut l’ombre atténuée, retirée ensuite de l’affichage à la demande de l’utilisateur.

Les vingt meshes adaptés de la source totalisent **29 974 vertices et 58 200 triangles**, hors vitre dupliquée et récepteur d’ombre. Leur silhouette, leurs UV, les inscriptions et les détails peints restent ceux de la source adaptée. Le réglage de matériaux ne remplace pas la topologie par un modèle plus détaillé ; les grandes surfaces planes restent planes. Les logos, les petits libellés et les boutons décoratifs ne sont pas redessinés. L’illustration d’écran reste également distincte de celle de la référence.

## Caméra, éclairage et calage

Caméra perspective fixe, verrouillée en position, rotation et échelle :

| Paramètre                 | Valeur                                  |
| ------------------------- | --------------------------------------- |
| Résolution                | 1620 × 698, transparent RGBA            |
| Focale / capteur          | 99,15277 mm / 36 mm                     |
| Position XYZ              | 3,049518 ; −11,258713 ; −2,479765       |
| Rotation XYZ en radians   | 1,866937 ; −0,138146 ; 0,264990         |
| Décalage optique XY       | −0,007640 ; −0,028690                   |
| Moteur / échantillons     | Cycles / 128 maximum, débruitage activé |
| Échantillonnage adaptatif | Activé, seuil 0,015                     |
| Gestion des couleurs      | AgX                                     |

La caméra et les quatre points de dalle restent ceux de l’intégration précédente. Leur position découle de l’ajustement initial sur les coins de l’écran de référence. Le FBX est adapté à ce repère : façade vers −Y, verticale sur Z. L’aperçu utilise 48 échantillons maximum ; l’aperçu et les exports définitifs utilisent tous deux **100 % de la résolution**, soit 1620 × 698.

Éclairage par six surfaces rectangulaires :

| Lumière                     | Puissance | Dimensions |
| --------------------------- | --------- | ---------- |
| Softbox argentée principale | 330 W     | 3,4 × 1,25 |
| Bord bleu                   | 260 W     | 2,8 × 0,65 |
| Bord violet                 | 180 W     | 2,6 × 0,65 |
| Remplissage frontal         | 18 W      | 4 × 3      |
| Bande réfléchissante gauche | 55 W      | 0,55 × 3   |
| Bande réfléchissante droite | 65 W      | 0,35 × 2,4 |

Les positions, couleurs et cibles exactes sont conservées dans `scripts/psp/build_scene.py` et dans le `.blend`. Le monde contribue avec une intensité de **0,22**. Le fond reste transparent ; le background du portfolio n’est pas remplacé.

Le récepteur d’ombre est incliné suivant la normale unitaire dérivée de **(0 ; −0,45 ; 1)**. Sa position est calculée à partir du minimum du produit scalaire entre cette normale et les vertices de la console, avec un écart de **0,003 unité**. Cette construction le place sous le point d’appui de la géométrie, à la place de l’ancien plan horizontal éloigné de la coque. Le calque final applique ensuite un facteur d’alpha de **0,55**, enregistré dans `psp_shadow_opacity`, pour intégrer l’ombre au fond photographique existant. Le rendu d’aperçu monobloc utilise l’ombre native ; cette atténuation est propre à l’export du calque d’ombre.

Coins de l’écran dans la capture de 810 × 349, puis projection de la dalle finale ramenée à cette même résolution :

| Coin           | Référence X / Y | Projection X / Y |
| -------------- | --------------- | ---------------- |
| A, haut gauche | 199 / 30        | 198,22 / 29,14   |
| B, haut droite | 671 / 46        | 672,35 / 46,94   |
| C, bas droite  | 647 / 287       | 645,78 / 285,78  |
| D, bas gauche  | 158 / 251       | 158,65 / 252,14  |

Les valeurs exactes pour l’assemblage sont exportées automatiquement dans `layout.json` : **A (396,4471 ; 58,2857), B (1344,6936 ; 93,8846), C (1291,5621 ; 571,5644), D (317,3080 ; 504,2701)** pour le canevas de 1620 × 698. Quatre repères `ScreenCornerA…D`, rattachés à `ScreenOpening`, sont enregistrés dans la scène. Le composant HTML de 480 × 272 est projeté sur ces quatre points par une homographie CSS `matrix3d`, calculée par `screenProjection.ts`. Il ne s’agit pas d’une rotation CSS réglée à l’œil.

Le redimensionnement applique une seule échelle au canevas complet. La coque, les zones de clic et le contenu d’écran conservent ainsi le même repère. Aucun suivi de souris, flottement, zoom de console ou moteur 3D ne s’exécute dans le navigateur.

## Calques exportés

Dans `src/assets/images/psp/` :

| Fichier                  | Contenu                                                                           |
| ------------------------ | --------------------------------------------------------------------------------- |
| `psp-body.webp`          | Coque, détails et supports, sans commandes interactives ni contenu d’écran        |
| `psp-shadow.webp`        | Ombre issue du shadow catcher Cycles                                              |
| `psp-reflections.webp`   | Cadre intermédiaire argenté réfléchissant, même caméra                            |
| `psp-screen-glass.webp`  | Surface transparente et reflets discrets de la vitre                              |
| `screen-wallpaper.webp`  | Illustration de fond de l’écran React, 1440 × 810                                 |
| `buttons/*-idle.webp`    | Treize commandes au repos                                                         |
| `buttons/*-pressed.webp` | Commandes enfoncées suivant Y : 0,016 pour directions/actions, 0,004 pour système |
| `layout.json`            | Résolution, quatre coins, rectangles des sprites et caméra                        |

Les 26 sprites sont recadrés après rendu avec **le même rectangle pour les deux états**, sans déplacement des pixels. Le manifeste utilise l’union de la géométrie évaluée au repos et enfoncée, avec une marge de huit pixels ; une commande sortant du canevas provoque une erreur. Le script de recadrage contrôle les treize identifiants attendus, refuse les états vides et tout rectangle qui couperait des pixels visibles, vérifie les dimensions des grands calques et refuse les calques vides. Les deux états ont la même caméra, les mêmes matériaux et les mêmes lumières ; seul l’enfoncement de la pièce change.

La course par défaut de **0,016** est enregistrée dans la propriété de scène `psp_press_travel`. Home, Select, Start et les deux boutons Volume portent une propriété d’objet du même nom, de **0,004**, prioritaire. Leur saillie locale mesurée est d’environ 0,00722 unité ; la course plus courte évite de les enfoncer derrière la façade. `press_distance()` est utilisé à la fois pour le manifeste et pour les rendus.

Le rendu de chaque sprite limite les rayons caméra au rectangle commun calculé dans le manifeste (`render border`). **Le canevas complet est conservé**, sans recadrage Blender (`use_crop_to_border = False`) : les origines de pixels restent identiques avant le recadrage Pillow. Toute la scène reste présente pour l’éclairage, les ombres et les reflets. Ce réglage réduit le travail de rendu des 26 états, notamment le coût du shader Bevel, sans déplacer les pièces.

Le rendu de coque conserve les ombres et les reflets des commandes au repos : elles sont cachées aux seuls rayons caméra, plutôt que retirées du rendu. Les sprites, la vitre et le calque de reflets utilisent ensuite des objets **Holdout temporaires** pour conserver l’occlusion par le reste de la console. Les parties enfoncées derrière une surface ne sont donc pas artificiellement redessinées par-dessus celle-ci. Seules les parties visibles du cadre métallique sont exportées : ses faces arrière ne se superposent pas à la coque lors de l’assemblage HTML. L’export restaure les propriétés de visibilité, les positions et les paramètres de région après le rendu. Les ombres enregistrées dans le calque fixe de coque restent celles de l’état de repos ; ce calque n’est pas recalculé pendant les interactions web.

Les noms des ressources et des commandes restent inchangés pour React ; les rectangles de boutons sont recalculés avec les courses adaptées. `layout.json` contient également l’attribution `modelSource`. Les trente rendus du réglage de réalisme totalisent **567 928 octets** après recadrage ; avec le fond d’écran conservé de 111 552 octets, le total est de **679 480 octets, environ 664 Kio**, hors manifeste. Les fichiers FBX, textures sources, Blender et scripts ne sont pas envoyés au navigateur.

## Architecture React et commandes

`PSPConsole` assemble l’écran, la coque, les boutons, la vitre et les reflets. Le calque extérieur `psp-shadow.webp` reste disponible dans les exports Blender, mais n’est plus importé ni affiché dans le portfolio. Les ombres de relief intégrées aux matériaux de la coque et des boutons restent conservées. Les calques décoratifs n’interceptent aucun clic. Les deux images de chaque bouton sont chargées dès le montage ; un fondu de 60 ms à l’appui et 95 ms au relâchement accompagne le changement d’état. La préférence de réduction des animations supprime ce fondu.

Le texte visible des raccourcis sous la console a été retiré ; les raccourcis eux-mêmes et les indications accessibles aux lecteurs d’écran restent disponibles. L’agrandissement utilise une icône discrète alignée en bas à droite sous la console, avec le nom accessible et l’infobulle « Agrandir l’écran ». Sa zone mesure 32 × 28 px sur desktop/tablette et 40 × 40 px sur mobile. La barre reste dans le flux sous 1024 px.

`usePSPControls` constitue le point d’entrée commun souris/tactile/clavier. Il gère les appuis, relâchements, annulations de pointeur, pertes de focus et sons optionnels. `pspNavigation.ts` contient le réducteur pur : catégorie, page actuelle, sélection mémorisée dans chaque catégorie, paragraphe About, page et zoom du CV, panneaux d’aide/options/crédits, luminosité et sons. Le composant commun `PSPXMB` affiche les quatre catégories horizontales et leur liste verticale, configurées dans `pspContent.ts` à partir des données existantes.

| Commande        | Action                                                  |
| --------------- | ------------------------------------------------------- |
| Gauche / droite | Catégorie précédente/suivante, avec boucle ; retour au XMB |
| Haut / bas      | Élément précédent/suivant avec boucle ; paragraphes About ou pages CV dans leur détail |
| Croix / Entrée  | Ouvrir ou confirmer ; ouvrir un lien depuis son détail  |
| Cercle / Échap  | Fermer le panneau, revenir du détail ou revenir au menu |
| Triangle / S    | Options : sons et luminosité                            |
| Carré / A       | Aide                                                    |
| Start / Home    | Accueil XMB, catégorie et sélections conservées          |
| Select          | Crédits et attribution du modèle                        |
| Volume − / +    | Niveau des seuls effets PSP, de 0 à 3                   |

Les raccourcis sont gérés par propagation dans la console, jamais par un écouteur clavier global. Les champs de saisie et les raccourcis avec Ctrl/Alt/Meta restent libres. Les boutons natifs et liens restent utilisables avec Tab et Entrée. Une flèche utilisée sur un menu recentre le focus sur son écran pour que la confirmation ouvre la sélection courante.

Les rubriques réutilisent les données réelles du portfolio :

- **Home → About** : profil et paragraphes de `src/data/about.ts` ; navigation entre paragraphes.
- **Home → CV** : les deux pages du véritable PDF référencé par `src/data/profile.ts`, pagination, zoom de 100 à 400 %, vue agrandie, ouverture du PDF original et téléchargement réel.
- **Projects** : projets de `src/data/projects.ts` ; vignettes, détails, tags et liens existants.
- **Skills** : catégories de `src/data/skills.ts` ; liste puis compétences de chaque catégorie.
- **Contact** : adresse et liens de `src/data/socialLinks.ts` ; confirmation dans la liste ouvrant la destination réelle et affichant son détail. Seules les entrées configurées sont proposées.

**Home** est la catégorie sélectionnée au démarrage, avec **About** sélectionné dans sa liste ; aucun détail n’est ouvert automatiquement. Les quatre catégories utilisent le même menu vertical animé. Les sélections sont conservées lors des changements de catégorie et du retour au XMB ; les listes vides restent navigables. La navigation ne modifie pas l’URL et ne fait pas défiler la page principale. Seuls les liens confirmés ouvrent explicitement une destination externe ou le client de messagerie.

L’état est volontairement limité à la session React : l’actualisation revient au menu initial. Le mode agrandi partage **le même contrôleur** et conserve les sélections, la page et le zoom du CV. L’écran miniature est alors inerte pour l’accessibilité. Le dialogue natif gère le focus modal ; sa fermeture rend le focus au bouton d’ouverture. Échap revient d’abord dans la navigation, puis ferme la vue agrandie à l’accueil XMB.

Les sons sont des notes synthétisées localement, activées par défaut (`Navigation sounds: On`) et désactivables dans les options de la PSP. Ils sont déclenchés uniquement après interaction, respectent le mute mémorisé du lecteur musical et ne modifient ni son volume de 5 %, ni sa position, ni ses événements. Une seule note de navigation est active à la fois. Un refus de Web Audio laisse la navigation silencieuse et fonctionnelle.

Le menu Options affiche uniquement **On / Off** pour les sons, sans fraction ni niveau intermédiaire. Les touches VOL conservent leur réglage interne ; un niveau nul correspond à Off. Le texte explicatif précédent est retiré. Les trois options et le bouton de retour tiennent dans le panneau, y compris dans la vue agrandie mobile et en paysage, sans scrollbar ni option masquée. Les détails de maintenance du CV et de validation de cette navigation figurent dans [psp-xmb.md](psp-xmb.md).

## Reproduire ou modifier les rendus

Outils utilisés : **Blender 5.2.3 LTS**, Python avec **Pillow** pour le recadrage. Aucune dépendance npm n’a été ajoutée. Blender utilise OptiX si un GPU compatible est disponible, sinon le CPU ; `-- --cpu` force ce dernier. Les caches de rendu sont placés dans `.verification/optix`.

Depuis la racine du repository, sous PowerShell, reconstruire le master depuis le **FBX v2** et remplacer les ressources actives :

```powershell
& E:\Blender\blender.exe --background --factory-startup --disable-autoexec --python scripts/psp/build_scene.py
python scripts/psp/pack_layers.py
npx prettier --write src/assets/images/psp/layout.json
```

Cette commande **reconstruit `assets-source/psp/PSP-portfolio.blend`** et écrit les calques et le manifeste dans `src/assets/images/psp/`. Les adaptations reproductibles de géométrie, matériaux, caméra et lumières sont dans `build_scene.py`. Les six textures sont intégrées au master sauvegardé.

Pour préparer les ressources sans remplacer les images actives, utiliser le répertoire de staging :

```powershell
& E:\Blender\blender.exe --background --factory-startup --disable-autoexec --python scripts/psp/build_scene.py -- --staging
python scripts/psp/pack_layers.py --assets-dir .verification/psp-model-v2/rendered
```

`--staging` écrit tous les calques et `layout.json` dans `.verification/psp-model-v2/rendered/`, **mais reconstruit bien le master Blender**. Après validation, les quatre grands calques, le dossier `buttons/` et `layout.json` forment un ensemble à transférer vers `src/assets/images/psp/` ; `screen-wallpaper.webp` reste inchangé. Il ne faut pas associer les nouveaux sprites à l’ancien manifeste.

Pour un aperçu rapide sans remplacer le master ni les ressources actives :

```powershell
& E:\Blender\blender.exe --background --factory-startup --disable-autoexec --python scripts/psp/build_scene.py -- --preview
```

Le résultat est écrit dans `.verification/psp-model-v2/preview.webp`, avec un manifeste de travail dans `.verification/psp-model-v2/rendered/layout.json`. Cet aperçu ne produit pas les trente calques définitifs ; ne pas lancer le recadrage sur un dossier ne contenant que ce manifeste. `--save-only` sauvegarde le master et le manifeste sans lancer les rendus. Un changement de géométrie ou de caméra doit toujours être suivi d’un export complet avant livraison.

Pour conserver des modifications faites manuellement dans `PSP-portfolio.blend`, enregistrer ce fichier dans Blender puis utiliser le réexport du master :

```powershell
& E:\Blender\blender.exe --background --factory-startup --disable-autoexec --python scripts/psp/export_saved.py
python scripts/psp/pack_layers.py
npx prettier --write src/assets/images/psp/layout.json
```

Ce second chemin **ne reconstruit pas le modèle**. Il recharge les objets portant `psp_control`, la caméra sauvegardée et les quatre repères de dalle, puis recalcule les coordonnées. Conserver les propriétés des pièces interactives, les noms `ScreenGlass`, `Shadow catcher`, `ScreenCornerA…D` et le préfixe `ChromeEdges`. Si l’ouverture est retouchée en mode édition, repositionner ses quatre repères. Un déplacement de l’objet `ScreenOpening` entraîne ses repères enfants.

Le déplacement d’appui repose sur l’axe +Y du modèle normalisé ; ne pas changer le repère des commandes sans adapter ce déplacement dans `render_layers.py`. Le script restaure les positions et la visibilité après les exports et n’enregistre pas un master avec des boutons enfoncés. `export_saved.py -- --check` recharge et contrôle les sources, puis calcule les coordonnées en mémoire **sans rendu ni réécriture du manifeste**. Sans cette option, `export_saved.py` écrit dans `src/assets/images/psp/` ; contrairement à `build_scene.py`, il n’a pas d’option de staging.

Pour retrouver le modèle historique aXel, restaurer ensemble le master de `legacy-v1/` dans `assets-source/psp/PSP-portfolio.blend`, les quatre scripts dans `scripts/psp/`, la documentation dans `docs/psp-console.md` et les ressources de `rendered-assets.zip` dans leur emplacement `src/assets/images/psp/`. Les crédits de la console doivent alors correspondre de nouveau à la source aXel historique. **Ne pas exécuter les scripts archivés directement dans `legacy-v1/`** : ils calculent les chemins du projet depuis leur emplacement et doivent d’abord retrouver leurs chemins d’origine. Les sources originales des deux modèles restent conservées. L’état du modèle Ilya précédant uniquement le réglage de réalisme est conservé dans la révision Git antérieure et, localement, dans `.verification/psp-realism/before-master.blend`, `before-assets.zip` et les copies des scripts ; ce dossier local n’est pas versionné.

Pour modifier le contenu ou ajouter une rubrique, intervenir dans `PSPScreen.tsx`, les données correspondantes et le réducteur ; ne pas déplacer la dalle à la main dans le CSS. Toute nouvelle commande doit suivre le même chemin `press/release/trigger` afin de conserver la synchronisation visuelle.

## Vérifications du réglage de réalisme

**Validation terminée le 5 novembre 2026.** Le master enregistré a été comparé en lecture seule à la sauvegarde antérieure `.verification/psp-realism/before-master.blend`. Les vingt meshes de console et la vitre conservent exactement leurs coordonnées de vertices, arêtes, polygones, boucles, UV, transformations d’objets et identifiants source. La caméra, les paramètres optiques, les quatre repères d’écran, la résolution et les treize identifiants de commande sont identiques. Les courses vérifiées sont 0,004 pour les cinq commandes système et 0,016 pour les huit directions/actions. La transformation du récepteur d’ombre change volontairement ; les normales et les matériaux sont également modifiés.

Les audits et aperçus comparatifs avant/candidate 1/candidate 2 sont conservés localement dans `.verification/psp-realism/`. Les trente exports définitifs ont été contrôlés, pesés et intégrés : dimensions, transparence LCD, absence de découpe de la coque et des sprites, états d’appui distincts et fond d’écran conservé. Leur composition complète a été inspectée sur desktop et mobile, avec l’ombre finale atténuée. La comparaison des dimensions de page avant/après passe aux quatre largeurs 1600, 1024, 768 et 390 px.

- Les **70 tests**, ESLint, TypeScript et le build Vite passent.
- Chrome : treize commandes physiques, clavier, navigation, détails, options/aide/crédits, écran agrandi, conservation d’état et restitution du focus validés.
- Largeurs 1920, 1600, 1440, 1024, 768, 390 et 320 px, événements tactiles simulés, perte de focus, réduction des animations, actualisation et décodage de tous les assets validés.
- Sons de navigation **On par défaut**, absence de son au simple chargement, désactivation/réactivation dans Options et respect du mute musical vérifiés. Le script de vérification actuel est `.verification/psp-realism/edge-check.cjs` ; l’ancien script de remplacement supposait encore Off au démarrage.
- Élément musical unique et continu à **5 %**, dialogue About extérieur à la PSP et limites de portée du clavier vérifiés ; aucune erreur JavaScript observée.

Les scripts locaux exécutés sont `.verification/psp-realism/browser-comparison.cjs after`, `.verification/psp-integration.cjs`, `.verification/psp-realism/edge-check.cjs` et `.verification/verify-psp-v2-assets.py`, en complément des commandes npm. Aucun composant React, style du site ou contenu d’écran n’a été modifié pour ce réglage.

## Vérifications du remplacement précédent

**État validé avant le réglage de réalisme, le 5 novembre 2026.** Les 70 tests du repository, ESLint, la compilation TypeScript et le build Vite passaient. La comparaison avant/après à 1600, 1024, 768 et 390 px confirmait des dimensions identiques pour la navbar, la grille Hero, les autres sections, l’emplacement PSP et la largeur de page.

```powershell
npm test
npm run build
npm run lint
node .verification/psp-replacement-baseline.cjs after
node .verification/psp-integration.cjs
node .verification/psp-edge-check.cjs
```

Les scripts navigateur de `.verification/` utilisent l’environnement local de vérification et le serveur Vite sur `http://127.0.0.1:5173` ; ils n’ajoutent aucune dépendance au portfolio.

- Master adapté rouvert dans Blender : treize commandes et quatre repères validés. L’empreinte du manifeste actif reste identique après `export_saved.py -- --check`.
- Trente exports RGBA non vides, dimensions et recadrages validés ; treize paires d’états distincts. Coque et sprites ne touchent pas les bords de leurs images. Une grille de 361 points intérieurs confirme une ouverture LCD entièrement transparente.
- Caméra, coordonnées de dalle et fond d’écran identiques à la version précédente. Les sauvegardes et les sources originales sont conservées.
- Chrome : clics sur les treize commandes, clavier et état d’appui synchronisé, navigation, détails Projects/Skills, aide/options/crédits, retours, écran agrandi, état partagé et restitution du focus validés.
- Événements tactiles simulés, relâchement à la perte de focus, raccourcis limités à la PSP, sons activés explicitement puis coupés par le mute musical, préférence de réduction des animations et décodage de toutes les images validés.
- Largeurs 1920, 1600, 1440, 1024, 768, 390 et 320 px contrôlées sans débordement horizontal. Captures du rendu final complet inspectées sur desktop et mobile après correction de l’occlusion du calque de reflets.
- Même élément musical unique, lecture continue et volume de 5 % pendant les interactions PSP et l’ouverture du dialogue About du portfolio. Aucun redémarrage audio ni erreur JavaScript observé ; retour au menu initial après actualisation validé.

La vérification responsive et tactile repose sur des viewports et des événements **simulés dans Chrome**, pas sur des appareils physiques. La Gamepad API n’est pas implémentée ; le contrôleur central permet de la raccorder ultérieurement.
