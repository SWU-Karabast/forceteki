describe('Shield', function() {
    integration(function() {
        describe('Shield\'s ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['vanquish'],
                        spaceArena: ['cartel-spacer']
                    },
                    player2: {
                        spaceArena: [{ card: 'tieln-fighter', upgrades: ['shield'] }]
                    }
                });
            });

            it('should defeat itself to prevent damage to the attached unit', function () {
                this.player1.clickCard(this.cartelSpacer);
                this.player1.clickCard(this.tielnFighter);

                expect(this.cartelSpacer.damage).toBe(2);
                expect(this.tielnFighter.damage).toBe(0);

                expect(this.shield).toBeInLocation('outside the game');
                expect(this.tielnFighter.isUpgraded()).toBe(false);

                // second attack to confirm that shield effect is off
                this.player2.clickCard(this.tielnFighter);
                this.player2.clickCard(this.cartelSpacer);
                expect(this.cartelSpacer).toBeInLocation('discard');
                expect(this.tielnFighter).toBeInLocation('discard');
            });

            it('should be removed from the game when the attached unit is defeated', function () {
                this.player1.clickCard(this.vanquish);
                this.player1.clickCard(this.tielnFighter);

                expect(this.tielnFighter).toBeInLocation('discard');
                expect(this.shield).toBeInLocation('outside the game');
            });
        });

        describe('Shield\'s ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        spaceArena: ['cartel-spacer']
                    },
                    player2: {
                        spaceArena: [{ card: 'tieln-fighter', upgrades: ['shield', 'shield'] }]
                    }
                });

                this.shields = this.player2.findCardsByName('shield');
            });

            it('should defeat itself to prevent damage to the attached unit', function () {
                const getShieldLocationsSorted = (shields) => shields.map((shield) => shield.location).sort();

                this.player1.clickCard(this.cartelSpacer);
                this.player1.clickCard(this.tielnFighter);

                expect(this.cartelSpacer.damage).toBe(2);
                expect(this.tielnFighter.damage).toBe(0);
                expect(this.tielnFighter.upgrades.length).toBe(1);

                expect(getShieldLocationsSorted(this.shields)).toEqual(['outside the game', 'space arena']);

                // second attack
                this.player2.clickCard(this.tielnFighter);
                this.player2.clickCard(this.cartelSpacer);
                expect(this.cartelSpacer).toBeInLocation('discard');
                expect(this.tielnFighter.damage).toBe(0);
                expect(this.tielnFighter.isUpgraded()).toBe(false);

                expect(getShieldLocationsSorted(this.shields)).toEqual(['outside the game', 'outside the game']);
            });
        });

        describe('When a shield is created', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['moment-of-peace']
                    },
                    player2: {
                        spaceArena: ['tieln-fighter']
                    }
                });
            });

            it('its owner and controller should be the player who created it', function () {
                this.player1.clickCard(this.momentOfPeace);

                expect(this.tielnFighter.upgrades.length).toBe(1);
                const shield = this.tielnFighter.upgrades[0];
                expect(shield.internalName).toBe('shield');
                expect(shield.owner).toBe(this.player1.player);
                expect(shield.controller).toBe(this.player1.player);
            });
        });
    });
});
