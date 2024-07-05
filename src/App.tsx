import "./App.css";
import { ThemeProvider } from "./components/ui/theme-provider";
import MagicMouse from "./components/ui/magic-mouse";
import BrightCard from "./components/ui/bright-card";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="App bg-folio-bg flex justify-center p-40">
        <MagicMouse />
        <BrightCard />
      </div>
    </ThemeProvider>
  );
}

export default App;
