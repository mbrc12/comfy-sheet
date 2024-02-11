import { render } from 'preact'
import { App } from './app.tsx'
import './index-rendered.css'

render(<App />, document.getElementById('app')!)
