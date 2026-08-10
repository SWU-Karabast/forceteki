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
                    player1: { groundArena: ['r2d2#artooooooooo'] }
                });
                const { context } = contextRef;

                // R2-D2's "can be played on a Vehicle with a Pilot" ability is active from any zone; while
                // he's a visible in-play unit it should be surfaced to everyone
                expect(context.r2d2).toHaveOngoingEffect('This upgrade can be played on a friendly Vehicle unit with a Pilot on it.');
            });

            it('hides an effect sourced from a hidden zone so the card is not leaked', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: { hand: ['r2d2#artooooooooo'] }
                });
                const { context } = contextRef;

                // R2-D2's ability is active from any zone, but he's in hand - it must stay hidden from the
                // default (spectator) perspective the matchers use
                expect(context.r2d2).toHaveNoOngoingEffects();
            });

            it('never surfaces an effect sourced from a facedown resource, even to its controller', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: { resources: ['r2d2#artooooooooo', 'atst', 'atst', 'atst', 'atst'] }
                });
                const { context } = contextRef;

                // R2-D2's ability is active from any zone, but as a blanked resource it must not appear as a
                // board effect for anyone - not even its controller
                expect(context.r2d2).toHaveNoOngoingEffects();
                expect(context.r2d2).toHaveNoOngoingEffectsForPlayer(context.player1);
            });

            it('shows an effect sourced from a hidden zone to the card\'s controller but not the opponent', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: { hand: ['r2d2#artooooooooo'] }
                });
                const { context } = contextRef;

                // R2-D2 is active-from-hand for player1, so only player1 may see the effect (and its own
                // hidden-zone card as the target); player2 must not have it leaked to them
                expect(context.r2d2).toHaveExactOngoingEffectsForPlayer(context.player1, [
                    { description: 'This upgrade can be played on a friendly Vehicle unit with a Pilot on it.', targets: [context.r2d2] }
                ]);
                expect(context.r2d2).toHaveNoOngoingEffectsForPlayer(context.player2);
            });

            it('flags a hidden-zone effect as controller-only but leaves a visible in-play effect unflagged', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['r2d2#artooooooooo'],
                        spaceArena: ['millennium-falcon#get-out-and-push']
                    }
                });
                const { context } = contextRef;

                const summariesForController = context.game.ongoingEffectEngine
                    .summarizeOngoingEffectsForState(context.player1.player);

                // the hand R2-D2's ability is only sent to its controller, so it must be flagged
                const handR2D2Effect = summariesForController
                    .find((summary) => summary.sourceCardUuid === context.r2d2.uuid);
                expect(handR2D2Effect.hiddenFromOpponent).toBe(true);

                // the in-play Falcon's effects are visible to both players, so they must not be flagged
                const arenaFalconEffects = summariesForController
                    .filter((summary) => summary.sourceCardUuid === context.millenniumFalcon.uuid);
                expect(arenaFalconEffects.length).toBeGreaterThan(0);
                expect(arenaFalconEffects.every((summary) => !summary.hiddenFromOpponent)).toBe(true);
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

        describe('excluded effects', function() {
            it('omits an "enters play ready" effect even from a visible in-play card', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: { spaceArena: ['millennium-falcon#piece-of-junk'] }
                });
                const { context } = contextRef;

                // the Falcon's only ability is "enters play ready", which describes how it already entered
                // play - it carries no useful board information and is never surfaced
                expect(context.millenniumFalcon).toHaveNoOngoingEffects();
            });

            it('omits a self cost-adjuster constant ability, even from a visible discard pile', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: { discard: ['mastery'] }
                });
                const { context } = contextRef;

                // Mastery's discount only changes the cost to play Mastery itself, so it is noise in every
                // zone (here the discard pile, which is visible to everyone)
                expect(context.mastery).toHaveNoOngoingEffects();
            });

            it('omits a setup-only starting-hand base ability', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: { base: 'colossus' }
                });
                const { context } = contextRef;

                // Colossus only modifies the starting hand size during setup and is inert afterwards
                expect(context.p1Base).toHaveNoOngoingEffects();
            });

            it('omits setup-only starting-hand and mulligan base abilities', async function() {
                // Nabat Village's no-mulligan effect changes the setup flow, so this can't use the action-phase
                // auto-setup; the base and its constant abilities are already in play during the setup phase
                await contextRef.setupTestAsync({
                    phase: 'setup',
                    player1: { base: 'nabat-village' }
                });
                const { context } = contextRef;

                // Nabat Village's starting-hand and no-mulligan effects are both setup-only
                expect(context.p1Base).toHaveNoOngoingEffects();
            });

            it('still surfaces a board-relevant cost-adjuster constant ability that discounts other cards', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: { groundArena: ['jabba-the-hutt#cunning-daimyo'] }
                });
                const { context } = contextRef;

                // this discount applies to other cards the player plays (Trick events), so unlike a self
                // cost adjuster it is genuine board information and must still be shown
                expect(context.jabbaTheHutt).toHaveOngoingEffect('Each Trick event you play costs 1 resource less');
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
