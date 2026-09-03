import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import HomePage from './pages/HomePage.jsx';

createRoot(document.getElementById('root')).render(<App Page={HomePage} isHome />);
