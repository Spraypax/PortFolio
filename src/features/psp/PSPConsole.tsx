import { useEffect, useId, useRef, useState } from 'react'
import type { CSSProperties, KeyboardEvent, PointerEvent } from 'react'
import { Maximize2, X } from 'lucide-react'
import body from '@/assets/images/psp/psp-body.webp'
import shadow from '@/assets/images/psp/psp-shadow.webp'
import glass from '@/assets/images/psp/psp-screen-glass.webp'
import reflections from '@/assets/images/psp/psp-reflections.webp'
import layout from '@/assets/images/psp/layout.json'
import { PSPScreen } from './PSPScreen'
import { usePSPControls } from './usePSPControls'
import type { PSPControls } from './usePSPControls'
import type { PSPControl } from './pspNavigation'
import { rectangleToQuad } from './screenProjection'
import styles from './PSPConsole.module.css'

const sprites = import.meta.glob<string>('../../assets/images/psp/buttons/*.webp', {
  eager: true,
  query: '?url',
  import: 'default',
})
const screenMatrix = rectangleToQuad(
  layout.screen.width,
  layout.screen.height,
  layout.screen.corners.map(([x, y]) => [x, y] as const),
)
const buttonLabels: Record<PSPControl, string> = {
  up: 'PSP : haut',
  down: 'PSP : bas',
  left: 'PSP : gauche',
  right: 'PSP : droite',
  cross: 'Croix : confirmer',
  circle: 'Cercle : retour',
  triangle: 'Triangle : options',
  square: 'Carré : aide',
  start: 'Start : menu principal',
  select: 'Select : crédits',
  home: 'Home : menu principal',
  'volume-down': 'Diminuer le volume des sons PSP',
  'volume-up': 'Augmenter le volume des sons PSP',
}

function PSPButton({ control, controls }: { control: PSPControl; controls: PSPControls }) {
  const sprite = layout.buttons[control]
  const action = ['cross', 'circle', 'triangle', 'square'].includes(control)
  const direction = ['up', 'down', 'left', 'right'].includes(control)
  const style: CSSProperties = {
    left: `${(sprite.x / layout.width) * 100}%`,
    top: `${(sprite.y / layout.height) * 100}%`,
    width: `${(sprite.width / layout.width) * 100}%`,
    height: `${(sprite.height / layout.height) * 100}%`,
  }
  function release(event: PointerEvent<HTMLButtonElement>) {
    controls.release(control)
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }
  return (
    <button
      type="button"
      className={styles.physicalButton}
      style={style}
      aria-label={buttonLabels[control]}
      title={buttonLabels[control]}
      data-psp-control={control}
      data-pressed={controls.pressed.has(control) || undefined}
      data-shape={action ? 'round' : direction ? 'direction' : 'system'}
      onPointerDown={(event) => {
        if (event.button !== 0) return
        event.preventDefault()
        event.currentTarget.focus({ preventScroll: true })
        event.currentTarget.setPointerCapture(event.pointerId)
        controls.press(control)
      }}
      onPointerUp={release}
      onPointerCancel={release}
      onLostPointerCapture={() => controls.release(control)}
      onBlur={() => controls.release(control)}
      onClick={(event) => {
        // Pointer actions run on press; keyboard and assistive clicks run here.
        if (event.detail === 0) controls.trigger(control)
      }}
    >
      <img src={sprites[`../../assets/images/psp/${sprite.idle}`]} alt="" draggable={false} />
      <img
        className={styles.pressedSprite}
        src={sprites[`../../assets/images/psp/${sprite.pressed}`]}
        alt=""
        draggable={false}
      />
      <span className={styles.buttonHitArea} aria-hidden="true" />
    </button>
  )
}

