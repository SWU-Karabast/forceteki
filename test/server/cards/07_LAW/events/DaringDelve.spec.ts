describe('Daring Delve', function() {
    integration(function(contextRef) {
        describe('Daring Delve\'s ability', function() {
            it('should discard 2 cards and allow returning an Aggression card to hand', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['daring-delve'],
                        deck: ['wampa', 'green-squadron-awing'],
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.daringDelve);
                expect(context.wampa).toBeInZone('discard', context.player1);
                expect(context.greenSquadronAwing).toBeInZone('discard', context.player1);

                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.greenSquadronAwing]);
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickCard(context.wampa);

                expect(context.player2).toBeActivePlayer();
                expect(context.wampa).toBeInZone('hand', context.player1);
            });

            it('should discard 2 cards and allow returning an Aggression card to hand (only 1 Aggression card)', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['daring-delve'],
                        deck: ['wampa', 'atst'],
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.daringDelve);
                expect(context.wampa).toBeInZone('discard', context.player1);
                expect(context.atst).toBeInZone('discard', context.player1);

                expect(context.player1).toBeAbleToSelectExactly([context.wampa]);
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickCard(context.wampa);

                expect(context.player2).toBeActivePlayer();
                expect(context.wampa).toBeInZone('hand', context.player1);
            });

            it('should discard 2 cards from deck and allow returning an Aggression card (no Aggression card)', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['daring-delve'],
                        deck: ['battlefield-marine', 'atst'],
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.daringDelve);

                expect(context.player2).toBeActivePlayer();
                expect(context.battlefieldMarine).toBeInZone('discard', context.player1);
                expect(context.atst).toBeInZone('discard', context.player1);
            });

            it('should discard 2 cards from deck and allow returning an Aggression card (empty deck)', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['daring-delve'],
                        deck: [],
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.daringDelve);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
