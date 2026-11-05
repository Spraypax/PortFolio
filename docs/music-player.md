# Lecteur musical de la navbar

## Source et chapitres vérifiés

Source : [PS1 Liquid D&B Mix - Jazzy D&B, Atmospheric, Jungle, Y2K](https://www.youtube.com/watch?v=Izd1oYIbfbg), par Shredward.

Lors de l'essai réel du 5 novembre 2026, cette vidéo a renvoyé l'erreur d'intégration YouTube **150**, alors que la vidéo de démonstration officielle était lisible dans le même environnement. Le propriétaire du portfolio a donc choisi la source locale et fourni le MP3 du même mix. Ce fichier a été découpé aux 19 débuts vérifiés, avec décodage précis et encodage MP3 stéréo à 192 kbit/s, sans modifier l'original. Chaque section possède son propre fichier sous `src/assets/audio/music/`, avec titre et crédit dans ses métadonnées ID3. Aucun téléchargement ou extraction depuis YouTube n'a été effectué.

Les 19 débuts, titres et crédits ci-dessous proviennent de la description et des chapitres de cette vidéo, consultés le 5 novembre 2026. Le crédit peut désigner un jeu ou sa bande originale plutôt qu'un artiste. Chaque fin correspond au début du chapitre suivant : il s'agit des sections du mix, pas nécessairement de la durée de la version originale des morceaux.

| Titre                               | Crédit publié                    | Début | Fin                    | Durée de section |
| ----------------------------------- | -------------------------------- | ----- | ---------------------- | ---------------- |
| BIOS                                | Zorrovian                        | 00:00 | 02:12                  | 02:12            |
| Us Ephemeral (George Clanton Remix) | Vitesse X                        | 02:12 | 05:00                  | 02:48            |
| Frosty Retreat (Outside)            | Ape Escape                       | 05:00 | 07:05                  | 02:05            |
| EMERALD HANDS                       | black balloons                   | 07:05 | 08:21                  | 01:16            |
| Night Stream                        | Ridge Racers                     | 08:21 | 12:00                  | 03:39            |
| Resonance                           | DV-i                             | 12:00 | 13:33                  | 01:33            |
| Before Dawn (4 am Mix)              | Phuture Assassins                | 13:33 | 16:53                  | 03:20            |
| The Fountain                        | Blu Mar Ten                      | 16:53 | 18:14                  | 01:21            |
| Triangles                           | TOKYOPILL                        | 18:14 | 20:58                  | 02:44            |
| Lucid Rhythms                       | Ridge Racer 4                    | 20:58 | 22:32                  | 01:34            |
| Snowland (Necro & Twelve Stage)     | Street Fighter III: Third Strike | 22:32 | 24:17                  | 01:45            |
| Mount Amazing 2                     | Ape Escape 3                     | 24:17 | 26:02                  | 01:45            |
| Warp Trooper                        | Ridge Racers                     | 26:02 | 27:45                  | 01:43            |
| SR20DET                             | Blksmiith                        | 27:45 | 31:51                  | 04:06            |
| My Head Hurts                       | strxwberrymilk                   | 31:51 | 34:11                  | 02:20            |
| EARTHBOUND                          | black balloons                   | 34:11 | 35:30                  | 01:19            |
| Crystal Waves                       | Cxldr3                           | 35:30 | 37:04                  | 01:34            |
| Nova                                | Love Spirals Downwards           | 37:04 | 39:01                  | 01:57            |
| DEEP SEA                            | Super Monkey Ball: Banana Mania  | 39:01 | Fin réelle de la vidéo | Environ 01:51    |

Le MP3 fourni dure environ 40:52,35, ce qui correspond à la vidéo. La dernière section est découpée jusqu'à sa fin réelle et utilise `endSeconds: null`, résolu par la durée du fichier audio. Pour les 18 premières pistes locales, le début est zéro et la durée correspond à la différence entre deux timestamps de la source.

## Commandes et continuité

- La première piste démarre automatiquement une fois l'introduction entièrement terminée et la page principale visible. Une seule tentative est effectuée ; si le navigateur refuse, Play permet de lancer la musique manuellement. Les effets sonores d'introduction gardent leur fonctionnement et leur volume.
- Play/Pause reprend la position courante. Une pause ou un arrêt manuel n'est pas annulé par le démarrage automatique, la navigation ou un retour à l'onglet.
- Next lance directement la piste suivante à son début ; Previous redémarre la piste après plus de trois secondes, sinon sélectionne la précédente. La playlist boucle.
- Le carré arrête la lecture et revient au début de la piste courante.
- Les fichiers locaux s'enchaînent automatiquement à leur fin et la dernière piste revient à la première. Un unique élément audio est conservé pendant la navigation et l'ouverture des dialogues.
- Le transport vérifie aussi la position toutes les 250 ms. L'adaptateur YouTube facultatif suit les chapitres contigus sans rechargement ; la précision d'un déplacement YouTube reste celle de l'API et de ses images clés.
- La pochette locale et le format desktop de 56 px sont conservés. Les titres longs sont tronqués avec leur texte complet au survol.
- Les barres constituent une animation décorative simulée, sans analyse des fréquences. Elles se figent et se réduisent progressivement en pause ; elles respectent la réduction des mouvements.
- Le panneau donne accès au volume, à la sourdine et à la liste sélectionnable des pistes. Le volume par défaut est de **5 %**, pour une ambiance de fond discrète. Les anciennes préférences plus fortes sont ramenées une fois à ce niveau ; une sourdine ou un volume inférieur sont conservés. Les nouveaux choix manuels de volume et de sourdine sont mémorisés dans `localStorage` si disponible. Une actualisation repart sur la première piste et attend la fin de l'introduction pour tenter de la lancer.

## Adaptateur YouTube facultatif

La playlist active est locale : aucun script ni iframe YouTube n'est chargé. L'adaptateur YouTube est conservé pour une éventuelle source intégrable. Si une telle source est configurée, l'API est chargée à la première ouverture du panneau, sans clé et sans extraction audio. Le lecteur officiel conserve ses contrôles, son image et ses éléments YouTube. Son viewport ne descend pas sous 200 × 200 px. Aucun élément n'est superposé sur sa surface.

Le panneau est un popover non modal, conservé pendant le défilement et la navigation par ancres. Sur les navigateurs disposant de `Element.moveBefore`, le même hôte est déplacé atomiquement dans les dialogues natifs ouverts : l'iframe reste visible et utilisable, sans rechargement. Sur les anciens navigateurs, il reste visible au-dessus du dialogue, avec les restrictions d'interaction du navigateur pendant la modalité.

Pour YouTube, fermer le panneau met en pause avant de retirer le lecteur. Masquer l'onglet met également la vidéo en pause ; le retour à l'onglet ne force pas sa reprise. Un refus de lecture automatique attend une nouvelle action et ne déclenche pas de boucle de tentatives. Les erreurs d'intégration ou de réseau apparaissent dans le panneau, avec un lien vers la source.

Références : [API IFrame](https://developers.google.com/youtube/iframe_api_reference), [affichage et taille minimum](https://developers.google.com/youtube/terms/required-minimum-functionality), [règles de lecture](https://developers.google.com/youtube/terms/developer-policies).

## Configuration

`src/data/musicChapters.ts` centralise les titres, crédits et timestamps `mm:ss` (ou `hh:mm:ss`) vérifiés. `src/data/music.ts` importe les 19 MP3 et les associe à ces informations dans le même ordre avec `createLocalPlaylist`. Les sections invalides ou un nombre de fichiers différent du nombre de chapitres sont rejetés. Modifier les limites de découpage implique aussi de redécouper les fichiers correspondants. Le paramètre de radio du lien YouTube fourni n'est pas utilisé : toutes les pistes proviennent du même mix.

Pour des fichiers audio dont la diffusion est autorisée, `MusicTrack` accepte aussi une source `{ kind: 'audio', url }`, un début à zéro et une fin explicite ou `null`. Chaque morceau doit avoir son propre fichier importé dans les données. `LocalAudioAdapter` utilise un unique élément audio natif persistant ; le panneau peut alors être fermé sans interrompre la musique et aucune vidéo n'est nécessaire. Aucun téléchargement ni extraction depuis YouTube n'est effectué.

## Vérification

Les tests Node de `tests/music.test.mjs` couvrent les 19 chapitres, les timestamps, les transports, les transitions naturelles, les seeks obsolètes, la boucle finale, les préférences, les refus d'autoplay et le transport de sources audio indépendantes. Les vérifications navigateur doivent aussi distinguer les tests à API simulée des essais avec la vidéo officielle réelle, soumis au réseau et aux restrictions du navigateur.

La version locale a été vérifiée avec les 19 MP3 réels : lecture/pause/reprise, précédent/suivant, fin de section et boucle finale, conservation du même élément audio pendant About/Skills/Experience/Projects, fermeture du panneau sans interruption, volume/sourdine après rechargement et formats 1440/1024/768/390/320 px. Le contexte `PortfolioReadyContext` partage désormais la fin de l'introduction avec les fonctionnalités de la page principale ; les contrôleurs et les fichiers sonores de l'introduction restent inchangés.
