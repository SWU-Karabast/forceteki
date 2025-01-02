describe('In Pursuit', function() {
    integration(function(contextRef) {
        describe('In Pursuit\'s ability', function() {
            it('should exhaust an enemy unit if you exhaust a friendly unit', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['in-pursuit'],
                        groundArena: ['battlefield-marine'],
                        spaceArena: [{ card: 'green-squadron-awing', exhausted: true }]
                    },
                    player2: {
                        groundArena: [{ card: 'pyke-sentinel', exhausted: true }],
                        spaceArena: ['inferno-four#unforgetting']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.inPursuit);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.greenSquadronAwing]);

                context.player1.clickCard(context.battlefieldMarine);
                expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel, context.infernoFour]);

                context.player1.clickCard(context.infernoFour);
                expect(context.battlefieldMarine.exhausted).toBe(true);
                expect(context.infernoFour.exhausted).toBe(true);
            });

            it('should not exhaust an enemy unit if you select an already exhausted friendly unit', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['in-pursuit'],
                        groundArena: ['battlefield-marine'],
                        spaceArena: [{ card: 'green-squadron-awing', exhausted: true }]
                    },
                    player2: {
                        spaceArena: ['inferno-four#unforgetting']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.inPursuit);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.greenSquadronAwing]);

                context.player1.clickCard(context.greenSquadronAwing);
                expect(context.player2).toBeActivePlayer();
                expect(context.infernoFour.exhausted).toBe(false);
            });

            it('should not exhaust an enemy unit if you can not exhaust a friendly unit', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['in-pursuit'],
                        spaceArena: [{ card: 'green-squadron-awing', exhausted: true }]
                    },
                    player2: {
                        groundArena: [{ card: 'pyke-sentinel', exhausted: true }],
                        spaceArena: ['inferno-four#unforgetting']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.inPursuit);
                expect(context.player2).toBeActivePlayer();
                expect(context.infernoFour.exhausted).toBe(false);
            });
        });
    });
});