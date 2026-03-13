import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./card";
import { Button } from "./button";

function BrightCard({
  title,
  description,
  techStack,
  githubLink,
  demoLink,
}: {
  title: string;
  description: string;
  techStack?: string;
  githubLink?: string;
  demoLink?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref);

  const techBadges = techStack
    ? techStack
        .replace(/\.$/, "")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

  return (
    <motion.div
      className="flex justify-center"
      ref={ref}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={inView ? { opacity: 1, scale: [0.8, 1] } : { opacity: 0 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
    >
      <Card className="max-w-[450px] bright-card">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              {description}
              {techBadges.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {techBadges.map((tech, index) => (
                    <span
                      key={index}
                      className="inline-block text-xs font-medium px-2.5 py-1 rounded-full border"
                      style={{
                        backgroundColor: 'rgba(var(--folio-secondary-rgb), 0.15)',
                        color: 'var(--folio-secondary)',
                        borderColor: 'rgba(var(--folio-secondary-rgb), 0.25)',
                      }}
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter>
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

export default BrightCard;
