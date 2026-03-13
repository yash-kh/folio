import { motion, useInView } from "framer-motion";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./card";
import { Button } from "./button";
import { useRef } from "react";

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
  const ref = useRef(null);
  const inView = useInView(ref);

  return (
    <motion.div
      className="relative flex justify-center items-center"
      ref={ref}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={inView ? { opacity: 1, scale: [0.8, 1] } : { opacity: 0 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
    >
      {/* Timeline dot */}
      <div className="absolute -left-8 md:-left-12 top-6 w-3 h-3 rounded-full border-2 z-10" style={{ backgroundColor: 'var(--folio-secondary)', borderColor: 'rgba(var(--folio-secondary-rgb), 0.5)' }} />
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
            <Button className="mr-2" asChild>
              <a
                href={githubLink}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`View ${title} source code on GitHub`}
              >
                <i className="fa-brands fa-github"></i>
              </a>
            </Button>
          )}
          {demoLink && (
            <Button asChild>
              <a
                href={demoLink}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`View ${title} live demo`}
              >
                <i className="fa-solid fa-link"></i>
              </a>
            </Button>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
}

export default LongBrightCard;
