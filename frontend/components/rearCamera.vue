<template>
    <div>
        <div v-if="!videoDevice" class="w-full h-full border-4 rounded-lg border-gray-200 flex justify-center items-center text-7xl font-bold">No Camera Detected.</div>
        <div v-else class="w-full h-full">
        <video class="object-fill w-full h-full rounded-xl" ref="videoElement" autoplay></video>
        </div>
    </div>
</template>

<script>
    export default {
        data() {
            return {
            videoDevice: null,
            };
        },
        async mounted() {
            await this.getVideoDevice();
            if (this.videoDevice) {
            this.startStream(this.videoDevice.deviceId);
            }
        },
        methods: {
            async getVideoDevice() {
                try {
                    const devices = await navigator.mediaDevices.enumerateDevices();
                    const videoDevices = devices.filter(device => device.kind === 'videoinput');
                    if (videoDevices.length > 0) {
                    this.videoDevice = videoDevices[0];
                    }
                }
                catch (err) {
                    console.error('Error accessing video devices: ', err);
                }
            },
            async startStream(deviceId) {
                try {
                    const videoElement = this.$refs.videoElement;
                    const stream = await navigator.mediaDevices.getUserMedia({
                    video: { deviceId: { exact: deviceId } }
                    });
                    videoElement.srcObject = stream;
                } catch (err) {
                    console.error('Error accessing the camera: ', err);
                }
            }
        }
    }
</script>
