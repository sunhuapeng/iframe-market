/**
 * 通过传值。返回盒子的外边框临界点和中心点 尺寸
 */
const THREE = require("three");
export default class GetBox {
  constructor() {
  }
  // 返回box3
  getbox(box: any) {
    let b = new THREE.Box3();
    b.expandByObject(box);
    return b;
  }
}
