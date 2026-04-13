import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }
  static getDerivedStateFromError(err) {
    return { error: err }
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{
          padding: '2rem', background: '#030913', color: '#f0c040',
          fontFamily: 'monospace', fontSize: '14px', minHeight: '100vh',
          whiteSpace: 'pre-wrap', wordBreak: 'break-word',
        }}>
          <div style={{ color: '#e06060', marginBottom: '1rem', fontSize: '18px' }}>
            ⚠ Render Error
          </div>
          <div style={{ color: '#f0e6c8' }}>
            {String(this.state.error)}
          </div>
          <div style={{ color: 'rgba(240,230,200,0.5)', marginTop: '1rem', fontSize: '12px' }}>
            {this.state.error?.stack}
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)
