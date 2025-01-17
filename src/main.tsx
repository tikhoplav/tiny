import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

import { init } from '@tiny/core'

const canvas: HTMLCanvasElement | null = document.querySelector('canvas#main')
if (!canvas) throw new Error('Canvas `#main` not found')
const ctx: GPUCanvasContext | null = canvas.getContext('webgpu')
if (!ctx) throw new Error('Webgpu context is unavailable')

init(ctx)
  .then(render => {
    const update = (dt: number) => {
       render(dt)
       requestAnimationFrame(update)
    }
    update(0)
  })
  .catch(console.error)

createRoot(document.getElementById('root')!).render(<StrictMode></StrictMode>)
