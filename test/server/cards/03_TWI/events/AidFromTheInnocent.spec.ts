describe('Aid From the Innocent ', function() {
    integration(function(contextRef) {
        describe('Aid From the Innocent\'s ability', function() {
            it('should search the top 10 cards of your deck for 2 Heroism non-unit cards and discard them. They can be played from discard for 2 less this phase', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'han-solo#audacious-smuggler',
                        base: 'dagobah-swamp',
                        hand: ['aid-from-the-innocent'],
                        deck: ['sabine-wren#explosives-artist', 'battlefield-marine', 'waylay', 'rebel-assault', 'patrolling-vwing', 'devotion',
                            'drop-in', 'hello-there', 'swoop-racer', 'resupply', 'superlaser-technician'],
                        resources: 20
                    },
                    player2: {
                        spaceArena: ['system-patrol-craft'],
                        groundArena: ['wampa']
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.aidFromTheInnocent);
                expect(context.player1).toHaveExactDisplayPromptCards({
                    invalid: [context.sabineWren, context.battlefieldMarine, context.waylay, context.patrollingVwing, context.devotion, context.swoopRacer, context.resupply],
                    selectable: [context.rebelAssault, context.helloThere, context.dropIn]
                });
                expect(context.player1).toHaveEnabledPromptButton('Take nothing');

                // Select two cards
                context.player1.clickCardInDisplayCardPrompt(context.dropIn);
                expect(context.player1).toHaveEnabledPromptButton('Done');
                context.player1.clickCardInDisplayCardPrompt(context.helloThere);
                expect(context.player1).toHaveEnabledPromptButton('Done');

                // one click to confirm that additional cards can't be selected
                context.player1.clickCardInDisplayCardPrompt(context.rebelAssault, true);

                context.player1.clickPrompt('Done');

                expect(context.dropIn).toBeInZone('discard');
                expect(context.helloThere).toBeInZone('discard');
                expect(context.player1.readyResourceCount).toBe(15);

                context.player2.passAction();

                // Play the other card
                context.player1.clickCard(context.helloThere);
                expect(context.player1.readyResourceCount).toBe(14);

                context.player2.passAction();

                // Play one of the cards
                context.player1.clickCard(context.dropIn);
                const cloneTroopers = context.player1.findCardsByName('clone-trooper');
                expect(cloneTroopers.length).toBe(2);
                expect(context.player1.readyResourceCount).toBe(12);
            });
        });
    });
});
