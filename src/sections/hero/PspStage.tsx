import styles from './PspStage.module.css'

export function PspStage() {
  // TODO: PSP 2.5D integration
  // The empty mount reserves the existing desktop layout for a future PSP assembly.
  return (
    <div className={styles.stage} aria-hidden="true" data-psp-stage>
      <div className={styles.mount} />
    </div>
  )
}
