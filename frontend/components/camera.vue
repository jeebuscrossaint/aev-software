<template>
    <div>
      <div v-if="videoDevices.length === 0">No cameras found.</div>
      <div v-for="device in videoDevices" :key="device.deviceId">
          <video class="object-cover w-full h-full" :ref="'videoElement' + device.deviceId" autoplay></video>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        videoDevices: [],
      };
    },
    async mounted() {
      await this.getVideoDevices();
      if (this.videoDevices.length > 0) {
        this.videoDevices.forEach(device => {
          this.startStream(device.deviceId);
        });
      }
    },
    methods: {
      async getVideoDevices() {
        try {
          const devices = await navigator.mediaDevices.enumerateDevices();
          this.videoDevices = devices.filter(device => device.kind === 'videoinput');
        } catch (err) {
          console.error('Error accessing video devices: ', err);
        }
      },
      async startStream(deviceId) {
        try {
          const videoElement = this.$refs[`videoElement${deviceId}`][0];
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