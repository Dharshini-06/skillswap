import { useCallback } from "react";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";

export default function ParticlesBg() {
  const particlesInit = useCallback(async (engine) => {
    // load full bundle to get all features
    await loadFull(engine);
  }, []);

  return (
    <Particles
      init={particlesInit}
      options={{
        fullScreen: { enable: true, zIndex: 1 },
        detectRetina: true,
        background: { color: "transparent" },
        fpsLimit: 60,
        interactivity: {
          detectsOn: 'canvas',
          events: {
            onHover: { enable: true, mode: 'grab' },
            onClick: { enable: true, mode: 'push' },
            resize: true,
          },
          modes: {
            grab: { distance: 180, links: { opacity: 0.9 } },
            bubble: { distance: 200, size: 8, duration: 2, opacity: 0.8 },
            push: { quantity: 4 },
            repulse: { distance: 120 },
          },
        },
        particles: {
          number: { value: 85, density: { enable: true, area: 800 } },
          color: { value: ['#7c3aed', '#d946ef', '#06b6d4'] },
          shape: { type: 'circle' },
          opacity: { value: 0.8, random: { enable: true, minimumValue: 0.4 } },
          size: { value: { min: 1, max: 4 } },
          links: {
            enable: true,
            distance: 180,
            color: '#7c3aed',
            opacity: 0.4,
            width: 1,
          },
          move: {
            enable: true,
            speed: 0.9,
            direction: 'none',
            random: false,
            straight: false,
            outModes: { default: 'out' },
            attract: { enable: false, rotateX: 600, rotateY: 1200 },
          },
        },
      }}
    />
  );
}
