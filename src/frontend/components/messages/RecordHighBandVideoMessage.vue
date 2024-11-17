<script>
import { Muxer, StreamTarget } from 'webm-muxer';
//import * as WebMMuxer from 'webm-muxer';

export default {
    name: 'RecordHighBandVideoMessage',

    data() {
        return {
            muxer: null,
            videoEncoder: null,
            audioEncoder: null,
            startTime: null,
            recording: false,
            audioTrack: null,
            videoTrack: null,
            intervalId: null,
            recordedChunks: [],
        };
    },

    methods: {
        async startRecording() {
            this.recordedChunks = [];

            // Check for AudioEncoder availability
            if (typeof AudioEncoder === 'undefined') {
                alert("Looks like your user agent doesn't support AudioEncoder / WebCodecs API yet.");
                return;
            }

            // Check for VideoEncoder availability
            if (typeof VideoEncoder === 'undefined') {
                alert("Looks like your user agent doesn't support VideoEncoder / WebCodecs API yet.");
                return;
            }

            // TODO: start recording button status will be change here
            this.$refs.startRecording.style.display = 'none';

            try {
                let userMedia = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                this.audioTrack = userMedia.getAudioTracks()[0];
                this.videoTrack = userMedia.getVideoTracks()[0];
            } catch (e) {
                console.error('Failed to acquire media tracks:', e);
                this.$refs.startRecording.style.display = 'block';
                return;
            }

            if (!this.audioTrack) console.warn("Couldn't acquire a user media audio track.");
            if (!this.videoTrack) console.warn("Couldn't acquire a user media video track.");
            console.log("media and audio not nulll");
            let mediaSource = new MediaSource();
            this.$refs.streamPreview.src = URL.createObjectURL(mediaSource);
            this.$refs.streamPreview.play().catch(e => console.error('Preview playback failed:', e));
            await new Promise(resolve => mediaSource.onsourceopen = resolve);
            console.log("Media source resolved");
            let sourceBuffer = mediaSource.addSourceBuffer('video/webm; codecs="av01.0.00M.08, opus"');

            // TODO: show endRecordingButton here
            this.$refs.endRecording.style.display = 'block';

            let audioSampleRate = this.audioTrack?.getSettings().sampleRate;
            let audioNumberOfChannels = this.audioTrack?.getSettings().channelCount ?? 2;
            let videoTrackWidth = this.videoTrack?.getSettings().width;
            let videoTrackHeight = this.videoTrack?.getSettings().height;
            console.log(audioSampleRate);
            console.log(audioNumberOfChannels);
            let muxer = new Muxer({
                streaming: true,
                target: new StreamTarget({
                    onData: (buffer, _) => {
                        try {
                            this.recordedChunks.push(buffer);
                            sourceBuffer.appendBuffer(buffer);
                        } catch(e) {
                            console.error("Appending buffer was went wrong:", e);
                        }
                    }
                }),
                video: this.videoTrack ? {
                    codec: 'V_AV1',
                    width: 256,
                    height: 144,
                    frameRate: 18,
                } : undefined,
                audio: this.audioTrack ? {
                    codec: 'A_OPUS',
                    sampleRate: audioSampleRate,
                    numberOfChannels: audioNumberOfChannels
                } : undefined,
                type: 'webm',
                firstTimestampBehavior: 'offset'
            });
            
            // Audio Track
            if (this.audioTrack) {
                this.audioEncoder = new AudioEncoder({
                    output: (chunk, meta) => {
                        muxer.addAudioChunk(chunk, meta);
                    },
                    error: e => console.error('Audio encoder error:', e)
                });
                this.audioEncoder.configure({
                    codec: 'opus',
                    numberOfChannels: audioNumberOfChannels,
                    sampleRate: audioSampleRate,
                    bitrate: 32_000,
                });

                // Create a MediaStreamTrackProcessor to get AudioData chunks from the audio track
                let trackProcessor = new MediaStreamTrackProcessor({ track: this.audioTrack });
                let consumer = new WritableStream({
                    write: (audioData) => {
                        if (!this.recording) return;
                        this.audioEncoder.encode(audioData);
                        audioData.close();
                    }
                });
                trackProcessor.readable.pipeTo(consumer).catch(e => console.error('Audio processing failed:', e));
            }

            // Video Track
            if (this.videoTrack) {
                this.videoEncoder = new VideoEncoder({
                    output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
                    error: e => console.error(e)
                });
                this.videoEncoder.configure({
                    codec: 'av01.0.00M.08',
                    width: 256,
                    height: 144,
                    framerate: 18,
                    bitrate: 128_000,
                    bitrateMode: 'constant',
                    latencyMode: 'realtime',
                    tile: 1
                });

                // Create a MediaStreamTrackProcessor to get VideoFrame chunks from the video track
                let frameCount = 0;
                const keyFrameInterval = 1;
                let videoTrackProcessor = new MediaStreamTrackProcessor({ track: this.videoTrack });
                let videoConsumer = new WritableStream({
                    write: (videoFrame) => {
                        if (!this.recording) return;
                        const isKeyFrame = frameCount % keyFrameInterval === 0;
                        this.videoEncoder.encode(videoFrame, { keyFrame: isKeyFrame });
                        frameCount++;

                        videoFrame.close();
                    }
                });
                videoTrackProcessor.readable.pipeTo(videoConsumer).catch(e => console.error('Video processing failed:', e));
            }

            this.startTime = document.timeline.currentTime;
            this.recording = true;

            this.updateRecordingStatus();
            this.intervalId = setInterval(() => this.updateRecordingStatus(), 1000/30);
        },
        async stopRecording() {
            // TODO: style end recording button as none 
            this.$refs.endRecording.style.display = 'none';
            this.recording = false;

            try {
                clearInterval(this.intervalId);
                this.audioTrack?.stop();
                this.videoTrack?.stop();

                await this.videoEncoder?.flush();
                await this.audioEncoder?.flush();

                const frames = new Blob(this.recordedChunks, { type: 'video/webm' });
                console.log(frames);
                this.$emit('recording-complete', { frames }); 
            } catch(e) {
                console.error(e);
            } finally {
                this.videoEncoder = null;
                this.audioEncoder = null;
                this.muxer = null;
                this.startTime = null;
            }
        },
        createBlobObject() {
	    return new Blob(this.recordedChunks, { type: 'video/webm' });
        },
        updateRecordingStatus() {
            const elapsedTime = document.timeline.currentTime - this.startTime;
            this.$refs.recordingStatus.textContent = `${elapsedTime % 1000 < 500 ? '🔴' : '⚫'} Recording - ${(elapsedTime / 1000).toFixed(1)} s`;
        }
    }
}
</script>

<template>
    <div class="flex flex-col justify-between h-full py-5">
        <div>
            <video id="stream-preview" ref="streamPreview" width="256" height="144" controls class="mx-auto"></video>
            <p id="recording-status" ref="recordingStatus" class="m-0 text-center mt-5 h-5 text-white"></p>
        </div>
        <div id="controls" class="mt-5 flex justify-center h-9">
            <button id="start-recording" ref="startRecording" @click="startRecording" class="px-4 py-2 bg-white text-black rounded-md hover:bg-gray-700
                transition-colors duration-200 focus:outline-none focus:ring-2
                focus:ring-blue-500 focus:ring-offset-2">Start Recording</button>
            <button id="end-recording" ref="endRecording" @click="stopRecording" class="px-4 py-2 bg-white text-black rounded-md hover:bg-gray-700
                transition-colors duration-200 focus:outline-none focus:ring-2
                focus:ring-blue-500 focus:ring-offset-2 hidden">End Recording</button>
        </div>
    </div>
</template>
