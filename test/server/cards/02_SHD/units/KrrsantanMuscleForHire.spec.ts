describe('Krrsantan, Muscle For Hire', function() {
    integration(function(contextRef) {
        describe('Krrsantan\'s Bounty ability', function() {
            it('should ready when played while opponent has a unit with bounty', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['krrsantan#muscle-for-hire']
                    },
                    player2: {
                        groundArena: ['hylobon-enforcer']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.krrsantan);
                context.player1.clickPrompt('If an enemy unit has a Bounty, you may ready this unit');
                expect(context.player2).toBeActivePlayer();
                expect(context.krrsantan.exhausted).toBeFalse();
            });

            it('should not ready when played while opponent does not have a unit with bounty', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['krrsantan#muscle-for-hire']
                    },
                    player2: {
                        groundArena: ['battlefield-marine']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.krrsantan);
                expect(context.player2).toBeActivePlayer();
                expect(context.krrsantan.exhausted).toBeTrue();
            });

            it('should not deal damage if krrsantan have no damage on him', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['krrsantan#muscle-for-hire']
                    },
                    player2: {
                        groundArena: ['battlefield-marine']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.krrsantan);
                context.player1.clickCard(context.p2Base);
                expect(context.player2).toBeActivePlayer();
            });

            it('should deal damage equal to damage he have', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'krrsantan#muscle-for-hire', damage: 3 }],
                        spaceArena: ['green-squadron-awing']
                    },
                    player2: {
                        groundArena: ['battlefield-marine', 'wampa']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.krrsantan);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.wampa, context.krrsantan]);
                expect(context.player1).toHaveChooseNoTargetButton();

                context.player1.clickCard(context.wampa);
                expect(context.player2).toBeActivePlayer();
                expect(context.wampa.damage).toBe(context.krrsantan.damage);
            });
        });
    });
});
