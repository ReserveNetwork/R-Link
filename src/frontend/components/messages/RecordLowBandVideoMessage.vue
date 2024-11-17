<script>
import CameraAsciiPanel from './CameraAsciiPanel.vue'

export default {
    name: 'RecordLowBandVideoMessage',

    components: {
        CameraAsciiPanel,
    },

    data() {

    },
    methods: {
        handleRecordingComplete({ frames, audio }) {
            this.$emit('recording-complete', { frames, audio })
        },
        handleCopied() {
            // TODO: get handle copy action 
        },
    },
}
</script>

<template>
    <CameraAsciiPanel
        @recording-complete="handleRecordingComplete"
        @copied="handleCopied"
    />
</template>
