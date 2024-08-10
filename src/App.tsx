import "./App.css";
import { ThemeProvider } from "./components/ui/theme-provider";
import MagicMouse from "./components/ui/magic-mouse";
import TechStack from "./components/section/tech-stack";
import Header from "./components/section/header";
import AboutMe from "./components/section/about-me";
import Projects from "./components/section/projects";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="App bg-folio-bg">
        <Header />
        <AboutMe />
        <TechStack />
        <MagicMouse />
        <Projects />
      </div>
    </ThemeProvider>
  );
}

export default App;
