const THREE = require("three");
export function memberMaterial() {
    return new THREE.MeshPhongMaterial({
        color: '#67accb',
    });
}
export function floorMaterial() {
    return new THREE.MeshPhongMaterial({
        color: '#f2edbc',
    });
}