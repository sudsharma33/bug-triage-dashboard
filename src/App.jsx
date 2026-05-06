import './App.css';
import BugList from './components/BugList.jsx';

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>TriageBoard</h1>
        <p>A lightweight bug triage dashboard</p>
      </header>
      <main>
        <BugList />
      </main>
    </div>
  );
}

export default App;