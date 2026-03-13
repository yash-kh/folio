import "./App.css";
import { ThemeProvider } from "./components/ui/theme-provider";
import { ColorThemeProvider } from "./components/ui/color-theme-provider";
import ThemeSwitcher from "./components/ui/theme-switcher";
import MagicMouse from "./components/ui/magic-mouse";
import TechStack from "./components/section/tech-stack";
import Header from "./components/section/header";
import AboutMe from "./components/section/about-me";
import Projects from "./components/section/projects";
import Footer from "./components/section/footer";
import StackMatch from "./components/section/stack-match";
import Work from "./components/section/work";
import Contact from "./components/section/contact";
import { usePageView } from "./hooks/usePageView";

function App() {
  usePageView();
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <ColorThemeProvider>
        <div className="App" style={{ backgroundColor: 'var(--folio-bg)' }}>
          <Header />
          <div className="pt-20">
          <AboutMe />
          </div>
          <TechStack />
          <Work />
          <Projects />
          <StackMatch />
          <Footer />
          <MagicMouse />
          <ThemeSwitcher />
        </div>
      </ColorThemeProvider>
    </ThemeProvider>
  );
}

export default App;
