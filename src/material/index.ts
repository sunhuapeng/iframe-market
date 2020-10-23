const THREE = require("three");
// 店铺
export function memberMaterial() {
    return new THREE.MeshPhongMaterial({
        color: '#181366',
        transparent: true,
        opacity: 0.4
    });
}
// 底板
export function floorMaterial() {
    return new THREE.MeshPhongMaterial({
        color: '#3c35f3',
        transparent: false,
        opacity: 0.6
    });
}
// 空店铺
export function nomemberMaterial() {
    return new THREE.MeshPhongMaterial({
        color: '#131640',
        transparent: true,
        opacity: 0.2
    });
}
// 电梯的材质
export function elevatorMaterial() {
    return new THREE.MeshPhongMaterial({
        color: '#017580',
        transparent: true,
        opacity: 0.3
    });
}
// 点亮店铺的颜色
export function LightMemberMaterial() {
    return new THREE.MeshPhongMaterial({
        color: '#f14f54',
        transparent: true,
        opacity: 0.3
    });
}
// 店铺的线
export function DrawLine(dom, opacity, color, count?) {
    if (dom.isMesh) {
        var edges = new THREE.EdgesGeometry(dom.geometry, count ? count : 10);
        var line = new THREE.LineSegments(edges);
        line.material.color = new THREE.Color(color);
        line.material.depthTest = true;
        line.material.opacity = opacity;
        line.material.transparent = true;
        return line;
    }
}