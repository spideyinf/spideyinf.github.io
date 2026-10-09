import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import styled from 'styled-components'

const KEY = 'note-map:instrument-order'

function loadOrder<T extends string>(fallback: T[]): T[] {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) ?? 'null')
    if (Array.isArray(saved) && saved.length === fallback.length && fallback.every((id) => saved.includes(id))) {
      return saved
    }
  } catch {
    // Storage blocked or corrupt: use the default order
  }
  return fallback
}

function saveOrder(order: string[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(order))
  } catch {
    // Not critical — the order just won't be remembered
  }
}

const Item = styled.div<{ $dragging: boolean }>`
  position: relative;
  border-radius: 18px;
  transition: box-shadow 0.15s;
  ${(p) =>
    p.$dragging &&
    `
    z-index: 5;
    box-shadow: 0 0 0 2px var(--hot), 0 18px 40px rgba(0, 0, 0, 0.45);
  `}
`

/** Drag handle that doubles as the card title: grip dots + the instrument name */
export const Handle = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin: -4px 0 -4px -8px;
  padding: 4px 10px 4px 8px;
  border: 1px solid transparent;
  border-radius: 10px;
  background: transparent;
  color: var(--ink);
  font: inherit;
  cursor: grab;
  touch-action: none;
  user-select: none;
  transition:
    background 0.15s,
    border-color 0.15s;
  &:hover,
  &:focus-visible {
    background: var(--well);
    border-color: var(--rule);
  }
  &:hover .grip,
  &:focus-visible .grip {
    color: var(--ink-soft);
  }
  &:active {
    cursor: grabbing;
  }
  .grip {
    display: grid;
    grid-template-columns: repeat(2, 3px);
    gap: 3px;
    color: var(--ink-faint);
    transition: color 0.15s;
  }
  .grip i {
    width: 3px;
    height: 3px;
    border-radius: 50%;
    background: currentColor;
  }
`

export const Grip = () => (
  <span className="grip" aria-hidden>
    {Array.from({ length: 6 }, (_, i) => (
      <i key={i} />
    ))}
  </span>
)

type HandleProps = {
  onPointerDown: (e: React.PointerEvent) => void
  onKeyDown: (e: React.KeyboardEvent) => void
  'aria-label': string
}

/**
 * Vertical list whose items can be reordered by dragging their handle (mouse,
 * pen or touch) or with ↑/↓ on a focused handle. The order is remembered.
 */
export function SortableStack<T extends string>({
  initial,
  render,
  label,
}: {
  initial: T[]
  /** Accessible name for an item's handle, given the direction it can move */
  label: (id: T, dir: 'up' | 'down') => string
  render: (id: T, handle: HandleProps, dragging: boolean) => ReactNode
}) {
  const [order, setOrder] = useState<T[]>(() => loadOrder(initial))
  const [dragging, setDragging] = useState<T | null>(null)
  const nodes = useRef(new Map<T, HTMLDivElement>())
  const before = useRef(new Map<T, number>())
  const drag = useRef<{ id: T; startY: number; offset: number } | null>(null)
  const orderRef = useRef(order)
  orderRef.current = order

  const commit = (next: T[]) => {
    // Remember where every card was so the swap can animate (FLIP)
    before.current = new Map(
      orderRef.current.map((id) => [id, nodes.current.get(id)?.getBoundingClientRect().top ?? 0]),
    )
    orderRef.current = next
    setOrder(next)
    saveOrder(next)
  }

  useLayoutEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    for (const [id, top] of before.current) {
      const el = nodes.current.get(id)
      if (!el) continue
      const delta = top - el.getBoundingClientRect().top
      if (!delta) continue
      if (drag.current?.id === id) {
        // The dragged card stays under the pointer: fold the jump into its offset
        drag.current.startY -= delta
        drag.current.offset += delta
        el.style.transform = `translateY(${drag.current.offset}px)`
        continue
      }
      if (reduce) continue
      el.style.transition = 'none'
      el.style.transform = `translateY(${delta}px)`
      requestAnimationFrame(() => {
        el.style.transition = 'transform 220ms cubic-bezier(.2,.8,.2,1)'
        el.style.transform = ''
      })
    }
    before.current.clear()
  }, [order])

  const move = (id: T, dir: -1 | 1) => {
    const cur = orderRef.current
    const i = cur.indexOf(id)
    const j = i + dir
    if (j < 0 || j >= cur.length) return
    const next = [...cur]
    ;[next[i], next[j]] = [next[j], next[i]]
    commit(next)
  }

  const onPointerDown = (id: T) => (e: React.PointerEvent) => {
    if (e.button !== 0) return
    e.preventDefault()
    const el = nodes.current.get(id)!
    drag.current = { id, startY: e.clientY, offset: 0 }
    setDragging(id)
    el.style.transition = 'none'

    const onMove = (ev: PointerEvent) => {
      const d = drag.current
      if (!d) return
      d.offset = ev.clientY - d.startY
      el.style.transform = `translateY(${d.offset}px)`
      // Swap once the pointer passes the middle of a neighbouring card
      const cur = orderRef.current
      const i = cur.indexOf(d.id)
      const up = i > 0 ? nodes.current.get(cur[i - 1]) : undefined
      const down = i < cur.length - 1 ? nodes.current.get(cur[i + 1]) : undefined
      const mid = (n: HTMLDivElement) => {
        const r = n.getBoundingClientRect()
        return r.top + r.height / 2
      }
      if (up && ev.clientY < mid(up)) move(d.id, -1)
      else if (down && ev.clientY > mid(down)) move(d.id, 1)
    }
    const onUp = () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
      drag.current = null
      setDragging(null)
      el.style.transition = 'transform 200ms cubic-bezier(.2,.8,.2,1)'
      el.style.transform = ''
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
  }

  return (
    <div className="flex flex-col gap-5">
      {order.map((id, i) => (
        <Item
          key={id}
          $dragging={dragging === id}
          ref={(n) => {
            if (n) nodes.current.set(id, n)
            else nodes.current.delete(id)
          }}
        >
          {render(
            id,
            {
              onPointerDown: onPointerDown(id),
              onKeyDown: (e) => {
                if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                  e.preventDefault()
                  move(id, e.key === 'ArrowUp' ? -1 : 1)
                }
              },
              'aria-label': label(id, i === 0 ? 'down' : 'up'),
            },
            dragging === id,
          )}
        </Item>
      ))}
    </div>
  )
}
