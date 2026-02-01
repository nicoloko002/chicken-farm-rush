import Phaser from "phaser";

export class Score extends Phaser.GameObjects.Text {
   constructor(scene, x, y) {
      super(scene, x, y, '0', {
         fontSize: 30,
         strokeThickness: 1
      });

      this.scene.add.existing(this);
   }

   setScore(score) {
      this.text = 'x ' + score;
   }

   incScore(incValue) {
      this.text = 'x ' + (Number(this.text) + Number(incValue));
   }
}
