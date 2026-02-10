describe('Shadow of Stygeon Prime', function() {
    integration(function(contextRef) {
        describe('Shadow of Stygeon Prime\'s ability', function() {
            it('should exhaust attached unit and restrict it to be ready', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['shadow-of-stygeon-prime'],
                        groundArena: ['wampa']
                    },
                    player2: {
                        hand: ['keep-fighting', 'keep-fighting'],
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['green-squadron-awing'],
                        leader: { card: 'sabine-wren#galvanized-revolutionary', deployed: true }
                    }
                });
                const { context } = contextRef;

                const keepFightingCards = context.player2.findCardsByName('keep-fighting', 'hand');

                context.player1.clickCard(context.shadowOfStygeonPrime);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.battlefieldMarine, context.greenSquadronAwing]);
                context.player1.clickCard(context.battlefieldMarine);

                context.player2.clickCard(context.battlefieldMarine);
                context.player2.clickCard(context.p1Base);

                expect(context.battlefieldMarine.exhausted).toBeTrue();
                expect(context.wampa.exhausted).toBeFalse();
                expect(context.greenSquadronAwing.exhausted).toBeFalse();
                expect(context.sabineWren.exhausted).toBeFalse();
                context.player1.clickPrompt('Pass');

                // play keep fighting on battlefield marine
                context.player2.clickCard(keepFightingCards[0]);
                context.player2.clickCardNonChecking(context.battlefieldMarine);
                expect(context.battlefieldMarine.exhausted).toBeTrue();

                // battlefield marine should not be ready on regroup phase
                context.player1.clickPrompt('Claim initiative');
                context.player2.clickPrompt('Pass');
                expect(context.battlefieldMarine.exhausted).toBeTrue();
                expect(context.p2Base.damage).toBe(2);
                context.player1.clickPrompt('Done');
                context.player2.clickPrompt('Done');

                context.player1.passAction();
                // play keep fighting on battlefield marine
                context.player2.clickCard(keepFightingCards[1]);
                context.player2.clickCardNonChecking(context.battlefieldMarine);
                expect(context.battlefieldMarine.exhausted).toBeTrue();
            });
        });
    });
});