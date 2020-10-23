const THREE = require("three");
import { astarCreate, initCube } from '../tools/public'
import { memberMaterial, LightMemberMaterial} from '../material/index'

var handleClick = function (event, _this) {
  _this.mouse.x = (event.clientX / document.body.offsetWidth) * 2 - 1;
  _this.mouse.y = -(event.clientY / document.body.offsetHeight) * 2 + 1;
  var raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(_this.mouse, _this.camera);
  var raylist = raycaster.intersectObjects(_this.floorGroup.children, true);
  if (raylist[0]) {
    let obj = raylist[0].object
    if (obj.memberId) {
      const memberFloorId = obj.parent.floorId
      const mySelfFloorId = _this.mySelf.mySelfFloorId
      console.log('mySelfFloorId', mySelfFloorId)
      // 相同楼层
      let trail = []
      if (mySelfFloorId === memberFloorId) {
        trail = gettrail(obj, _this)
        if(trail.length === 0) {
          // 需要记录进店前的终点，作为下一次出发的起点，
          // 代码需要重新整理
          alert('你无路可逃')
          return 
        }
        let cp = obj.cp.split(',')
        cp.splice(1, 0, obj.parent.getWorldPosition().y)
        let memberCp = new THREE.Vector3().fromArray(cp)
        let endToPcTrail = getEndToPc(trail[trail.length - 1], memberCp)
        let allTrail = trail.concat(endToPcTrail)
        console.log(allTrail)

        var geometry = new THREE.BufferGeometry().setFromPoints(allTrail);
        var material = new THREE.LineBasicMaterial({
          color: '#f14f54'
        });
        var line = new THREE.Line(geometry, material);
        _this.scene.add(line)

        // 头像行动
        let index = 0
        let trailInterval = setInterval(() => {
          if (allTrail[index]) {
            _this.mySelf.position.copy(allTrail[index].setY(allTrail[index].y + 5))
          }
          if (index === allTrail.length - 1) {
            obj.material = LightMemberMaterial()
            clearInterval(trailInterval)

          }
          index++
        }, 100)
      } else {
        console.log('不同楼层')
      }

    } else {
      let cp = new THREE.Vector3
      _this.$getBox.getbox(obj).getCenter(cp)
      let x = Math.floor(cp.x)
      let y = Math.floor(cp.z)
    }
  }
}
// 获取从终点到店铺中心的点
function getEndToPc(end, cp) {
  let length = end.distanceTo(cp)
  var curve = new THREE.CatmullRomCurve3([
    end,
    new THREE.Vector3(Number(cp.x), cp.y, Number(cp.z))
  ]);

  var points = curve.getPoints(Math.floor(length / 7)); //分段数100，返回101个顶点
  return points
}

var gettrail = function (object, _this) {
  let star = _this.mySelf.getWorldPosition()  // 自己的位置
  let arr = object.cp.split(',')
  arr.splice(1, 0, '0')
  let memberCp = new THREE.Vector3().fromArray(arr) // 店铺的中心点
  let trailVector3 = new THREE.Vector3() // 轨迹中离店铺中心最近的点
  let trailPoint = object.parent.userData.trailPoint // 可行走的所有点
  let minLength = 0 // 最小长度
  let minIndex = 0 // 最小长度的索引
  let size = object.parent.size // 模型的最大尺寸
  let astar = object.parent.userData.astar
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
  let end = trailVector3
  let width = Math.floor(size.z)
  let height = Math.floor(size.x)
  let sp = new THREE.Vector3(Math.floor((star.x + height / 2) / 7), 0, Math.floor((star.z + width / 2) / 7))
  let ep = new THREE.Vector3(Math.floor((end.x + height / 2) / 7), 0, Math.floor((end.z + width / 2) / 7))
  let newtrail = astarCreate(sp, ep, astar)
  let trail = []
  for (let i = 0; i < newtrail.length; i++) {
    let x = (newtrail[i].x + 1) * 7 - height / 2
    let z = (newtrail[i].y + 1) * 7 - width / 2
    let v3 = new THREE.Vector3(x, object.parent.getWorldPosition().y, z)
    trail.push(v3)
  }
  return trail
}
export {
  handleClick
}