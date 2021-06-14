
import { _decorator, Component, Node, Vec3, UITransform, view } from 'cc';
import { FaScript } from './FaScript';
const { ccclass, property } = _decorator;

const _pos = new Vec3();

@ccclass('MainScript')
export class MainScript extends Component {
    // [1]
    // dummy = '';

    // [2]
    // @property
    // serializableDummy = 0;

    @property(Node) // 摇臂
    public spriteBa: Node = null!;

    @property(Node) // 砝码精灵数组
    public spriteFaArray: Array<Node> = [];

    @property(Node) // 槽数组
    public faSlogArray: Array<Node> = [];

    public nowFa: Node = null!;

    // 槽信息
    public faSlogInfo: Array<Node> = [null, null, null, null, null, null, null, null, null, null, null, null];

    // 角度计数
    public degree: number = 0;
    // 倾斜方向
    public direction: number = 0

    // 速度
    public baSpeed: number = 10
    // 摇摆角度
    public baRotation: number[] = [-10, 10]
    // 摇臂位置加成
    public baAddition: number[] = [6, 5, 4, 3, 2, 1, 1, 2, 3, 4, 5, 6]
    // 摇臂位置
    public baDistribution: number[] = [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0]

    start () {
        // [3]
    }

    onLoad () {
        this.node.on(Node.EventType.TOUCH_START, (event) => {
            // 选择砝码
            let b = this.transfarmPos1(event)
            for (let index = 0; index < this.spriteFaArray.length; index++) {
                const element = this.spriteFaArray[index];
                if (element) {
                    let originFa = element.getComponent(FaScript)
                    if (!originFa!.nextFa) {
                        _pos.set(b)
                        _pos.subtract(element.getPosition());
                        if (_pos.length() < 40) {
                            this.nowFa = element
    
                            // 清除槽信息
                            this.clearSlotInfo(element)
                            break
                        }
                    }
                }
            }

            // console.log("xxxxxxxxxxx11111")
        }, this);

        this.node.on(Node.EventType.TOUCH_MOVE, (event) => {
            if (this.nowFa) {
                // 拖动砝码
                let b = this.transfarmPos1(event)
                this.nowFa.setPosition(b.x, b.y)
                // console.log("xxxxxx222222222")
            }
        }, this);

        this.node.on(Node.EventType.TOUCH_END, (event) => {
            if (this.nowFa) {
                let beFound = false
                // 是否找到平衡臂的挂点
                for (let index = 0; index < this.faSlogArray.length; index++) {
                    const element = this.faSlogArray[index];
                    if (element && this.faSlogInfo[index] == null) {
                        this.nowFa.getPosition(_pos)

                        // 取出挂点在场景的坐标
                        let b = this.transfarmPos(element, this.node)
                        _pos.y += 30
                        _pos.subtract(b);
                        if (_pos.length() < 10) {
                            this.faSlogInfo[index] = this.nowFa
                            this.nowFa.getComponent(FaScript)!.afterFa = this.faSlogArray[index]
                            beFound = true
                            break
                        }
                    }
                }

                if (!beFound) {
                    // 是否找到已挂载砝码的挂点
                    for (let index = 0; index < this.spriteFaArray.length; index++) {
                        const element = this.spriteFaArray[index];
                        if (element && element.name != this.nowFa.name) {
                            let originFa = element.getComponent(FaScript)
                            if (originFa!.afterFa && !originFa!.nextFa) {
                                this.nowFa.getPosition(_pos)

                                // 取出挂点在场景的坐标
                                let b = this.transfarmPos(element, this.node)
                                _pos.y += 60
                                _pos.subtract(b);
                                if (_pos.length() < 10) {    
                                    originFa!.nextFa = this.nowFa
                                    this.nowFa.getComponent(FaScript)!.afterFa = element
                                    beFound = true
                                    break
                                }
                            }
                        }
                    }
                }

                this.computeWeight()
                this.nowFa = null
            }
        }, this);
    }

