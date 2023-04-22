import * as THREE from "three";
import {FontLoader} from "three/addons/loaders/FontLoader.js";

const loader = new FontLoader();
const baseGeometry = new THREE.BoxGeometry(90, 5, 60);
baseGeometry.rotateY(-Math.PI / 2);
const baseMaterial = new THREE.MeshLambertMaterial({
    color: 'rgba(12,161,224,0.97)',
});
const base = new THREE.Mesh(baseGeometry, baseMaterial);
base.position.set(0, -2.51, 10)


const enemyBaseGeo = new THREE.BoxGeometry(60, 5, 90);
const enemyBase = new THREE.Mesh(enemyBaseGeo, baseMaterial);
enemyBase.position.set(37.52, 35, 10);
enemyBase.rotation.z = -Math.PI / 2

const connectorGeo = new THREE.BoxGeometry(90, 10, 10);
const connector = new THREE.Mesh(connectorGeo, baseMaterial);
connector.rotation.y = -Math.PI / 2;
connector.position.set(35, 0, 10)

const shipBoxGeo = new THREE.BoxGeometry(27, 5, 27);
const shipBoxMaterial = new THREE.MeshLambertMaterial({
    color: '#573f0a',
    transparent: true,
    opacity: 1,
})
const shipBox = new THREE.Mesh(shipBoxGeo, shipBoxMaterial);
shipBox.position.set(0, -3, 40)

const buttonGeo = new THREE.CylinderGeometry(3, 3, 20, 3, 1);
const buttonMaterial = new THREE.MeshLambertMaterial({color: 'green'});
const button = new THREE.Mesh(buttonGeo, buttonMaterial);
button.position.set(-22.5, 1.5, 40);
button.rotation.x = -Math.PI / 2;



function addStyleObject(scene) {
    scene.add(base);
    scene.add(shipBox);
    scene.add(enemyBase);
    scene.add(connector);
    scene.add(button);
    // scene.add(start);
}


export {addStyleObject, shipBox, button}