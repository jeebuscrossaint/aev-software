<template>
    <div>
        <div id="sceneContainer"></div>
    </div>
</template>

<script>
import * as THREE from 'three';

// I hate that I have to write all the code in an export because its so weird but like idk how else to do it bc this treats it like a vue component even though its the page
// I could also make the whole scene a component with a prop for speed but eh I'll do that some other time... TODO ig lol
export default {
    props: {
        speed: {
            type: Number,
            default: 0,
        },
    },
    mounted() {
        let MULTIPLIER = this.speed; // THIS WILL BE THE CARS SPEED ONCE WE CAN GET THE DATA

        this.$watch('speed', (newSpeed, oldSpeed) => {
            MULTIPLIER = newSpeed;
        });

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

            return `rgb(${color.r}, ${color.g}, ${color.b})`;
        }

        // Threejs setup
        let geometry, material, mesh;
        let movingMarker;
        let scene = new THREE.Scene();
        let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 2, 0);
        camera.lookAt(new THREE.Vector3(-7, -2, 0));

        let renderer = new THREE.WebGLRenderer({ antialias: false });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor("#F9FBFD");

        // adds scene to template
        this.$el.querySelector('#sceneContainer').appendChild(renderer.domElement);

        // Road
        geometry = new THREE.BoxGeometry(100, 0.1, 2);
        material = new THREE.MeshBasicMaterial({ color: '#343434' });
        mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        // Road side
        geometry = new THREE.BoxGeometry(50, 0.12, 0.05);
        material = new THREE.MeshBasicMaterial({ color: '#f0f0f0' });
        let side1 = new THREE.Mesh(geometry, material);
        side1.position.set(0, 0, 0.9);
        scene.add(side1);
        console.log(side1.material.color)
        // Other road side
        let side2 = side1.clone();
        side2.position.set(0, 0, -0.9);
        scene.add(side2);
        // updates road side colors
        function updateSideColors() {
            if (MULTIPLIER == 0) {
                side1.material.color.set(getColorForSpeed("#F9FBFD"));
                side2.material.color.set(getColorForSpeed("#F9FBFD"));
            }
            else{
                side1.material.color.set(getColorForSpeed(MULTIPLIER));
                side2.material.color.set(getColorForSpeed(MULTIPLIER));
            }
        }

        // creates interval for infinite markers
        function createMarker() {
            geometry = new THREE.BoxGeometry(1, 0.12, 0.1);
            material = new THREE.MeshBasicMaterial({ color: 'yellow' });
            movingMarker = new THREE.Mesh(geometry, material);
            movingMarker.position.set(-35, 0, 0);
            movingMarker.userData.isMarker = true;
            scene.add(movingMarker);
            updateSideColors();
        } setInterval(createMarker, (1000 / MULTIPLIER) * 5);
        // preset markers
        for(let i = 0; i < 38; i+=3){
            geometry = new THREE.BoxGeometry(1, 0.12, 0.1);
            material = new THREE.MeshBasicMaterial({ color: 'yellow' });
            movingMarker = new THREE.Mesh(geometry, material);
            movingMarker.position.set(-i, 0, 0);
            movingMarker.userData.isMarker = true;
            scene.add(movingMarker);
        }
        // animates all markers including new ones
        function animate() {
            requestAnimationFrame(animate);

            scene.children.forEach(child => {
                if (child.userData.isMarker) {
                    child.position.x += 0.01 * MULTIPLIER;
                }
            });

            renderer.render(scene, camera);
        } animate();

        // Test speed reactivity
        // setInterval(() => {
        //     MULTIPLIER += 1;
        // }, 500);
    }
}
</script>