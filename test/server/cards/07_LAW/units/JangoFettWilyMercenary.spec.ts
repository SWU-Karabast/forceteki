describe('Jango Fett, Wily Mercenary', function() {
    integration(function(contextRef) {
        describe('Jango Fett, Wily Mercenary\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['academy-training'],
                        groundArena: ['jango-fett#wily-mercenary'],
                        spaceArena: ['green-squadron-awing'],
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['cartel-spacer'],
                        leader: { card: 'mace-windu#vaapad-form-master', deployed: true },
                    }
                });
            });

            it('should exhaust an enemy unit when upgraded', function () {
                const { context } = contextRef;

                // Attack base, Jango Fett is not upgraded, he cannot exhaust an enemy unit
                context.player1.clickCard(context.jangoFettWilyMercenary);
                context.player1.clickCard(context.p2Base);
                expect(context.player2).toBeActivePlayer();
                expect(context.wampa.exhausted).toBe(false);
                context.readyCard(context.jangoFettWilyMercenary);
                context.player2.passAction();

                // Upgrade Jango Fett and attack base
                context.player1.clickCard(context.academyTraining);
                context.player1.clickCard(context.jangoFettWilyMercenary);
                context.player2.passAction();
                context.player1.clickCard(context.jangoFettWilyMercenary);
                context.player1.clickCard(context.p2Base);

                // Jango Fett should be able to select ground unit to exhaust
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.cartelSpacer, context.maceWindu]);
                expect(context.player1).not.toHavePassAbilityButton();
                context.player1.clickCard(context.wampa);

                expect(context.wampa.exhausted).toBe(true);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
