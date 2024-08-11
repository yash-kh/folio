import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  // CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./card";
import { Button } from "./button";

function BrightCard({
  title,
  description,
  githubLink,
  demoLink,
}: {
  title: string;
  description: string;
  githubLink?: string;
  demoLink?: string;
}) {
  return (
    <motion.div
      className="flex justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="max-w-[450px] bright-card">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {/* <CardDescription>{description}</CardDescription> */}
        </CardHeader>
        <CardContent>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">{description}</div>
            <div className="flex flex-col space-y-1.5"></div>
          </div>
        </CardContent>
        <CardFooter>
          <span></span>
          {githubLink && (
            <Button
              className="mr-2"
              onClick={() => window.open(githubLink, "_blank")}
            >
              <i className="fa-brands fa-github"></i>
            </Button>
          )}
          {demoLink && (
            <Button onClick={() => window.open(demoLink, "_blank")}>
              <i className="fa-solid fa-link"></i>
            </Button>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
}

export default BrightCard;
