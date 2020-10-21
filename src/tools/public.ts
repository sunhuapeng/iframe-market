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
  let leng1 = 0
  let leng2 = 0
  if (intersects[0]) {
    // 从相机到交叉点的距离
    leng1 = intersects[0].point.length()
    // 从相机到文字的距离
    leng2 = end.length()
    // console.log(intersects[0].point, end)
    console.log(leng1 < leng2)
    // console.log(star.length(intersects[0].point))
    // console.log(intersects[0].point)
    // console.log(intersects[0].point.length() > end.length())
  }
  return !(leng1 < leng2);
}