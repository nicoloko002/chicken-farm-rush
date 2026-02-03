import { Tool } from "./Tool";

export class HandTool extends Tool {
    action(pointer) {
        this.scene.chickenGroup.pointerInteraction(pointer);
    }
}