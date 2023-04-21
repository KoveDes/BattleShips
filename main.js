import * as THREE from 'three';
import {addShips, generateFields, initStats, initTrackballControls} from './util'
import {checkCollision, checkIfDestroyed, checkIfPlaceable, rotateDragableObjects, checkIfPlaceableEnemy, checkCollisionEnemy} from './gameUtils'
import {DragControls} from "three/addons/controls/DragControls.js";
import {
    ambientLight,
    directionalLight,
    enemyGameboard,
    enemyShipGroups,
    enemyShips,
    gameboard,
    shipGroups,
    ships,
    spotLight
} from "./objects"


window.addEventListener('resize', onResize, false);

let rotateDragable = false;
let draggableObjects = [];
const objRemoved = [];
const enemyObjRemoved = [];
const shipCopies = [];

const stats = initStats();

const scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement)
scene.background = 'white';


//Gameboard
scene.add(gameboard)
scene.add(enemyGameboard)
addShips(ships, gameboard, true, scene, draggableObjects);
addShips(enemyShips, enemyGameboard, false, scene, draggableObjects);
generateFields(enemyGameboard, scene);
generateFields(gameboard, scene);

scene.add(spotLight)
scene.add(directionalLight)
scene.add(ambientLight)

// camera.position.set(-90, 80, 0)
camera.position.set(-120, 80, 0);

camera.lookAt(scene.position)



let trackballControls = initTrackballControls(camera, renderer);
let clock = new THREE.Clock();

let animateCamera = ''
let selectedObj;
let isPlaceable;
let turn;
let gameFinished = false;
const enemyFields = scene.children.filter(o => o.isEnemy);


function placeEnemyShips() {

    let isOk = [];
    for (const obj in enemyShips) {
        const ship = enemyShips[obj];
        ship.position.set(50, 0, 45);
        ship.rotation.x = 0;

        const randomFieldNumber = Math.floor(Math.random() * (enemyFields.length));
        ship.position.copy(enemyFields[randomFieldNumber].position);
        ship.position.x = -ship.geometry.parameters.height / 2 - 0.01 + enemyGameboard.position.y;
        ship.rotated = Math.floor(Math.random() * 2) === 1;
        if (ship.rotated) {
            ship.rotation.x = 90 * (Math.PI / 180);
            if (ship.geometry.parameters.width % 10 === 0)
                ship.position.y += 2.5
        } else {
            if (ship.geometry.parameters.width % 10 === 0)
                ship.position.z += 2.5;
        }

        isOk.push(checkIfPlaceableEnemy(ship, enemyGameboard))
        if (!checkIfPlaceableEnemy(ship, enemyGameboard)) {
            ship.rotation.x = 0;
            ship.position.set(0, 0, 0);
        }
        const currGroup = enemyShipGroups[`${ship.name}Group`];
        let {x: objXC, y: objYC, z: objZC} = ship.position;
        let objWidth = ship.geometry.parameters.width;
        // console.log(ship.position);
        //Sprawdz czy statki nie nakładają się na siebie
        checkCollisionEnemy(ship, objWidth, objYC, objZC, (field) => {
            if (field.taken) {
                isOk.push(false);
            }
        }, scene)

        if (currGroup.children.length > 2) {
            currGroup.traverse(obj => {
                if (obj.name === 'field') {
                    enemyObjRemoved.push(obj);
                }
            })
            currGroup.clear();
        }


        let {y: objY, z: objZ} = ship.position;

        //Co zrobic gdy pole jest pod statkiem
        checkCollisionEnemy(ship, objWidth, objY, objZ, (field) => {
            field.scale.y = 1;
            field.taken = true;
            ship.scale.set(0, 0, 0);
            field.ship = ship.name;
            currGroup.add(field.clone());
            enemyObjRemoved.push(field);
        }, scene)

        const shipCopy = ship.clone();
        currGroup.add(shipCopy);


    }

    if (isOk.includes(false)) {
        for (const field of scene.children) {
            if (field.name === 'field') {
                field.ship = "";
                field.taken = false;
                field.scale.y = 1;
            }
        }
    }
    return !isOk.includes(false);

}

