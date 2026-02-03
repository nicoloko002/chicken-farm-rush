import { EventBus } from "../EventBus";
import { Tool } from "./Tool";
import { Enemy } from "../entities/npcs/enemies/Enemy";

export class StickTool extends Tool {
    constructor(scene, x, y, iconSprite, backgroundSprite, chargeSprite, triggerKey, cost) {
        super(scene, x, y, iconSprite, backgroundSprite, chargeSprite, triggerKey, cost);

        this.cursorEnemyClickConfig = {
            min: 2,
            max: 5,
            animation: 'punchEffect',
            origin: {
               x: 0.5,
               y: 0.5
            },
            damageSound: this.scene.sound.add('damageSound')
        };
    }

    action(pointer) {
        const hitObjects = this.scene.input.hitTestPointer(pointer);
        const enemy = hitObjects.find(o => o instanceof Enemy);

        if (enemy != null) {
            enemy?.doDamage(this.cursorEnemyClickConfig);
        }
    }
}