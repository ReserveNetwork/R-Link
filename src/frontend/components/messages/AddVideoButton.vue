<template>
  <div class="inline-flex rounded-md shadow-sm">
    <button
      @click="isShowingMenu = true"
      class="my-auto mr-1 inline-flex items-center gap-x-1 rounded-md bg-gray-500 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-gray-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-500"
    >
      <span class="flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5">
          <path stroke-linecap="round" stroke-linejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
        </svg>
        Add Video
      </span>
    </button>


    <div class="relative block">
      <Transition
        enter-active-class="transition ease-out duration-100"
        enter-from-class="transform opacity-0 scale-95"
        enter-to-class="transform opacity-100 scale-100"
        leave-active-class="transition ease-in duration-75"
        leave-from-class="transform opacity-100 scale-100"
        leave-to-class="transform opacity-0 scale-95">
        <div v-if="isShowingMenu" v-click-outside="hideMenu" class="absolute bottom-0 -ml-11 sm:right-0 sm:ml-0 z-10 mb-10 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div class="py-1">
            <button @click="lowBandVideoMessage" type="button" class="w-full block text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 whitespace-nowrap">Low Band Video Message (ASCII)</button>
            <button @click="highBandVideoMessage" type="button" class="w-full block text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 whitespace-nowrap">High Band Video Message (WebM)</button>
          </div>
        </div>
      </Transition>
    </div>

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
          <RecordLowBandVideoMessage v-if="recordType == 'LOW_BAND'"
            @recording-complete="handleRecordingComplete"
            @copied="handleCopied"
          />
          <RecordHighBandVideoMessage v-else-if="recordType == 'HIGH_BAND'"
            @recording-complete="handleHighBandRecordingComplete"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import RecordHighBandVideoMessage from './RecordHighBandVideoMessage.vue'
import RecordLowBandVideoMessage from './RecordLowBandVideoMessage.vue'

export default {
  name: 'AddVideoButton',

  components: {
    RecordHighBandVideoMessage,
    RecordLowBandVideoMessage,
  },

  data() {
    return {
      isModalOpen: false,
      isShowingMenu: false,
      recordType: null,
    }
  },
  methods: {
    hideMenu() {
      this.isShowingMenu = false;
    },
    lowBandVideoMessage() {
      this.recordType = 'LOW_BAND';
      this.openModal();
    },
    highBandVideoMessage() {
      this.recordType = 'HIGH_BAND';
      this.openModal();
      // call highBandVideoMessage component
    },
    openModal() {
      this.isModalOpen = true
      this.$emit('modal-opened')
    },

    closeModal() {
      this.isModalOpen = false
      this.$emit('modal-closed')
    },

    handleRecordingComplete({ frames, audio }) {
      this.$emit('recording-complete', { type: 'LOW_BAND', frames: frames, audio: audio })
      this.closeModal();
    },

    handleHighBandRecordingComplete({ frames }) {
      console.log(frames);
      this.$emit('recording-complete', { type: 'HIGH_BAND', frames: frames, audio: undefined })
      this.closeModal();
    },

    handleCopied() {
      // Optional: Show a notification or handle the copy event
    }
  }
}
</script>