const computerCorrectFields = []

function computerGuess() {
    const playerFields = scene.children.filter(o => (o.name === 'field' && !o.isEnemy));
    let randomFieldNumber = Math.floor(Math.random() * (playerFields.length));
    let field = playerFields[randomFieldNumber];
    while (field.clicked === 1) {
        randomFieldNumber = Math.floor(Math.random() * (playerFields.length));
        field = playerFields[randomFieldNumber];
    }
    turn = 'player';
    if (field.taken) {
        computerCorrectFields.push(field);
        field.material.color = new THREE.Color('red');
    } else {
        field.material.color = new THREE.Color('black');
    }
    field.clicked = 1;
    checkIfDestroyed(computerCorrectFields, shipCopies)
    if (computerCorrectFields.length === 17) {
        div.textContent = 'Konieceeeeeeeeeeeeeeee';
    }
}

placeEnemyShips()
let done = false;
while (!done) {
    done = placeEnemyShips();
}
//Później usunąć - służy do testów
for (const field of enemyFields) {
    if (field.name === 'field' && field.taken) {
        field.material.color.setHex(23423)
    }
}

// Dragging objects
let dragControls = new DragControls([...draggableObjects], camera, renderer.domElement);

dragControls.addEventListener('dragstart', (e) => {
    selectedObj = e.object;
    selectedObj.rotated = false;
})


dragControls.addEventListener('dragend', () => {
    if (draggableObjects.includes(selectedObj)) {
        const currGroup = shipGroups[`${selectedObj.name}Group`];
        isPlaceable = checkIfPlaceable(selectedObj, gameboard, currGroup)
        let {x: objX, z: objZ} = selectedObj.position;
        let objWidth = selectedObj.geometry.parameters.width;

        //Sprawdz czy statki nie nakładają się na siebie
        checkCollision(selectedObj, objWidth, objZ, objX, (field) => {
            if (field.taken) {
                isPlaceable = false
            }
        }, scene)


        if (!isPlaceable) {
            selectedObj.rotation.y = 0;
            let z = 0;
            switch (selectedObj.name) {
                case "destroyer":
                    z = 30;
                    break;
                case "submarine":
                    z = 35;
                    break;
                case "cruiser":
                    z = 40;
                    break;
                case "battleship":
                    z = 45;
                    break;
                case "carrier":
                    z = 50;
                    break;
            }
            selectedObj.position.set(0, 0, z);
        }

        if (isPlaceable) {
            if (currGroup.children.length > 2) {
                currGroup.traverse(obj => {
                    if (obj.name === 'field') {
                        objRemoved.push(obj);
                    }
                })
                currGroup.clear();
            }


            let {x: objX, z: objZ} = selectedObj.position;
            let objWidth = selectedObj.geometry.parameters.width;


            //Co zrobić, gdy statek zostanie postawiony
            checkCollision(selectedObj, objWidth, objZ, objX, (field) => {
                field.taken = true;
                field.ship = selectedObj.name;
                currGroup.add(field.clone());
                objRemoved.push(field);
            }, scene);


            for (const shipGroup in shipGroups) {
                scene.add(shipGroups[shipGroup])
            }
            const shipCopy = selectedObj.clone();
            scene.remove(selectedObj);
            shipCopies.push(shipCopy);
            scene.getObjectByName(selectedObj.name + "Group").add(shipCopy);
        }

        draggableObjects = draggableObjects.filter(obj => obj !== selectedObj);
        selectedObj = null;
    }
    for (const field of scene.children) {
        if (field.name === 'field' && field.taken) {
            field.material.color.setHex(23423)
        }
    }
    // console.log(draggableObjects)
    if (!draggableObjects.length) {
        dragControls.deactivate();
        // computerGuess()
    }
})


const div = document.querySelector('.p');


const raycaster = new THREE.Raycaster();

