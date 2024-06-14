<script setup>
    const audioElements = ref([]);

    function playSound(soundNumber) {
        let audio = new Audio(`/sound${soundNumber}.mp3`);
        audio.play();
        audioElements.value.push(audio);
    }

    function stopSounds() {
        audioElements.value.forEach(audio => {
            audio.pause();
            audio.currentTime = 0;
        });
        audioElements.value = [];
    }
</script>

<template>
    <div class="grid grid-cols-3 gap-4 py-[16px] px-[13px]">
        <button class="bg-gray-200 text-black rounded shadow-md transition-transform hover:bouncy-hover" @click="playSound(1)">Engine Start</button>
        <button class="bg-gray-200 text-black rounded shadow-md transition-transform hover:bouncy-hover" @click="playSound(2)">Racecar</button>
        <button class="bg-gray-200 text-black rounded shadow-md transition-transform hover:bouncy-hover" @click="playSound(3)">Reversing</button>
        <button class="bg-gray-200 text-black rounded shadow-md transition-transform hover:bouncy-hover" @click="playSound(4)">UFO</button>
        <button class="bg-gray-200 text-black rounded shadow-md transition-transform hover:bouncy-hover" @click="playSound(5)">Walking</button>
        <button class="bg-gray-200 text-black rounded shadow-md transition-transform hover:bouncy-hover" @click="playSound(6)">Ukulele</button>
        <button class="bg-gray-200 text-black rounded shadow-md transition-transform hover:bouncy-hover" @click="playSound(7)">Horn 1</button>
        <button class="bg-gray-200 text-black rounded shadow-md transition-transform hover:bouncy-hover" @click="playSound(8)">Horn 2</button>
        <button class="bg-gray-200 text-black rounded shadow-md transition-transform hover:bouncy-hover" @click="stopSounds()">STOP NOISE</button>
    </div>
</template>

<style>
    @keyframes bounceInOut {
        0%, 100% {
            transform: scale(1);
        }
        20% {
            transform: scale(1.1);
        }
        40% {
            transform: scale(0.9);
        }
        60% {
            transform: scale(1.05);
        }
        80% {
            transform: scale(0.95);
        }
    }

    .hover\:bouncy-hover:hover {
        animation: bounceInOut 0.6s ease-in-out;
    }
</style>