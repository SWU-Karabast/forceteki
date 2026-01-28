
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
                            'zorii-bliss#valiant-smuggler'
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
                            'fireball#an-explosion-with-wings'
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

            it('does not create additional Regroup Phases if it leaves play during the first Regroup Phase', function() {
                const { context } = contextRef;

                // P1 plays Max Rebo with Sneak Attack
                context.player1.clickCard(context.sneakAttack);
                context.player1.clickCard(context.p1MaxRebo);
                expect(context.p1MaxRebo).toBeInZone('groundArena');

                // Move to Regroup Phase
                context.moveToRegroupPhase();

                // Max Rebo is in discard (defeated due to Sneak Attack)
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

            describe('Interactions with other "Regroup Phase" effects', function() {
                it('abilities that trigger at the start of the Regroup Phase still trigger for the additional Regroup Phase', function() {
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
            });

            // describe('With multiple Max Rebo units in play', function() {
            //     it('creates one additional Regroup Phase for each Max Rebo unit in play at the end of the first Regroup Phase', async function() {
            //     });

            //     it('if one Max Rebo is defeated at the start of the first Regroup Phase, it does not create an additional Regroup Phase for that unit', async function() {
            //     });
            // });
        });
    });
});
