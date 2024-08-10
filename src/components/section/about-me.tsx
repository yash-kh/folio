import { motion } from "framer-motion";
import { siCoffeescript, siGithub, siGmail, siX } from "simple-icons";
import Tooltip from "../ui/tooltip";

function AboutMe() {
  return (
    <>
      <div className="container py-4">
        <div className="flex flex-wrap justify-around w-full">
          <div className="flex justify-center mb-5">
            <div>
              <span className="text-gray-500 translate-x-[-10px] translate-y-[-30px]">
                About Me
              </span>
              <br />
              <Tooltip message="HI! Thats me">
                <h1 className="text-7xl font-bold mb-8">Yash</h1>
              </Tooltip>
              <h3 className="mb-1 text-lg">
                Problem <Tooltip message="It's always Monday">Solver</Tooltip>
              </h3>
              <h3 className="mb-1 text-lg">
                <Tooltip message="Sleep is optional">Code</Tooltip> Base
                Explorer
              </h3>
              <h3 className="mb-1 text-lg">
                Open Source{" "}
                <Tooltip message="Debugging other’s mess">Contributor</Tooltip>
              </h3>
              <div className="flex mt-5 header-group">
                <Tooltip message="Github">
                  <button className="p-2 bright-icon">
                    <svg
                      role="img"
                      viewBox="0 0 24 24"
                      width="25"
                      height="25"
                      fill="currentColor"
                      xmlns="http://www.w3.org/2000/svg"
                      className="mr-2"
                    >
                      <path d={siGithub.path} />
                    </svg>
                  </button>
                </Tooltip>
                <Tooltip message="Mail">
                  <button className="p-2 bright-icon">
                    <svg
                      role="img"
                      viewBox="0 0 24 24"
                      width="25"
                      height="25"
                      fill="currentColor"
                      xmlns="http://www.w3.org/2000/svg"
                      className="mr-2"
                    >
                      <path d={siGmail.path} />
                    </svg>
                  </button>
                </Tooltip>
                <Tooltip message="Lets Talk!">
                  <button className="p-2 bright-icon">
                    <svg
                      role="img"
                      viewBox="0 0 24 24"
                      width="25"
                      height="25"
                      fill="currentColor"
                      xmlns="http://www.w3.org/2000/svg"
                      className="mr-2"
                    >
                      <path d={siCoffeescript.path} />
                    </svg>
                  </button>
                </Tooltip>
                <Tooltip message="Twitter || X">
                  <button className="p-2 bright-icon">
                    <svg
                      role="img"
                      viewBox="0 0 24 24"
                      width="25"
                      height="25"
                      fill="currentColor"
                      xmlns="http://www.w3.org/2000/svg"
                      className="mr-2"
                    >
                      <path d={siX.path} />
                    </svg>
                  </button>
                </Tooltip>
              </div>
            </div>
          </div>
          <div className="flex justify-center w-96 h-80 mb-5">
            <motion.img
              className="me-img"
              initial={{ opacity: 0, y: -50, height: "0" }}
              animate={{ opacity: 1, y: 0, height: "20rem" }}
              whileHover={{ padding: "20px", scale: 1.1 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              whileTap={{ scale: 0.9 }}
              src="yash.jpg"
              alt="Group-1"
            />
          </div>
        </div>
        {/* Description Section */}
        <div className="flex justify-center">
          <div className="description-section text-center mt-10 header-group p-3 w-fit">
            <h2 className="text-2xl font-semibold mb-4">Who am I?</h2>
            <p className="max-w-3xl mx-auto">
              I am Yash, a passionate{" "}
              <Tooltip message="Since 2021">developer</Tooltip> with a love for
              problem-solving and exploring new technologies. Whether it's
              delving into a complex{" "}
              <Tooltip message="Playground">codebase</Tooltip> or contributing
              to open-source projects, I thrive on challenges that push me to
              grow and <Tooltip message="& Earn">learn</Tooltip>.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default AboutMe;
