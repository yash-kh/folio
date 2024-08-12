import { motion } from "framer-motion";
import { siGithub, siGmail, siLinkedin, siX } from "simple-icons";
import Tooltip from "../ui/tooltip";

function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-black text-slate-300 py-12"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex flex-col items-center space-y-6">
          <p className="text-center text-lg font-semibold">
            © {new Date().getFullYear()} Yash Khatri. All rights{" "}
            <Tooltip message="By my parents &#9825;">reserved</Tooltip>.
          </p>
          <div className="flex space-x-4">
            <Tooltip message="Github">
              <button
                className="p-2 bright-icon"
                onClick={() => {
                  window.open("https://github.com/yash-kh");
                }}
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
                  <path d={siGithub.path} />
                </svg>
              </button>
            </Tooltip>
            <Tooltip message="Lets Talk!">
              <button
                className="p-2 bright-icon"
                onClick={() => window.open("mailto:hello@yashkhatri.in")}
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
                  <path d={siGmail.path} />
                </svg>
              </button>
            </Tooltip>
            <Tooltip message="Twitter || X">
              <button
                className="p-2 bright-icon"
                onClick={() => {
                  window.open("https://x.com/_Yash_Khatri");
                }}
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
                  <path d={siX.path} />
                </svg>
              </button>
            </Tooltip>
            <Tooltip message="Linkedin">
              <button
                className="p-2 bright-icon"
                onClick={() => {
                  window.open(
                    "https://www.linkedin.com/in/yash-khatri-35850018b/"
                  );
                }}
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
                  <path d={siLinkedin.path} />
                </svg>
              </button>
            </Tooltip>
          </div>
        </div>
      </div>
    </motion.footer>
  );
}

export default Footer;
