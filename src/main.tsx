import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

import { hello } from '@tiny/core'
hello()

createRoot(document.getElementById('root')!).render(<StrictMode></StrictMode>)
