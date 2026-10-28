import styles from './IntroExperience.module.css'

export function IntroBackdrop() {
  return (
    <div className={styles.atmosphere} aria-hidden="true">
      <div className={styles.halo} />
      <svg className={styles.waves} viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="intro-ribbon" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#3a8dff" stopOpacity="0" />
            <stop offset=".48" stopColor="#64c7ff" stopOpacity=".2" />
            <stop offset=".78" stopColor="#9385ff" stopOpacity=".1" />
            <stop offset="1" stopColor="#3a8dff" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="intro-edge">
            <stop stopColor="#64adff" stopOpacity="0" />
            <stop offset=".5" stopColor="#9bc8ff" stopOpacity=".75" />
            <stop offset="1" stopColor="#9385ff" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          fill="url(#intro-ribbon)"
          d="M-200 540C200 100 600 900 1100 440S1800 320 1900 430L1900 550C1400 270 1300 820 800 620S100 470-200 650Z"
        />
        <g fill="none" stroke="url(#intro-edge)">
          <path strokeWidth="1.4" d="M-100 520C250 210 510 850 1080 470S1600 280 1800 440" />
          <path
            strokeWidth=".7"
            opacity=".5"
            d="M-150 560C220 230 550 900 1080 500S1650 340 1800 480"
          />
          <path
            strokeWidth=".8"
            opacity=".4"
            d="M-200 620C310 330 640 790 1190 540S1660 470 1800 500"
          />
          <path
            strokeWidth=".6"
            opacity=".3"
            d="M-100 390C350 730 630 310 1100 580S1650 600 1800 410"
          />
        </g>
      </svg>
      <div className={styles.particles}>
        {[0, 1, 2, 3, 4, 5, 6, 7].map((dot) => (
          <i key={dot} />
        ))}
      </div>
    </div>
  )
}
