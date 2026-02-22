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
        this.hand = new HandTool(this.scene, 205, 675, 'masterHand', 'bgBtn', null, 'Q');
        this.hand.setIncValue(10);
        this.uiContainer.add(this.hand);

        this.stick = new StickTool(this.scene, 285, 675, 'stick', 'bgBtn', 'chargeBarHealthFill', 'W', null, {
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

        this.bulletegg = new Tool(this.scene, 365, 675, 'bulletegg', 'bgBtn', 'chargeBarHealthFill', 'E', 1, {
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

        this.minegg = new Tool(this.scene, 445, 675, 'minegg', 'bgBtn', 'chargeBarHealthFill', 'R', 2);
        this.minegg.setIncValue(.3);
        this.uiContainer.add(this.minegg);

        this.empEggranade = new Tool(this.scene, 525, 675, 'empEggranade', 'bgBtn', 'chargeBarHealthFill', 'T', 50, {
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

        // const placeholder1 = new HandTool(this.scene, 605, 675, 'masterHand', 'bgBtn', null, 'Y');
        // placeholder1.setIncValue(10);
        // this.uiContainer.add(placeholder1);

        // const placeholder2 = new HandTool(this.scene, 685, 675, 'masterHand', 'bgBtn', null, 'U');
        // placeholder2.setIncValue(10);
        // this.uiContainer.add(placeholder2);

        // const placeholder3 = new HandTool(this.scene, 765, 675, 'masterHand', 'bgBtn', null, 'I');
        // placeholder3.setIncValue(10);
        // this.uiContainer.add(placeholder3);
        
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

    getToolPosition(toolName) {
        let tool = null;

        switch(toolName.toLowerCase()) {
            case 'hand':
                tool = this.hand;
                break;
            case 'stick':
                tool = this.stick;
                break;
            case 'bulletegg':
                tool = this.bulletegg;
                break;
            case 'minegg':
                tool = this.minegg;
                break;
            case 'empeggranade':
                tool = this.empEggranade;
                break;
            default:
                return null;
        }

        if (!tool) return null;

        return {
            x: tool.x + tool.list[0].displayWidth / 4,
            y: tool.y + 25
        };
    }
}