import { AppRouter } from './app/router/AppRouter'
import { SessionInitializer } from './app/providers/SessionInitializer'

function App() {
  return (
    <SessionInitializer>
      <AppRouter />
    </SessionInitializer>
  )
}

export default App
