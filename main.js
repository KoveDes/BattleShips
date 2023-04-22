import * as THREE from 'three';
import {addShips, generateFields} from './util'
import {
    checkCollision,
    checkCollisionEnemy,
    checkIfDestroyed,
    checkIfPlaceable,
    checkIfPlaceableEnemy,
    rotateDragableObjects
} from './gameUtils'
import {DragControls} from "three/addons/controls/DragControls.js";
import {addStyleObject, button, shipBox} from './styleObjects'
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
import {MTLLoader} from 'three/addons/loaders/MTLLoader.js';
import {OBJLoader} from 'three/addons/loaders/OBJLoader.js';

window.addEventListener('resize', onResize, false);

let rotateDragable = false;
let draggableObjects = [];
const objRemoved = [];
const enemyObjRemoved = [];
const shipCopies = [];


const scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement)
// scene.background = 'white';

const gameInfo = document.querySelector('.game-info');
console.log(gameInfo);
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

addStyleObject(scene);

camera.position.set(-120, 50, 10);
camera.lookAt(0,20,10)


let animateCamera = ''
let selectedObj;
let isPlaceable;
let turn;
let gameFinished = false;
const enemyFields = scene.children.filter(o => o.isEnemy);
let winner = '';

function placeEnemyShips() {

    let isOk = [];
    for (const obj in enemyShips) {
        const ship = enemyShips[obj];
        ship.position.set(50, 0, 45);
        ship.rotation.x = 0;

        const randomFieldNumber = Math.floor(Math.random() * (enemyFields.length));
        ship.position.copy(enemyFields[randomFieldNumber].position);
        ship.position.x = -ship.geometry.parameters.height / 2 - 0.05 + enemyGameboard.position.y;
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
        winner = 'computer';
        gameFinished = true;
        gameInfo.textContent = 'Komputer wygrywa grę!';
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
    animateCamera = 'drag';

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
            selectedObj.position.set(0, 2.5, z);
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
    }
    animateCamera = '';

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
        selectedObj.position.y = selectedObj.geometry.parameters.height / 2 + 0.05;
        if (!selectedObj.rotated) {
            if (selectedObj.geometry.parameters.width % 10 === 0)
                selectedObj.position.x += 2.5;
        } else {
            if (selectedObj.geometry.parameters.width % 10 === 0)
                selectedObj.position.z += 2.5
        }

    }
})

//Ship rotation
window.addEventListener('keydown', (e) => {
    switch (e.code) {
        case 'KeyR':
            rotateDragable = true;
            break;

    }
})
window.addEventListener('keyup', (e) => {
    switch (e.code) {
        case 'KeyR':
            rotateDragableObjects(rotateDragable, selectedObj);
            rotateDragable = false;
            break;
    }
})


//Selecting fields by player
const correctFields = [];
window.addEventListener('mousedown', e => {
    let pointer = new THREE.Vector3();
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
    pointer.z = 0.5;
    pointer.unproject(camera);
    let raycaster = new THREE.Raycaster(camera.position, pointer.sub(camera.position).normalize());
    let intersects = raycaster.intersectObjects(scene.children);

    if (turn === 'player') {
        if (intersects.length > 0 && intersects[0].object.clicked !== 1) {
            const selected = intersects[0].object;
            if (selected.name === 'field' && enemyFields.includes(selected)) {
                if (selected.taken) {
                    correctFields.push(selected);
                    selected.material.color = new THREE.Color('red');
                    gameInfo.textContent = 'Trafiłeś w statek!';
                } else {
                    gameInfo.textContent = 'Nie trafiłeś!';
                    selected.material.color = new THREE.Color('black');
                }
                turn = 'computer'
                selected.clicked = 1;

            }
            checkIfDestroyed(correctFields, enemyShips,);
            if (correctFields.length === 17) {
                gameInfo.textContent = "Gratulacje! Wygrałeś grę!"
                winner = 'player';
                gameFinished = true;
            }
        }
    }

    if (intersects.length > 0 && intersects[0].object === button) {
        if (draggableObjects.length) {
            console.log('Nie możesz rozpocząć gry!');
            if (trophy) {
                console.log('Załadowano')
            }
        } else {
            console.log("Gra została rozpoczęta: Twoja kolej");
            placed = true;
            turn = 'player';
            document.querySelector('.info').remove();
            gameInfo.style.opacity = 1;
        }
    }

}, false)
let placed = false;
// Rozpoczęcie gry


//Puchar
let trophy;
const mtlLoader = new MTLLoader();
mtlLoader.load('Blank.mtl', function (materials) {
    const loader = new OBJLoader();
    loader.setMaterials(materials);
    loader.load('trophy.obj', function (obj) {
        trophy = obj;
        scene.add(trophy);
    })
});

const controls = {
    showRay: false,
    trackBalls: false,
}

function cDrag() {
    // let xL = = 10;

    if (camera.position.x < -41) {
        camera.position.x += 2;
        camera.lookAt(10,-20,10)
        camera.updateProjectionMatrix();
    }

}
function cToTrophy() {
}

function deleteButton() {
    if (button.scale.y > 0)
        button.scale.y -= 0.025;
    (button.geometry.parameters);
    if (button.scale.y <= 0) {
        button.scale.z = 0;
        button.scale.x = 0;

    }
}
function moveToDefault() {
    let x = camera.position.x
    while (x > -120) {
        x -= 0.1;
        camera.position.x -= 0.01;
        camera.lookAt(0,20,10)
        camera.updateProjectionMatrix();
    }
}

function animateWinning(winner) {
    if (winner === 'player') {
        if (shipBox.position.y <= 0) {
            shipBox.position.y += 0.05;
        }
    } else {
        shipBox.rotation.z = -Math.PI / 2;
        shipBox.position.x = 32.5
        // shipBox.material.opacity = 0;
        shipBox.position.y = 40 - 2.5;
        trophy.position.y = 40 - 2.5;
        trophy.position.x = 32.5;
        trophy.rotation.y = -Math.PI / 2;
    }
    if (trophy.scale.x < 1.5) {
        trophy.scale.x += 0.02;
        trophy.scale.y += 0.02;
        trophy.scale.z += 0.02;
    }
}

let trophyLoaded = false;

function animate() {

    if (turn === 'computer') {
        computerGuess();
    }

    switch (animateCamera) {
        case "drag":
            cDrag();
            break;
        case "gameOver":
            cToTrophy();
            break;
        default: {
            moveToDefault()
        }
    }
    if (placed) {
        deleteButton()
    }

    if (gameFinished) {
        turn = '';
    }
    if (trophy && !trophyLoaded) {
        trophy.rotation.x = -Math.PI / 2;
        trophy.rotation.z = -Math.PI / 2;
        trophy.position.set(0, 1.5, 40);
        trophy.scale.set(0, 0, 0);
        trophyLoaded = true;
    }

    if (winner) {
        cToTrophy()
        animateWinning(winner);

    }

    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

animate()

function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
}


