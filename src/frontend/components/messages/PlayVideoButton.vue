<script>
import TextAsciiPanel from './TextAsciiPanel.vue'

export default {
  name: "PlayVideoButton",
  components: {TextAsciiPanel},
  props: {
    compressedFrames: {
      default: ''
    },
    compressedAudio: {
      default: ''
    }
  },
  data() {
    return {
      isModalOpen: false
    }
  },
  methods: {
    openModal() {
      this.isModalOpen = true
      this.$emit('modal-opened')
    },
    closeModal() {
      this.isModalOpen = false
      this.$emit('modal-closed')
    }
  }
}
</script>

<template>
  <div class="inline-flex rounded-md shadow-sm">
    
    <button
        type="button"
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        @click="openModal"
    >
      Play Video
    </button>

    <!-- Modal -->
    <div v-if="isModalOpen"
         class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-black rounded-lg w-full max-w-4xl h-[80vh] overflow-hidden">
        <div class="flex justify-between items-center p-4 border-b border-gray-700">
          <div>
            
          </div>
          <button
              @click="closeModal"
              class="text-gray-400 hover:text-white"
          >
            <span class="text-2xl">&times;</span>
          </button>
        </div>
        <div class="h-[calc(100%-8rem)] relative overflow-hidden">
          <TextAsciiPanel v-if="isModalOpen"
                          :compressed-frames="compressedFrames"
                          :compressed-audio="compressedAudio"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
