import { siGithub, siGmail, siLinkedin, siX } from "simple-icons";
import Tooltip from "../ui/tooltip";

function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-black text-slate-300 py-12 mt-10">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex flex-col items-center space-y-6">
          <h3 className="text-2xl font-bold text-white">
            Let's work together
          </h3>
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
          <p className="text-center text-lg font-semibold">
            © {new Date().getFullYear()} Yash Khatri. All rights{" "}
            <Tooltip message="By my parents &#9825;">reserved</Tooltip>.
          </p>
          <button
            onClick={scrollToTop}
            className="mt-4 px-4 py-2 text-sm border border-slate-600 rounded-full hover:bg-slate-800 transition-colors"
          >
            Back to top
          </button>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
