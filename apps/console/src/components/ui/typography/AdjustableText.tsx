import React, { useEffect, useRef, useState } from 'react'

interface IProps {
  style?: React.CSSProperties
}

export const AdjustableText: React.FC<
  IProps & {
    children: string
  }
> = ({ children, style = {} }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const ghostRef = useRef<HTMLDivElement>(null)
  const [fontSize, setFontSize] = useState<string | undefined>()

  useEffect(() => {
    const observer = new ResizeObserver(() => {
      cal()
    })

    observer.observe(containerRef.current!)

    cal()
    return () => {
      observer.disconnect()
    }

    function cal() {
      const containerWidth = containerRef.current?.clientWidth
      const ghostWidth = ghostRef.current?.offsetWidth

      if (containerWidth && ghostWidth && ghostWidth > containerWidth) {
        const newFontSize = (containerWidth / ghostWidth) * 1
        setFontSize(`${newFontSize}em`)
      }
    }
  }, [children])

  return (
    <span
      ref={containerRef}
      className="whitespace-nowrap"
      style={{ ...style, fontSize }}
    >
      {children}
      <span
        ref={ghostRef}
        className="invisible absolute whitespace-nowrap"
        style={style}
      >
        {children}
      </span>
    </span>
  )
}