export function PSPConsole() {
  const controls = usePSPControls()
  const viewport = useRef<HTMLDivElement>(null)
  const consoleRoot = useRef<HTMLDivElement>(null)
  const dialog = useRef<HTMLDialogElement>(null)
  const opener = useRef<HTMLButtonElement>(null)
  const [expanded, setExpanded] = useState(false)
  const helpId = useId()
  const dialogTitleId = useId()

  useEffect(() => {
    const element = viewport.current
    if (!element) return
    const resize = () =>
      element.style.setProperty('--psp-scale', String(element.clientWidth / layout.width))
    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  function closeScreen() {
    dialog.current?.close()
    controls.releaseAll()
    setExpanded(false)
    opener.current?.focus({ preventScroll: true })
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (
      expanded &&
      event.key === 'Escape' &&
      controls.state.currentPage === 'home' &&
      !controls.state.panel
    ) {
      event.preventDefault()
      event.stopPropagation()
      closeScreen()
      return
    }
    controls.keyboardHandlers.onKeyDown(event)
  }

  return (
    <div
      ref={consoleRoot}
      className={styles.console}
      role="group"
      aria-label="Console PSP interactive"
      aria-describedby={helpId}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onKeyUp={controls.keyboardHandlers.onKeyUp}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) controls.releaseAll()
      }}
      onPointerDown={(event) => {
        if (!(event.target as HTMLElement).closest('button, a, input, textarea, select, dialog')) {
          consoleRoot.current?.focus({ preventScroll: true })
        }
      }}
      data-psp-console
    >
      <p id={helpId} className="sr-only">
        Cliquez sur la console pour utiliser les flèches. Entrée confirme, Échap revient, A affiche
        l’aide et S ouvre les options. Les boutons de la console sont aussi cliquables.
      </p>
      <div
        ref={viewport}
        className={styles.viewport}
        style={{ aspectRatio: `${layout.width} / ${layout.height}` }}
      >
        <div className={styles.canvas} style={{ width: layout.width, height: layout.height }}>
          <img
            className={`${styles.layer} ${styles.shadow}`}
            src={shadow}
            alt=""
            draggable={false}
          />
          <div
            className={styles.screenPlane}
            style={{
              width: layout.screen.width,
              height: layout.screen.height,
              transform: `matrix3d(${screenMatrix.join(',')})`,
            }}
            aria-hidden={expanded || undefined}
            inert={expanded || undefined}
          >
            <PSPScreen controls={controls} />
          </div>
          <img className={`${styles.layer} ${styles.body}`} src={body} alt="" draggable={false} />
          {(Object.keys(layout.buttons) as PSPControl[]).map((control) => (
            <PSPButton key={control} control={control} controls={controls} />
          ))}
          <img className={`${styles.layer} ${styles.glass}`} src={glass} alt="" draggable={false} />
          <img
            className={`${styles.layer} ${styles.reflections}`}
            src={reflections}
            alt=""
            draggable={false}
          />
        </div>
      </div>
      <div className={styles.toolbar}>
        <span aria-hidden="true">↑ ↓ ← → · Entrée · Échap</span>
        <button
          ref={opener}
          type="button"
          data-psp-native
          className={styles.expandButton}
          aria-haspopup="dialog"
          onClick={() => {
            controls.releaseAll()
            dialog.current?.showModal()
            setExpanded(true)
            dialog.current?.focus({ preventScroll: true })
          }}
        >
          <Maximize2 size={12} aria-hidden="true" /> Agrandir l’écran
        </button>
      </div>
      <dialog
        ref={dialog}
        className={styles.screenDialog}
        aria-labelledby={dialogTitleId}
        tabIndex={-1}
        onCancel={(event) => {
          event.preventDefault()
          closeScreen()
        }}
        onClose={() => setExpanded(false)}
      >
        <div className={styles.dialogHeader}>
          <h2 id={dialogTitleId}>PSP · Portfolio</h2>
          <button
            type="button"
            data-psp-native
            onClick={closeScreen}
            aria-label="Fermer l’écran agrandi"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        <div className={styles.enlargedScreen}>
          {expanded && <PSPScreen controls={controls} enlarged />}
        </div>
        <p className={styles.dialogHelp}>
          Touchez les menus ou utilisez les flèches. Échap revient, puis ferme l’écran à l’accueil.
        </p>
      </dialog>
    </div>
  )
}
