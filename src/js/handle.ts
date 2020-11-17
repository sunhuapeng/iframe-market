const THREE = require("three");
import { astarCreate, initCube } from '../tools/public'
import { memberMaterial, LightMemberMaterial } from '../material/index'
import { Vector2, Vector3 } from '../../node_modules/three/src/Three';
import { threadId } from 'worker_threads';


import { Line2 } from "../../node_modules/three/examples/jsm/lines/Line2.js";

// import { Line2 } from "./jsm/lines/Line2.js";
import { LineMaterial } from "../../node_modules/three/examples/jsm/lines/LineMaterial.js";
import { LineGeometry } from "../../node_modules/three/examples/jsm/lines/LineGeometry.js";
import { GeometryUtils } from "../../node_modules/three/examples/jsm/utils/GeometryUtils.js";

var handleClick = function (event, _this) {
  _this.mouse.x = (event.clientX / document.body.offsetWidth) * 2 - 1;
  _this.mouse.y = -(event.clientY / document.body.offsetHeight) * 2 + 1;

  if (event.touches) {
    _this.mouse.x = (event.touches[0].pageX / window.innerWidth) * 2 - 1;
    _this.mouse.y = -(event.touches[0].pageY / window.innerHeight) * 2 + 1;
  } else {
    _this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    _this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  }
  var raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(_this.mouse, _this.camera);
  var raylist = raycaster.intersectObjects(_this.floorGroup.children, true);
  if (raylist[0]) {
    let obj = raylist[0].object
    let mySelfPosition = new THREE.Vector3()
    _this.mySelf.getWorldPosition(mySelfPosition)
    console.log('mySelfPosition', mySelfPosition)
    // 可行走矩阵
    if (obj.memberId) {
      const memberFloorId = obj.parent.floorId
      const mySelfFloorId = _this.mySelf.mySelfFloorId
      // 相同楼层
      let trail = []
      if (mySelfFloorId === memberFloorId) {
        trail = gettrail(mySelfPosition, obj)
        if (trail.length === 0) {
          // 需要记录进店前的终点，作为下一次出发的起点，
          // 代码需要重新整理
          alert('你无路可逃')
          return
        }
        let memberCp = v2tov3(obj.cp, obj.parent.getWorldPosition().y)
        let endToPcTrail = getEndToPc(trail[trail.length - 1], memberCp)
        let allTrail = trail.concat(endToPcTrail)
        console.log(allTrail)
        Drawline(_this, allTrail)
        // var geometry = new THREE.BufferGeometry().setFromPoints(allTrail);
        // var material = new THREE.LineBasicMaterial({
        //   color: '#f14f54'
        // });
        // var line = new THREE.Line(geometry, material);
        // _this.scene.add(line)
        headerMove(allTrail, _this.mySelf)

      } else {
        // 找到最近的电梯
        // 获取头像所在楼层
        const headerFloor = _this.scene.getObjectByProperty('floorId', _this.mySelf.mySelfFloorId)
        let minEle = null
        let minLen = 9999
        let eleCp = new Vector3()
        let eleVector3 = new Vector3()
        let floorPosition = new THREE.Vector3() as any
        headerFloor.children.forEach((mesh, index) => {
          // 找到所有电梯
          if (mesh.elevatorId) {
            // 获取电梯中心点
            eleCp = v2tov3(mesh.cp, mesh.getWorldPosition(new Vector3()).y)
            let len = eleCp.distanceTo(mySelfPosition)
            if (minLen > len) {
              minLen = len
              minEle = mesh
              mesh.getWorldPosition(floorPosition)
              eleVector3 = eleCp
            }
          }
        })
        if (minEle) {
          // 第一阶段轨迹
          let trailFirst = gettrail(mySelfPosition, minEle)
          console.log('第一段')
          // 获取第二段轨迹（上电梯）
          let firstEleFloor = eleVector3

          let endEleFloor = new THREE.Vector3()
          // 获取重点楼层的Y
          obj.parent.getWorldPosition(endEleFloor)
          _this.mySelf.mySelfFloorId = obj.parent.floorId
          // 获取到第二段结束的点
          let endPoint = firstEleFloor.clone().setY(endEleFloor.y)

          let trailSecond = getEndToPc(firstEleFloor, endPoint)



          let points = obj.parent.userData.trailPoint
          // 寻找距离电梯上来后的最近可以行走的点
          let minPoint = null
          let minLen = 99999
          for (let i = 0; i < points.length; i++) {
            let p = points[i]
            let len = endPoint.distanceTo(p)
            if (len < minLen) {
              minLen = len
              minPoint = p
            }
          }
          // 获取电梯到店铺最近点的
          let trailThird = gettrail(minPoint, obj)
          // let lastTrail 
          // 获取店铺最近点到店铺中心的路径
          let lastTrail = getEndToPc(trailThird[trailThird.length - 1], v2tov3(obj.cp, obj.getWorldPosition(new THREE.Vector3()).y))

          if (trailFirst.length === 0 || trailSecond === 0 || trailThird.length === 0 || lastTrail.length === 0) {
            alert('你无路可逃')
            return
          }

          let allTrail = trailFirst.concat(trailSecond).concat(trailThird).concat(lastTrail)
          headerMove(allTrail, _this.mySelf)
          Drawline(_this, allTrail)
          // var geometry = new THREE.BufferGeometry().setFromPoints(allTrail);
          // var material = new THREE.LineBasicMaterial({
          //   color: '#f14f54'
          // });
          // var line = new THREE.Line(geometry, material);
          // _this.scene.add(line)
        }
      }

    } else {
      let cp = new THREE.Vector3
      _this.$getBox.getbox(obj).getCenter(cp)
      let x = Math.floor(cp.x)
      let y = Math.floor(cp.z)
    }
  }
}
function Drawline(_this, points) {

  var Linematerial = new THREE.LineDashedMaterial();

  var Linegeometry = new THREE.BufferGeometry(); //声明一个缓冲几何体对象

  //类型数组创建顶点位置position数据
  var vertices = new Float32Array([
    0, 0, 0, //顶点1坐标
  ]);
  // 创建属性缓冲区对象
  var attribue = new THREE.BufferAttribute(vertices, 3); //3个为一组，作为一个顶点的xyz坐标
  // 需要传position信息 
  Linegeometry.position = attribue;

  var line1 = new THREE.Line(Linegeometry, Linematerial);

  var geometry = new LineGeometry();
  geometry.fromLine(line1)
  var matLine = new LineMaterial({
    color: 0xf14f54,
    linewidth: 0.003,
    dashed: false
  });

  var line = new Line2(geometry, matLine);
  _this.scene.add(line);

  // var points = GeometryUtils.hilbert3D(new THREE.Vector3(0, 0, 0), 5.0, 1, 0, 1, 2, 3, 4, 5, 6, 7);
  var spline = new THREE.CatmullRomCurve3(points);
  var divisions = Math.round(8 * points.length);
  var point = new THREE.Vector3();
  var color = new THREE.Color();


  let i = 0, l = divisions
  let newpoints = []
  let colors = []
  setInterval(() => {
    if (i < l) {
      var t = i / l;
      spline.getPoint(t, point);
      newpoints.push(point.x, point.y, point.z)
      var geometry = new LineGeometry();
      geometry.setPositions(newpoints);
      color.setHSL(t, 1.0, 0.5);
      colors.push(color.r, color.g, color.b);
      geometry.setColors(colors);

      line.geometry = geometry
      i++
    }
  }, 10);

}
// cp值转为Vector3
function v2tov3(v2, y) {
  let cp = v2.split(',')
  cp.splice(1, 0, y)
  let memberCp = new THREE.Vector3().fromArray(cp)
  return memberCp
}
function headerMove(allTrail, header) {
  // 头像行动
  let index = 0
  let trailInterval = setInterval(() => {
    if (allTrail[index]) {
      header.position.copy(allTrail[index].setY(allTrail[index].y + 5))
    }
    if (index === allTrail.length - 1) {
      // obj.material = LightMemberMaterial()
      clearInterval(trailInterval)
    }
    index++
  }, 100)
}
// 获取从终点到店铺中心的点
function getEndToPc(end, cp) {
  let length = end.distanceTo(cp)
  var curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(Number(end.x), end.y, Number(end.z)),
    new THREE.Vector3(Number(cp.x), cp.y, Number(cp.z))
  ]);
  var points = curve.getPoints(Math.floor(length / 7)); //分段数100，返回101个顶点
  return points
}
// 开始的位置，结束的模型
var gettrail = function (star, endObj) {
  let arr = endObj.cp.split(',')
  arr.splice(1, 0, '0')
  let memberCp = new THREE.Vector3().fromArray(arr) // 店铺的中心点
  let trailVector3 = new THREE.Vector3() // 轨迹中离店铺中心最近的点
  let trailPoint = endObj.parent.userData.trailPoint // 可行走的所有点
  let minLength = 0 // 最小长度
  let minIndex = 0 // 最小长度的索引
  let size = endObj.parent.size // 模型的最大尺寸
  let astar = endObj.parent.userData.astar
  // 找到距离店铺最近的点
  for (let i = 0; i < trailPoint.length; i++) {
    let l = memberCp.distanceTo(trailPoint[i])
    if (i === 0) {
      minLength = l
    } else {
      if (l < minLength) {
        minLength = l
        minIndex = i
      }
    }
  }
  trailVector3 = trailPoint[minIndex]
  return computedAsterToTrail(star, trailVector3, size, astar, endObj.parent.getWorldPosition().y)
}
function computedAsterToTrail(star, end, size, astar, y) {
  // let end = trailVector3
  let width = Math.floor(size.z)
  let height = Math.floor(size.x)
  let sp = new THREE.Vector3(Math.floor((star.x + height / 2) / 7), 0, Math.floor((star.z + width / 2) / 7))
  let ep = new THREE.Vector3(Math.floor((end.x + height / 2) / 7), 0, Math.floor((end.z + width / 2) / 7))
  let newtrail = astarCreate(sp, ep, astar)
  let trail = []
  for (let i = 0; i < newtrail.length; i++) {
    let x = (newtrail[i].x + 1) * 7 - height / 2
    let z = (newtrail[i].y + 1) * 7 - width / 2
    let v3 = new THREE.Vector3(x, y, z)
    trail.push(v3)
  }
  return trail
}
export {
  handleClick
}