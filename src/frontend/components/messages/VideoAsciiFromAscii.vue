<template>
  <div
    :style="{
      backgroundColor: backgroundColor,
      padding: 0,
      margin: 0,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
      height: '100%'
    }"
  >
    <canvas
      ref="canvasVideoBuffer"
      :width="charsPerLine"
      :height="charsPerColumn"
      style="display: none"
    />

    <!-- ASCII -->
    <pre
      v-if="artType === ArtTypes.ASCII"
      ref="preTag"
      :style="{
        backgroundColor: backgroundColor,
        color: fontColor,
        padding: 0,
        margin: 0,
        letterSpacing: `${lineSpacing}em`,
        lineHeight: `${lineHeight}em`,
        transform: `scaleX(${flipY ? -1 : 1})`,
        overflow: 'hidden'
      }"
    >{{ asciiText }}</pre>

    <!-- ASCII_COLOR -->
    <pre
      v-else-if="artType === ArtTypes.ASCII_COLOR"
      ref="preTag"
      v-html="asciiText"
      :style="{
        backgroundColor: backgroundColor,
        color: fontColor,
        padding: 0,
        margin: 0,
        letterSpacing: `${lineSpacing}em`,
        lineHeight: `${lineHeight}em`,
        transform: `scaleX(${flipY ? -1 : 1})`,
        overflow: 'hidden'
      }"
    ></pre>

    <!-- ASCII_COLOR_BG_IMAGE -->
    <span v-else-if="artType === ArtTypes.ASCII_COLOR_BG_IMAGE">
      <pre
        ref="preTag"
        :style="{
          padding: 0,
          margin: 0,
          letterSpacing: `${lineSpacing}em`,
          lineHeight: `${lineHeight}em`,
          backgroundSize: '100% 100%',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          color: 'transparent',
          transform: `scaleX(${flipY ? -1 : 1})`,
          overflow: 'hidden'
        }"
      >{{ asciiText }}</pre>
    </span>

    <p v-else>ERROR</p>
  </div>
</template>

<script>
import {
  calculateAndSetFontSize,
} from '../../js/VideoCanvasAscii';

const ArtTypes = {
  ASCII: 'ASCII',
  ASCII_COLOR: 'ASCII_COLOR',
  ASCII_COLOR_BG_IMAGE: 'ASCII_COLOR_BG_IMAGE'
};

export default {
  name: 'VideoAsciiFromAscii',

  props: {
    text: {
      type: String,
      required: true
    },
    parentRef: {
      type: Object,
      required: true
    },
    charsPerLine: {
      type: Number,
      required: true
    },
    charsPerColumn: {
      type: Number,
      required: true
    },
    fontColor: {
      type: String,
      required: true
    },
    backgroundColor: {
      type: String,
      required: true
    },
    artType: {
      type: String,
      required: true,
      validator: function(value) {
        return Object.values(ArtTypes).includes(value);
      }
    },
    preTagRef: {
      type: Object,
      default: null
    },
    flipY: {
      type: Boolean,
      default: false
    },
    lineHeight: {
      type: Number,
      default: 0.7
    },
    lineSpacing: {
      type: Number,
      default: 0
    }
  },

  data() {
    return {
      asciiText: '',
      animationFrameId: 0,
      resizeObserver: null,
      ArtTypes
    };
  },

  mounted() {
    this.setupResizeObserver();
    this.startAnimation();
  },

  beforeUnmount() {
    this.cleanupResizeObserver();
    this.stopAnimation();
  },

  methods: {
    setupResizeObserver() {
      calculateAndSetFontSize(this.$refs.preTag, this.charsPerLine, this.charsPerColumn, this.parentRef.clientWidth, this.parentRef.clientHeight)

      this.resizeObserver = new ResizeObserver(entries => {
        const {width, height} = entries[0].contentRect;
        calculateAndSetFontSize(this.$refs.preTag, this.charsPerLine, this.charsPerColumn, width, height);
      });

      if (this.parentRef) {
        this.resizeObserver.observe(this.parentRef);
      }
    },

    cleanupResizeObserver() {
      if (this.resizeObserver) {
        this.resizeObserver.disconnect();
      }
    },

    updateAscii() {
      const canvas = this.$refs.canvasVideoBuffer
      if (!canvas) return

      const context = canvas.getContext('2d', { willReadFrequently: true });
      if (!context) return

      context.drawImage(this.text, 0, 0, canvas.width, canvas.height)
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
      
      this.asciiText = this.text;

      this.animationFrameId = requestAnimationFrame(this.updateAscii);
    },

    startAnimation() {
      this.updateAscii();
    },

    stopAnimation() {
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
      }
    }
  },

  watch: {
    text(newText) {
      this.asciiText = newText;
    }
  }
};
</script>
