import "./App.css";
import { ThemeProvider } from "./components/ui/theme-provider";
import MagicMouse from "./components/ui/magic-mouse";
// import BrightCard from "./components/ui/bright-card";
import ScrollLine from "./components/ui/scroll-line";
import {
  siAmazonec2,
  siAmazons3,
  siAmazonwebservices,
  siAndroidstudio,
  siAngular,
  siAwslambda,
  siBootstrap,
  siCloudflare,
  siDocker,
  siExcalidraw,
  siExpress,
  siFigma,
  siGit,
  siGooglecloud,
  siJavascript,
  siJest,
  siJira,
  siMongodb,
  siNextdotjs,
  siNpm,
  siPm2,
  siPostgresql,
  siPostman,
  siPrisma,
  siReact,
  siRedux,
  siRender,
  siSlack,
  siSocketdotio,
  siTailwindcss,
  siZod,
} from "simple-icons/icons";

function App() {
  const frontend = [
    { text: "React", IconComponent: siReact },
    { text: "JavaScript", IconComponent: siJavascript },
    { text: "Next", IconComponent: siNextdotjs },
    { text: "Angular", IconComponent: siAngular },
    { text: "Redux", IconComponent: siRedux },
    { text: "Bootstrap", IconComponent: siBootstrap },
    { text: "Tailwind", IconComponent: siTailwindcss },
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
  ];

  const devops = [
    { text: "AWS", IconComponent: siAmazonwebservices },
    { text: "Render", IconComponent: siRender },
    { text: "AWS S3", IconComponent: siAmazons3 },
    { text: "GCP", IconComponent: siGooglecloud },
    { text: "AWS EC2", IconComponent: siAmazonec2 },
    { text: "Cloudflare", IconComponent: siCloudflare },
    { text: "AWS Lambda", IconComponent: siAwslambda },
    { text: "Docker", IconComponent: siDocker },
  ];

  const tools = [
    { text: "Postman", IconComponent: siPostman },
    { text: "Jira", IconComponent: siJira },
    { text: "Figma", IconComponent: siFigma },
    { text: "NPM", IconComponent: siNpm },
    { text: "Android Studio", IconComponent: siAndroidstudio },
    { text: "Excalidraw", IconComponent: siExcalidraw },
    { text: "Slack", IconComponent: siSlack },
    { text: "GIT", IconComponent: siGit },
  ];

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="App bg-folio-bg">
        <MagicMouse />
        {/* <BrightCard
          title="Omniegli"
          description="This is an Omegle clone"
          demoLink="https://omnieglii.onrender.com"
          githubLink="https://github.com/yash-kh/Omniegli.git"
        /> */}
        <ScrollLine items={frontend} moveLeft={true} speed={90} />
        <ScrollLine items={backend} moveLeft={false} speed={90} />
        <ScrollLine items={devops} moveLeft={true} speed={95} />
        <ScrollLine items={tools} moveLeft={false} speed={90} />
      </div>
    </ThemeProvider>
  );
}

export default App;
