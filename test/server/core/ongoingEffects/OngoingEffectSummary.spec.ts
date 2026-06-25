describe('Ongoing effect summary', function() {
    integration(function(contextRef) {
        function summaryFor(context) {
            return context.game.ongoingEffectEngine.summarizeOngoingEffectsForState();
        }

        function descriptionsFor(context, sourceCard) {
            return summaryFor(context)
                .filter((entry) => entry.sourceCardUuid === sourceCard.uuid)
                .map((entry) => entry.source.effectDescription);
        }

        describe('description resolution', function() {
            it('describes a lasting effect using the title of the ability that created it', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: { hand: ['qira#playing-her-part'] },
                    player2: { hand: ['battlefield-marine'] }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.qira);
                context.player1.clickPrompt('Done');
                context.player1.chooseListOption('Battlefield Marine');

                expect(descriptionsFor(context, context.qira)).toContain(
                    'While this unit is in play, each card with that name costs 3 resources more for your opponents to play'
                );
            });

            it('describes each constant ability of a unit using its ability title', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: { spaceArena: ['millennium-falcon#get-out-and-push'] },
                    player2: {}
                });
                const { context } = contextRef;

                expect(descriptionsFor(context, context.millenniumFalcon)).toEqual([
                    'You may play or deploy 1 additional Pilot on this unit',
                    'This unit gets +1/+0 for each Pilot on it'
                ]);
            });
        });

        describe('use-limited effects', function() {
            it('drops a cost-adjusting effect from the summary once its limit is reached', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: { groundArena: ['gnk-power-droid'], hand: ['battlefield-marine'] },
                    player2: { groundArena: ['wampa'] }
                });
                const { context } = contextRef;

                // GNK's "next unit costs 1 less" effect is created on attack
                context.player1.clickCard(context.gnkPowerDroid);
                context.player1.clickCard(context.p2Base);
                expect(descriptionsFor(context, context.gnkPowerDroid)).toContain('discount the next unit played by');

                // playing a unit consumes the once-per-game limit, so the spent effect should no longer be shown
                context.player2.passAction();
                context.player1.clickCard(context.battlefieldMarine);
                expect(descriptionsFor(context, context.gnkPowerDroid)).toEqual([]);
            });
        });
    });
});
