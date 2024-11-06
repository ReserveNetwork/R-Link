<template>
  <div :style="containerStyle">
    <canvas
      ref="canvasVideoBuffer"
      :width="charsPerLine"
      :height="charsPerColumn"
      class="hidden"
    />

    <pre
      v-if="artType === 'ASCII'"
      ref="preTag"
      :style="preStyles"
    >{{ asciiText }}</pre>

    <pre
      v-else-if="artType === 'ASCII_COLOR'"
      ref="preTag"
      v-html="asciiText"
      :style="preStyles"
    ></pre>

    <span v-else-if="artType === 'ASCII_COLOR_BG_IMAGE'">
      <pre
        ref="preTag"
        :style="preStylesWithBg"
      >{{ asciiText }}</pre>
    </span>
  </div>
</template>

<script>
import { asciiChars } from '../../js/PixelAscii'
import { calculateAndSetFontSize, getAsciiFromImage, getAsciiFromImageColor, canvasImgToUrl } from '../../js/VideoCanvasAscii'

export default {
  name: 'VideoAscii',

  props: {
    videoStreaming: {
      type: HTMLVideoElement,
      required: true
    },
    parentRef: {
      type: Object,
      required: true
    },
    charsPerLine: {
      type: Number,
      default: 50
    },
    charsPerColumn: {
      type: Number,
      default: 35
    },
    fontColor: {
      type: String,
      default: 'white'
    },
    backgroundColor: {
      type: String,
      default: 'black'
    },
    artType: {
      type: String,
      default: 'ASCII',
      validator: (value) => ['ASCII', 'ASCII_COLOR', 'ASCII_COLOR_BG_IMAGE'].includes(value)
    },
    preTagRef: {
      type: Object,
      default: null
    },
    flipY: {
      type: Boolean,
      default: false
    },
    onFrameCapture: {
      type: Function,
      default: undefined
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
      containerStyle: {
        backgroundColor: this.backgroundColor,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%'
      },
      preStyles: {
        backgroundColor: this.backgroundColor,
        color: this.fontColor,
        letterSpacing: `${this.lineSpacing}em`,
        lineHeight: `${this.lineHeight}em`,
        transform: `scaleX(${this.flipY ? -1 : 1})`,
        overflow: 'hidden',
        margin: 0,
        padding: 0
      },
      preStylesWithBg: {
        ...this.preStyles,
        backgroundSize: '100% 100%',
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        color: 'transparent'
      }
    }
  },

  mounted() {
    this.initResizeObserver()
    this.startAnimation()
  },

  beforeUnmount() {
    this.cleanup()
  },

  unmounted() {
    this.resizeObserver.disconnect();
  },

  watch: {
    videoStreaming() {
      this.restartAnimation()
    },
    artType() {
      this.restartAnimation()
    }
  },

  methods: {
    initResizeObserver() {
      console.log(this.parentRef);
      calculateAndSetFontSize(this.$refs.preTag, this.charsPerLine, this.charsPerColumn, this.parentRef.clientWidth, this.parentRef.clientHeight)

      this.resizeObserver = new ResizeObserver(entries => {
        const {width, height} = entries[0].contentRect;
        calculateAndSetFontSize(this.$refs.preTag, this.charsPerLine, this.charsPerColumn, width, height);
      });
 
      if (this.parentRef) {
        this.resizeObserver.observe(this.parentRef)
      }
    },

    updateAscii() {
      const canvas = this.$refs.canvasVideoBuffer
      if (!canvas) return

      const context = canvas.getContext('2d', { willReadFrequently: true })
      if (!context) return

      context.drawImage(this.videoStreaming, 0, 0, canvas.width, canvas.height)
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height)

      switch (this.artType) {
        case 'ASCII':
          this.asciiText = getAsciiFromImage(imageData, asciiChars)
          break
        case 'ASCII_COLOR':
          this.asciiText = getAsciiFromImageColor(imageData, asciiChars)
          break
        case 'ASCII_COLOR_BG_IMAGE':
          this.asciiText = getAsciiFromImage(imageData, asciiChars)
          if (this.$refs.preTag) {
            this.$refs.preTag.style.backgroundImage = `url(${canvasImgToUrl(canvas).src})`
          }
          break
      }

      if (this.onFrameCapture) {
        this.onFrameCapture(this.asciiText)
      }

      this.animationFrameId = requestAnimationFrame(this.updateAscii)
    },

    startAnimation() {
      this.updateAscii()
    },

    restartAnimation() {
      cancelAnimationFrame(this.animationFrameId)
      this.startAnimation()
    },

    cleanup() {
      cancelAnimationFrame(this.animationFrameId)
      if (this.resizeObserver) {
        this.resizeObserver.disconnect()
      }
    }
  }
}
</script>
