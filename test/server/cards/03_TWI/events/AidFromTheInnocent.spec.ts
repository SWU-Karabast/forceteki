describe('Aid From the Innocent ', function() {
    integration(function(contextRef) {
        describe('Cobb Vanth, The Marshal\'s ability', function() {
            it('should search the deck for a card and make it playable for free for the phase', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['aid-from-the-innocent'],
                        deck: ['sabine-wren#explosives-artist', 'battlefield-marine', 'waylay', 'rebel-assault', 'patrolling-vwing', 'devotion',
                            'drop-in', 'hello-there', 'swoop-racer', 'resupply', 'superlaser-technician'],
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

                context.player2.passAction();

                const p1Resources = context.player1.readyResourceCount;

                // Play the other card
                context.player1.clickCard(context.helloThere);
                expect(context.player1.readyResourceCount).toBe(p1Resources);

                context.player2.passAction();

                // Play one of the cards
                context.player1.clickCard(context.dropIn);
                expect(context.player1.readyResourceCount).toBe(p1Resources);

                const cloneTroopers = context.player1.findCardsByName('clone-trooper');
                expect(cloneTroopers.length).toBe(2);
            });
        });
    });
});
