import { initScene, initCamera, initRenderer, initRenderer2D, initControls, initAmbientLight, initDirectional, helper, spotLight, spotLightHelper, box, back } from '../createThreeScene/index'
import { LoadGltf } from '../loader/index'
import { GetFloor } from '../api/requery'
import GetBox from '../tools/getBox'
import { memberMaterial } from '../material/index'
const THREE = require("three");
class Market {
    private scene: any //场景
    private camera: any; //相机
    private renderer: any; //渲染器
    private controls: any; //控制器
    private labelRenderer: any; //2d渲染器
    private floorData: any = []; // 楼层数据
    private floorGroup: any; // 楼层数据
    private loadFloorIndex: number = 0
    floorHeight: number = 50
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
        // this.scene.add(initDirectional())
        this.scene.add(initAmbientLight())
        const spotL = spotLight()
        this.scene.add(spotL)
        this.scene.add(spotLightHelper(spotL))
        this.scene.add(helper())
        this.floorGroup = new THREE.Group()
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
                        const floorCp = new THREE.Vector3(0, y, 0)
                        scene.position.copy(floorCp),
                            scene.y = y
                        scene.traverse((obj: any) => {
                            this.bindMember(obj)
                        })
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
                        this.floorGroup.add(scene)
                        this.loadFloorIndex++
                        this.renderFloor()
                    })
            }
            clearInterval(interFloor)
        }, 300)
    }
    bindMember(obj: any) {
        if (this.flagMember.indexOf(obj.name.split('_')[0]) === -1 && obj.isMesh) {
            console.log(obj)
            const v3 = new THREE.Vector3()
            this.$getBox.getbox(obj).getCenter(v3)
            // console.log(v3)
            obj.material = memberMaterial
            console.log(Math.floor(v3.x) + "," + Math.floor(v3.z))

        }
    }
    async getFloor() {
        // 异步请求
        await GetFloor('./static/json/floor.json').then((res: any) => {
            this.floorData = res
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