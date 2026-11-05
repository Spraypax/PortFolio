import { PSPConsole } from '@/features/psp/PSPConsole'
import styles from './PspStage.module.css'

export function PspStage() {
  return (
    <div className={styles.stage} data-psp-stage>
      <PSPConsole />
    </div>
  )
}
