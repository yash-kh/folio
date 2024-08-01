import "./App.css";
import { ThemeProvider } from "./components/ui/theme-provider";
import MagicMouse from "./components/ui/magic-mouse";
import BrightCard from "./components/ui/bright-card";
import ScrollLine from "./components/ui/scroll-line";
import {
  siAngular,
  siBootstrap,
  siExpress,
  siJavascript,
  siJest,
  siMongodb,
  siNextdotjs,
  siPm2,
  siPostgresql,
  siPrisma,
  siReact,
  siRedux,
  siSocketdotio,
  siTailwindcss,
  siZod,
} from "simple-icons/icons";

function App() {
  const items = [
    { text: "React", IconComponent: siReact },
    { text: "JavaScript", IconComponent: siJavascript },
    { text: "Next", IconComponent: siNextdotjs },
    { text: "Angular", IconComponent: siAngular },
    { text: "Redux", IconComponent: siRedux },
    { text: "Bootstrap", IconComponent: siBootstrap },
    { text: "Tailwind", IconComponent: siTailwindcss },
    // Add more items as needed
  ];

  const backend = [
    { text: "Express", IconComponent: siExpress },
    { text: "Socket", IconComponent: siSocketdotio },
    { text: "Jest", IconComponent: siJest },
    { text: "Zod", IconComponent: siZod },
    { text: "PM2", IconComponent: siPm2 },
    { text: "Prisma", IconComponent: siPrisma },
    { text: "PostgreSQL", IconComponent: siPostgresql },
    { text: "MongoDB", IconComponent: siMongodb },
    // Add more items as needed
  ];

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="App bg-folio-bg flex justify-center p-40">
        <MagicMouse />
        <BrightCard
          title="Omniegli"
          description="This is an Omegle clone"
          demoLink="https://omnieglii.onrender.com"
          githubLink="https://github.com/yash-kh/Omniegli.git"
        />
      </div>
      <ScrollLine items={items} moveLeft={true} speed={180} />
      <ScrollLine items={backend} moveLeft={false} speed={185} />
    </ThemeProvider>
  );
}

export default App;
