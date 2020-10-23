import { initScene, initCamera, initRenderer, initRenderer2D, initControls, initAmbientLight, initDirectional, helper, spotLight, spotLightHelper, box, back } from '../createThreeScene/index'
import { LoadGltf } from '../loader/index'
import { GetFloor, GetMember } from '../api/requery'
import GetBox from '../tools/getBox'
import { memberMaterial, nomemberMaterial, DrawLine, floorMaterial, elevatorMaterial } from '../material/index'
import { createText, pointRay, getTrailPoint, createMyPosition, astarCreate } from '../tools/public'
import { threadId } from 'worker_threads'
import { handleClick } from '../js/handle'
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
    mySelf: any = null // 主角
    mouse: any = new THREE.Vector2(); //鼠标位置
    floorHeight: number = 50
    memberData: any = []
    elevatorData: any = []
    nameRayList = []
    groundRayArr = []
    layerX = 0
    layerY = 0
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
        var axisHelper = new THREE.AxisHelper(250)
        this.scene.add(axisHelper)
        this.scene.add(initAmbientLight())
        this.floorGroup.name = 'floorgroup'
        this.scene.add(this.floorGroup)
        // 获取数据
        await this.getFloor()
        await this.getMember()
        await this.getElevaor()
        console.log('楼层数据', this.floorData)
        // 计算每层楼之间的距离
        this.floorHeight = window.innerHeight / Math.max(10, this.floorData.length)
        this.renderFloor()
        window.addEventListener("resize", () => { this.onWindowResized(); }, false);

        window.addEventListener('click', (event: any) => {
            this.mouse.x = (event.clientX / document.body.offsetWidth) * 2 - 1;
            this.mouse.y = -(event.clientY / document.body.offsetHeight) * 2 + 1;
            var raycaster = new THREE.Raycaster();
            raycaster.setFromCamera(this.mouse, this.camera);
            var raylist = raycaster.intersectObjects(this.floorGroup.children, true);
            if (raylist[0]) {
                // console.log(raylist[0].object)
                let cp = new THREE.Vector3
                this.$getBox.getbox(raylist[0].object).getCenter(cp)
                let x = Math.floor(cp.x)
                let y = Math.floor(cp.z)
                // console.log(x, y)
            }
        })
        window.addEventListener('mouseup', (event: any) => {
            if (event.layerX === this.layerX && event.layerY === this.layerY) {
                const _this = this
                handleClick(event, _this)
            }
        })
        window.addEventListener('mousedown', (event: any) => {
            this.layerX = event.layerX
            this.layerY = event.layerY
        })
    }
    // 渲染楼层
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
                        scene.floorId = floor.id
                        getTrailPoint(scene, this)
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
                        // 渲染店铺
                        this.bindMember(scene)
                        this.loadFloorIndex++
                        if (this.loadFloorIndex === datalength) {
                            console.log('楼层加载结束')
                            this.mySelf = createMyPosition(this)
                            console.log('mySelf', this.mySelf)
                        }
                        this.renderFloor()
                    })
            }
            clearInterval(interFloor)
        }, 300)
    }
    // 获取商铺数据
    async getMember() {
        this.memberData = await GetMember('./static/json/member.json')
    }
    // 获取电扶梯数据
    async getElevaor() {
        this.elevatorData = await GetMember('./static/json/elevator.json')
    }

    async bindMember(scene: any) {
        scene.traverse(obj => {
            const floorId = scene.floorId
            if (this.flagMember.indexOf(obj.name.split('_')[0]) === -1 && obj.isMesh) {
                const v3 = new THREE.Vector3()
                this.$getBox.getbox(obj).getCenter(v3)
                const cp = Math.floor(v3.x) + ',' + Math.floor(v3.z)
                var line = new THREE.Geometry();
                for (let i = 0; i < this.memberData.length; i++) {
                    // scene.add(line)
                    let member = this.memberData[i]
                    if (!obj.memberId) {
                        if (member.coordinates === cp && member.floorid === floorId) {
                            obj.material = memberMaterial()
                            line = DrawLine(obj, 0.5, 0x2fafe1);
                            obj.memberId = member.id
                            let nameV3 = v3.clone().setY(0)
                            var memberName = createText(member.name, nameV3)
                            memberName.position.setY(5)
                            this.nameRayList.push(memberName)
                            obj.userData.data = member
                            obj.cp = cp
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
                } else if (obj.name.split('_')[0].indexOf('elevator') !== -1 || obj.name.split('_')[0].indexOf('escalator') !== -1) {
                    // 电扶梯
                    // this.groundRayArr.push(obj)
                    obj.material = elevatorMaterial()
                    for (let i = 0; i < this.elevatorData.length; i++) {
                        const ele = this.elevatorData[i]
                        const v3 = new THREE.Vector3()
                        this.$getBox.getbox(obj).getCenter(v3)
                        const cp = Math.floor(v3.x) + ',' + Math.floor(v3.z)
                        // console.log(cp)
                        if(cp === ele.coordinates && !obj.elevatorId) {
                            // console.log(obj)
                            obj.elevatorId = ele.id
                            obj.cp = ele.coordinates
                            obj.userData.data = ele
                        }
                    }
                }
            }
        })

    }
    // 获取楼层信息
    async getFloor() {
        // 异步请求
        await GetFloor('./static/json/floor.json').then((res: any) => {
            this.floorData = res
        })
    }
    // 监听鼠标移动隐藏被遮挡的店铺名称
    rayText() {
        this.floorGroup.traverse((mesh) => {
            if (mesh.isType === '2') {
                const textWorldV3 = new THREE.Vector3()
                mesh.getWorldPosition(textWorldV3)
                const opt = pointRay(this.camera.position, textWorldV3, this.groundRayArr);
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