export class WormBoss {
    constructor(scene, x, y) {
        var boss = scene.physics.add.sprite(x, y, 'wormBossSpawn');
        boss.setOrigin(.5, .5);
        var spawnAnim = boss.anims.create(
            {
                key: 'spawn',
                frames: scene.anims.generateFrameNumbers('wormBossSpawn', { start: 0, end: 31, first: 0 }),
                frameRate: 25,
                repeat: 0,
            }
        );
        boss.anims.create(
            {
                key: 'scream',
                frames: scene.anims.generateFrameNumbers('wormBossScream', { start: 0, end: 31, first: 0 }),
                frameRate: 30,
                repeat: 2
            }
        );
        let screamToIddleAnim = boss.anims.create(
            {
                key: 'screamToIddle',
                frames: scene.anims.generateFrameNumbers('wormBossScreamToIddle', { start: 0, end: 39, first: 0 }),
                frameRate: 70,
                repeat: 0
            }
        );
        boss.anims.create(
            {
                key: 'iddle',
                frames: scene.anims.generateFrameNumbers('wormBossIddle', { start: 0, end: 63, first: 0 }),
                frameRate: 25,
                repeat: 0
            }
        );
        boss.anims.create(
            {
                key: 'screamToIddleReverse',
                frames: scene.anims.generateFrameNumbers('wormBossScreamToIddle', { start: 39, end: 0, first: 39 }),
                frameRate: 100,
                repeat: 0
            }
        );
        boss.anims.create(
            {
                key: 'spawnReverse',
                frames: scene.anims.generateFrameNumbers('wormBossSpawn', { start: 31, end: 0, first: 31 }),
                frameRate: 40,
                repeat: 0,
                onComplete: () =>
                {
                    boss.chain(['scream', 'screamToIddle', 'iddle', 'screamToIddleReverse', 'spawnReverse']);
                    boss.anims.play('spawn');
                }
            }
        );
        boss.chain(['scream', 'screamToIddle', 'iddle', 'screamToIddleReverse', 'spawnReverse']);
        boss.anims.play('spawn');
    }
}