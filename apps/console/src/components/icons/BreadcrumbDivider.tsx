import React from 'react'

export const BreadcrumbDivider: Component = ({ className }) => {
  return (
    <svg
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      color="currentColor"
      shapeRendering="geometricPrecision"
      viewBox="0 0 24 24"
      className={className}
    >
      <path d="M16.88 3.549L7.12 20.451"></path>
    </svg>
  )
}