//Przcyiąganie do planszy
window.addEventListener('pointermove', (e) => {
    const pointer = new THREE.Vector2();
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObjects([gameboard], false);

    if (intersects.length > 0 && selectedObj) {
        isPlaceable = true;
        const intersect = intersects[0];

        selectedObj.position.copy(intersect.point).add(intersect.face.normal);
        selectedObj.position.divideScalar(5).floor().multiplyScalar(5).addScalar(2.5);
        selectedObj.position.y = selectedObj.geometry.parameters.height / 2 + 0.01;
        if (!selectedObj.rotated) {
            if (selectedObj.geometry.parameters.width % 10 === 0)
                selectedObj.position.x += 2.5;
        } else {
            if (selectedObj.geometry.parameters.width % 10 === 0)
                selectedObj.position.z += 2.5
        }


        //selectedObj zamiast boxHelper
    }
})

//Ship rotation
window.addEventListener('keydown', (e) => {
    switch (e.code) {
        case 'KeyR':
            rotateDragable = true;

    }
})
window.addEventListener('keyup', (e) => {
    switch (e.code) {
        case 'KeyR':
            rotateDragableObjects(rotateDragable, selectedObj)
            rotateDragable = false;
            animateCamera = 'drag'

            break;
    }
})


//Selecting fields by player
const correctFields = [];
window.addEventListener('mousedown', e => {
    if (turn === 'player') {
        let pointer = new THREE.Vector3();
        pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
        pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
        pointer.z = 0.5;
        pointer.unproject(camera);
        let raycaster = new THREE.Raycaster(camera.position, pointer.sub(camera.position).normalize());
        let intersects = raycaster.intersectObjects(scene.children);
        if (intersects.length > 0 && intersects[0].object.clicked !== 1) {
            const selected = intersects[0].object;
            if (selected.name === 'field' && enemyFields.includes(selected)) {
                if (selected.taken) {
                    correctFields.push(selected);
                    selected.material.color = new THREE.Color('red');
                } else {
                    selected.material.color = new THREE.Color('black');
                }
                turn = 'computer'
                selected.clicked = 1;

            }
            checkIfDestroyed(correctFields, enemyShips);
            if (correctFields.length === 17) {
                div.textContent = "Gra zakończona"
                gameFinished = true;
            }
        }
    } else {
        console.log('Nie twoja kolej');
    }

}, false)

// Rozpoczęcie gry
document.querySelector('.start').addEventListener('click', e => {
    e.preventDefault();
    animateCamera = 'drag'

    if (draggableObjects.length) {
        console.log('Nie możesz rozpocząć gry!');
    } else {
        console.log("Gra została rozpoczęta: Twoja kolej");
        document.querySelector('.start').remove();
        turn = 'player';
    }
})

//

//ray
let tube;
window.addEventListener('mousemove', (e) => {
    if (controls.showRay) {
        let pointer = new THREE.Vector3();
        pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
        pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
        pointer.z = 0.5
        pointer.unproject(camera)
        let raycaster = new THREE.Raycaster(camera.position, pointer.sub(camera.position).normalize());
        let intersects = raycaster.intersectObjects(scene.children);

        if (intersects.length > 0) {
            const points = [];
            points.push(new THREE.Vector3(-90, 70, 30));
            points.push(intersects[0].point);
            var mat = new THREE.MeshBasicMaterial({color: '#da3', transparent: true, opacity: 0.6});
            var tubeGeometry = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 140, 0.09);

            if (tube) {
                scene.remove(tube);
            }
            if (controls.showRay) {
                tube = new THREE.Mesh(tubeGeometry, mat);
                scene.add(tube);
            }
        }
    }

}, false)

const controls = {
    showRay: false,
    trackBalls: false,
}

//GUI
const gui = new dat.GUI();
gui.add(controls, 'showRay').onChange(function (e) {
    if (tube) scene.remove(tube)
})
gui.add(controls, 'trackBalls')


function cc() {
    let x = camera.position.x
    console.log(x)
    while (x < -70) {
        x += 0.1;
        camera.position.x += 0.01;
        camera.updateProjectionMatrix();
    }
}

function animate() {
    stats.update()

    if (turn === 'computer') {
        computerGuess();
        cc()
    }
    if(animateCamera === 'drag') {
        cc();
    }

    if (gameFinished) {
        turn = '';
    }

    if (controls.trackBalls)
        trackballControls.update(clock.getDelta());
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

animate()

function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
}


