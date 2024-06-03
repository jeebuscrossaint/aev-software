<script setup>
    let speed = ref(0); // CHANGE THIS TO THE SPEED OF THE CAR ONCE WE CAN GET IT

    onMounted(() => {
        setInterval(() => {
            speed.value += 1;
        }, 400);
    });
</script>

<template>
    <div>
        <carScene :speed="speed" />
        <div class="w-screen flex justify-center">
            <div class="w-[25vw] max-w-[200px] h-[15vh] top-16 backdrop-blur-sm bg-[rgba(0,0,0,0.5)] rounded-xl border-2 border-black flex justify-center items-center text-5xl sm:text-7xl font-bold text-white absolute">
                {{ speed }}
            </div>
        </div>
    </div>
</template> 