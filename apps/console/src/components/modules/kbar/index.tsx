import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  KBarAnimator,
  KBarPortal,
  KBarPositioner,
  KBarProvider,
  KBarResults,
  KBarSearch,
  useMatches,
} from 'kbar'
import type { Action, ActionId, ActionImpl } from 'kbar'
import type { FC, PropsWithChildren } from 'react'

import { useRefValue } from '~/hooks/common/use-ref-value'
import { clsxm } from '~/lib/helper'
import { flattedRoutes } from '~/router/builder'
import { useExtractTitleFunction } from '~/router/helper'

export const ComposedKBarProvider: FC<PropsWithChildren> = ({ children }) => {
  const extractTitle = useExtractTitleFunction()
  const nav = useNavigate()
  const actions: Action[] = useRefValue(
    () =>
      flattedRoutes
        .map<Action | null>((route) => {
          if (route.meta?.redirect) return null

          let name = ''

          if (route.parent) {
            name = extractTitle(route.parent.meta?.title) || ''
          }
          if (route.meta?.title) {
            if (name) name += ' > '
            name += `${extractTitle(route.meta?.title)}`
          }

          if (!name) return null

          return {
            id: route.path!,
            name,
            perform: () => {
              nav(`${route.path}`)
            },
          }
        })
        .filter(Boolean) as Action[],
  )

  return (
    <KBarProvider actions={actions}>
      {children}

      <KBarPortal>
        <KBarPositioner>
          <KBarAnimator className="max-w-[600px] w-full bg-foreground-100/60 backdrop-blur-md text-foreground rounded-lg overflow-hidden shadow-xl shadow-foreground-300">
            <KBarSearch className="p-3 text-lg w-full border-none outline-none bg-foreground-200/30 backdrop-blur-md text-foreground" />
            <RenderResults />
          </KBarAnimator>
        </KBarPositioner>
      </KBarPortal>
    </KBarProvider>
  )
}

function RenderResults() {
  const { results, rootActionId } = useMatches()

  return (
    <KBarResults
      items={results}
      onRender={({ item, active }) =>
        typeof item === 'string' ? (
          <div className="py-2 px-4 text-xs uppercase opacity-50">{item}</div>
        ) : (
          <ResultItem
            action={item}
            active={active}
            currentRootActionId={rootActionId!}
          />
        )
      }
    />
  )
}

const ResultItem = React.forwardRef(
  (
    {
      action,
      active,
      currentRootActionId,
    }: {
      action: ActionImpl
      active: boolean
      currentRootActionId: ActionId
    },
    ref: React.Ref<HTMLDivElement>,
  ) => {
    const ancestors = React.useMemo(() => {
      if (!currentRootActionId) return action.ancestors
      const index = action.ancestors.findIndex(
        (ancestor) => ancestor.id === currentRootActionId,
      )
      // +1 removes the currentRootAction; e.g.
      // if we are on the "Set theme" parent action,
      // the UI should not display "Set theme… > Dark"
      // but rather just "Dark"
      return action.ancestors.slice(index + 1)
    }, [action.ancestors, currentRootActionId])

    return (
      <div
        ref={ref}
        className={clsxm(
          `p-3 flex items-center justify-between cursor-pointer`,
          active ? 'bg-foreground-200/70' : '',
        )}
      >
        <div className="flex gap-2 items-center text-sm">
          {action.icon && action.icon}
          <div className="flex flex-col">
            <div>
              {ancestors.length > 0 &&
                ancestors.map((ancestor) => (
                  <React.Fragment key={ancestor.id}>
                    <span className="opacity-50 mr-2">{ancestor.name}</span>
                    <span className="mr-2">&rsaquo;</span>
                  </React.Fragment>
                ))}
              <span>{action.name}</span>
            </div>
            {action.subtitle && (
              <span className="text-xs">{action.subtitle}</span>
            )}
          </div>
        </div>
        {action.shortcut?.length ? (
          <div aria-hidden className="grid grid-flow-col gap-1">
            {action.shortcut.map((sc) => (
              <kbd
                key={sc}
                className="p-1 bg-foreground bg-opacity-10 rounded text-sm"
              >
                {sc}
              </kbd>
            ))}
          </div>
        ) : null}
      </div>
    )
  },
)

ResultItem.displayName = 'ResultItem'
