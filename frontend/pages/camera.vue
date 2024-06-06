<template>
    <div>
      <h1>Camera Streams</h1>
      <div v-if="videoDevices.length === 0">No cameras found.</div>
      <div class="flex w-screen">
        <div v-for="device in videoDevices" :key="device.deviceId" class="camera-container">
            <h2>{{ device.label || `Camera ${device.deviceId}` }}</h2>
            <video :ref="'videoElement' + device.deviceId" autoplay></video>
        </div>
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
  
  <style>
  .camera-container {
    margin-bottom: 20px;
  }
  video {
    width: 100%;
    height: auto;
  }
  </style>
  