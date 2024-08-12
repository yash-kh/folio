import BrightCard from "../ui/bright-card";
import Tooltip from "../ui/tooltip";

function Projects() {
  return (
    <>
      <div className="container py-4" id="projects">
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
              title="Omniegli"
              description="An Omegle clone featuring real-time chat and video functionality using Socket.io and WebRTC for peer-to-peer communication."
              demoLink="https://omnieglii.onrender.com"
              githubLink="https://github.com/yash-kh/Omniegli"
            />
            <BrightCard
              title="DiFi Swap UI"
              description="A user interface for swapping tokens using the xy.finance API. Provides a seamless and intuitive experience for token swapping."
              demoLink="https://bridge-app-lgag.onrender.com/"
              githubLink="https://github.com/yash-kh/bridge"
            />
            <BrightCard
              title="Image Annotation App"
              description="An Angular application Allows users to capture image, annotation, and export for further use."
              demoLink="https://imageannotationapp.onrender.com"
              githubLink="https://github.com/yash-kh/ImageAnnotationApp"
            />
            <BrightCard
              title="Portfolio"
              description="A portfolio website made to showcase my development skills and projects."
              demoLink="https://yashkhatri.in"
              githubLink="https://github.com/yash-kh/folio"
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default Projects;
