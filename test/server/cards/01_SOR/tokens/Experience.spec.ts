describe('Experience', function() {
    integration(function(contextRef) {
        describe('Experience\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        spaceArena: [{ card: 'cartel-spacer', upgrades: ['experience'] }]
                    },
                    player2: {
                        spaceArena: ['valiant-assault-ship']
                    }
                });
            });

            it('should grant the attached unit +1/+1 and be removed from game when unit is defeated', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.cartelSpacer);
                context.player1.clickCard(context.valiantAssaultShip);

                expect(context.cartelSpacer.damage).toBe(3);
                expect(context.valiantAssaultShip.damage).toBe(3);

                // second attack to confirm that experience effect is still on
                context.player2.passAction();
                context.cartelSpacer.exhausted = false;

                context.player1.clickCard(context.cartelSpacer);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(3);

                // third attack to confirm that token goes to discard
                context.player2.passAction();
                context.cartelSpacer.exhausted = false;

                context.player1.clickCard(context.cartelSpacer);
                context.player1.clickCard(context.valiantAssaultShip);
                expect(context.cartelSpacer).toBeInLocation('discard');
                expect(context.valiantAssaultShip).toBeInLocation('discard');
                expect(context.experience).toBeInLocation('outside the game');
            });
        });

        describe('Experience', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['confiscate'],
                        spaceArena: [{ card: 'cartel-spacer', upgrades: ['experience'] }]
                    },
                    player2: {
                    }
                });
            });

            it('should be removed from the game when defeated', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.confiscate);

                // ability will resolve automatically since there's only one legal target
                expect(context.cartelSpacer.isUpgraded()).toBe(false);
                expect(context.experience).toBeInLocation('outside the game');
            });
        });

        describe('When an experience token is created', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['clan-wren-rescuer']
                    },
                    player2: {
                        spaceArena: ['tieln-fighter']
                    }
                });
            });

            it('its owner and controller should be the player who created it', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.clanWrenRescuer);
                context.player1.clickCard(context.tielnFighter);

                expect(context.tielnFighter.upgrades.length).toBe(1);
                const experience = context.tielnFighter.upgrades[0];
                expect(experience.internalName).toBe('experience');
                expect(experience.owner).toBe(context.player1.player);
                expect(experience.controller).toBe(context.player1.player);
            });
        });
    });
});
