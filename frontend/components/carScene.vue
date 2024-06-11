<template>
    <div>
        <div id="sceneContainer"></div>
    </div>
</template>

<script>
/****************************** Sadly, we cannot use any of this code as the 3D render was not functional for the RPI architecture and OS. But the static asset was made using the render though so here's the code still *******************************/

import * as THREE from 'three';
import { STLLoader } from 'three/addons/loaders/STLLoader.js';

export default {
    props: {
        speedToggle: {
            type: Number,
            default: 0,
        }
    },
    mounted() {
        let MULTIPLIER = this.speedToggle;

        this.$watch('speed', (newSpeed, oldSpeed) => {
            MULTIPLIER = newSpeed;
        });

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