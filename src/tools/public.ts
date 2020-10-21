const THREE = require("three");
import {
  CSS2DObject,
  CSS2DRenderer
} from "../../node_modules/three/examples/jsm/renderers/CSS2DRenderer";
export function createText(name, vector) {
  const fontSize = 14
  var text = document.createElement("div");
  text.className = "member-name";

  text.textContent = name
  let css2d: any = new CSS2DObject(text);
  css2d.position.copy(vector);
  css2d.name = name
  css2d.isType = '2'
  return css2d
}

export function pointRay(star, end, children) {
  // createLine(star, end);
  let nstar = star.clone(); // 克隆一个新的位置信息，这样不会影响传入的三维向量的值
  let nend = end.clone().sub(nstar).normalize(); // 克隆一个新的位置信息，这样不会影响传入的三维向量的值
  var raycaster = new THREE.Raycaster(nstar, nend); // 创建一个正向射线
  var intersects = raycaster.intersectObjects(
    children,
    true
  );
  // console.log(intersects[0].point.length())
  // console.log(end.length())
  let jclang = 0
  let textlang = 0
  if (intersects.length != 0) {
    jclang = star.distanceTo(intersects[0].point)
    textlang = star.distanceTo(end)
  }
  return jclang<textlang;
}