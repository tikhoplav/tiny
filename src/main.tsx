import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

import { init } from '@tiny/00-triangle'
// import { init } from '@tiny/01-cube'

const canvas: HTMLCanvasElement | null = document.querySelector('canvas#main')
if (!canvas) throw new Error('Canvas `#main` not found')

init({ canvas })
  .then(({ draw }) => {
    const update = (dt: number) => {
      draw(dt)
      requestAnimationFrame(update)
    }

    update(0)
  })
  .catch(console.error)

createRoot(document.getElementById('root')!).render(<StrictMode></StrictMode>)
