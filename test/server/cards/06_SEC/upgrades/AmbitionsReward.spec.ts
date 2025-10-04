describe('Ambition\'s Reward', function() {
    integration(function(contextRef) {
        describe('Ambition\'s Reward\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['ambitions-reward'],
                        groundArena: ['battlefield-marine', 'wampa'],
                    },
                    player2: {
                        groundArena: ['atst']
                    }
                });
            });

            it('should create a spy token when attached to a friendly unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.ambitionsReward);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.wampa, context.atst]);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.player2).toBeActivePlayer();
                const spy = context.player1.findCardsByName('spy');
                expect(spy.length).toBe(1);
                expect(spy[0]).toBeInZone('groundArena');
                expect(spy[0].exhausted).toBeTrue();

                context.player2.clickPrompt('Pass');
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(4);

                expect(context.player2).toBeActivePlayer();
            });

            it('should create a spy token for the controller when attached to an enemy unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.ambitionsReward);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.wampa, context.atst]);
                context.player1.clickCard(context.atst);

                expect(context.player2).toBeActivePlayer();
                const spy = context.player1.findCardsByName('spy');
                expect(spy.length).toBe(1);
                expect(spy[0]).toBeInZone('groundArena');
                expect(spy[0].exhausted).toBeTrue();

                context.player2.clickCard(context.atst);
                context.player2.clickCard(context.p1Base);
                expect(context.p1Base.damage).toBe(7);

                expect(context.player1).toBeActivePlayer();
            });
        });
    });
});