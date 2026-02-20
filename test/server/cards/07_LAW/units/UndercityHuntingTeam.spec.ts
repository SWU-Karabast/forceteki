describe('Undercity Hunting Team', function() {
    integration(function(contextRef) {
        describe('Undercity Hunting Team\'s ability', function() {
            it('should search top 5 cards for a Bounty Hunter unit and draw it', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['undercity-hunting-team'],
                        deck: ['boba-fett#disintegrator', 'bossk#deadly-stalker', 'wampa', 'battlefield-marine', 'rebel-pathfinder', 'atst']
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.undercityHuntingTeam);

                expect(context.player1).toHaveExactDisplayPromptCards({
                    selectable: [context.bobaFett, context.bossk],
                    invalid: [context.wampa, context.battlefieldMarine, context.rebelPathfinder],
                });
                expect(context.player1).toHaveEnabledPromptButton('Take nothing');

                context.player1.clickCardInDisplayCardPrompt(context.bobaFett);

                expect(context.player2).toBeActivePlayer();
                expect(context.bobaFett).toBeInZone('hand', context.player1);
                expect([context.bossk, context.wampa, context.battlefieldMarine, context.rebelPathfinder]).toAllBeInBottomOfDeck(context.player1, 4);
            });

            it('should not search top 5 cards if deck is empty', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['undercity-hunting-team'],
                        groundArena: ['rebel-pathfinder'],
                        deck: []
                    },
                });
                const { context } = contextRef;

                context.player1.clickCard(context.undercityHuntingTeam);
                expect(context.player2).toBeActivePlayer();
                expect(context.p1Base.damage).toBe(0);
            });

            it('should search top 5 cards for a Bounty Hunter unit (no valid selection, and fewer deck length)', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['undercity-hunting-team'],
                        deck: ['wampa']
                    },
                });
                const { context } = contextRef;

                context.player1.clickCard(context.undercityHuntingTeam);

                expect(context.player1).toHaveExactDisplayPromptCards({
                    invalid: [context.wampa],
                });
                context.player1.clickPrompt('Take nothing');

                expect(context.player2).toBeActivePlayer();
                expect(context.wampa).toBeInBottomOfDeck(context.player1, 1);
            });
        });
    });
});
