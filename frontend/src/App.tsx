import Dashboard from './components/Dashboard'

function App() {
  return (
    <div className="container">
      <header>
        <h1>Service Uptime Monitor</h1>
        <p>Real-time status tracking and latency analysis for infrastructure APIs.</p>
      </header>
      <main>
        <Dashboard />
      </main>
    </div>
  )
}

export default App
