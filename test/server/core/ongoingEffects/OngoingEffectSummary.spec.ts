describe('Ongoing effect summary', function() {
    integration(function(contextRef) {
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

                expect(context.qira).toHaveOngoingEffect(
                    'While this unit is in play, each card named Battlefield Marine costs 3 resources more for your opponents to play'
                );
            });

            it('shows an effect sourced from a visible in-play card, even one active from any zone', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: { spaceArena: ['millennium-falcon#piece-of-junk'] }
                });
                const { context } = contextRef;

                expect(context.millenniumFalcon).toHaveOngoingEffect('This unit enters play ready');
            });

            it('hides an effect sourced from a hidden zone so the card is not leaked', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: { hand: ['millennium-falcon#piece-of-junk'] }
                });
                const { context } = contextRef;

                // "enters play ready" is active from any zone, but the Falcon is in hand - it must stay hidden
                // from the default (spectator) perspective the matchers use
                expect(context.millenniumFalcon).toHaveNoOngoingEffects();
            });

            it('never surfaces an effect sourced from a facedown resource, even to its controller', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: { resources: ['millennium-falcon#piece-of-junk', 'atst', 'atst', 'atst', 'atst'] }
                });
                const { context } = contextRef;

                // the Falcon's "enters play ready" is active from any zone, but as a blanked resource it must
                // not appear as a board effect for anyone - not even its controller
                expect(context.millenniumFalcon).toHaveNoOngoingEffects();
                expect(context.millenniumFalcon).toHaveNoOngoingEffectsForPlayer(context.player1);
            });

            it('shows an effect sourced from a hidden zone to the card\'s controller but not the opponent', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: { hand: ['millennium-falcon#piece-of-junk'] }
                });
                const { context } = contextRef;

                // the Falcon is active-from-hand for player1, so only player1 may see the effect (and its
                // own hidden-zone card as the target); player2 must not have it leaked to them
                expect(context.millenniumFalcon).toHaveExactOngoingEffectsForPlayer(context.player1, [
                    { description: 'This unit enters play ready', targets: [context.millenniumFalcon] }
                ]);
                expect(context.millenniumFalcon).toHaveNoOngoingEffectsForPlayer(context.player2);
            });

            it('uses the lasting effect\'s explicit title for a modal-choice effect (ability title is just a header)', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: { hand: ['cunning'], groundArena: ['battlefield-marine'] },
                    player2: { hand: ['wampa'] }
                });
                const { context } = contextRef;

                // Cunning picks 2 modal options; only the +4/+0 one leaves an ongoing effect, and it sets
                // an explicit `title` since the ability title ("Cunning modal ability:") is just a header
                context.player1.clickCard(context.cunning);
                context.player1.clickPrompt('Give a unit +4/+0 for this phase');
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickPrompt('An opponent discards a random card from their hand');

                expect(context.cunning).toHaveOngoingEffect('Gets +4/+0 for this phase');
            });

            it('uses the lasting effect\'s explicit title for an effect built inside a Select choice handler', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: { hand: ['lawbringer#shadow-over-lothal'] },
                    player2: { groundArena: ['atst'] }
                });
                const { context } = contextRef;

                // Lawbringer's -2/-2 lasting effect lives in a Select choices handler, so without an explicit
                // title the summary would fall back to the generic "Choose an aspect..." ability header
                context.player1.clickCard(context.lawbringer);
                context.player1.clickPrompt('Villainy');

                expect(context.lawbringer).toHaveOngoingEffect('Each enemy Villainy unit gets -2/-2 for this phase');
            });

            it('uses the lasting effect\'s explicit title for a keyword chosen via Select', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: { hand: ['admiral-yularen#fleet-coordinator'], spaceArena: ['cartel-spacer'] }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.admiralYularen);
                context.player1.clickPrompt('Sentinel');

                expect(context.admiralYularen).toHaveOngoingEffect('Each friendly Vehicle unit gains Sentinel while this unit is in play');
            });

            it('describes each constant ability of a unit using its ability title', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: { spaceArena: ['millennium-falcon#get-out-and-push'] }
                });
                const { context } = contextRef;

                expect(context.millenniumFalcon).toHaveExactOngoingEffects([
                    'You may play or deploy 1 additional Pilot on this unit',
                    'This unit gets +1/+0 for each Pilot on it'
                ]);
            });
        });

        describe('abilities and keywords granted to an attached unit', function() {
            it('names the numeric keyword an upgrade grants to its attached unit', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: { groundArena: [{ card: 'battlefield-marine', upgrades: ['devotion'] }] }
                });
                const { context } = contextRef;

                expect(context.devotion).toHaveOngoingEffect('Give Restore 2 to the attached unit');
            });

            it('names the non-numeric keyword an upgrade grants to its attached unit', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: { groundArena: [{ card: 'battlefield-marine', upgrades: ['protector'] }] }
                });
                const { context } = contextRef;

                expect(context.protector).toHaveOngoingEffect('Give Sentinel to the attached unit');
            });

            it('describes the triggered ability an upgrade grants to its attached unit', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: { groundArena: [{ card: 'battlefield-marine', upgrades: ['battle-fury'] }] }
                });
                const { context } = contextRef;

                expect(context.battleFury).toHaveOngoingEffect('Give “On Attack: Discard a card from your hand” to the attached unit');
            });
        });

        describe('delayed effects', function() {
            it('describes a delayed effect using its own title', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: { hand: ['sneak-attack', 'wampa'] }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.sneakAttack);
                context.player1.clickCard(context.wampa);

                // the lingering delayed effect is the "defeat it at regroup" part, sourced from the event
                expect(context.sneakAttack).toHaveOngoingEffect('Defeat Wampa');
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

                // object form also asserts the effect's targets (resolved from card objects to uuids)
                expect(context.changeOfHeart).toHaveOngoingEffect({
                    description: 'Owner takes control',
                    targets: [context.battlefieldMarine],
                });
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
                expect(context.gnkPowerDroid).toHaveOngoingEffect('The next unit you play this phase costs 1 resource less');

                // playing a unit consumes the once-per-game limit, so the spent effect should no longer be shown
                context.player2.passAction();
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.gnkPowerDroid).toHaveNoOngoingEffects();
            });
        });
    });
});
