import styles from './index.module.css'

import './index.global.css'

export const Background = () => {
  return (
    <div className={styles['root']}>
      <div className="scene">
        <div className="backdrop" />
        <div className="noise" />
        <div className="dots" />
        <div className="canvas" />
      </div>
    </div>
  )
}
