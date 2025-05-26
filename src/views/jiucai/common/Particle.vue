<script setup lang="ts">
import {useMyStore} from "@/stores/myStore";
const myStore = useMyStore();

const particlesOptions = ref({
  background: {
    color: {
      value: "block",
    },
  },
  fullScreen: {
    enable: true,
  },
  opacity: {
    value: 1,
    random: true,
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
    },
    modes: {
      bubble: {
        distance: 400,
        duration: 2,
        opacity: 0.8,
        size: 40,
      },
      push: {
        quantity: 4,
      },
      repulse: {
        distance: 200,
        duration: 0.4,
      },
    },
  },
  particles: {
    color: {
      value: "random",
      animation: {
        enable: true,
        speed: 20,
        sync: true,
      },
    },
    links: {
      color: "random",
      distance: 150,
      enable: true,
      opacity: 0.5,
      width: 1,
    },
    move: {
      direction: "none",
      enable: true,
      outModes: "bounce",
      random: false,
      speed: 6,
      straight: false,
    },
    number: {
      density: {
        enable: true,
      },
      value: 32,
      limit: {
        mode: "delete",
        value: 64
      }
    },
    opacity: {
      value: 0.5,
    },
    shape: {
      type: "circle",
    },
    size: {
      value: { min: 1, max: 5 },
    },
  },
  detectRetina: true,
});

</script>
<template>
  <vue-particles v-if="myStore.particles" id="tsparticles" :options="particlesOptions" />
</template>

<style scoped>
#tsparticles{
  pointer-events: none;
  z-index: 9999;
}
</style>
