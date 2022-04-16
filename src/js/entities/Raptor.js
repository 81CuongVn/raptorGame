import Phaser from "phaser";

import * as Globals from "../Globals";
import * as ParticleManager from "../ParticleManager";
import Entity from "./Entity";

export default class Raptor extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y) {
        super(scene);
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.direction = Globals.DIRECTIONS["EAST"];

        // STATS
        this.name = "Raptor";
        this.speed = 110;
        this.attackCooldown = 750;
        this.canAttack = true;
        this.slashHitbox = { w: 8, h: 16 };

        this.sprite = this.scene.physics.add.sprite(this.x, this.y, "raptor", 0).setOrigin(0.5, 0.5);
        this.sprite.parentEntity = this;
        this.sprite.setDepth(2);
        this.sprite.anims.create({
            key: "idle",
            frames: this.sprite.anims.generateFrameNames("raptor", { start: 0, end: 3 }),
            frameRate: Globals.ANIMATION_FRAMERATE,
            repeat: -1
        });
        this.sprite.anims.create({
            key: "walk",
            frames: this.sprite.anims.generateFrameNames("raptor", { start: 10, end: 19 }),
            frameRate: Globals.ANIMATION_FRAMERATE,
            repeat: -1
        });
        this.sprite.play("idle");

        this.width = this.sprite.displayWidth;
        this.height = this.sprite.displayHeight;

        this.slashSprite = this.scene.physics.add.sprite(this.x, this.y, "slash", 0).setOrigin(0.5, 0.5).setDepth(3);
        this.slashSprite.anims.create({
            key: "slashing",
            frames: this.slashSprite.anims.generateFrameNames("slash", { start: 0, end: 4 }),
            frameRate: Globals.ANIMATION_FRAMERATE,
            repeat: 0
        });
        this.slashSprite.on('animationcomplete', () => {
            this.slashSprite.setVisible(false);
            this.slashSprite.body.checkCollision.none = true;
        });
        this.slashSprite.play("slashing");

        this.sprite.body.setSize(14, 12);
        this.slashSprite.body.setSize(this.slashHitbox.w, this.slashHitbox.h);
        this.slashSprite.setVisible(false);
        this.slashSprite.body.checkCollision.none = true;
    }

    handlePlayerControls() {
        // Keyboard controls
        let vx = 0;
        let vy = 0;
        if (this.scene.cursors.left.isDown || this.scene.cursors.right.isDown || this.scene.cursors.up.isDown || this.scene.cursors.down.isDown) {
            // Sets direction according to input
            if (this.scene.cursors.up.isDown) {
                vy = -this.speed;
                this.direction = Globals.DIRECTIONS["NORTH"]
            } else if (this.scene.cursors.down.isDown) {
                vy = this.speed;
                this.direction = Globals.DIRECTIONS["SOUTH"]
            }
            if (this.scene.cursors.left.isDown) {
                vx = -this.speed;
                this.sprite.flipX = true;
                this.direction = Globals.DIRECTIONS["WEST"]
            } else if (this.scene.cursors.right.isDown) {
                vx = this.speed;
                this.sprite.flipX = false;
                this.direction = Globals.DIRECTIONS["EAST"]
            }
            // Diagonals
            if (vx !== 0 && vy !== 0) {
                vx = vx / 1.4142;
                vy = vy / 1.4142;
            }
            // Set walk animation
            if (this.sprite.anims.currentAnim.key !== "walk")
                this.sprite.play("walk");

            // Adapt slash position
            this.slashSprite.setPosition(
                this.x + this.sprite.body.halfWidth + this.direction.x * this.sprite.body.sourceWidth,
                this.y + this.sprite.body.halfHeight + this.direction.y * this.sprite.body.sourceHeight
            );
            // Adapt slash direction
            if (this.direction === Globals.DIRECTIONS["WEST"])
                this.slashSprite.flipX = true;
            else
                this.slashSprite.flipX = false;

            if (this.direction === Globals.DIRECTIONS["NORTH"]) {
                // this.slashSprite.rotation = -90;
                this.slashSprite.body.rotation = -90;
                this.slashSprite.body.setSize(this.slashHitbox.h, this.slashHitbox.w);
            } else if (this.direction === Globals.DIRECTIONS["SOUTH"]) {
                // this.slashSprite.rotation = 90;
                this.slashSprite.body.rotation = 90;
                this.slashSprite.body.setSize(this.slashHitbox.h, this.slashHitbox.w);
            } else {
                // this.slashSprite.rotation = 0;
                this.slashSprite.body.rotation = 0;
                this.slashSprite.body.setSize(this.slashHitbox.w, this.slashHitbox.h);
            }

        } else {
            // Set idle animation if no inputs
            if (this.sprite.anims.currentAnim.key !== "idle")
                this.sprite.play("idle");
        }

        this.sprite.setVelocity(vx, vy);

        this.x = this.sprite.body.x;
        this.y = this.sprite.body.y;
    }

    handlePlayerAttack() {
        if (Phaser.Input.Keyboard.JustDown(this.scene.cursorsAttack.left)) {
            if (this.canAttack)
                this.attack();
        }
    }

    attack() {
        this.slashSprite.setVisible(true);
        this.slashSprite.body.checkCollision.none = false;
        this.slashSprite.play("slashing");

        // Cooldown reseter
        this.canAttack = false;
        this.scene.time.delayedCall(this.attackCooldown, () => { this.canAttack = true; }, [], this);
    }

}