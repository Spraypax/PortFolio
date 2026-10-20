import styles from './PspStage.module.css'

export function PspStage() {
  // TODO: PSP 2.5D integration
  // This mount will host fixed Blender layers, a real HTML screen and independent controls.
  // Keep it empty in phase 1. No shell, screen, buttons or avatar are implemented here.
  return (
    <div className={styles.stage} aria-hidden="true" data-psp-stage>
      <div className={styles.mount} />
    </div>
  )
}
