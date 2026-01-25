import Phaser from "phaser";

export default class ChickenGroup extends Phaser.Physics.Arcade.Group
{
    INTERACTION_RANGE = 300;
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

    pointerInteraction(pointer)
    {
        this.items.forEach(item => {
            if (Phaser.Math.Distance.BetweenPoints(pointer.position, item.instance.body.position) < INTERACTION_RANGE)
                item.pointerInteraction(pointer);
        });
    }
}