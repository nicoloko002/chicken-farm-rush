import { EventBus } from "../EventBus";
import { HandTool } from "./HandTool";
import { StickTool } from "./StickTool";
import { Tool } from "./Tool";

export class ToolManager {
    constructor(scene, container) {
        this.scene = scene;
        this.currentTool = null;
        this.tools = new Map();
        this.commandHistory = [];
        this.uiContainer = container;

        this.initializeTools();
    }

    initializeTools() {
        this.hand = new HandTool(this.scene, 160, 690, 'masterHand', 'bgBtn', null, 'Q');
        this.hand.setIncValue(10);
        this.uiContainer.add(this.hand);

        this.stick = new StickTool(this.scene, 240, 690, 'stick', 'bgBtn', 'chargeBarHealthFill', 'W', null, {
            atack: {
                min: 2,
                max: 5,
                animation: 'punchEffect',
                origin: {
                    x: 0.5,
                    y: 0.5
                }
            },
        });
        this.stick.setIncValue(5);
        this.uiContainer.add(this.stick);

        this.bulletegg = new Tool(this.scene, 320, 690, 'bulletegg', 'bgBtn', 'chargeBarHealthFill', 'E', 1, {
            atack: {
                min: 60,
                max: 60,
                animation: 'shotEffect',
                origin: {
                    x: 0.5,
                    y: 0.5
                }
            },
        });
        this.bulletegg.setIncValue(1);
        this.uiContainer.add(this.bulletegg);

        this.minegg = new Tool(this.scene, 400, 690, 'minegg', 'bgBtn', 'chargeBarHealthFill', 'R', 2);
        this.minegg.setIncValue(.3);
        this.uiContainer.add(this.minegg);

        this.empEggranade = new Tool(this.scene, 480, 690, 'empEggranade', 'bgBtn', 'chargeBarHealthFill', 'T', 50, {
            atack: {
                min: 9999,
                max: 9999,
                animation: 'empEffect',
                origin: {
                    x: 0.5,
                    y: 0.5
                },
                damageSound: this.scene.sound.add('shock')
            },
        });
        this.empEggranade.setIncValue(.01);
        this.uiContainer.add(this.empEggranade);
        
        EventBus.on('buttonPressed', (button) => {
            this.currentTool = button;
            this.deselectButtons();
            this.cursor = button.cursor;
        });

        this.scene.input.on('pointerdown', pointer => pointer.y < this.hand.y && this.currentTool?.executeAction(pointer), this);
    }
    
    deselectButtons() {
        this.uiContainer.iterate((item) => item instanceof Tool && item != this.currentTool && item.deselect());
    }
}