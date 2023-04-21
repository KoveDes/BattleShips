import * as THREE from "three";

const baseGeometry = new THREE.BoxGeometry(90, 5, 80);
baseGeometry.rotateY(-Math.PI / 2);
const baseMaterial = new THREE.MeshLambertMaterial({
    color: 'yellow',
});
const base = new THREE.Mesh(baseGeometry, baseMaterial);
base.position.set(-10,-2.51,10)


const enemyBaseGeo = new THREE.BoxGeometry(60,5,90);
const enemyBase = new THREE.Mesh(enemyBaseGeo, baseMaterial);
enemyBase.position.set(37.52,35,10);
enemyBase.rotation.z = -Math.PI / 2

const connectorGeo = new THREE.BoxGeometry(90,10,10);
const connector =  new THREE.Mesh(connectorGeo, baseMaterial);
connector.rotation.y = -Math.PI/2;
connector.position.set(35,0,10)

const shipBoxGeo = new THREE.BoxGeometry(27,12,27);
const shipBoxMaterial = new THREE.MeshLambertMaterial({
    color: 'blue', wireframe: true
})
const shipBox = new THREE.Mesh(shipBoxGeo, shipBoxMaterial);
shipBox.position.set(0,-2.51,40)


function addStyleObject(scene) {
    scene.add(base);
    scene.add(shipBox);
    scene.add(enemyBase);
    scene.add(connector);
}
export {addStyleObject}