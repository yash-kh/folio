import { motion } from "framer-motion";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./card";
import { Button } from "./button";

function LongBrightCard({
  title,
  company,
  timeSlot,
  description,
  githubLink,
  demoLink,
}: {
  title: string;
  company: string;
  timeSlot: string;
  description: string[];
  githubLink?: string;
  demoLink?: string;
}) {
  return (
    <motion.div
      className="flex justify-center items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="w-full max-w-[900px] p-2 bright-card">
        <CardHeader>
          <CardTitle>
            {title} at {company}
          </CardTitle>
          <div className="text-sm dark:text-gray-500">{timeSlot}</div>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-1">
            {description.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </CardContent>
        <CardFooter className="flex justify-end">
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

export default LongBrightCard;
