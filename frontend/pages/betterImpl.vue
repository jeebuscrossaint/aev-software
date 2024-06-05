<script setup>
    let speedColor = ref(0); 
    let speedToggle = ref(0);

    const speed = ref(0)

    // JOSSAYA ADD SOCKETIO BACKEND CONNECTION HERE WITH AN UNUSED PORT & LMK

    onMounted(() => {
        setInterval(() => {
            // ALL THIS WILL BE UPDATED WITH SERIALPORT UPDATE THIS IS STATIC FOR NOW WITH INTERVAL TEST CASE
            speed.value += 1;
            if(speed.value == 0){
                speedToggle.value = 0;
                speedColor.value = speed.value;
            }
            else{
                speedToggle.value = 20;
                speedColor.value = speed.value;
            }
        }, 700);
    });
</script>

<template>
    <div>
        <div v-if="speed <= 0">
            <carScene :speedToggle="speedToggle" :speedColor="speedColor" />
        </div> 
        <div v-else>
            <carScene :speedToggle="speedToggle" :speedColor="speedColor" />
        </div>
        <div class="w-screen flex justify-center">
            <div class="w-[25vw] max-w-[200px] h-[15vh] top-16 backdrop-blur-sm bg-[rgba(0,0,0,0.5)] rounded-xl border-2 border-black flex justify-center items-center text-5xl sm:text-7xl font-bold text-white absolute">
                {{ speed }}
            </div>
        </div>
    </div>
</template> 