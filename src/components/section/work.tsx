import LongBrightCard from "../ui/long-bright-card";
import Tooltip from "../ui/tooltip";

function Work() {
  return (
    <>
      <div className="container relative pt-4 pb-40" id="work">
      <div className="absolute top-0 left-0 text-9xl text-[#5BBCFF] opacity-40 z-[-1]">
            {"{"}
        </div>
        <div className="absolute bottom-0 right-0 text-9xl text-[#5BBCFF] opacity-40 z-[-1]">
            {"}"}
        </div>
        <div className="text-center">
          <div className="inline-block header-group py-5 px-10 m-10">
            <Tooltip message="Make it work!">
              <div className="text-5xl">Work</div>
            </Tooltip>
          </div>
        </div>
        <div className="flex justify-center">
          <div className="grid max-w-[950px] md:grid-cols-1 gap-8 w-full">
            <LongBrightCard
              title="SDE - 1"
              company="Cyno pharmaceutical"
              timeSlot="06/2023 - Present"
              description={[
                "Led a team of 4 developers to foster collaboration",
                "Developed a ground-up SAAS solution for automating order placement, tracking, and accounting",
                "Optimized system efficiency with Node.js through efficient API design, caching, and cron jobs",
                "Hosted our SAAS app on AWS, utilizing EC2, RDS, and S3 for scalability and reliability",
              ]}
              demoLink="https://cyno.co.in"
              //   githubLink="https://github.com/yash-kh/Omniegli"
            />
            <LongBrightCard
              title="Software Engineer"
              company="Affordplan"
              timeSlot="03/2022 - 06/2023"
              description={[
                "Responsible for developing User Interaction screens.",
                "Migration of Angular JS application to Angular 10+ application.",
                "Making efficient Cron job for better analysis of system health.",
                "Assigning task to interns, taking regular updates and code review.",
              ]}
              demoLink="https://affordplan.com/"
              //   githubLink="https://github.com/yash-kh/bridge"
            />
            <LongBrightCard
              title="Associate Software Engineer"
              company="Accenture"
              timeSlot="09/2021 - 03/2022"
              description={[
                "Started learning .Net Development.",
                "Interacting with the clients in order to understand their issues.",
                "Main focus was the smooth functioning of the interfaces.",
              ]}
              demoLink="https://Accenture.com"
              //   githubLink="https://github.com/yash-kh/ImageAnnotationApp"
            />
            <LongBrightCard
              title="IT Intern"
              company="CJ darcl logistics"
              timeSlot="01/2021 - 05/2021"
              description={[
                "Started learning about frontend development with Angular",
                "Worked on microservices on express.js",
                "Working on database both SQL and NoSQL",
              ]}
              demoLink="https://cjdarcl.com/"
              //   githubLink="https://github.com/yash-kh/folio"
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default Work;
