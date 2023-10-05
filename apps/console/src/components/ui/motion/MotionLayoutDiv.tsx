import { forwardRef } from 'react'
import { motion } from 'framer-motion'
import type { ForwardRefComponent, HTMLMotionProps } from 'framer-motion'

export const MotionLayoutDiv: ForwardRefComponent<
  HTMLDivElement,
  HTMLMotionProps<'div'>
> = forwardRef((props, ref) => {
  const { children, ...rest } = props
  return (
    <motion.div layout ref={ref} {...rest}>
      {children}
    </motion.div>
  )
})

MotionLayoutDiv.displayName = 'MotionLayoutDiv'
