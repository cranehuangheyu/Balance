
import { _decorator, Component, Node, Vec3, UITransform } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('FaScript')
export class FaScript extends Component {
    // [1]
    // dummy = '';

    // [2]
    // @property
    // serializableDummy = 0;

    public afterFa: Node = null!; // 上一个点

    public nextFa: Node = null!; // 下一个点

    start () {
        // [3]
    }

    onLoad () {
        
    }

    // 计算重量
    computeWeight () {
        let weight = 50
        if (this.nextFa) {
            weight += this.nextFa.getComponent(FaScript)!.computeWeight()
        }
        return weight
    }

    // 同步坐标
    flushPos () {
        if (this.nextFa) {
            let b = this.node.getPosition()
            this.nextFa.setPosition(b.x, b.y - 60, b.z)

            this.nextFa.getComponent(FaScript)!.flushPos()
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
