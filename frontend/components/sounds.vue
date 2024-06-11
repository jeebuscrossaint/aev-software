<script setup>
    function playSound(soundNumber) {
      let audio = new Audio(`/sound${soundNumber}.mp3`);
      audio.play();
    }
</script>

<template>
    <div class="grid grid-cols-3 gap-4 py-[16px] px-[13px]">
        <button class="bg-gray-200 text-black p-6 rounded shadow-md transition-transform hover:bouncy-hover" @click="playSound(1)">Sound 1</button>
        <button class="bg-gray-200 text-black p-6 rounded shadow-md transition-transform hover:bouncy-hover" @click="playSound(2)">Sound 2</button>
        <button class="bg-gray-200 text-black p-6 rounded shadow-md transition-transform hover:bouncy-hover" @click="playSound(3)">Sound 3</button>
        <button class="bg-gray-200 text-black p-6 rounded shadow-md transition-transform hover:bouncy-hover" @click="playSound(4)">Sound 4</button>
        <button class="bg-gray-200 text-black p-6 rounded shadow-md transition-transform hover:bouncy-hover" @click="playSound(5)">Sound 5</button>
        <button class="bg-gray-200 text-black p-6 rounded shadow-md transition-transform hover:bouncy-hover" @click="playSound(6)">Sound 6</button>
        <button class="bg-gray-200 text-black p-6 rounded shadow-md transition-transform hover:bouncy-hover" @click="playSound(7)">Sound 7</button>
        <button class="bg-gray-200 text-black p-6 rounded shadow-md transition-transform hover:bouncy-hover" @click="playSound(8)">Sound 8</button>
        <button class="bg-gray-200 text-black p-6 rounded shadow-md transition-transform hover:bouncy-hover" @click="playSound(9)">Sound 9</button>
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