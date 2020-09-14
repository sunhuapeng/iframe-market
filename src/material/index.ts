const THREE = require("three");
export function memberMaterial() {
    return new THREE.MeshLambertMaterial({
        color: 0x00ff00,
    });
}