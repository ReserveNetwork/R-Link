<template>
    <div :id="videoContainerId">
        <video class="shadow" :id="id" :ref="(el) => { el.addEventListener('click', async () => { await this.playPip(el); }) }" controls>
            <source :src="options['sources'][0]['src']" :type="options['sources'][0]['type']" />
        </video>
    </div>
</template>

<script>

export default {
    name: 'VideoPlayer',
    props: {
        options: {
            type: Object,
            default() {
                return {};
            }
        }
    },
    data() {
        return {
            player: null,
            id: null, 
            videoContainerId: null
        }
    },
    methods: {
        uuidv4() {
          return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
                (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16));
        },
        async playPip(el) {
            try {
                if (document.pictureInPictureelement) {
                    document.exitPictureInPicture();
                } else if (document.pictureInPictureEnabled) {
                    el.requestPictureInPicture();
                }
            } catch (e) {
                console.error(e);
            }
        }
    },
    created() {
        this.id = this.uuidv4();
        this.videoContainerId = this.uuidv4();
    },
    mounted() {
    },
}
</script>
