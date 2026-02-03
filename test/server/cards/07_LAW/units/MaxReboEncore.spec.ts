
describe('Max Rebo, Encore!', () => {
    integration(function(contextRef) {
        describe('Constant ability', function() {
            beforeEach(async function() {
                const { context } = contextRef;
                context.startingResourceCount = 5;

                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        // Set leader/base for aspects
                        leader: 'sly-moore#cipher-in-the-dark',
                        base: 'data-vault',
                        resources: context.startingResourceCount,
                        hand: [
                            'sneak-attack',
                            'max-rebo#encore'
                        ],
                        groundArena: [
                            'zorii-bliss#valiant-smuggler',
                            'dryden-vos#i-get-all-worked-up'
                        ],
                        deck: [
                            // To have specific cards to check during regroup phase (in alphabetical order)
                            'air-superiority',
                            'beguile',
                            'choose-sides',
                            'daring-raid',
                            'eject',
                            'face-off'
                        ]
                    },
                    player2: {
                        // Set leader/base for aspects
                        leader: 'kazuda-xiono#best-pilot-in-the-galaxy',
                        base: 'data-vault',
                        hand: [
                            'max-rebo#encore',
                            'fireball#an-explosion-with-wings',
                            'contracted-hunter',
                            'arrest',
                            'patient-hunter'
                        ],
                        resources: context.startingResourceCount,
                        deck: [
                            // To have specific cards to check during regroup phase (in alphabetical order)
                            'apology-accepted',
                            'budget-scheming',
                            'change-of-heart',
                            'death-field',
                            'evacuate',
                            'fly-casual'
                        ]
                    }
                });

                context.p1MaxRebo = context.player1.findCardByName('max-rebo#encore');
                context.p2MaxRebo = context.player2.findCardByName('max-rebo#encore');

                // Asign each expected draw card to a variable for easier access
                context.p1Draws = {
                    a: context.player1.findCardByName('air-superiority'),
                    b: context.player1.findCardByName('beguile'),
                    c: context.player1.findCardByName('choose-sides'),
                    d: context.player1.findCardByName('daring-raid'),
                    e: context.player1.findCardByName('eject'),
                    f: context.player1.findCardByName('face-off')
                };

                context.p2Draws = {
                    a: context.player2.findCardByName('apology-accepted'),
                    b: context.player2.findCardByName('budget-scheming'),
                    c: context.player2.findCardByName('change-of-heart'),
                    d: context.player2.findCardByName('death-field'),
                    e: context.player2.findCardByName('evacuate'),
                    f: context.player2.findCardByName('fly-casual')
                };
            });

            it('creates an additional Regroup Phase after the first Regroup Phase each round', function() {
                const { context } = contextRef;

                // P1 plays Max Rebo
                context.player1.clickCard(context.p1MaxRebo);
                expect(context.p1MaxRebo).toBeInZone('groundArena');

                // Move to Regroup Phase
                context.moveToRegroupPhase();

                // First Regroup Phase begins (draw A,B but not C,D)
                expect(context.getChatLog()).toEqual('Round: 1 - Regroup Phase');
                expect(context.p1Draws.a).toBeInZone('hand');
                expect(context.p1Draws.b).toBeInZone('hand');
                expect(context.p2Draws.a).toBeInZone('hand');
                expect(context.p2Draws.b).toBeInZone('hand');
                expect(context.p1Draws.c).toBeInZone('deck');
                expect(context.p1Draws.d).toBeInZone('deck');
                expect(context.p2Draws.c).toBeInZone('deck');
                expect(context.p2Draws.d).toBeInZone('deck');

                // Each player resources A
                context.player1.clickCard(context.p1Draws.a);
                context.player1.clickDone();
                context.player2.clickCard(context.p2Draws.a);
                context.player2.clickDone();
                expect(context.p1Draws.a).toBeInZone('resource');
                expect(context.p2Draws.a).toBeInZone('resource');
                expect(context.player1.resources.length).toBe(context.startingResourceCount + 1);
                expect(context.player2.resources.length).toBe(context.startingResourceCount + 1);

                // Second Regroup Phase begins (draw C,D, but not E,F)
                expect(context.getChatLog()).toEqual('Round: 1 - Additional Regroup Phase (granted by Max Rebo)');
                expect(context.p1Draws.c).toBeInZone('hand');
                expect(context.p1Draws.d).toBeInZone('hand');
                expect(context.p2Draws.c).toBeInZone('hand');
                expect(context.p2Draws.d).toBeInZone('hand');
                expect(context.p1Draws.e).toBeInZone('deck');
                expect(context.p1Draws.f).toBeInZone('deck');
                expect(context.p2Draws.e).toBeInZone('deck');
                expect(context.p2Draws.f).toBeInZone('deck');

                // Each player resources C
                context.player1.clickCard(context.p1Draws.c);
                context.player1.clickDone();
                context.player2.clickCard(context.p2Draws.c);
                context.player2.clickDone();
                expect(context.p1Draws.c).toBeInZone('resource');
                expect(context.p2Draws.c).toBeInZone('resource');
                expect(context.player1.resources.length).toBe(context.startingResourceCount + 2);
                expect(context.player2.resources.length).toBe(context.startingResourceCount + 2);

                // Action phase begins
                expect(context.getChatLog()).toEqual('Round: 2 - Action Phase');
            });

            it('does not create an additional Regroup Phase if it leaves play during the first Regroup Phase (Sneak Attack)', function() {
                const { context } = contextRef;

                // P1 plays Max Rebo with Sneak Attack
                context.player1.clickCard(context.sneakAttack);
                context.player1.clickCard(context.p1MaxRebo);
                expect(context.p1MaxRebo).toBeInZone('groundArena');

                // Move to Regroup Phase
                context.moveToRegroupPhase();

                // Max Rebo is defeated due to Sneak Attack
                expect(context.p1MaxRebo).toBeInZone('discard');

                // Regroup Phase begins (draw A,B but not C,D)
                expect(context.getChatLog()).toEqual('Round: 1 - Regroup Phase');
                expect(context.p1Draws.a).toBeInZone('hand');
                expect(context.p1Draws.b).toBeInZone('hand');
                expect(context.p2Draws.a).toBeInZone('hand');
                expect(context.p2Draws.b).toBeInZone('hand');
                expect(context.p1Draws.c).toBeInZone('deck');
                expect(context.p1Draws.d).toBeInZone('deck');
                expect(context.p2Draws.c).toBeInZone('deck');
                expect(context.p2Draws.d).toBeInZone('deck');

                // Each player resources A
                context.player1.clickCard(context.p1Draws.a);
                context.player1.clickDone();
                context.player2.clickCard(context.p2Draws.a);
                context.player2.clickDone();
                expect(context.p1Draws.a).toBeInZone('resource');
                expect(context.p2Draws.a).toBeInZone('resource');
                expect(context.player1.resources.length).toBe(context.startingResourceCount + 1);
                expect(context.player2.resources.length).toBe(context.startingResourceCount + 1);

                // Action phase begins (no second Regroup Phase)
                expect(context.getChatLog()).toEqual('Round: 2 - Action Phase');
            });

            it('does create an additional Regroup Phase if it enters play during the first Regroup Phase (Arrest)', function() {
                const { context } = contextRef;

                // P1 plays Max Rebo
                context.player1.clickCard(context.p1MaxRebo);

                // P2 plays Arrest to capture Max Rebo (he will be rescued during the first Regroup Phase)
                context.player2.clickCard(context.arrest);
                context.player2.clickCard(context.p1MaxRebo);
                expect(context.p1MaxRebo).toBeCapturedBy(context.p2Base);

                // Move to Regroup Phase
                context.moveToRegroupPhase();

                // First Regroup Phase begins
                expect(context.getChatLog()).toEqual('Round: 1 - Regroup Phase');

                // Max Rebo is rescued at the beginning of the Regroup Phase
                expect(context.p1MaxRebo).toBeInZone('groundArena', context.player1);

                // Each player draws A,B and resources A
                expect(context.p1Draws.a).toBeInZone('hand');
                expect(context.p1Draws.b).toBeInZone('hand');
                expect(context.p2Draws.a).toBeInZone('hand');
                expect(context.p2Draws.b).toBeInZone('hand');

                context.player1.clickCard(context.p1Draws.a);
                context.player1.clickDone();
                context.player2.clickCard(context.p2Draws.a);
                context.player2.clickDone();
                expect(context.p1Draws.a).toBeInZone('resource');
                expect(context.p2Draws.a).toBeInZone('resource');

                // Second Regroup Phase begins
                expect(context.getChatLog()).toEqual('Round: 1 - Additional Regroup Phase (granted by Max Rebo)');

                // Each player draws C,D and resources C
                expect(context.p1Draws.c).toBeInZone('hand');
                expect(context.p1Draws.d).toBeInZone('hand');
                expect(context.p2Draws.c).toBeInZone('hand');
                expect(context.p2Draws.d).toBeInZone('hand');

                context.player1.clickCard(context.p1Draws.c);
                context.player1.clickDone();
                context.player2.clickCard(context.p2Draws.c);
                context.player2.clickDone();
                expect(context.p1Draws.c).toBeInZone('resource');
                expect(context.p2Draws.c).toBeInZone('resource');

                // Action phase begins
                expect(context.getChatLog()).toEqual('Round: 2 - Action Phase');
            });


            describe('Interactions with other "Regroup Phase" effects', function() {
                it('abilities that trigger at the start of the Regroup Phase still trigger for the additional Regroup Phase (Fireball)', function() {
                    const { context } = contextRef;

                    // P1 plays Max Rebo
                    context.player1.clickCard(context.p1MaxRebo);

                    // P2 plays Fireball
                    context.player2.clickCard(context.fireball);

                    // Move to Regroup Phase
                    context.moveToRegroupPhase();

                    // First Regroup Phase begins (Fireball takes 1 damage)
                    expect(context.getChatLogs(2)).toContain('Round: 1 - Regroup Phase');
                    expect(context.fireball.damage).toBe(1);

                    // Each player passes resourcing
                    context.player1.clickDone();
                    context.player2.clickDone();

                    // Second Regroup Phase begins (Fireball takes another 1 damage)
                    expect(context.getChatLogs(2)).toContain('Round: 1 - Additional Regroup Phase (granted by Max Rebo)');
                    expect(context.fireball.damage).toBe(2);
                });

                it('delayed effects that happen in the Regroup Phase occur in only in the "next" Regroup Phase (Zorii Bliss)', function() {
                    const { context } = contextRef;

                    // P1 attacks with Zorii Bliss
                    context.player1.clickCard(context.zoriiBliss);
                    context.player1.clickCard(context.p2Base);

                    // P1 draws A due to Zorii's ability
                    expect(context.p1Draws.a).toBeInZone('hand');

                    // P2 plays Max Rebo
                    context.player2.clickCard(context.p2MaxRebo);

                    // Move to Regroup Phase
                    context.moveToRegroupPhase();

                    // First Regroup Phase begins (Zorii's delayed effect triggers discard effect)
                    expect(context.getChatLog()).toEqual('Round: 1 - Regroup Phase');
                    expect(context.player1).toHavePrompt('Choose a card to discard for Zorii Bliss\'s effect');
                    expect(context.player1).toBeAbleToSelectExactly([
                        context.sneakAttack,
                        context.p1MaxRebo,
                        context.p1Draws.a,
                    ]);
                    context.player1.clickCard(context.p1Draws.a);
                    expect(context.p1Draws.a).toBeInZone('discard');

                    // Draw step (P1 draws B,C  and P2 draws A,B)
                    expect(context.p1Draws.b).toBeInZone('hand');
                    expect(context.p1Draws.c).toBeInZone('hand');
                    expect(context.p2Draws.a).toBeInZone('hand');
                    expect(context.p2Draws.b).toBeInZone('hand');

                    // Each player resources B
                    context.player1.clickCard(context.p1Draws.b);
                    context.player1.clickDone();
                    context.player2.clickCard(context.p2Draws.b);
                    context.player2.clickDone();
                    expect(context.p1Draws.b).toBeInZone('resource');
                    expect(context.p2Draws.b).toBeInZone('resource');

                    // Second Regroup Phase begins (no delayed effect from Zorii)
                    expect(context.getChatLog()).toEqual('Round: 1 - Additional Regroup Phase (granted by Max Rebo)');
                    expect(context.player1).toHavePrompt('Select between 0 and 1 cards to resource'); // No discard prompt

                    // Draw step (P1 draws D,E and P2 draws C,D)
                    expect(context.p1Draws.d).toBeInZone('hand');
                    expect(context.p1Draws.e).toBeInZone('hand');
                    expect(context.p2Draws.c).toBeInZone('hand');
                    expect(context.p2Draws.d).toBeInZone('hand');
                });

                it('lasting effects that apply to the "next" Regroup Phase only last for the next Regroup Phase (Dryden Vos)', function() {
                    const { context } = contextRef;

                    // P1 attacks with Dryden Vos
                    context.player1.clickCard(context.drydenVos);
                    context.player1.clickCard(context.p2Base);

                    // Dryden's ability triggers to double power but not ready next Regroup Phase
                    expect(context.player1).toHavePassAbilityPrompt('Double this unit\'s power for this attack. If you do, this unit does not ready during the next regroup phase.');
                    context.player1.clickPrompt('Trigger');
                    expect(context.player2).toBeActivePlayer();
                    expect(context.p2Base.damage).toBe(4);

                    // P2 plays Max Rebo
                    context.player2.clickCard(context.p2MaxRebo);

                    // Move to Regroup Phase
                    context.moveToRegroupPhase();

                    // First Regroup Phase begins
                    expect(context.getChatLog()).toEqual('Round: 1 - Regroup Phase');

                    // Each player passes resourcing
                    context.player1.clickDone();
                    context.player2.clickDone();

                    // Dryden is still exhausted
                    expect(context.drydenVos.exhausted).toBeTrue();

                    // Second Regroup Phase begins
                    expect(context.getChatLog()).toEqual('Round: 1 - Additional Regroup Phase (granted by Max Rebo)');

                    // Each player passes resourcing
                    context.player1.clickDone();
                    context.player2.clickDone();

                    // Dryden readies this time
                    expect(context.drydenVos.exhausted).toBeFalse();
                });

                it('effects that apply for the round do not expire before the end of the additional Regroup Phase (Kazuda Xiono)', function() {
                    const { context } = contextRef;

                    // P1 plays Max Rebo
                    context.player1.clickCard(context.p1MaxRebo);

                    // P2 plays Contracted Hunter
                    context.player2.clickCard(context.contractedHunter);
                    context.player2.clickPrompt('Pass'); // No ambush

                    context.player1.claimInitiative();

                    // P2 uses Kazuda to remove all abilities from Contracted Hunter for the round
                    context.player2.clickCard(context.kazudaXiono);
                    context.player2.clickPrompt('Remove all abilities from a friendly unit, then take another action');
                    context.player2.clickCard(context.contractedHunter);
                    context.player2.clickPrompt('Pass'); // No additional action

                    // First Regroup Phase begins, Contracted Hunter is not defeated by its own ability
                    expect(context.getChatLog()).toEqual('Round: 1 - Regroup Phase');
                    expect(context.contractedHunter).toBeInZone('groundArena');

                    // Each player passes resourcing
                    context.player1.clickDone();
                    context.player2.clickDone();

                    // Second Regroup Phase begins, Contracted Hunter is still not defeated by its own ability
                    expect(context.getChatLog()).toEqual('Round: 1 - Additional Regroup Phase (granted by Max Rebo)');
                    expect(context.contractedHunter).toBeInZone('groundArena');

                    // Each player passes resourcing
                    context.player1.clickDone();
                    context.player2.clickDone();

                    // Action phase begins, Contracted Hunter is still in play
                    expect(context.getChatLog()).toEqual('Round: 2 - Action Phase');
                    expect(context.contractedHunter).toBeInZone('groundArena');
                });

                it('effects that apply to "this Regroup Phase" will not carry over to additional Regroup Phases (Patient Hunter)', function() {
                    const { context } = contextRef;

                    // P1 plays Max Rebo
                    context.player1.clickCard(context.p1MaxRebo);

                    // P2 plays Patient Hunter
                    context.player2.clickCard(context.patientHunter);

                    // Move to Regroup Phase
                    context.moveToRegroupPhase();

                    // First Regroup Phase begins, Patient Hunter ability triggers
                    expect(context.getChatLog()).toEqual('Round: 1 - Regroup Phase');
                    expect(context.player2).toHavePrompt('Give an Experience token to a unit. If you do, that unit can\'t ready during this regroup phase');
                    context.player2.clickCard(context.p1MaxRebo);

                    // Each player passes resourcing
                    context.player1.clickDone();
                    context.player2.clickDone();

                    // Max Rebo is still exhausted, but Patient Hunter has readied
                    expect(context.p1MaxRebo.exhausted).toBeTrue();
                    expect(context.patientHunter.exhausted).toBeFalse();

                    // Second Regroup Phase begins, Patient Hunter triggers again
                    expect(context.getChatLog()).toEqual('Round: 1 - Additional Regroup Phase (granted by Max Rebo)');
                    expect(context.player2).toHavePrompt('Give an Experience token to a unit. If you do, that unit can\'t ready during this regroup phase');
                    context.player2.clickCard(context.patientHunter);

                    // Each player passes resourcing
                    context.player1.clickDone();
                    context.player2.clickDone();

                    // Both units are readied since the effect only applied to "this Regroup Phase"
                    expect(context.p1MaxRebo.exhausted).toBeFalse();
                    expect(context.patientHunter.exhausted).toBeFalse();
                });

                // TODO: Once we know more about when regroup phases should be queued up according to the rules, we should add a test where
                //       there are multiple copies of Max Rebo in play during the first regroup phase, but one leaves play during the second
                //       regroup phase. Currently we queue up all additional regroup phases at the end of the first regroup phase, but we
                //       don't yet know if that's correct.
            });

            describe('With multiple Max Rebo units in play', function() {
                it('creates one additional Regroup Phase for each Max Rebo unit in play at the end of the first Regroup Phase', function() {
                    const { context } = contextRef;

                    // P1 plays Max Rebo
                    context.player1.clickCard(context.p1MaxRebo);

                    // P2 plays Max Rebo
                    context.player2.clickCard(context.p2MaxRebo);

                    // Move to Regroup Phase
                    context.moveToRegroupPhase();

                    // First Regroup Phase begins
                    expect(context.getChatLog()).toEqual('Round: 1 - Regroup Phase');

                    // Each player draws A,B and resources A
                    expect(context.p1Draws.a).toBeInZone('hand');
                    expect(context.p1Draws.b).toBeInZone('hand');
                    expect(context.p2Draws.a).toBeInZone('hand');
                    expect(context.p2Draws.b).toBeInZone('hand');

                    context.player1.clickCard(context.p1Draws.a);
                    context.player1.clickDone();
                    context.player2.clickCard(context.p2Draws.a);
                    context.player2.clickDone();
                    expect(context.p1Draws.a).toBeInZone('resource');
                    expect(context.p2Draws.a).toBeInZone('resource');

                    // Second Regroup Phase begins
                    expect(context.getChatLog()).toEqual('Round: 1 - Additional Regroup Phase (granted by Max Rebo)');

                    // Each player draws C,D and resources C
                    expect(context.p1Draws.c).toBeInZone('hand');
                    expect(context.p1Draws.d).toBeInZone('hand');
                    expect(context.p2Draws.c).toBeInZone('hand');
                    expect(context.p2Draws.d).toBeInZone('hand');

                    context.player1.clickCard(context.p1Draws.c);
                    context.player1.clickDone();
                    context.player2.clickCard(context.p2Draws.c);
                    context.player2.clickDone();
                    expect(context.p1Draws.c).toBeInZone('resource');
                    expect(context.p2Draws.c).toBeInZone('resource');

                    // Third Regroup Phase begins
                    expect(context.getChatLog()).toEqual('Round: 1 - Additional Regroup Phase (granted by Max Rebo)');

                    // Each player draws E,F and resources E
                    expect(context.p1Draws.e).toBeInZone('hand');
                    expect(context.p1Draws.f).toBeInZone('hand');
                    expect(context.p2Draws.e).toBeInZone('hand');
                    expect(context.p2Draws.f).toBeInZone('hand');

                    context.player1.clickCard(context.p1Draws.e);
                    context.player1.clickDone();
                    context.player2.clickCard(context.p2Draws.e);
                    context.player2.clickDone();
                    expect(context.p1Draws.e).toBeInZone('resource');
                    expect(context.p2Draws.e).toBeInZone('resource');

                    // Action phase begins
                    expect(context.getChatLog()).toEqual('Round: 2 - Action Phase');
                });

                it('if one Max Rebo is defeated at the start of the first Regroup Phase, it does not create an additional Regroup Phase for that unit', function() {
                    const { context } = contextRef;

                    // P1 plays Max Rebo with Sneak Attack
                    context.player1.clickCard(context.sneakAttack);
                    context.player1.clickCard(context.p1MaxRebo);
                    expect(context.p1MaxRebo).toBeInZone('groundArena');

                    // P2 plays Max Rebo
                    context.player2.clickCard(context.p2MaxRebo);

                    // Move to Regroup Phase
                    context.moveToRegroupPhase();

                    // First Regroup Phase begins
                    expect(context.getChatLog()).toEqual('Round: 1 - Regroup Phase');

                    // P1's Max Rebo is defeated due to Sneak Attack
                    expect(context.p1MaxRebo).toBeInZone('discard');

                    // Each player draws A,B and resources A
                    expect(context.p1Draws.a).toBeInZone('hand');
                    expect(context.p1Draws.b).toBeInZone('hand');
                    expect(context.p2Draws.a).toBeInZone('hand');
                    expect(context.p2Draws.b).toBeInZone('hand');

                    context.player1.clickCard(context.p1Draws.a);
                    context.player1.clickDone();
                    context.player2.clickCard(context.p2Draws.a);
                    context.player2.clickDone();
                    expect(context.p1Draws.a).toBeInZone('resource');
                    expect(context.p2Draws.a).toBeInZone('resource');

                    // Second Regroup Phase begins
                    expect(context.getChatLog()).toEqual('Round: 1 - Additional Regroup Phase (granted by Max Rebo)');

                    // Each player draws C,D and resources C
                    expect(context.p1Draws.c).toBeInZone('hand');
                    expect(context.p1Draws.d).toBeInZone('hand');
                    expect(context.p2Draws.c).toBeInZone('hand');
                    expect(context.p2Draws.d).toBeInZone('hand');

                    context.player1.clickCard(context.p1Draws.c);
                    context.player1.clickDone();
                    context.player2.clickCard(context.p2Draws.c);
                    context.player2.clickDone();
                    expect(context.p1Draws.c).toBeInZone('resource');
                    expect(context.p2Draws.c).toBeInZone('resource');

                    // Action phase begins (only one additional Regroup Phase occurred)
                    expect(context.getChatLog()).toEqual('Round: 2 - Action Phase');
                });
            });
        });
    });
});