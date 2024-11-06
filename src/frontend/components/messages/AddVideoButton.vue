<template>
  <div class="inline-flex rounded-md shadow-sm">
    <button
      @click="openModal"
      class="my-auto mr-1 inline-flex items-center gap-x-1 rounded-md bg-gray-500 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-gray-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-500"
    >
      <span class="flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5">
          <path stroke-linecap="round" stroke-linejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
        </svg>
        Add Video
      </span>
    </button>

    <!-- Modal -->
    <div
      v-if="isModalOpen"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-black rounded-lg w-full max-w-4xl h-[80vh] overflow-hidden">
        <!-- Modal Header -->
        <div class="flex justify-between items-center p-4 border-b border-gray-700">
          <h3 class="text-xl font-semibold text-white">Record ASCII Video</h3>
          <button
            @click="closeModal"
            class="text-gray-400 hover:text-white"
          >
            <span class="text-2xl">&times;</span>
          </button>
        </div>

        <!-- Modal Content -->
        <div class="h-[calc(100%-8rem)] relative overflow-hidden">
          <CameraAsciiPanel
            @recording-complete="handleRecordingComplete"
            @copied="handleCopied"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import CameraAsciiPanel from './CameraAsciiPanel.vue'

export default {
  name: 'AddVideoButton',

  components: {
    CameraAsciiPanel
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
    },

    handleRecordingComplete({ frames, audio }) {
      this.$emit('recording-complete', { frames, audio })
      this.closeModal();
    },

    handleCopied() {
      // Optional: Show a notification or handle the copy event
    }
  }
}
</script>
