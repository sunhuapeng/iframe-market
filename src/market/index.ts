import { initScene, initCamera, initRenderer, initRenderer2D, initControls, initAmbientLight, initDirectional, helper, spotLight, spotLightHelper, box, back } from '../createThreeScene/index'
import { LoadGltf } from '../loader/index'
import { GetFloor, GetMember } from '../api/requery'
import GetBox from '../tools/getBox'
import { memberMaterial, nomemberMaterial, DrawLine, floorMaterial } from '../material/index'
import { createText, pointRay } from '../tools/public'
import { threadId } from 'worker_threads'
// import { MeshBasicMaterial } from '../../node_modules/three/examples/jsm/'
const THREE = require("three");
class Market {
    private scene: any //场景
    private camera: any; //相机
    private renderer: any; //渲染器
    private controls: any; //控制器
    private labelRenderer: any; //2d渲染器
    private floorData: any = []; // 楼层数据
    private floorGroup: any = new THREE.Group(); // 楼层数据
    private loadFloorIndex: number = 0
    floorHeight: number = 50
    nameRayList = []
    groundRayArr = []
    $getBox: any = new GetBox()
    // 待开发。底板。卫生间。电梯。扶梯
    private flagMember: string[] = ['dev', 'floor', 'toilet', 'elevator', 'escalator',]
    constructor() {
        this.created()

    }
    async created() {
        // 创建场景
        this.scene = initScene()
        this.camera = initCamera()
        this.renderer = initRenderer()
        this.labelRenderer = initRenderer2D()
        this.controls = initControls(this.camera, this.renderer);
        this.controls.addEventListener('change', () => {
            // console.log(this.camera.position)
        });
        this.controls.addEventListener("change", this.rayText.bind(this));
        const directional = initDirectional()
        this.scene.add(directional);

        this.scene.add(initAmbientLight())
        this.floorGroup.name = 'floorgroup'
        this.scene.add(this.floorGroup)
        // 获取数据
        await this.getFloor()
        console.log('楼层数据', this.floorData)
        // 计算每层楼之间的距离
        this.floorHeight = window.innerHeight / Math.max(10, this.floorData.length)
        this.renderFloor()
        window.addEventListener("resize", () => { this.onWindowResized(); }, false);
    }
    renderFloor() {
        const datalength = this.floorData.length
        const helfLength = Math.ceil(datalength / 2)
        const interFloor = setInterval(() => {
            if (this.loadFloorIndex < datalength) {
                const floor = this.floorData[this.loadFloorIndex]
                new LoadGltf(floor.url)
                    .create()
                    .then((scene: any) => {
                        scene.name = floor.name
                        const index = (this.loadFloorIndex + 1) - helfLength
                        const y = this.floorHeight * index
                        scene.position.y = y
                        this.bindMember(scene)

                        this.floorGroup.add(scene)

                        if (this.loadFloorIndex === 0) {
                            // 根据第一层计算相机位置，将所有楼层适配显示到屏幕
                            const ground = scene.getObjectByName('floor')
                            const size = new THREE.Vector3()
                            this.$getBox.getbox(ground).getSize(size)
                            // 两条直角边
                            const a = size.x
                            const b = size.z
                            // 求斜边
                            const c = Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2))
                            this.camera.position.set(c + Math.min(datalength, 4) * 50, Math.min(helfLength, 4) * this.floorHeight, c + Math.min(datalength, 4) * 50)
                        }
                        this.loadFloorIndex++
                        this.renderFloor()
                    })
            }
            clearInterval(interFloor)
        }, 300)
    }

    async bindMember(scene: any) {
        await GetMember('./static/json/member.json').then((res: any) => {
            console.log('房间数据', res)
            scene.traverse(obj => {
                if (this.flagMember.indexOf(obj.name.split('_')[0]) === -1 && obj.isMesh) {
                    const v3 = new THREE.Vector3()
                    this.$getBox.getbox(obj).getCenter(v3)
                    const cp = Math.floor(v3.x) + ',' + Math.floor(v3.z)
                    var line = new THREE.Geometry();
                    for (let i = 0; i < res.length; i++) {
                        // scene.add(line)
                        let member = res[i]
                        if (!obj.memberId) {
                            if (member.coordinates === cp) {
                                obj.material = memberMaterial()
                                line = DrawLine(obj, 0.5, 0x2fafe1);
                                obj.memberId = member.id
                                let nameV3 = v3.clone().setY(0)
                                var memberName = createText(member.name, nameV3)
                                memberName.position.setY(5)
                                this.nameRayList.push(memberName)
                                obj.add(memberName)
                            } else {
                                obj.material = nomemberMaterial()
                                line = DrawLine(obj, 0.5, 0x652ab8);
                            }
                        }
                    }
                } else {
                    if (obj.name.split('_')[0].indexOf('floor') !== -1) {
                        this.groundRayArr.push(obj)
                        obj.material = floorMaterial()
                    }
                }
            })
        })
    }

    async getFloor() {
        // 异步请求
        await GetFloor('./static/json/floor.json').then((res: any) => {
            this.floorData = res
        })
    }
    rayText() {
        this.floorGroup.traverse((mesh) => {
            if (mesh.isType === '2') {
                const textWorldV3 = new THREE.Vector3()
                mesh.getWorldPosition(textWorldV3)
                const opt = pointRay(this.camera.position, textWorldV3, this.groundRayArr);
                // console.log(Number(!opt).toString())
                mesh.element.style.opacity = Number(!opt).toString();
            }
        })
    }
    onWindowResized() {
        var aspect = window.innerWidth / window.innerHeight;
        this.camera.left = - 500 * aspect / 2;
        this.camera.right = 500 * aspect / 2;
        this.camera.top = 500 / 2;
        this.camera.bottom = - 500 / 2;
        this.camera.updateProjectionMatrix();
        this.labelRenderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    animate() {
        requestAnimationFrame(() => {
            this.render();
        });
        this.controls.update();
    }
    render() {
        this.animate()
        this.renderer.render(this.scene, this.camera);
        this.labelRenderer.render(this.scene, this.camera);
    }
}
export default Market