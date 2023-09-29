import { forwardRef } from 'react'
import { motion } from 'framer-motion'
import type { HTMLMotionProps } from 'framer-motion'
import type { PropsWithChildren } from 'react'

import { softSpringPreset } from '~/constants/spring'

export const MotionDivToBottom = forwardRef<
  HTMLDivElement,
  PropsWithChildren & HTMLMotionProps<'div'>
>((props, ref) => {
  const { children, ...rest } = props

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: -10,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      exit={{
        opacity: 0,
        y: -10,
      }}
      transition={softSpringPreset}
      {...rest}
      ref={ref}
    >
      {children}
    </motion.div>
  )
})

MotionDivToBottom.displayName = 'MotionDiv'
