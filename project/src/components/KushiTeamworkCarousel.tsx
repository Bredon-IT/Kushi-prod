import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const teamworkSteps = [
  {
    step: 1,
    title: "Pick Date & Time",
    img: "/step1.png",
    desc: `"Choose a convenient date and time that fits your schedule through a simple call or visit our website for online booking."`,
  },
  {
    step: 2,
    title: "Book Service",
    img: "/step2.png",
    desc: `"Confirm your service request by sharing the location, service type, and any specific instructions."`,
  },
  {
    step: 3,
    title: "Our Pro Arrives",
    img: "/step3.png",
    desc: `"A trained professional reaches your doorstep on time, fully equipped with eco-friendly tools and supplies."`,
  },
  {
    step: 4,
    title: "Service Execution",
    img: "/step4.png",
    desc: `"Our experts carry out the service with precision and high-quality standards."`,
  },
  {
    step: 5,
    title: "Payment for Services",
    img: "/step5.png",
    desc: `"Once done, make secure payment via cash, UPI, or online — no hidden charges."`,
  },
];

export function KushiTeamworkCarousel() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % teamworkSteps.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-gradient-to-r from-emerald-50 to-gray-50 py-16 overflow-hidden text-center">
      {/* Header */}
      <h2 className="text-3xl sm:text-4xl font-extrabold text-emerald-700 mb-3 tracking-tight">
        The Kushi Way: Excellence in 5 Simple Steps
      </h2>
      <p className="text-base sm:text-lg text-gray-600 mb-10 max-w-3xl mx-auto">
        From booking to sparkling clean — our process ensures quality, trust, and satisfaction.
      </p>

      {/* 🔹 Full-width Carousel Container */}
      <div className="relative flex justify-center items-center w-full max-w-[1600px] mx-auto h-[320px] overflow-hidden">
        {teamworkSteps.map((step, index) => {
          const total = teamworkSteps.length;
          const distance = (index - current + total) % total;

          let x = 0;
          let scale = 0.85;
          let opacity = 0.5;
          let zIndex = 1;

          if (distance === 0) {
            x = 0;
            scale = 1;
            opacity = 1;
            zIndex = 50;
          } else if (distance === 1) {
            x = 280;
            opacity = 0.8;
            scale = 0.9;
            zIndex = 30;
          } else if (distance === 2) {
            x = 540;
            opacity = 0.6;
            scale = 0.85;
            zIndex = 20;
          } else if (distance === total - 1) {
            x = -280;
            opacity = 0.8;
            scale = 0.9;
            zIndex = 30;
          } else if (distance === total - 2) {
            x = -540;
            opacity = 0.6;
            scale = 0.85;
            zIndex = 20;
          } else {
            x = 0;
            opacity = 0;
          }

          return (
            <motion.div
              key={index}
              className="absolute w-[280px] flex flex-col items-center cursor-pointer"
              initial={false}
              animate={{ x, zIndex }}
              transition={{ duration: 0.7, ease: "easeInOut" }}
              onClick={() => setCurrent(index)}
            >
              {/* Card */}
              <motion.div
                className={`rounded-2xl overflow-hidden shadow-xl bg-white w-full h-[200px] p-3 flex flex-col justify-center items-center relative ${
                  distance === 0 ? "shadow-emerald-300/50" : "shadow-gray-200"
                }`}
                animate={{ scale, opacity }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
              >
                {/* Step badge */}
                <div
                  className={`absolute top-2 left-2 font-bold text-lg rounded-full w-8 h-8 flex items-center justify-center ${
                    distance === 0
                      ? "bg-emerald-500 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {step.step}
                </div>

                {/* Image */}
                <img
                  src={step.img}
                  alt={step.title}
                  className="w-full h-full object-contain"
                />
              </motion.div>

              {/* Title */}
              <motion.h3
                className="mt-4 text-lg font-semibold text-gray-800"
                animate={{ opacity: distance === 0 ? 1 : 0.6 }}
              >
                {step.title}
              </motion.h3>
            </motion.div>
          );
        })}
      </div>

      {/* Description below carousel */}
      <AnimatePresence mode="wait">
        <motion.p
          key={current}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.4 }}
          className="mt-12 text-gray-700 italic text-base sm:text-lg max-w-3xl mx-auto px-6 border-t border-emerald-100 pt-4"
        >
          {teamworkSteps[current].desc.replace(/"/g, "")}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
