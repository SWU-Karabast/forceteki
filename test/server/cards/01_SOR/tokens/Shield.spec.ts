describe('Shield', function() {
    integration(function(contextRef) {
        describe('Shield\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
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
                const { context } = contextRef;

                context.player1.clickCard(context.cartelSpacer);
                context.player1.clickCard(context.tielnFighter);

                expect(context.cartelSpacer.damage).toBe(2);
                expect(context.tielnFighter.damage).toBe(0);

                expect(context.shield).toBeInLocation('outside the game');
                expect(context.tielnFighter.isUpgraded()).toBe(false);

                // second attack to confirm that shield effect is off
                context.player2.clickCard(context.tielnFighter);
                context.player2.clickCard(context.cartelSpacer);
                expect(context.cartelSpacer).toBeInLocation('discard');
                expect(context.tielnFighter).toBeInLocation('discard');
            });

            it('should be removed from the game when the attached unit is defeated', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.vanquish);
                context.player1.clickCard(context.tielnFighter);

                expect(context.tielnFighter).toBeInLocation('discard');
                expect(context.shield).toBeInLocation('outside the game');
            });
        });

        describe('Shield\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        spaceArena: ['cartel-spacer']
                    },
                    player2: {
                        spaceArena: [{ card: 'tieln-fighter', upgrades: ['shield', 'shield'] }]
                    }
                });

                context.shields = context.player2.findCardsByName('shield');
            });

            it('should defeat itself to prevent damage to the attached unit', function () {
                const { context } = contextRef;

                const getShieldLocationsSorted = (shields) => shields.map((shield) => shield.location).sort();

                context.player1.clickCard(context.cartelSpacer);
                context.player1.clickCard(context.tielnFighter);

                expect(context.cartelSpacer.damage).toBe(2);
                expect(context.tielnFighter.damage).toBe(0);
                expect(context.tielnFighter).toHaveExactUpgradeNames(['shield']);

                expect(getShieldLocationsSorted(context.shields)).toEqual(['outside the game', 'space arena']);

                // second attack
                context.player2.clickCard(context.tielnFighter);
                context.player2.clickCard(context.cartelSpacer);
                expect(context.cartelSpacer).toBeInLocation('discard');
                expect(context.tielnFighter.damage).toBe(0);
                expect(context.tielnFighter.isUpgraded()).toBe(false);

                expect(getShieldLocationsSorted(context.shields)).toEqual(['outside the game', 'outside the game']);
            });
        });

        describe('When a shield is created', function() {
            beforeEach(function () {
                contextRef.setupTest({
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
                const { context } = contextRef;

                context.player1.clickCard(context.momentOfPeace);

                expect(context.tielnFighter.upgrades.length).toBe(1);
                const shield = context.tielnFighter.upgrades[0];
                expect(shield.internalName).toBe('shield');
                expect(shield.owner).toBe(context.player1.player);
                expect(shield.controller).toBe(context.player1.player);
            });
        });
    });
});
