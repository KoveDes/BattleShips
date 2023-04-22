import {TrackballControls} from "three/addons/controls/TrackballControls";
import * as THREE from "three";

function initStats(type) {

    var panelType = (typeof type !== 'undefined' && type) && (!isNaN(type)) ? parseInt(type) : 0;
    var stats = new Stats();

    stats.showPanel(panelType); // 0: fps, 1: ms, 2: mb, 3+: custom
    document.body.appendChild(stats.dom);

    return stats;
}

function initTrackballControls(camera, renderer) {
    let trackballControls = new TrackballControls(camera, renderer.domElement);
    trackballControls.rotateSpeed = 1.0;
    trackballControls.zoomSpeed = 1.2;
    trackballControls.panSpeed = 0.8;
    trackballControls.noZoom = false;
    trackballControls.noPan = false;
    trackballControls.staticMoving = true;
    trackballControls.dynamicDampingFactor = 0.3;
    trackballControls.keys = [65, 83, 68];

    return trackballControls;
}

function generateFields(board, scene) {
    const size = board.geometry.parameters.width / 10 - 0.5;
    const cubeGeo = new THREE.BoxGeometry(size, 0.01, size);
    if(board.name === 'enemy') {
        cubeGeo.rotateZ(-Math.PI/2);
    }
    for (let i = 0; i < 10; i++) {
        for (let j = 0; j < 10; j++) {
            const cubeMaterial = new THREE.MeshLambertMaterial({color: '#f8f500', transparent: true, opacity: 0.75});
            const box = new THREE.Mesh(cubeGeo, cubeMaterial);
            box.receiveShadow = true;
            box.name = 'field'
            if (board.name === 'enemy') {
                box.isEnemy = true;
                box.position.x = -0.05 + board.position.x;
                box.position.y = -((board.geometry.parameters.height) / 2) + 0.25 + size / 2 + (size + 0.5) * i + board.position.y
                box.position.z = -((board.geometry.parameters.height) / 2) + 0.25 + size / 2 + (size + 0.5) * j + board.position.z
            } else {
                box.position.y = 0.05 + board.position.y;
                box.position.x = -((board.geometry.parameters.height) / 2) + 0.25 + size / 2 + (size + 0.5) * i + board.position.x
                box.position.z = -((board.geometry.parameters.height) / 2) + 0.25 + size / 2 + (size + 0.5) * j + board.position.z
            }
            scene.add(box);
            if(board.name === 'enemy') {
            }
        }
    }
}


function addShips(ships, board, draggable, scene, draggableObjects) {
    let z = 30;
    for (const ship in ships) {
        ships[ship].position.set(board.position.x, 2.5, z);
        z += 5;
        if (draggable) draggableObjects.push(ships[ship])
        scene.add(ships[ship]);
    }
}


export {initStats, initTrackballControls, addShips, generateFields}