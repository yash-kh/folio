import "./App.css";
import { ThemeProvider } from "./components/ui/theme-provider";
import MagicMouse from "./components/ui/magic-mouse";
// import BrightCard from "./components/ui/bright-card";
import TechStack from "./components/section/tech-stack";
import Header from "./components/section/header";
import AboutMe from "./components/section/about-me";

function App() {

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="App bg-folio-bg">
        <Header />
        <AboutMe />
        <TechStack />
        <MagicMouse />
        {/* <BrightCard
          title="Omniegli"
          description="This is an Omegle clone"
          demoLink="https://omnieglii.onrender.com"
          githubLink="https://github.com/yash-kh/Omniegli.git"
        /> */}
      </div>
    </ThemeProvider>
  );
}

export default App;
