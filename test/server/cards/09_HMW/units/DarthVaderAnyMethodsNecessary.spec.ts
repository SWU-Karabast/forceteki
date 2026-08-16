describe('Darth Vader Any Methods Necessary', function() {
    integration(function(contextRef) {
        describe('Darth Vader Any Methods Necessary\'s ability', function() {
            it('should search the top 8 cards of your deck for up to 2 units that each cost 4 or less, play them for free, and deal 2 damage to each of them', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'ig88#ruthless-bounty-hunter',
                        base: 'energy-conversion-lab',
                        hand: ['darth-vader#any-methods-necessary'],
                        deck: ['wampa', 'village-tender', 'atst', 'battlefield-marine', 'protector', 'rebel-pathfinder', 'resupply', 'porg', 'yoda#old-master']
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.darthVader);

                expect(context.player1).toHaveExactDisplayPromptCards({
                    selectable: [context.wampa, context.villageTender, context.battlefieldMarine, context.rebelPathfinder, context.porg],
                    invalid: [context.protector, context.resupply, context.atst]
                });
                expect(context.player1).toHaveEnabledPromptButton('Take nothing');

                context.player1.clickCardInDisplayCardPrompt(context.wampa);

                expect(context.player1).toHaveExactDisplayPromptCards({
                    selected: [context.wampa],
                    selectable: [context.villageTender, context.battlefieldMarine, context.rebelPathfinder, context.porg],
                    invalid: [context.protector, context.resupply, context.atst]
                });
                expect(context.player1).toHaveEnabledPromptButton('Done');

                context.player1.clickCardInDisplayCardPrompt(context.battlefieldMarine);
                context.player1.clickDone();

                expect(context.player2).toBeActivePlayer();
                expect(context.wampa).toBeInZone('groundArena');
                expect(context.battlefieldMarine).toBeInZone('groundArena');
                expect(context.player1.exhaustedResourceCount).toBe(9);
                expect(context.darthVader.damage).toBe(0);
                expect(context.wampa.damage).toBe(2);
                expect(context.battlefieldMarine.damage).toBe(2);

                expect([context.villageTender, context.rebelPathfinder, context.porg, context.protector, context.resupply, context.atst]).toAllBeInBottomOfDeck(context.player1, 6);
            });

            it('should should be able to select less than 2', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'ig88#ruthless-bounty-hunter',
                        base: 'energy-conversion-lab',
                        hand: ['darth-vader#any-methods-necessary'],
                        deck: ['wampa', 'village-tender', 'atst', 'battlefield-marine', 'protector', 'rebel-pathfinder', 'resupply', 'porg', 'yoda#old-master']
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.darthVader);
                context.player1.clickCardInDisplayCardPrompt(context.wampa);
                context.player1.clickDone();

                expect(context.player2).toBeActivePlayer();
                expect(context.wampa).toBeInZone('groundArena');
                expect(context.player1.exhaustedResourceCount).toBe(9);
                expect(context.darthVader.damage).toBe(0);
                expect(context.wampa.damage).toBe(2);
                expect([context.battlefieldMarine, context.villageTender, context.rebelPathfinder, context.porg, context.protector, context.resupply, context.atst]).toAllBeInBottomOfDeck(context.player1, 7);
            });
        });
    });
});
