import Phaser from "phaser";

export default class ChickenGroup extends Phaser.Physics.Arcade.Group
{
    INTERACTION_RANGE = 120;
    items = [];

    constructor(scene)
    {
        super(scene.physics.world, scene);
    }

    add(item)
    {
        this.items.push(item);
        super.add(item.instance);
    }

    remove(item)
    {
        const index = this.items.indexOf(item);

        if (index > -1) {
            this.items.splice(index, 1);
        }
        super.remove(item.instance);
    }

    pointerInteraction(pointer)
    {
        this.items.forEach(item => {
            if (Phaser.Math.Distance.BetweenPoints(pointer.position, item.instance.body.center) - item.instance.body.width/2 < this.INTERACTION_RANGE)
                item.pointerInteraction(pointer);
        });
    }
}