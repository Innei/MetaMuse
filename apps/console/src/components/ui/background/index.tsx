import clsx from 'clsx'

import styles from './index.module.css'

export const Background = () => {
  return (
    <div className="absolute h-full w-full overflow-hidden">
      <div
        className={clsx(
          'absolute inset-[-100px] z-0 blur-md filter',
          styles.bg,
        )}
       />
    </div>
  )
}
