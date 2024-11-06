<template>
  <div class="w-full h-full bg-black relative overflow-hidden flex flex-col gap-5 justify-between">
    <!-- Video Display -->
    <div ref="parentRef" class="w-full h-full overflow-hidden mt-5">
      <div v-if="isReady && videoRef">
        <VideoAscii
          :video-streaming="videoRef"
          :parent-ref="$refs.parentRef"
          :art-type="useColor ? 'ASCII' : 'ASCII_COLOR_BG_IMAGE'"
          :chars-per-line="charsPerLine"
          :chars-per-column="charsPerColumn"
          :font-color="'#b88402'"
          :background-color="'black'"
          :flip-y="false"
          :pre-tag-ref="preTagRef"
          :on-frame-capture="isRecording ? handleFrameCapture : undefined"
        />
      </div>
      <div v-else>
        <p class="text-white text-center">
          {{ isReady ? 'Video stream not available.' : '' }}
        </p>
      </div>
    </div>

    <div class="bg-black text-center mb-4 z-50">
      <div
          v-if="isReady"
          class="text-white">
        <span v-if="isRecording">
        </span>
        <button
            class="px-4 py-2 bg-white text-black rounded-md hover:bg-gray-700
         transition-colors duration-200 focus:outline-none focus:ring-2
         focus:ring-blue-500 focus:ring-offset-2"
            :class="{ 'bg-red-600 hover:bg-red-700': isRecording }"
            @click="toggleRecording"
        >
          <span v-if="isRecording" class="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 9.563C9 9.252 9.252 9 9.563 9h4.874c.311 0 .563.252.563.563v4.874c0 .311-.252.563-.563.563H9.564A.562.562 0 0 1 9 14.437V9.564Z" />
            </svg>
            Stop Recording
          </span>
          
          <span v-else class="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
            </svg>
            Start Recording
          </span>
        </button>
      </div>
      
      <div v-else class="text-center">
      <button
          class="px-4 py-2 bg-white text-black mx-auto flex items-center rounded-md gap-2 hover:bg-gray-700
         transition-colors duration-200 focus:outline-none focus:ring-2
         focus:ring-blue-500 focus:ring-offset-2"
          @click="initializeMediaDevices"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
          <path stroke-linecap="round" stroke-linejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M12 18.75H4.5a2.25 2.25 0 0 1-2.25-2.25V9m12.841 9.091L16.5 19.5m-1.409-1.409c.407-.407.659-.97.659-1.591v-9a2.25 2.25 0 0 0-2.25-2.25h-9c-.621 0-1.184.252-1.591.659m12.182 12.182L2.909 5.909M1.5 4.5l1.409 1.409" />
        </svg>
        Initialize Media Devices
      </button>
      </div>
    </div>

  </div>
</template>

<script>
import {MediaRecorder} from 'extendable-media-recorder';
import {encodeWav} from "../../js/WavEncoder";
import {saveCompressedFrames} from "../../js/Compression";
import VideoAscii from './VideoAscii.vue'

