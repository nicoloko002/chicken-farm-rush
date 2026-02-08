import Phaser from "phaser";

export class Score extends Phaser.GameObjects.Text {
   constructor(scene, x, y) {
      super(scene, x, y, '0', {
         fontSize: 30,
         strokeThickness: 1
      });

      this.scene.add.existing(this);
      this.amount = 0;
   }

   setScore(score) {
      this.amount = score;
      this.text = 'x ' + score;
   }

   incScore(incValue) {
      this.amount += incValue;
      this.text = 'x ' + this.amount;
   }
}
