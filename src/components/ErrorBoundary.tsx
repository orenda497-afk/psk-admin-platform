import { Component, type ReactNode } from 'react'

interface Props { children: ReactNode }
interface State { error: Error | null }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error('PSK admin — caught render error:', error, info.componentStack)
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ minHeight:'60vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'40px 20px' }}>
          <div style={{ maxWidth:'440px', textAlign:'center', background:'rgba(10,22,34,0.70)', border:'1.5px solid rgba(255,255,255,0.09)', borderRadius:'16px', padding:'32px 28px' }}>
            <div style={{ fontSize:'32px', marginBottom:'12px' }}>⚠️</div>
            <div style={{ fontSize:'15px', fontWeight:700, color:'rgba(255,255,255,0.90)', marginBottom:'8px' }}>Something went wrong on this page</div>
            <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.50)', marginBottom:'20px', lineHeight:1.5 }}>
              The rest of the app is fine — this only affects the page you were on. Try going back or reloading.
            </div>
            <div style={{ display:'flex', gap:'10px', justifyContent:'center' }}>
              <button onClick={() => { this.setState({ error: null }); window.history.back() }}
                style={{ padding:'10px 18px', borderRadius:'9px', fontSize:'12px', fontWeight:600, cursor:'pointer', fontFamily:'inherit', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.14)', color:'rgba(255,255,255,0.70)' }}>← Go back</button>
              <button onClick={() => window.location.reload()}
                style={{ padding:'10px 18px', borderRadius:'9px', fontSize:'12px', fontWeight:700, cursor:'pointer', fontFamily:'inherit', background:'linear-gradient(135deg,rgba(255,215,0,0.18),rgba(255,149,0,0.10))', border:'1.5px solid rgba(255,215,0,0.38)', color:'rgba(255,215,0,0.95)' }}>Reload page</button>
            </div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
