describe('Snap Wexley, Resistance Recon Flier', function() {
    integration(function(contextRef) {
        describe('Snap Wexley\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['snap-wexley#resistance-recon-flier', 'poe-dameron#quick-to-improvise', 'black-one#straight-at-them', 'battlefield-marine'],
                        spaceArena: ['green-squadron-awing'],
                        deck: ['atst', 'wampa', 'protector', 'fireball#an-explosion-with-wings', 'determined-recruit', 'bb8#happy-beeps'],
                        base: 'echo-base',
                        leader: 'sabine-wren#galvanized-revolutionary'
                    },
                });
            });

            it('when played as upgrade should look for a resistance card on the top 5 card of deck', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.snapWexley);
                context.player1.clickPrompt('Play Snap Wexley with Piloting');
                context.player1.clickCard(context.greenSquadronAwing);

                expect(context.player1).toHaveExactDisplayPromptCards({
                    selectable: [context.fireball, context.determinedRecruit],
                    invalid: [context.atst, context.wampa, context.protector]
                });
                expect(context.player1).not.toHaveEnabledPromptButton('Done');
                expect(context.player1).toHaveEnabledPromptButton('Take nothing');

                context.player1.clickCardInDisplayCardPrompt(context.fireball);

                expect(context.player2).toBeActivePlayer();
                expect(context.fireball).toBeInZone('hand');
                expect(context.getChatLogs(2)).toContain('player1 takes Fireball');
                expect([context.atst, context.wampa, context.protector, context.determinedRecruit]).toAllBeInBottomOfDeck(context.player1, 4);
            });

            it('when played as unit and on attack should decrease the cost of the next resistance card by 1', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.snapWexley);
                context.player1.clickPrompt('Play Snap Wexley');

                context.player2.passAction();

                let resourceCount = context.player1.exhaustedResourceCount;

                // play a non-resistance card to check trait filter
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.player1.exhaustedResourceCount - resourceCount).toBe(2);

                context.player2.passAction();

                resourceCount = context.player1.exhaustedResourceCount;
                context.player1.clickCard(context.poeDameron);
                expect(context.player1.exhaustedResourceCount - resourceCount).toBe(4);

                context.player2.passAction();

                context.readyCard(context.snapWexley);
                context.player1.clickCard(context.snapWexley);
                context.player1.clickCard(context.p2Base);

                context.player2.passAction();

                resourceCount = context.player1.exhaustedResourceCount;

                context.player1.clickCard(context.blackOne);

                expect(context.player1.exhaustedResourceCount - resourceCount).toBe(1);
            });
        });
    });
});