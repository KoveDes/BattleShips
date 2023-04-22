import * as THREE from "three";

class Ship3D {
    constructor(name, width, color) {
        this.name = name;
        this.width = width;
        this.color = color;
        // this.createShip();
    }

    createShip(enemy) {
        const geometry = new THREE.BoxGeometry(this.width, 2.5, 5);
        if(enemy) {
            geometry.rotateY(-Math.PI / 2);
            geometry.rotateZ(-Math.PI / 2)
        }
        const material = new THREE.MeshLambertMaterial({
            color: this.color, transparent: true,
        });
        const ship = new THREE.Mesh(geometry, material);
        ship.castShadow = true;
        ship.receiveShadow = true;
        ship.name = this.name;
        return ship;
    }
}

const destroyer = new Ship3D('destroyer', 10, 'brown').createShip();
const submarine = new Ship3D('submarine', 15, 'green').createShip();
const cruiser = new Ship3D('cruiser', 15, 'purple').createShip();
const battleship = new Ship3D('battleship', 20, 'orange').createShip();
const carrier = new Ship3D('carrier', 25, 'blue').createShip();

const enemyDestroyer = new Ship3D('enemyDestroyer', 10, 'brown').createShip(true);
const enemySubmarine = new Ship3D('enemySubmarine', 15, 'green').createShip(true);
const enemyCruiser = new Ship3D('enemyCruiser', 15, 'purple').createShip(true);
const enemyBattleship = new Ship3D('enemyBattleship', 20, 'orange').createShip(true);
const enemyCarrier = new Ship3D('enemyCarrier', 25, 'blue').createShip(true);

const ships = {
    destroyer,
    submarine,
    cruiser,
    battleship,
    carrier,
}
const enemyShips = {
    enemyDestroyer,
    enemySubmarine,
    enemyCruiser,
    enemyBattleship,
    enemyCarrier,
}




//Lights
const spotLight = new THREE.SpotLight('#030303');
spotLight.position.set(-50, 50, 90);
spotLight.shadow.mapSize = new THREE.Vector2(1024 * 2, 1024 * 2);
spotLight.castShadow = true;

const directionalLight = new THREE.SpotLight('#ffffff');
directionalLight.position.set(-60, 120, -10);
directionalLight.shadow.mapSize = new THREE.Vector2(1024 * 4, 1024 * 4);

const ambientLight = new THREE.AmbientLight('#2a2a2a');
ambientLight.castShadow = true;


//GameBoard
const gameboardGeometry = new THREE.PlaneGeometry(50, 50);
gameboardGeometry.rotateX(-Math.PI / 2)

const gameboardMaterial = new THREE.MeshLambertMaterial({
    color: '#ffffff'
});
const gameboard = new THREE.Mesh(gameboardGeometry, gameboardMaterial);
gameboard.receiveShadow = true;
gameboard.name = 'player'
gameboard.position.set(0, 0, 0);

const enemyGbGeo = new THREE.PlaneGeometry(50,50);
enemyGbGeo.rotateY(-Math.PI / 2);
const enemyGameboard = new THREE.Mesh(enemyGbGeo, gameboardMaterial);
// const enemyGameboard = new THREE.Mesh(gameboardGeometry, gameboardMaterial);
enemyGameboard.receiveShadow = true;
enemyGameboard.name = 'enemy';
enemyGameboard.position.set(35,35,0);

const shipGroups = {
    destroyerGroup: new THREE.Group(),
    submarineGroup: new THREE.Group(),
    cruiserGroup: new THREE.Group(),
    battleshipGroup: new THREE.Group(),
    carrierGroup: new THREE.Group(),
}
shipGroups.destroyerGroup.name = 'destroyerGroup';
shipGroups.submarineGroup.name = 'submarineGroup';
shipGroups.cruiserGroup.name = 'cruiserGroup';
shipGroups.battleshipGroup.name = 'battleshipGroup';
shipGroups.carrierGroup.name = 'carrierGroup';


const enemyShipGroups = {
    enemyDestroyerGroup: new THREE.Group(),
    enemySubmarineGroup: new THREE.Group(),
    enemyCruiserGroup: new THREE.Group(),
    enemyBattleshipGroup: new THREE.Group(),
    enemyCarrierGroup: new THREE.Group(),
}
enemyShipGroups.enemyDestroyerGroup.name = 'enemyDestroyerGroup';
enemyShipGroups.enemySubmarineGroup.name = 'enemySubmarineGroup';
enemyShipGroups.enemyCruiserGroup.name = 'enemyCruiserGroup';
enemyShipGroups.enemyBattleshipGroup.name = 'enemyBattleshipGroup';
enemyShipGroups.enemyCarrierGroup.name = 'enemyCarrierGroup';

export {ships, gameboard, spotLight, directionalLight, ambientLight, enemyGameboard, enemyShips, shipGroups, enemyShipGroups};