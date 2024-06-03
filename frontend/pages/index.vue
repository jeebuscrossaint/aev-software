<script setup>

    const movingMarker = ref();
    const { onLoop } = useRenderLoop()
    onLoop(({ delta, elapsed, clock, dt }) => {
    // I will run at every frame ~ 60FPS (depending of your monitor)
        if(movingMarker.value) {
            movingMarker.value.position.x += 0.01*5 // 1 HERE IS THE SPEED MULTIPLIER
        }
    })
    
</script>

<template>
    <!--
    <TresCanvas window-size clear-color="#F9FBFD">
        <TresMesh :position="[0, 0, 0]">
            <TresBoxGeometry :args="[5,0.1,2]" />
            <TresMeshBasicMaterial color="#343434" />
        </TresMesh>
    </TresCanvas>
    -->
    <TresCanvas ref="sceneTest" window-size clear-color="#F9FBFD">
        <TresPerspectiveCamera :look-at="[-5, -2, 0]" :position="[0, 2, 0]" />

        <TresMesh ref="movingMarker" :position="[-25, 0, 0]">
            <TresBoxGeometry :args="[1, 0.12, 0.1]" />
            <TresMeshBasicMaterial color="yellow" />
        </TresMesh>
        

        <TresMesh :position="[0, 0, 0.9]">
            <TresBoxGeometry :args="[50, 0.12, 0.05]" />
            <TresMeshBasicMaterial color="#f0f0f0" />
        </TresMesh>
        <TresMesh :position="[0, 0, -0.9]">
            <TresBoxGeometry :args="[50, 0.12, 0.05]" />
            <TresMeshBasicMaterial color="#f0f0f0" />
        </TresMesh>
        <TresMesh>
            <TresBoxGeometry :args="[100,0.1,2]" />
            <TresMeshBasicMaterial color="#343434" />
        </TresMesh>
    </TresCanvas>
    <div class="w-screen flex justify-center">
        <div class="w-[35vw] max-w-[300px] h-[15vh] top-16 backdrop-blur-sm bg-[rgba(0,0,0,0.5)] rounded-xl border-2 border-black flex justify-center items-center text-4xl sm:text-6xl font-bold text-white absolute">
            55MPH
        </div>
    </div>
    
</template>