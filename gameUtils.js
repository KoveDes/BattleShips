function rotateDragableObjects(rotateDragable, selectedObj) {
    if (rotateDragable && selectedObj) {
        selectedObj.rotation.y = selectedObj.rotation.y === 0 ? 90 * (Math.PI / 180) : 0;
        selectedObj.rotated = !selectedObj.rotated;

    }
}

function adjustPosition(objWidth, objAxe) {
    if (objWidth % 10 === 0) {
        objAxe -= 2.5;
        objAxe += objWidth / 2
    } else {
        objAxe += objWidth == 25 ? 10 : 5
    }
    return objAxe;
}

function checkIfPlaceable(obj, board, group) {
    let placeable = true;
    if (obj.position.y !== 1.26) {
        placeable = false;
    }
    if (!obj.rotated) {
        if ((obj.position.x + obj.geometry.parameters.width / 2) > board.position.x + board.geometry.parameters.width / 2 ||
            (obj.position.x - obj.geometry.parameters.width / 2) < board.position.x - board.geometry.parameters.width / 2) {
            placeable = false;
        }
    } else {
        if ((obj.position.z + obj.geometry.parameters.width / 2) > board.geometry.parameters.width / 2 ||
            (obj.position.z - obj.geometry.parameters.width / 2) < -board.geometry.parameters.width / 2) {
            placeable = false;
        }
    }
    return placeable
}

function checkCollision(ship, objWidth, objZC, objXC, insert, scene) {
    if (ship.rotated) {
        objZC = adjustPosition(objWidth, objZC);
        for (let j = 0; j < objWidth; j += 5) {
            for (const field of scene.children) {
                if (field.name === 'field' && field.position.x === objXC) {
                    if (field.position.z === objZC - j) {
                        insert(field)
                    }

                }
            }
        }
    } else {
        objXC = adjustPosition(objWidth, objXC);
        for (let j = 0; j < objWidth; j += 5) {
            for (const field of scene.children) {
                if (field.name === 'field' && field.position.z === objZC) {
                    if (field.position.x === objXC - j) {
                        insert(field)
                    }
                }
            }
        }
    }
}

function checkIfDestroyed(fields, enemyShips) {
    for (const enemyShip in enemyShips) {
        const ship = enemyShips[enemyShip];
        const size = ship.geometry.parameters.width / 5
        if (size === fields.filter(field => field.ship === ship.name).length) {
            console.log('Zatopiony: '+ ship.name);
            ship.scale.set(1, 5, 1);

        }
    }
}

export {rotateDragableObjects, adjustPosition, checkIfPlaceable, checkCollision, checkIfDestroyed}