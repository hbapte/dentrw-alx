import { Fade } from "react-awesome-reveal";

const RSSB = "./Images/insurance/rssb.png";
const MMI = "./Images/insurance/mmi.png";
const PRIME = "./Images/insurance/prime.png";
const RADIANT = "./Images/insurance/radiant.png";
const SORAS = "./Images/insurance/Soras.png";
const BRITAM = "./Images/insurance/britam.png";
const BK = "./Images/insurance/BK.png";
const SANLAM = "./Images/insurance/sanlam.png";

const Insurance = () => {
  return (
    <section className="mt-16 " id="insurance">
      <header className="">
        <Fade>
          <div className="max-w-xl mb-10 mx-4 md:mx-auto  sm:text-center lg:max-w-2xl md:mb-12">
            <div>
              <p className="inline-block px-3 py-px mb-4 text-xs font-semibold tracking-wider text-teal-900 uppercase rounded-full bg-teal-accent-400">
                insurance
              </p>
            </div>
            <h2 className="max-w-md mb-6 font-sans text-2xl md:text-3xl font-bold leading-none tracking-tight text-gray-900 sm:text-4xl md:mx-auto">
              <span className="relative inline-block">
                <svg
                  viewBox="0 0 52 24"
                  fill="currentColor"
                  className="absolute top-0 left-2 z-0 hidden w-32 -mt-8 -ml-20 text-blue-gray-100 lg:w-32 lg:-ml-28 lg:-mt-10 sm:block"
                >
                  <defs>
                    <pattern
                      id="18302e52-9e2a-4c8e-9550-0cbb21b38e55"
                      x="0"
                      y="0"
                      width=".135"
                      height=".30"
                    >
                      <circle cx="1" cy="1" r=".7" />
                    </pattern>
                  </defs>
                  <rect
                    fill="url(#18302e52-9e2a-4c8e-9550-0cbb21b38e55)"
                    width="52"
                    height="24"
                  />
                </svg>
                <span className="relative">We </span>
              </span>{" "}
              work with <span className="text-blue-500">Insurance</span>{" "}
              companies for your coverage
            </h2>

            <p className="max-w-[40rem] text-md mx-auto mt-4 text-gray-500"></p>
          </div>
        </Fade>
      </header>
      <div className="slider grid grid-cols-4 lg:grid-cols-8   shadow-md opacity-[100%] h-100 mx-auto overflow-hidden relative ">
        {/* <div className="slide-track animate-scroll"> */}
        <div className="slide h-100 w-250">
          <img
            src={RSSB}
            className="object-cover"
            height="100"
            width="250"
            alt=""
          />
        </div>
        <div className="slide h-100 w-250">
          <img src={SANLAM} height="100" width="250" alt="" />
        </div>
        <div className="slide h-100 w-250">
          <img src={MMI} height="10" width="250" alt="" />
        </div>
        <div className="slide h-100 w-250">
          <img src={BRITAM} className="" alt="" />
        </div>
        <div className="slide h-100 w-250">
          <img src={SORAS} height="100" width="250" alt="" />
        </div>

        <div className="slide h-100 w-250">
          <img src={PRIME} height="100" width="250" alt="Prime Insurance" />
        </div>
        <div className="slide h-100 w-250">
          <img src={RADIANT} height="50" width="250" alt="" />
        </div>

        <div className="slide h-100 w-250">
          <img src={BK} height="100" width="250" alt="" />
        </div>
      </div>
    </section>
  );
};

export default Insurance;
