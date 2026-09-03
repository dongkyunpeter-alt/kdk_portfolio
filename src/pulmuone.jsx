import { createRoot } from 'react-dom/client';
import { gsap } from 'gsap';
import { ScrollSmoother } from 'gsap/ScrollSmoother';
import App from './App.jsx';
import PulmuonePage from './pages/PulmuonePage.jsx';

gsap.registerPlugin(ScrollSmoother);
createRoot(document.getElementById('root')).render(
  <App Page={PulmuonePage} isHome={false} scrollSmoother={ScrollSmoother} />
);
