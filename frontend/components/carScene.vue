<template>
    <div>
        <div id="sceneContainer"></div>
    </div>
</template>

<script>
import * as THREE from 'three';
import { STLLoader } from 'three/addons/loaders/STLLoader.js';

export default {
    props: {
        speedToggle: {
            type: Number,
            default: 0,
        },
        speedColor: {
            type: Number,
            default: 0,
        },
    },
    mounted() {
        let MULTIPLIER = this.speedToggle; // THIS WILL BE THE CARS SPEED ONCE WE CAN GET THE DATA

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
        camera.position.set(1.5, 2, 0);
        camera.lookAt(new THREE.Vector3(-7, 0, 0));

        let renderer = new THREE.WebGLRenderer({ antialias: false });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor("#F9FBFD");

        // adds scene to template
        this.$el.querySelector('#sceneContainer').appendChild(renderer.domElement);

        // car (STL in threejs woohoo definitely not cursed)
        const loader = new STLLoader();
        loader.load( 'car.stl', function ( geometry ) {

            const material = new THREE.MeshPhongMaterial( { color: '#ACACAC', specular: 0x494949, shininess: 400 } );
            const mesh = new THREE.Mesh( geometry, material );

            mesh.position.set( -2.65, 0.83, 0.51 );
            mesh.rotation.set( -Math.PI/2, 0, 0 );
            mesh.scale.set( 0.00065, 0.00065, 0.00065 );
            // this doesn't rlly even matter
            mesh.castShadow = true;
            // this does tho
            mesh.receiveShadow = true;

            scene.add( mesh );

        } );
        // gradient light for car model
        scene.add( new THREE.HemisphereLight( '#CBCBCB', '#000000', 9 ) );

        // Road
        geometry = new THREE.BoxGeometry(300, 0.1, 3.2);
        material = new THREE.MeshBasicMaterial({ color: '#343434' });
        mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        // Road side
        geometry = new THREE.BoxGeometry(200, 0.12, 0.05);
        material = new THREE.MeshBasicMaterial({ color: '#f0f0f0' });
        let side1 = new THREE.Mesh(geometry, material);
        side1.position.set(0, 0, 1.35);
        scene.add(side1);
        console.log(side1.material.color)
        // Other road side
        let side2 = side1.clone();
        side2.position.set(0, 0, -1.35);
        scene.add(side2);
        // updates road side colors
        function updateSideColors() {
            if (this.speedColor == 0) {
                side1.material.color.set(getColorForSpeed("#F9FBFD"));
                side2.material.color.set(getColorForSpeed("#F9FBFD"));
            }
            else{
                side1.material.color.set(getColorForSpeed(this.speedColor));
                side2.material.color.set(getColorForSpeed(this.speedColor));
            }
        }

        // creates interval for infinite markers
        function createMarker() {
            geometry = new THREE.BoxGeometry(1, 0.12, 0.1);
            material = new THREE.MeshBasicMaterial({ color: 'red' });
            movingMarker = new THREE.Mesh(geometry, material);
            movingMarker.position.set(-60, 0, 1.5);
            movingMarker.userData.isMarker = true;
            scene.add(movingMarker);

            let movingMarker2 = movingMarker.clone();
            movingMarker2.position.set(-60, 0, -1.5);
            scene.add(movingMarker2);

            geometry = new THREE.BoxGeometry(1, 0.12, 0.1);
            material = new THREE.MeshBasicMaterial({ color: 'white' });
            let movingMarkerWhite = new THREE.Mesh(geometry, material);
            movingMarkerWhite.position.set(-60+1, 0, 1.5);
            movingMarkerWhite.userData.isMarker = true;
            scene.add(movingMarkerWhite);

            let movingMarkerWhite2 = movingMarkerWhite.clone();
            movingMarkerWhite2.position.set(-60+1, 0, -1.5);
            scene.add(movingMarkerWhite2); 
            updateSideColors();
        } setInterval(createMarker, (3500 / (MULTIPLIER+1))); 
        // preset markers
        for(let i = 0; i < 62; i+=2){
            geometry = new THREE.BoxGeometry(1, 0.12, 0.1);
            material = new THREE.MeshBasicMaterial({ color: 'red' });
            movingMarker = new THREE.Mesh(geometry, material);
            movingMarker.position.set(-i, 0, 1.5);
            movingMarker.userData.isMarker = true;
            scene.add(movingMarker);

            let movingMarker2 = movingMarker.clone();
            movingMarker2.position.set(-i, 0, -1.5);
            scene.add(movingMarker2);

            geometry = new THREE.BoxGeometry(1, 0.12, 0.1);
            material = new THREE.MeshBasicMaterial({ color: 'white' });
            let movingMarkerWhite = new THREE.Mesh(geometry, material);
            movingMarkerWhite.position.set(-i+1, 0, 1.5);
            movingMarkerWhite.userData.isMarker = true;
            scene.add(movingMarkerWhite);

            let movingMarkerWhite2 = movingMarkerWhite.clone();
            movingMarkerWhite2.position.set(-i+1, 0, -1.5);
            scene.add(movingMarkerWhite2);
            
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