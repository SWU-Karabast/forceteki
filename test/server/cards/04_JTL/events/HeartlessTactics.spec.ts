describe('Heartless Tactics', function () {
    integration(function (contextRef) {
        describe('Heartless Tactics\' ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['heartless-tactics'],
                        groundArena: ['wampa']
                    },
                    player2: {
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['red-three#unstoppable'],
                        leader: { card: 'sabine-wren#galvanized-revolutionary', deployed: true }
                    }
                });
            });

            it('should exhaust an enemy unit but not return to hand because it\'s a leader', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.heartlessTactics);

                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.battlefieldMarine, context.redThree, context.sabineWren]);
                context.player1.clickCard(context.sabineWren);

                expect(context.player2).toBeActivePlayer();
                expect(context.sabineWren.exhausted).toBeTrue();
                expect(context.sabineWren.getPower()).toBe(0);
            });

            it('should exhaust an enemy unit and return it to owner\'s hand', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.heartlessTactics);

                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.battlefieldMarine, context.redThree, context.sabineWren]);
                context.player1.clickCard(context.redThree);

                expect(context.redThree.exhausted).toBeTrue();
                expect(context.redThree.getPower()).toBe(0);

                expect(context.player1).toHavePassAbilityPrompt('If it has 0 power and isn\'t a leader, return it to its owner\'s hand');
                context.player1.clickPrompt('Trigger');

                expect(context.player2).toBeActivePlayer();
                expect(context.redThree).toBeInZone('hand');
            });

            it('should exhaust an enemy unit but not return to hand because he has more than 0 power', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.heartlessTactics);

                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.battlefieldMarine, context.redThree, context.sabineWren]);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.player2).toBeActivePlayer();
                expect(context.battlefieldMarine.exhausted).toBeTrue();
                expect(context.battlefieldMarine.getPower()).toBe(1);
            });
        });
    });
});
