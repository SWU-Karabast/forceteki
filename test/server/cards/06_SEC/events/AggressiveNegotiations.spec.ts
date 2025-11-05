describe('Aggressive Negotiations', function () {
    integration(function (contextRef) {
        describe('Aggressive Negotiations\'s ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['aggressive-negotiations', 'wampa', 'atst'],
                        groundArena: ['rugged-survivors', { card: 'battlefield-marine', upgrades: ['battle-fury'] }],
                        leader: { card: 'chirrut-imwe#one-with-the-force', deployed: true }
                    },
                });
            });

            it('should initiate an attack and give the attacker +1/+0 for each card in your hand', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.aggressiveNegotiations);
                context.player1.clickCard(context.chirrutImwe);
                context.player1.clickCard(context.p2Base);

                expect(context.player2).toBeActivePlayer();
                expect(context.player1.hand.length).toBe(2);
                expect(context.p2Base.damage).toBe(5);
                expect(context.ruggedSurvivors.getPower()).toBe(3);
            });

            it('should initiate an attack and give the attacker +1/+0 for each card in your hand, without updating for cards drawn during on-attack', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.aggressiveNegotiations);
                context.player1.clickCard(context.ruggedSurvivors);
                context.player1.clickCard(context.p2Base);
                context.player1.clickPrompt('Trigger');

                expect(context.player2).toBeActivePlayer();
                expect(context.player1.hand.length).toBe(3);
                expect(context.p2Base.damage).toBe(5);
                expect(context.ruggedSurvivors.getPower()).toBe(3);
            });

            it('should initiate an attack and give the attacker +1/+0 for each card in your hand, without updating for cards discarded during on-attack', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.aggressiveNegotiations);
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);

                // choose card to discard for Battle Fury effect
                context.player1.clickCard(context.wampa);

                expect(context.player2).toBeActivePlayer();
                expect(context.player1.hand.length).toBe(1);
                expect(context.p2Base.damage).toBe(8);
                expect(context.ruggedSurvivors.getPower()).toBe(3);
            });
        });
    });
});
