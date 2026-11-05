# PSP interactive — maintenance

## Périmètre et sources

La PSP occupe l’emplacement existant de `src/sections/hero/PspStage`. Les autres sections, la grille de `Hero`, la navbar, le fond du site, le lecteur musical et les sons d’introduction n’ont pas été modifiés. Sur tablette/mobile, le composant PSP occupe une ligne de la grille existante ; son écran peut être ouvert dans une vue agrandie.

Le modèle v2 est **« Sony PSP » d’Ilya Ostrovsky (@strov)**, fourni localement dans `PSP_Model.7z` et identifié par le propriétaire du portfolio sur [Sketchfab](https://sketchfab.com/3d-models/sony-psp-dca89d10ec304d0cab76837750df7761). La page source indexée indique **CC Attribution / Creative Commons Attribution** ; la version numérotée de la licence n’a pas pu être confirmée. `assets-source/psp/model-v2/ATTRIBUTION.md` conserve les références, les limites de cette vérification et les empreintes des fichiers fournis. Le bouton **Select** affiche le créateur et le lien vers cette source.

Les sources extraites sont conservées dans `assets-source/psp/model-v2/` : `psp_low_final.fbx`, `textures/` et `inventory.json`. Le SHA-256 du FBX avant adaptation est :

```text
017708E21EA111F3111AFAB3487701CFEE6EBA81927A25CA3E1E2400EB9B46CB
```

L’inventaire FBX compte **21 meshes et un objet vide** : le sol d’origine, les trois parties de la coque, le couvercle latéral `cap_low`, l’écran et quinze boutons déjà séparés. Le joystick visible n’est pas un mesh autonome nommé dans cet inventaire ; il reste un détail de la façade et n’a pas de nouvelle interaction. Chaque mesh possède une couche UV ; l’inventaire ne contient aucun modificateur. Six textures PBR sont fournies : albedo, occlusion ambiante, émissif, métal, normales et rugosité. La texture d’opacité du sol est conservée avec les sources, mais le sol original n’est pas utilisé dans les rendus du portfolio.

`assets-source/psp/PSP-portfolio.blend` est le master adapté et reproductible. `reference.png` conserve la capture donnée par l’utilisateur. L’ancien `PSP-original.blend`, son `original-inventory.json` et `BLENDSWAP_LICENSE.txt` restent conservés : **« PSP red » de aXel / CC BY 3.0** désigne uniquement ce modèle historique, pas le remplacement.

`assets-source/psp/legacy-v1/` sauvegarde l’ancien master `PSP-portfolio.blend`, les quatre scripts Blender/Python, la documentation précédente et `rendered-assets.zip`. Cette archive contient les ressources web précédentes, dont le manifeste et les états de boutons. Aucun de ces fichiers de sauvegarde n’est chargé par le navigateur.

## Travail Blender réalisé

La géométrie et les UV du FBX fourni sont réutilisés. Le sol et l’objet vide importés sont retirés de la scène adaptée ; les vingt meshes de la console sont conservés. L’orientation de façade du FBX est normalisée par une rotation **de +45° autour de X**, appliquée aux coordonnées des vertices avec la transformation initiale des objets. Les origines et transformations des pièces sont ensuite remises à l’identité : les appuis peuvent ainsi continuer à utiliser l’axe +Y commun.

- Adaptation de la géométrie à la dalle et à la caméra existantes, sans déplacement correctif de l’interface React. Les coordonnées source de la dalle sont X = −0,0472591966 à 0,0469950773 et Z = −0,0015805531 à 0,0514134541, après normalisation d’orientation. Elles sont projetées dans le repère cible X = **−1,7724657059 à 0,9286899567**, Z = **0,3342224658 à 1,6434509754**, avec Y de dalle = **−0,3079999983**.
- Les portions latérales hors dalle sont redimensionnées depuis leurs bords respectifs avec des coefficients **24,5 à gauche et 19,5 à droite**. Les marges au-dessus et au-dessous de la dalle sont comprimées respectivement par **0,70 et 0,60**. La profondeur utilise `Y = −0,3079999983 + (Ysource + 0,03245572187) × 17`.
- Reconstruction des matériaux Principled à partir des six cartes fournies. Albedo et émissif restent en couleur ; AO, métal, rugosité et normales sont lus en données linéaires (`Non-Color`). La teinte graphite froide et les symboles bleutés sont obtenus dans les matériaux, sans modifier les textures sources.
- AO mélangée à 35 %, rugosité remappée entre 0,18 et 0,49 pour la coque et les commandes, normal map d’intensité 0,55, émission 0,12 et vernis modéré. Le mesh `middlepart_low` devient `ChromeEdges / middlepart_low` : métal argenté à 0,92, rugosité entre 0,16 et 0,31. Les reflets proviennent de cette géométrie fournie et de l’éclairage.
- Conservation des treize identifiants de commande déjà utilisés par React. Les quatre directions et les quatre boutons d’action étant déjà séparés, aucune découpe approximative du D-pad n’est nécessaire. Les boutons source **12 (Display) et 13 (Music) restent décoratifs**, sans nouvelle fonction ni zone interactive.
- Remplacement du matériau de `screen_low`, renommé `ScreenOpening`, par un matériau **Holdout** qui retire le menu LCD peint du rendu. Une vitre transparente séparée fournit les reflets. Le fond affiché par React reste l’illustration dédiée existante, générée avec ImageGen : ville nocturne bleue, galaxie, lune et silhouette assise. Ce fond ne remplace pas celui du portfolio.

Les collections sous `PSP_ROOT` restent `BODY`, `SCREEN`, `DPAD`, `ACTION_BUTTONS`, `SYSTEM_BUTTONS`, `ANALOG`, `REFLECTIONS`, `SHADOWS`, `STUDIO`. Chaque pièce interactive porte une propriété `psp_control`, et les meshes importés conservent leur nom source dans `source_mesh`. La correspondance est explicite dans `build_scene.py` :

| Mesh source                    | Identifiant existant                    |
| ------------------------------ | --------------------------------------- |
| `button1_low` à `button4_low`  | `up`, `right`, `down`, `left`           |
| `button5_low` à `button8_low`  | `triangle`, `circle`, `cross`, `square` |
| `button9_low` à `button11_low` | `home`, `volume-down`, `volume-up`      |
| `button14_low`, `button15_low` | `select`, `start`                       |

Le résultat est une adaptation du modèle fourni à la référence, pas une copie pixel pour pixel de la photographie. La topologie de la coque, certains petits détails et l’illustration d’écran restent propres à cette réalisation.

## Caméra, éclairage et calage

Caméra perspective fixe, verrouillée en position, rotation et échelle :

| Paramètre               | Valeur                            |
| ----------------------- | --------------------------------- |
| Résolution              | 1620 × 698, transparent RGBA      |
| Focale / capteur        | 99,15277 mm / 36 mm               |
| Position XYZ            | 3,049518 ; −11,258713 ; −2,479765 |
| Rotation XYZ en radians | 1,866937 ; −0,138146 ; 0,264990   |
| Décalage optique XY     | −0,007640 ; −0,028690             |
| Moteur / échantillons   | Cycles / 64, débruitage activé    |
| Gestion des couleurs    | AgX                               |

La caméra et les quatre points de dalle restent ceux de l’intégration précédente. Leur position découle de l’ajustement initial sur les coins de l’écran de référence. Le FBX est adapté à ce repère : façade vers −Y, verticale sur Z. L’aperçu utilise 24 échantillons et 65 % de la résolution ; les exports définitifs utilisent les dimensions complètes ci-dessus.

Éclairage par quatre surfaces : softbox froide (440 W, 5 × 2), bord bleu (340 W, 3 × 1), bord violet (230 W, 3 × 1) et remplissage frontal (25 W, 4 × 3). Les positions, couleurs et cibles exactes sont conservées dans `scripts/psp/build_scene.py` et dans le `.blend`. Le monde contribue avec une intensité de 0,35. Le fond est transparent.

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

| Fichier                  | Contenu                                                                    |
| ------------------------ | -------------------------------------------------------------------------- |
| `psp-body.webp`          | Coque, détails et supports, sans commandes interactives ni contenu d’écran |
| `psp-shadow.webp`        | Ombre issue du shadow catcher Cycles                                       |
| `psp-reflections.webp`   | Cadre intermédiaire argenté réfléchissant, même caméra                     |
| `psp-screen-glass.webp`  | Surface transparente et reflets discrets de la vitre                       |
| `screen-wallpaper.webp`  | Illustration de fond de l’écran React, 1440 × 810                          |
| `buttons/*-idle.webp`    | Treize commandes au repos                                                  |
| `buttons/*-pressed.webp` | Les mêmes commandes réellement enfoncées de 0,016 unité suivant Y          |
| `layout.json`            | Résolution, quatre coins, rectangles des sprites et caméra                 |

Les 26 sprites sont recadrés après rendu avec **le même rectangle pour les deux états**, sans déplacement des pixels. Le manifeste utilise l’union de la géométrie évaluée au repos et enfoncée, avec une marge de huit pixels ; une commande sortant du canevas provoque une erreur. Le script de recadrage contrôle les treize identifiants attendus, refuse les états vides et tout rectangle qui couperait des pixels visibles, vérifie les dimensions des grands calques et refuse les calques vides. Les deux états ont la même caméra, les mêmes matériaux et les mêmes lumières ; seul l’enfoncement de la pièce change. Le déplacement de 0,016 est enregistré dans la propriété de scène `psp_press_travel`.

Le calque de reflets conserve l’occlusion de la façade et des commandes grâce à des objets Holdout temporaires. Seules les parties visibles du cadre métallique sont exportées : ses faces arrière ne se superposent pas à la coque lors de l’assemblage HTML. L’export restaure ces propriétés après le rendu.

Les noms des ressources et des commandes restent inchangés pour React ; les rectangles de boutons sont recalculés depuis les nouvelles pièces. `layout.json` contient également l’attribution `modelSource`. Les trente rendus v2 totalisent **435 510 octets (environ 425 Kio)** ; avec le fond d’écran conservé, **547 062 octets (environ 534 Kio)**. Les fichiers FBX, textures sources, Blender et scripts ne sont pas envoyés au navigateur.

## Architecture React et commandes

`PSPConsole` assemble l’ombre, l’écran, la coque, les boutons, la vitre et les reflets. Les calques décoratifs n’interceptent aucun clic. Les deux images de chaque bouton sont chargées dès le montage ; un fondu de 60 ms à l’appui et 95 ms au relâchement accompagne le changement d’état. La préférence de réduction des animations supprime ce fondu.

`usePSPControls` constitue le point d’entrée commun souris/tactile/clavier. Il gère les appuis, relâchements, annulations de pointeur, pertes de focus et sons optionnels. `pspNavigation.ts` contient le réducteur pur : page actuelle, sélection, page d’origine, détail, historique, panneaux d’aide/options/crédits, luminosité et sons.

| Commande        | Action                                                  |
| --------------- | ------------------------------------------------------- |
| D-pad / flèches | Sélection précédente/suivante, avec boucle              |
| Croix / Entrée  | Ouvrir ou confirmer ; ouvrir un lien depuis son détail  |
| Cercle / Échap  | Fermer le panneau, revenir du détail ou revenir au menu |
| Triangle / S    | Options : sons et luminosité                            |
| Carré / A       | Aide                                                    |
| Start / Home    | Menu principal, sélection conservée                     |
| Select          | Crédits et attribution du modèle                        |
| Volume − / +    | Niveau des seuls effets PSP, de 0 à 3                   |

Les raccourcis sont gérés par propagation dans la console, jamais par un écouteur clavier global. Les champs de saisie et les raccourcis avec Ctrl/Alt/Meta restent libres. Les boutons natifs et liens restent utilisables avec Tab et Entrée. Une flèche utilisée sur un menu recentre le focus sur son écran pour que la confirmation ouvre la sélection courante.

Les rubriques réutilisent les données réelles du portfolio :

- **About** : profil et paragraphes de `src/data/about.ts` ; navigation entre paragraphes.
- **Projects** : projets de `src/data/projects.ts` ; vignettes, détails, tags et liens existants.
- **Skills** : catégories de `src/data/skills.ts` ; liste puis compétences de chaque catégorie.
- **Contact** : adresse et liens de `src/data/socialLinks.ts` ; détail avant ouverture explicite.

About est sélectionné au démarrage. La navigation ne modifie pas l’URL et ne fait pas défiler la page principale. Seuls les liens confirmés ouvrent explicitement une destination externe ou le client de messagerie.

L’état est volontairement limité à la session React : l’actualisation revient au menu initial. Le mode agrandi partage **le même contrôleur** et conserve la sélection et la page. L’écran miniature est alors inerte pour l’accessibilité. Le dialogue natif gère le focus modal ; sa fermeture rend le focus au bouton d’ouverture. Échap revient d’abord dans la navigation, puis ferme la vue agrandie à l’accueil.

Les sons sont des notes synthétisées localement, activées par défaut (`Navigation sounds: On`) et désactivables dans les options de la PSP. Ils sont déclenchés uniquement après interaction, respectent le mute mémorisé du lecteur musical et ne modifient ni son volume de 5 %, ni sa position, ni ses événements. Une seule note de navigation est active à la fois. Un refus de Web Audio laisse la navigation silencieuse et fonctionnelle.

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

Pour revenir à la version précédente, restaurer ensemble le master de `legacy-v1/` dans `assets-source/psp/PSP-portfolio.blend`, les quatre scripts dans `scripts/psp/`, la documentation dans `docs/psp-console.md` et les ressources de `rendered-assets.zip` dans leur emplacement `src/assets/images/psp/`. Les crédits de la console doivent alors correspondre de nouveau à la source aXel historique. **Ne pas exécuter les scripts archivés directement dans `legacy-v1/`** : ils calculent les chemins du projet depuis leur emplacement et doivent d’abord retrouver leurs chemins d’origine. Les sources originales des deux modèles restent conservées.

Pour modifier le contenu ou ajouter une rubrique, intervenir dans `PSPScreen.tsx`, les données correspondantes et le réducteur ; ne pas déplacer la dalle à la main dans le CSS. Toute nouvelle commande doit suivre le même chemin `press/release/trigger` afin de conserver la synchronisation visuelle.

## Vérifications du remplacement

**Vérifications terminées le 5 novembre 2026.** Les 70 tests du repository, ESLint, la compilation TypeScript et le build Vite passent. La comparaison avant/après à 1600, 1024, 768 et 390 px confirme des dimensions identiques pour la navbar, la grille Hero, les autres sections, l’emplacement PSP et la largeur de page.

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
