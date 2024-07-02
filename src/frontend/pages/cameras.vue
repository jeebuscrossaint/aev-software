<template>
    <div class="flex flex-col justify-between items-center bg-[#f9fafe]">
        <img class="absolute opacity-40 w-[280px] z-[9999] top-4" src="/alsetSideLogo.png" alt="">
        <div class="flex w-full absolute bottom-0 justify-between">
            <img class="opacity-40 w-[150px] z-[9999] top-4" src="/blindSpot.png" alt="">
            <img class="opacity-40 w-[150px] z-[9999] top-4" style="transform: scale(-1, 1);" src="/blindSpot.png" alt="">
        </div>
        <div v-if="videoDevices.length === 0" class="w-screen h-screen flex justify-center items-center text-7xl font-bold">No Cameras Detected.</div>
        <div v-else class="relative w-full h-screen">
            <div v-if="videoDevices[0]" :class="['absolute p-2 pb-1 top-0 left-0 w-full h-[55%] transition-all', { 'full-screen': fullScreen === 2 }]" @click="toggleFullScreen(2)">
                <video class="rounded-xl object-fill w-full h-full" ref="videoElement1" autoplay></video>
            </div>
            <div v-if="videoDevices[1]" :class="['absolute p-2 pt-1 pr-1 bottom-0 left-0 w-1/2 h-[45%] transition-all', { 'full-screen': fullScreen === 0 }]" @click="toggleFullScreen(0)">
                <video class="rounded-xl rounded-br-xl object-fill w-full h-full" ref="videoElement0" autoplay></video>
            </div>
            <div v-if="videoDevices[2]" :class="['absolute p-2 pt-1 pl-1 bottom-0 right-0 w-1/2 h-[45%] transition-all', { 'full-screen': fullScreen === 1 }]" @click="toggleFullScreen(1)">
                <video class="rounded-xl rounded-bl-xl object-fill w-full h-full" ref="videoElement2" autoplay></video>
            </div>
        </div>
    </div>
</template>
  
<script>
    export default {
        data() {
            return {
                videoDevices: [],
                fullScreen: null,
            };
        },
        async mounted() {
            await this.getVideoDevices();
            if (this.videoDevices.length > 0) {
                this.videoDevices.forEach((device, index) => {
                    this.startStream(device.deviceId, index);
                });
            }
        },
        methods: {
            async getVideoDevices() {
                try {
                    const devices = await navigator.mediaDevices.enumerateDevices();
                    this.videoDevices = devices.filter(device => device.kind === 'videoinput').slice(0, 3); // Get the first 3 cameras
                } catch (err) {
                    console.error('Error accessing video devices: ', err);
                }
            },
            async startStream(deviceId, index) {
                try {
                    const videoElement = this.$refs[`videoElement${index}`];
                    if (videoElement) {
                    const stream = await navigator.mediaDevices.getUserMedia({
                        video: { deviceId: { exact: deviceId } }
                    });
                    videoElement.srcObject = stream;
                    }
                } catch (err) {
                    console.error('Error accessing the camera: ', err);
                }
            },
            toggleFullScreen(index) {
                this.fullScreen = this.fullScreen === index ? null : index;
            }
        }
    }
</script>

<style scoped>
    .full-screen {
        @apply absolute w-full h-full z-50;
    }
</style>