export default {
  name: 'CameraAsciiPanel',

  components: {
    VideoAscii
  },

  data() {
    return {
      useColor: true,
      frames: [],
      audioChunks: [],
      isReady: false,
      isRecording: false,
      lastCaptureTime: 0,
      preTagRef: null,
      videoRef: null,
      parentRef: null,
      mediaRecorderRef: null,
      audioContextRef: null,
      audioWorkletNode: null,
      streamRef: null,
      frameInterval: 1000 / 15,
      fps: 0,
      charsPerLine: 75,
      charsPerColumn: 0,
    }
  },
  
  methods: {
    calculateCharsPerColumn(video) {
      return 50; 
      //return Math.round(this.charsPerLine * (video.videoWidth / video.videoHeight));
    },

    async initializeMediaDevices() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640, max: 1024 },
            height: { ideal: 480, max: 768 },
            frameRate: { ideal: 15, max: 15 }
          },
          audio: true,
        })

        this.streamRef = stream

        if (!this.videoRef) {
          const videoElement = document.createElement('video')
          videoElement.playsInline = true
          videoElement.muted = true
          this.videoRef = videoElement
        }

        // Set up video stream
        this.videoRef.srcObject = stream
        await this.videoRef.play()
        this.charsPerColumn = this.calculateCharsPerColumn(this.videoRef);
        
        // Initialize audio context and worklet

        this.isReady = true
      } catch (err) {
        console.error('Error initializing camera:', err)
      }
    },

    async startRecording() {
      if (!this.streamRef || this.isRecording) return

      // Initialize MediaRecorder
      const mediaRecorder = new MediaRecorder(this.streamRef)
      this.mediaRecorderRef = mediaRecorder

      // Reset recording arrays
      this.audioChunks = []
      this.frames = []

      // Set up audio processing
      this.audioContextRef = new (window.AudioContext || window.webkitAudioContext)({
        sampleRate: 8000
      })
      
      await this.audioContextRef.audioWorklet.addModule('assets/js/codec2-emscripten/processor.js')
      this.audioWorkletNode = new AudioWorkletNode(this.audioContextRef, 'audio-processor')

      if (this.audioWorkletNode) {
        this.audioWorkletNode.port.onmessage = async event => {
          this.audioChunks.push(event.data)
        }
      }
      
      // Connect audio nodes
      const sourceNode = this.audioContextRef.createMediaStreamSource(this.streamRef)
      sourceNode.connect(this.audioWorkletNode)
      
      try {
        if (this.audioWorkletNode && this.isRecording) {
          this.audioWorkletNode.port.onmessage = async event => {
            this.audioChunks.push(event.data)
          }
        }
        mediaRecorder.start()
        this.isRecording = true
        this.lastCaptureTime = performance.now()
      } catch (error) {
        console.error('Error starting MediaRecorder:', error)
        this.isRecording = false
      }
    },

    async stopRecording() {
      if (!this.mediaRecorderRef || !this.isRecording) return

      try {
        this.mediaRecorderRef.stop()
        this.isRecording = false

        if (this.streamRef) {
          this.streamRef.getTracks().forEach(track => track.stop())
        }

        if (this.audioWorkletNode) {
          this.audioWorkletNode.disconnect()
        }

        if (this.audioContextRef && this.audioContextRef.state !== 'closed') {
          this.audioContextRef.close()
        }

        // Process audio data
        let fullAudioChunks = []
        this.audioChunks.forEach(chunk => {
          fullAudioChunks = [...fullAudioChunks, ...chunk]
        })

        // Encode audio
        const audioBuffer = WavEncoder.encodeWAV(fullAudioChunks, 8000)
        const rawBuffer = await Codec2Lib.audioFileToRaw(audioBuffer, 'audio.wav')
        const encoded = await Codec2Lib.runEncode('3200', rawBuffer)
        const audioBlob = new Blob([encoded])

        // Save data
        const compressedFrames = saveCompressedFrames(this.frames)

        // Emit recording data to parent
        this.$emit('recording-complete', {
          frames: compressedFrames,
          audio: audioBlob
        })
      } catch (error) {
        console.error('Error stopping recording:', error)
      }
    },

    toggleRecording() {
      if (this.isRecording) {
        this.stopRecording()
      } else {
        this.startRecording()
      }
    },

    handleFrameCapture(frame) {
      if (this.isRecording) {
        // Limit frame capture to 30 fps
        const now = performance.now()
        if (now - this.lastCaptureTime >= this.frameInterval) {
          this.frames.push(frame);
          this.lastCaptureTime = now;
        }
      }
    },
  },

  beforeUnmount() {
    if (this.streamRef) {
      this.streamRef.getTracks().forEach(track => track.stop())
    }

    if (this.audioWorkletNode) {
      this.audioWorkletNode.disconnect()
    }

    if (this.audioContextRef && this.audioContextRef.state !== 'closed') {
      this.audioContextRef.close()
    }

    if (this.mediaRecorderRef) {
      this.mediaRecorderRef.disconnect();
    }

    if (this.videoRef) {
      this.videoRef = null;
    }
  }
}
</script>

<style scoped>

</style>
