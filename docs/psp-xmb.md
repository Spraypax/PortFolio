# Navigation XMB et consultation du CV

La refonte du 5 novembre 2026 concerne uniquement l’interface React de la PSP. Le modèle, les rendus 2.5D, la projection de l’écran, la position de la console et les autres sections du portfolio sont conservés.

## Organisation

- `pspContent.ts` construit les catégories **Home, Projects, Skills, Contact** depuis les données du portfolio. Home contient About et CV. Projects, Skills et Contact reprennent leurs sources existantes.
- `PSPXMB.tsx` et son module CSS fournissent le menu horizontal et la liste verticale partagés. La liste défile localement pour garder la sélection visible, avec respect de la préférence de réduction des animations.
- `pspNavigation.ts` gère les deux axes, les sélections par catégorie, les détails, les panneaux et le lecteur CV. Les tests du réducteur couvrent les retours, les limites, les listes vides et les préférences audio.
- `usePSPControls.ts` reste le contrôleur commun aux boutons physiques, au clavier et aux actions tactiles. Les nouvelles confirmations passent par ce contrôleur pour conserver les sons et les états d’appui.
- `PSPScreen.tsx` compose le menu, les contenus existants et les panneaux. `PSPConsole.tsx` partage le contrôleur entre la dalle et le dialogue agrandi.

Gauche/droite changent de catégorie ; haut/bas parcourent les éléments. Croix/Entrée ouvre un élément, Cercle/Échap revient au XMB ou ferme le panneau courant. Triangle/S, Carré/A et Select conservent respectivement Options, aide et crédits. Start/Home revient au XMB sans perdre les sélections. Dans About, haut/bas parcourent les paragraphes ; dans CV, ils changent de page sans dépasser les limites du document.

Les projets et les groupes de compétences affichent leurs détails dans l’écran. Une confirmation supplémentaire depuis un projet ouvre son lien réel. Confirmer un contact ouvre directement sa destination configurée : messagerie pour l’adresse email, nouvel onglet pour les liens web. Aucun menu HTML `select` ni nouvelle dépendance npm n’est utilisé.

## Document CV

La source existante est `src/assets/documents/DUPONT_Lelian_CV_ATS.pdf`, référencée dans `src/data/profile.ts`. Elle contient actuellement **deux pages A4**. Le bouton **Download CV** télécharge ce fichier original ; le lien d’ouverture permet également de le consulter dans le lecteur PDF du navigateur.

`PSPCVViewer.tsx` fournit une consultation intégrée par aperçus fidèles des pages, plutôt qu’un lecteur PDF embarqué dépendant du navigateur. La pagination, le zoom de **100 à 400 %** et le défilement restent dans l’écran PSP. Le bouton d’agrandissement réutilise le dialogue existant et conserve la page et le zoom. À 100 %, la page s’adapte à la largeur disponible ; le zoom permet de lire les petits caractères sur mobile.

Les aperçus WebP lossless se trouvent dans `src/features/psp/assets/cv/`. Leur manifeste conserve le nombre et les dimensions des pages, la résolution de rendu et l’empreinte SHA-256 du PDF source. `cvDocument.ts` expose cette configuration au composant. Aucun contenu de CV n’est inventé ou retranscrit manuellement.

Pour régénérer les aperçus après modification du PDF, depuis la racine du projet :

```powershell
python scripts/psp/render_cv.py
node --experimental-strip-types --test tests/psp-cv.test.mjs
```

Le script nécessite **Pillow**, **pypdf** et **Poppler** (`pdftoppm` accessible dans PATH). Le rendu par défaut est de 192 dpi ; `--dpi` accepte 96 à 300. Il lit le PDF sans le modifier et régénère les aperçus et le manifeste. Le test détecte une source modifiée sans régénération et vérifie les fichiers de chaque page. Si le chemin du document change, adapter également la source déclarée dans le script et le lien existant dans `profile.ts`.

Limite : les aperçus intégrés sont des images, sans sélection ni recherche de texte. Le PDF original reste disponible pour ces usages et pour sa structure accessible. Le mode agrandi et le PDF original permettent une consultation plus confortable que la petite dalle.

## Vérifications

Les **78 tests**, ESLint et le build TypeScript/Vite valident l’ensemble du projet. Les tests spécifiques couvrent la navigation à deux axes, les sélections mémorisées, les listes vides, les pages et le zoom du CV, les panneaux et les sons. Le téléchargement a été comparé par SHA-256 au PDF source.

Le parcours navigateur local `.verification/psp-xmb.cjs` vérifie les quatre listes, les contenus et destinations réels, la consultation du CV, les treize commandes, l’état partagé avec la vue agrandie, les options entièrement visibles, les sons On/Off et le respect du mute musical. Il contrôle également la continuité de l’unique élément musical à 5 %, l’actualisation et l’absence d’erreurs JavaScript.

`.verification/psp-xmb-touch.cjs` vérifie les événements tactiles, la pagination et le défilement du CV à 400 %, ainsi que le dialogue About extérieur et les limites des raccourcis. `.verification/psp-xmb-focus.cjs` vérifie la conservation du focus après ouverture des options ou de l’aide depuis un élément XMB, puis après retour depuis un contrôle CV démonté, dans les deux modes d’écran. Le focus est transféré vers l’écran stable avant les commandes clavier pour éviter qu’il ne quitte la console lorsqu’un élément devient inerte.

Les dimensions de la console et des autres sections ont été comparées à 1600, 1024, 768 et 390 px. Le nouvel écran et les options ont été vérifiés de 320 à 1920 px, ainsi qu’en paysage à 844 × 390 px. Les vérifications tactiles et responsive utilisent Chrome avec des événements et viewports simulés, sans validation sur appareil physique. Les scripts locaux de `.verification/` sont ignorés par Git ; les tests du réducteur et du CV sont versionnés dans `tests/`.
