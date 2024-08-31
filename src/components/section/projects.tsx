import BrightCard from "../ui/bright-card";
import Tooltip from "../ui/tooltip";

function Projects() {
  return (
    <>
      <div className="container pt-4 relative pb-40" id="projects">
        <div className="absolute top-0 left-0 text-9xl text-[#5BBCFF] opacity-40 z-[-1]">
            {"<>"}
        </div>
        <div className="absolute bottom-0 right-0 text-9xl text-[#5BBCFF] opacity-40 z-[-1]">
            {"</>"}
        </div>
        <div className="text-center">
          <div className="inline-block header-group py-5 px-10 m-10">
            <Tooltip message="More on the Way!">
              <div className="text-5xl">Projects</div>
            </Tooltip>
          </div>
        </div>
        <div className="flex justify-center">
          <div className="grid max-w-[950px] md:grid-cols-2 gap-4 w-full">
            <BrightCard
              title="labelify"
              description="Data Labeling Platform with web3 payout using solana devnet network, made with next.js, node.js, AWS and alchemy API."
              demoLink="https://labelify-alpha.vercel.app/"
              githubLink="https://github.com/yash-kh/labelify"
              techStack="Next.js, Node.js, AWS, Alchemy API."
            />
            <BrightCard
              title="yashletz"
              description="(Work in progress) A Web based wallet, for storing and exchanging crypto assets. Made with next.js using alchemy API."
              demoLink="https://yashletz.vercel.app"
              githubLink="https://github.com/yash-kh/yashletz"
              techStack="Next.js, Alchemy API, HD wallets."
            />
            <BrightCard
              title="Omniegli"
              description="An Omegle clone featuring real-time chat and video functionality using Socket.io and WebRTC for peer-to-peer communication."
              demoLink="https://omnieglii.onrender.com"
              githubLink="https://github.com/yash-kh/Omniegli"
              techStack="React.js, Socket.io, WebRTC, Node.js."
            />
            <BrightCard
              title="DiFi Swap UI"
              description="A user interface for swapping tokens using the xy.finance API. Provides a seamless and intuitive experience for token swapping."
              demoLink="https://bridge-app-lgag.onrender.com/"
              githubLink="https://github.com/yash-kh/bridge"
              techStack="React.js, Node.js, xy.finance API."
            />
            <BrightCard
              title="Image Annotation App"
              description="An Angular application Allows users to capture image, annotation, and export for further use."
              demoLink="https://imageannotationapp.onrender.com"
              githubLink="https://github.com/yash-kh/ImageAnnotationApp"
              techStack="Angular, CanvasJS, PWA adaptor."
            />
            <BrightCard
              title="Portfolio"
              description="A portfolio website made to showcase my development skills and projects."
              demoLink="https://yashkhatri.in"
              githubLink="https://github.com/yash-kh/folio"
              techStack="React.js, Tailwind, Shadcn UI, Framer Motion."
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default Projects;
