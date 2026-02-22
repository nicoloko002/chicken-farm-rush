import { Scene } from "phaser";

export class TutorialUI extends Scene {
    constructor() {
        super('TutorialUI');
    }

    create() {
        this.tutorialScene = this.scene.get('Tutorial');
    }

    createButton(x, y, text, callback, width = 140, height = 45, fontSize = '14px') {
        const button = this.add.container(x, y);

        const bg = this.add.rectangle(0, 0, width, height, 0x4CAF50);
        bg.setInteractive({
            useHandCursor: true
        });
        bg.on('pointerdown', () => {
            callback();
        });
        bg.on('pointerover', () => {
            bg.setFillStyle(0x66BB6A);
        });
        bg.on('pointerout', () => {
            bg.setFillStyle(0x4CAF50);
        });
        button.add(bg);

        const btnText = this.add.text(0, 0, text, {
            fontSize: fontSize,
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            align: 'center',
            fontStyle: 'bold'
        });
        btnText.setOrigin(0.5);
        button.add(btnText);

        return button;
    }

    createDialogBox(title, description, buttons = null, instruction = null) {
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2 - 180;

        // Responsive sizing
        const dialogWidth = 600;
        const dialogHeight = 380;
        const padding = 30;

        const titleFontSize = '30px';
        const descFontSize = '25px';
        const instructionFontSize = '22px';
        const buttonFontSize = '22px';

        // Background
        const dialogBg = this.add.rectangle(
            centerX,
            centerY,
            dialogWidth,
            dialogHeight,
            0x1a1a1a,
            0.9
        );
        dialogBg.setStrokeStyle(3, 0xffff00);
        dialogBg.setInteractive();

        // Calculate positions
        const topPadding = 30;
        const elementSpacing = 20;

        let yPos = centerY - dialogHeight / 2 + topPadding;

        // Title
        const titleText = this.add.text(
            centerX,
            yPos,
            title, {
                fontSize: titleFontSize,
                fontFamily: 'Arial, sans-serif',
                color: '#ffff00',
                align: 'center',
                fontStyle: 'bold',
                fixedWidth: dialogWidth - padding,
                fixedHeight: 0,
                wordWrap: {
                    width: dialogWidth - padding
                }
            }
        );
        titleText.setOrigin(0.5, 0);
        yPos += titleText.height + elementSpacing + 15;

        // Description
        const descText = this.add.text(
            centerX,
            yPos,
            description, {
                fontSize: descFontSize,
                fontFamily: 'Arial, sans-serif',
                color: '#ffffff',
                align: 'center',
                wordWrap: {
                    width: dialogWidth - padding
                },
                lineSpacing: 8,
                fixedWidth: dialogWidth - padding,
                fixedHeight: 0
            }
        );
        descText.setOrigin(0.5, 0);
        yPos += descText.height + elementSpacing + 15;

        // Instruction text (if provided)
        if (instruction) {
            const instructionText = this.add.text(
                centerX,
                yPos,
                instruction, {
                    fontSize: instructionFontSize,
                    fontFamily: 'Arial, sans-serif',
                    color: '#ffff00',
                    align: 'center',
                    fontStyle: 'bold',
                    wordWrap: {
                        width: dialogWidth - padding
                    },
                    fixedWidth: dialogWidth - padding,
                    fixedHeight: 0
                }
            );
            instructionText.setOrigin(0.5, 0);
            yPos += instructionText.height + elementSpacing;
        }

        // Buttons
        if (buttons && buttons.length > 0) {
            const buttonY = centerY + dialogHeight / 2 - 35;
            const buttonWidth = 140;
            const buttonHeight = 45;

            if (buttons.length === 1) {
                const btn = this.createButton(centerX, buttonY, buttons[0].text, buttons[0].callback, buttonWidth, buttonHeight, buttonFontSize);
            } else {
                const buttonSpacing = 170;
                const totalWidth = (buttons.length - 1) * buttonSpacing;
                const startX = centerX - totalWidth / 2;

                buttons.forEach((btnData, index) => {
                    const btnX = startX + index * buttonSpacing;
                    this.createButton(btnX, buttonY, btnData.text, btnData.callback, buttonWidth, buttonHeight, buttonFontSize);
                });
            }
        }
    }

    clearDialog() {
        this.children.removeAll(true);
    }

    update() {
        // This scene doesn't need update logic
    }
}
