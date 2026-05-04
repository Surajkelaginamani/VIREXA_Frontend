import { useEffect, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadFull } from "tsparticles";

const ParticlesBackground = () => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadFull(engine);
    }).then(() => {
      setIsReady(true);
    });
  }, []);

  if (!isReady) return null;

  return (
    <Particles
      id="tsparticles"
      className="pointer-events-none fixed inset-0 z-0"
      options={{
        fullScreen: {
          enable: false,
        },

        background: {
          color: {
            value: "transparent",
          },
        },

        fpsLimit: 120,

        interactivity: {
          events: {
            onClick: {
              enable: true,
              mode: "push",
            },

            onHover: {
              enable: true,
              mode: "repulse",
            },

            resize: true,
          },

          modes: {
            push: {
              quantity: 4,
            },

            repulse: {
              distance: 120,
              duration: 0.4,
            },
          },
        },

        particles: {
          color: {
            value: ["#ec4899", "#8b5cf6", "#06b6d4"],
          },

          links: {
            color: "#ffffff",
            distance: 140,
            enable: true,
            opacity: 0.12,
            width: 1,
          },

          collisions: {
            enable: false,
          },

          move: {
            direction: "none",
            enable: true,
            outModes: {
              default: "bounce",
            },
            random: false,
            speed: 1.2,
            straight: false,
          },

          number: {
            density: {
              enable: true,
              area: 900,
            },

            value: 70,
          },

          opacity: {
            value: 0.35,
          },

          shape: {
            type: "circle",
          },

          size: {
            value: {
              min: 1,
              max: 5,
            },
          },
        },

        detectRetina: true,
      }}
    />
  );
};

export default ParticlesBackground;
