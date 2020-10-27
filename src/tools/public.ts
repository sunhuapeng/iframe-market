const THREE = require("three");
var a = require("../js/astar.js");
// var {Graph, astar} = {...a}
var Graph = a.Graph
var astar = a.astar
import { SSL_OP_NETSCAPE_CHALLENGE_BUG } from "constants";
import {
  CSS2DObject,
  CSS2DRenderer
} from "../../node_modules/three/examples/jsm/renderers/CSS2DRenderer";
export function createText(name, vector) {
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
  return jclang < textlang;
}

export function getTrailPoint(group, _this) {
  var rayArr = []
  var graph = []
  var trailPoint = []
  
  group.userData.trailPoint = trailPoint
  for (let i = 0; i < group.children.length; i++) {
    let mesh = group.children[i]
    if (mesh.isMesh && mesh.name !== 'floor') {
      rayArr.push(mesh)
    }
  }
  let size = new THREE.Vector3()
  _this.$getBox.getbox(group).getSize(size)
  group.size = size
  let worldVector3 = new THREE.Vector3()
  group.getWorldPosition(worldVector3)
  let y = worldVector3.y
  console.log(size)
  var maxx = Math.floor(size.x), maxz = Math.floor(size.z)
  const offset = 7
  let hrefX = Math.floor(maxx / 2)
  let hrefZ = Math.floor(maxz / 2)
  for (let i = -hrefX; i < hrefX; i++) {
    var astar = []
    if (i % offset === 0) {
      for (let j = -hrefZ; j < hrefZ; j++) {
        if (j % offset === 0) {
          let v3 = new THREE.Vector3(i, y + size.y, j)
          // console.log(v3)
          let flag = pointTrailRay(v3, rayArr)
          if (flag) {
            // initCube(_this, v3)
            trailPoint.push(v3)
            astar.push(1)
          } else {
            astar.push(0)
          }
        }
      }
      graph.push(astar)
    }
  }
  group.userData.astar = graph

}
// 计算路径 astar算法
export function astarCreate(star, end, graph) {
  var maps = new Graph(graph);
  const s = star.clone()
  const e = end.clone()
  const sx = (s.x)
  const sy = (s.z)
  const ex = (e.x)
  const ey = (e.z)
  var starPosition = maps.grid[sx][sy];
  var endPosition = maps.grid[ex][ey];
  var result = astar.search(maps, starPosition, endPosition);
  return result
}
export function createMyPosition(_this) {
  let mySelf = null
  for(let i=0; i<_this.floorGroup.children.length; i++) {
    let floor = _this.floorGroup.children[i]
    if(floor.name === 'F2'){
      let index = getRandomInt(0, floor.userData.trailPoint.length)
      let v3 = floor.userData.trailPoint[index]
      console.log('v3', v3)
        let sprite = create2dImg(v3)
        sprite.name = 'mySelf'
        sprite.mySelfFloorId = floor.floorId
        mySelf = sprite
        _this.scene.add(sprite)
    }
  }
  return mySelf
}
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function create2dImg(v3) {
  var spriteMaterial = new THREE.SpriteMaterial({
    map: new THREE.TextureLoader().load(`./static/image/header.png`), //设置精灵纹理贴图 类型
    transparent: true,
    opacity: 1,
  });
  var sprite = new THREE.Sprite(spriteMaterial);
  sprite.scale.set(12, 12, 1)
  sprite.position.copy(v3)
  return sprite
}

export function initCube(_this, p) {
  var geometry = new THREE.BoxBufferGeometry(1, 1, 1);
  var material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  var cube = new THREE.Mesh(geometry, material);
  cube.position.copy(p)
  _this.scene.add(cube);
}
function pointTrailRay(star, rayMeshArr) {
  const s = star.clone();
  const e = star.clone().setY(star.y - 2000);
  var raycaster = new THREE.Raycaster(s, e.clone().normalize());
  var intersects = raycaster.intersectObjects(rayMeshArr);
  let flag = intersects.length !== 0;
  return !flag
}