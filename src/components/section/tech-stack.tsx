import React from "react";
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
import ScrollLine from "../ui/scroll-line";
import Tooltip from "../ui/tooltip";

interface TechStackProps {}

const TechStack: React.FC<TechStackProps> = () => {
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
    <>
      <div className="text-center">
        <div className="inline-block header-group py-5 px-10 m-10">
          <Tooltip message="Want more! Just Ask">
            <div className="text-5xl">Tech Stack</div>
          </Tooltip>
        </div>
      </div>
      <ScrollLine items={frontend} moveLeft={true} speed={90} />
      <ScrollLine items={backend} moveLeft={false} speed={90} />
      <ScrollLine items={devops} moveLeft={true} speed={95} />
      <ScrollLine items={tools} moveLeft={false} speed={90} />
    </>
  );
};

export default TechStack;