    update (deltaTime: number) {
        let speed = deltaTime * this.baSpeed

        // [4]
        // 摆动天平
        if (this.direction == 1) {
            this.degree += speed
            if (this.degree > this.baRotation[1]) {
                this.degree = this.baRotation[1]
            }
        } else if (this.direction == -1) {
            this.degree -= speed
            if (this.degree < this.baRotation[0]) {
                this.degree = this.baRotation[0]
            }
        } else {
            // 回到平衡
            if (Math.abs(this.degree) < speed) {
                this.degree = 0
            } else if (this.degree > 0) {
                this.degree -= speed
                if (this.degree < 0) {
                    this.degree = 0
                }
            } else if (this.degree < 0) {
                this.degree += speed
                if (this.degree > 0) {
                    this.degree = 0
                }
            }
        }
        
        this.spriteBa.setRotationFromEuler(0, 0, this.degree)
        this.flushFaPos()
    }

    // 同步砝码坐标
    flushFaPos () {
        for (let index = 0; index < this.faSlogInfo.length; index++) {
            const element = this.faSlogInfo[index];
            if (element) {
                let slot = this.faSlogArray[index]
                if (slot) {
                    // 取出挂点在场景的坐标
                    let b = this.transfarmPos(slot, this.node)
                    b.y -= 30
                    element.setPosition(b)

                    // 同步其他挂载砝码的位置
                    element.getComponent(FaScript)!.flushPos()
                }
            }
        }
    }

    // 节点坐标转换
    transfarmPos (node1: Node, node2: Node) {
        let uiTrans :any = node1.parent!.getComponent(UITransform);
        let temp = uiTrans.convertToWorldSpaceAR(node1.getPosition());
        let b: any = node2.getComponent(UITransform)?.convertToNodeSpaceAR(temp);
        return b
    }

    // 节点坐标转换
    transfarmPos1 (event) {
        let winSize = view.getFrameSize()
        let canvasSize = view.getCanvasSize()
        // let visibleSize = view.getVisibleSize();
        winSize.width = 960 / winSize.width
        winSize.height = 640 / winSize.height
        let b: any = this.node.getComponent(UITransform)?.convertToNodeSpaceAR(
            new Vec3(
                    event.touch._point.x * winSize.height, 
                    event.touch._point.y * winSize.height, 
                    0));
        return b
    }

    // 清除槽信息
    clearSlotInfo (element: Node) {
        // 卸掉的操作
        if (!this.nowFa) {return} ;

        let afterFa = this.nowFa.getComponent(FaScript)!.afterFa
        if (afterFa) {
            let stringTemp = afterFa.name.split("_")
            if (stringTemp[0] == "slot") {
                // 摇臂上的槽
                this.faSlogInfo[Number(stringTemp[1]) - 1] = null
            } else {
                // 砝码状态恢复
                afterFa.getComponent(FaScript)!.nextFa = null
            }
            this.nowFa.getComponent(FaScript)!.afterFa = null
        }
    }

    // 处理重量大小
    computeWeight () {
        let leftW = 0
        let leftR = 0
        for (let index = 0; index < 12; index++) {
            const element = this.faSlogInfo[index];
            if (element) {
                // 取出对应槽的重量，加成处理
                let temp = element.getComponent(FaScript)!.computeWeight()
                temp *= this.baAddition[index]

                // 区分左右边
                if (this.baDistribution[index] == 1) {
                    leftW += temp
                } else {
                    leftR += temp
                }
            }
        }

        if (leftW == leftR) {
            this.direction = 0
        } else {
            this.direction = leftW > leftR ? 1 : -1
        }
    }
}

/**
 * [1] Class member could be defined like this.
 * [2] Use `property` decorator if your want the member to be serializable.
 * [3] Your initialization goes here.
 * [4] Your update function goes here.
 *
 * Learn more about scripting: https://docs.cocos.com/creator/3.0/manual/en/scripting/
 * Learn more about CCClass: https://docs.cocos.com/creator/3.0/manual/en/scripting/ccclass.html
 * Learn more about life-cycle callbacks: https://docs.cocos.com/creator/3.0/manual/en/scripting/life-cycle-callbacks.html
 */
