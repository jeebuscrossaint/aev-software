<script setup>
    import WebSocket from "ws";
    const ws = new WebSocket("ws://localhost:3001");
    
    let speedToggle = ref(0);
    let speedColor = ref({
        r: '249',
        g: '251',
        b: '253'
    })
    let speed = ref(0)

    function getColorForSpeed(speed) {
        // colors to interpolate between
        const green = { r: 144, g: 238, b: 144 };      
        const yellow = { r: 255, g: 165, b: 0 };       
        const red = { r: 227, g: 87, b: 77 };            

        // (we can change this once we know how fast it can go lol)
        const maxSpeed = 40;

        // ill be honest the rest of this function is AI generated fanciness to interpolate what color it should return dependent on the speed
        speed = Math.max(0, Math.min(speed, maxSpeed));
        let color;
        if (speed <= maxSpeed / 2) {
            // Interpolate between green and yellow
            let t = speed / (maxSpeed / 2);
            color = {
                r: Math.round(green.r + t * (yellow.r - green.r)),
                g: Math.round(green.g + t * (yellow.g - green.g)),
                b: Math.round(green.b + t * (yellow.b - green.b))
            };
        } else {
            // Interpolate between yellow and red
            let t = (speed - (maxSpeed / 2)) / (maxSpeed / 2);
            color = {
                r: Math.round(yellow.r + t * (red.r - yellow.r)),
                g: Math.round(yellow.g + t * (red.g - yellow.g)),
                b: Math.round(yellow.b + t * (red.b - yellow.b))
            };
        }

        return color;
    }

    ws.on("error", console.error);

    ws.on("open", function open() {
        setInterval(() => {
            ws.send("gps-data");
            console.log("Requested GPS data from server");
        }, 500);
    });

    ws.on("message", function message(data) {
        console.log("BMS Data Recieved: " + data);
        speed.value = data;
    });

    // ws.addEventListener("message", (event) => {
    //     console.log("Message from server ", event.data);
    // });

    // TEST DATA, COMMENT WHEN TESTING ACTUAL CAR
    // onMounted(() => {
    //     setInterval(() => {
    //         // ALL THIS WILL BE UPDATED WITH SERIALPORT UPDATE THIS IS STATIC FOR NOW WITH INTERVAL TEST CASE
    //         if(speed.value >= 40){
    //             speed.value = 0;
    //             if(speed.value == 0){
    //                 speedToggle.value = 0;
    //                 speedColor.value = getColorForSpeed(speed.value);
    //             }
    //             else{
    //                 speedToggle.value = 20;
    //                 speedColor.value = getColorForSpeed(speed.value);
    //             }
    //         }
    //         else{
    //             speed.value += 1;
    //             if(speed.value == 0){
    //                 speedToggle.value = 0;
    //                 speedColor.value = getColorForSpeed(speed.value);
    //             }
    //             else{
    //                 speedToggle.value = 20;
    //                 speedColor.value = getColorForSpeed(speed.value);
    //             }
    //         }
    //     }, 300);
    // });
</script>

<template>
    <!--Sadly due to Raspberry PI/ARM issues, we had to make the car a static image and video as opposed to a live 3D render :( -->
    <div class="flex flex-col h-screen justify-between items-center bg-[#f9fafe] overflow-hidden">
        <div class="w-screen flex justify-center h-[30vh]">
            <div class="w-[25vw] max-w-[200px] h-[15vh] top-16 bg-[rgba(0,0,0,0.5)] rounded-xl border-4 flex justify-center items-center text-5xl sm:text-7xl font-bold text-white absolute" :style="`border-color: rgb(${speedColor.r}, ${speedColor.g}, ${speedColor.b})`">
                {{ speed }}
            </div>
        </div>
        <div v-if="speed <= 0" class="translate-x-[1px] max-w-[1150px]">
            <img src="/car.png" alt="" />
        </div> 
        <div v-else class="max-w-[1150px]">
            <video src="/car.mp4" autoplay loop></video>
        </div>
    </div>
    <!--This was the 3D render code before we had to pivot implementations-->
    <!--
     <div>
        <div v-if="speed <= 0">
            <carScene :speedToggle="speedToggle" />
        </div> 
        <div v-else>
            <carScene :speedToggle="speedToggle" />
        </div>
        <div class="w-screen flex justify-center">
            <div class="w-[25vw] max-w-[200px] h-[15vh] top-16 bg-[rgba(0,0,0,0.5)] rounded-xl border-4 flex justify-center items-center text-5xl sm:text-7xl font-bold text-white absolute" :style="`border-color: rgb(${speedColor.r}, ${speedColor.g}, ${speedColor.b})`">
                {{ speed }}
            </div>
            <img src="/alsetLogo.png" alt="Alset Logo" class="absolute bottom-3 w-[100px]">
        </div>
    </div> 
    -->
</template> 
