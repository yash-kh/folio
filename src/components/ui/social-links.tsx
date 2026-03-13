import { motion } from "framer-motion";
import { siGithub, siGmail, siLinkedin, siX } from "simple-icons";
import Tooltip from "./tooltip";

const socialLinks = [
  {
    label: "GitHub",
    tooltip: "Github",
    href: "https://github.com/yash-kh",
    icon: siGithub,
    animationDuration: 0.4,
    opacityKeyframes: [0, 1],
    translateYKeyframes: [-10, 0],
  },
  {
    label: "Gmail",
    tooltip: "Lets Talk!",
    href: "mailto:hello@yashkhatri.in",
    icon: siGmail,
    animationDuration: 0.7,
    opacityKeyframes: [0, 1],
    translateYKeyframes: [-10, 0],
  },
  {
    label: "LinkedIn",
    tooltip: "Linkedin",
    href: "https://www.linkedin.com/in/yash-khatri-35850018b/",
    icon: siLinkedin,
    animationDuration: 0.9,
    opacityKeyframes: [0, 0, 1],
    translateYKeyframes: [-10, -10, 0],
  },
  {
    label: "X (Twitter)",
    tooltip: "Twitter || X",
    href: "https://x.com/_Yash_Khatri",
    icon: siX,
    animationDuration: 1,
    opacityKeyframes: [0, 0, 0, 1],
    translateYKeyframes: [-10, -10, -10, 0],
  },
];

interface SocialLinksProps {
  animated?: boolean;
}

function SocialLinks({ animated = false }: SocialLinksProps) {
  return (
    <>
      {socialLinks.map((link) => {
        const inner = (
          <Tooltip message={link.tooltip}>
            <a
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bright-icon"
              aria-label={link.label}
            >
              <svg
                role="img"
                viewBox="0 0 24 24"
                width="30"
                height="30"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
                className="mr-2"
              >
                <path d={link.icon.path} />
              </svg>
            </a>
          </Tooltip>
        );

        if (animated) {
          return (
            <motion.span
              key={link.label}
              initial={{ opacity: 0, translateY: -10 }}
              animate={{
                opacity: link.opacityKeyframes,
                translateY: link.translateYKeyframes,
              }}
              transition={{
                duration: link.animationDuration,
                ease: "easeInOut",
              }}
            >
              {inner}
            </motion.span>
          );
        }

        return <span key={link.label}>{inner}</span>;
      })}
    </>
  );
}

export default SocialLinks;
