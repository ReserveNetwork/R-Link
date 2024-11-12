<template>
  <Transition
    enter-active-class="transition ease-out duration-200"
    enter-from-class="opacity-0 scale-95"
    enter-to-class="opacity-100 scale-100"
    leave-active-class="transition ease-in duration-150"
    leave-from-class="opacity-100 scale-100"
    leave-to-class="opacity-0 scale-95"
  >
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center"
      @click.self="closeModal"
      role="dialog"
      aria-modal="true"
    >
      <!-- Backdrop -->
      <div
        class="absolute inset-0 bg-gray-100 bg-opacity-50 backdrop-blur-sm"
        aria-hidden="true"
      ></div>

      <!-- Modal Content -->
      <div class="relative z-10 rounded-full">
        <div class="flex justify-end mb-2">
          <button
            @click="closeModal"
            class="p-1 rounded-full hover:bg-gray-100 transition-colors duration-200"
            aria-label="Close modal"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="w-5 h-5 text-gray-500 hover:text-gray-700"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div class="w-40 h-40 rounded-full overflow-hidden shadow-xl">
          <img
            v-if="peer?.avatar"
            :src="`data:image/webp;base64,${peer.avatar}`"
            class="w-full h-full object-cover"
            :alt="`${peer.name}'s avatar`"
            @error="handleImageError"
          />
          <div
            v-else
            class="w-full h-full bg-gray-200 flex items-center justify-center"
          >
            <span class="text-gray-400">No Image</span>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script>
export default {
  name: 'ProfilePictureModal',

  props: {
    modelValue: {
      type: Boolean,
      required: true
    },
    peer: {
      type: Object,
      required: true,
      validator(value) {
        return value && typeof value === 'object'
      }
    }
  },

  emits: ['update:modelValue'], // Vue 3 explicit emits declaration

  computed: {
    isOpen: {
      get() {
        return this.modelValue
      },
      set(value) {
        this.$emit('update:modelValue', value)
      }
    }
  },

  methods: {
    closeModal() {
      this.isOpen = false
    },

    handleEscKey(event) {
      if (event.key === 'Escape' && this.isOpen) {
        this.closeModal()
      }
    },

    handleImageError(event) {
      event.target.classList.add('hidden')
      if (event.target.nextElementSibling) {
        event.target.nextElementSibling.classList.remove('hidden')
      }
    }
  },

  mounted() {
    document.addEventListener('keydown', this.handleEscKey)
  },

  unmounted() { // Changed from beforeDestroy to unmounted in Vue 3
    document.removeEventListener('keydown', this.handleEscKey)
  }
}
</script>