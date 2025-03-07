describe('Shield', function() {
    integration(function(contextRef) {
        describe('Shield\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
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

                expect(context.shield).toBeInZone('outsideTheGame');
                expect(context.tielnFighter.isUpgraded()).toBe(false);

                // second attack to confirm that shield effect is off
                context.player2.clickCard(context.tielnFighter);
                context.player2.clickCard(context.cartelSpacer);
                expect(context.cartelSpacer).toBeInZone('discard');
                expect(context.tielnFighter).toBeInZone('discard');
            });

            it('should be removed from the game when the attached unit is defeated', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.vanquish);
                context.player1.clickCard(context.tielnFighter);

                expect(context.tielnFighter).toBeInZone('discard');
                expect(context.shield).toBeInZone('outsideTheGame');
            });
        });

        describe('Shield\'s ability', function() {
            beforeEach(async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['cartel-spacer']
                    },
                    player2: {
                        spaceArena: [{ card: 'tieln-fighter', upgrades: ['shield', 'shield'] }]
                    }
                });

                const { context } = contextRef;
                context.shields = context.player2.findCardsByName('shield');
            });

            it('should defeat itself to prevent damage to the attached unit', function () {
                const { context } = contextRef;

                const getShieldZonesSorted = (shields) => shields.map((shield) => shield.zoneName).sort();

                context.player1.clickCard(context.cartelSpacer);
                context.player1.clickCard(context.tielnFighter);

                expect(context.cartelSpacer.damage).toBe(2);
                expect(context.tielnFighter.damage).toBe(0);
                expect(context.tielnFighter).toHaveExactUpgradeNames(['shield']);

                expect(getShieldZonesSorted(context.shields)).toEqual(['outsideTheGame', 'spaceArena']);

                // second attack
                context.player2.clickCard(context.tielnFighter);
                context.player2.clickCard(context.cartelSpacer);
                expect(context.cartelSpacer).toBeInZone('discard');
                expect(context.tielnFighter.damage).toBe(0);
                expect(context.tielnFighter.isUpgraded()).toBe(false);

                expect(getShieldZonesSorted(context.shields)).toEqual(['outsideTheGame', 'outsideTheGame']);
            });
        });

        describe('When a shield is created', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['moment-of-peace']
                    },
                    player2: {
                        spaceArena: ['tieln-fighter']
                    },

                    // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                    autoSingleTarget: true
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
