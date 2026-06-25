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
                    'While this unit is in play, each card named Battlefield Marine costs 3 resources more for your opponents to play'
                );
            });

            it('shows an effect sourced from a visible in-play card, even one active from any zone', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: { spaceArena: ['millennium-falcon#piece-of-junk'] },
                    player2: {}
                });
                const { context } = contextRef;

                expect(descriptionsFor(context, context.millenniumFalcon)).toContain('This unit enters play ready');
            });

            it('hides an effect sourced from a hidden zone so the card is not leaked', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: { hand: ['millennium-falcon#piece-of-junk'] },
                    player2: {}
                });
                const { context } = contextRef;

                // "enters play ready" is active from any zone, but the Falcon is in hand - it must stay hidden
                expect(descriptionsFor(context, context.millenniumFalcon)).toEqual([]);
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

        describe('delayed effects', function() {
            it('describes a delayed effect using its own title', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: { hand: ['sneak-attack', 'wampa'] },
                    player2: {}
                });
                const { context } = contextRef;

                context.player1.clickCard(context.sneakAttack);
                context.player1.clickCard(context.wampa);

                // the lingering delayed effect is the "defeat it at regroup" part, sourced from the event
                expect(descriptionsFor(context, context.sneakAttack)).toContain('Defeat Wampa');
            });

            it('describes a delayed control-change effect with its title rather than its chat text', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: { hand: ['change-of-heart'] },
                    player2: { groundArena: ['battlefield-marine'] }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.changeOfHeart);
                context.player1.clickCard(context.battlefieldMarine);

                expect(descriptionsFor(context, context.changeOfHeart)).toContain('Owner takes control');
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
                expect(descriptionsFor(context, context.gnkPowerDroid)).toContain('The next unit you play this phase costs 1 resource less');

                // playing a unit consumes the once-per-game limit, so the spent effect should no longer be shown
                context.player2.passAction();
                context.player1.clickCard(context.battlefieldMarine);
                expect(descriptionsFor(context, context.gnkPowerDroid)).toEqual([]);
            });
        });
    });
});
