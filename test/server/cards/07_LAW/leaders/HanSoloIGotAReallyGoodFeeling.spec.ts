describe('Han Solo, I Got a Really Good Feeling', function() {
    integration(function(contextRef) {
        describe('Undeployed leader-side ability', function() {
            beforeEach(async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hasForceToken: true,
                        credits: 1,
                        resources: 4, // To avoid deploy prompt
                        leader: 'han-solo#i-got-a-really-good-feeling',
                        groundArena: [
                            { card: 'battlefield-marine', upgrades: ['experience'] },
                            { card: 'secretive-sage', upgrades: ['shield'] },
                            'spy',
                            'clone-trooper',
                            'battle-droid'
                        ]
                    },
                    player2: {
                        hasForceToken: true,
                        credits: 1,
                        groundArena: [
                            'consular-security-force',
                            { card: 'imperial-dark-trooper', upgrades: ['experience'] },
                            'spy',
                            'clone-trooper',
                            'battle-droid'
                        ]
                    }
                });

                const { context } = contextRef;
                context.p1Tokens = {
                    force: context.player1.findCardByName('the-force'),
                    credit: context.player1.findCardByName('credit'),
                    experience: context.player1.findCardByName('experience'),
                    shield: context.player1.findCardByName('shield'),
                    spy: context.player1.findCardByName('spy'),
                    cloneTrooper: context.player1.findCardByName('clone-trooper'),
                    battleDroid: context.player1.findCardByName('battle-droid'),
                };
                context.p2Tokens = {
                    force: context.player2.findCardByName('the-force'),
                    credit: context.player2.findCardByName('credit'),
                    experience: context.player2.findCardByName('experience'),
                    spy: context.player2.findCardByName('spy'),
                    cloneTrooper: context.player2.findCardByName('clone-trooper'),
                    battleDroid: context.player2.findCardByName('battle-droid'),
                };
            });

            it('exhausts and defeats a friendly token to deal 1 damage to a unit', function () {
                const { context } = contextRef;

                // Use Han Solo's action ability
                context.player1.clickCard(context.hanSolo);

                // Select a unit to deal 1 damage to
                expect(context.player1).toHavePrompt('Deal 1 damage to a unit');
                expect(context.player1).toBeAbleToSelectExactly([
                    // All P1 and P2 units are valid targets, including token units
                    context.battlefieldMarine,
                    context.secretiveSage,
                    context.p1Tokens.spy,
                    context.p1Tokens.cloneTrooper,
                    context.p1Tokens.battleDroid,
                    context.consularSecurityForce,
                    context.imperialDarkTrooper,
                    context.p2Tokens.spy,
                    context.p2Tokens.cloneTrooper,
                    context.p2Tokens.battleDroid
                ]);
                context.player1.clickCard(context.consularSecurityForce);

                // Defeat a friendly token to pay the cost
                expect(context.player1).toHavePrompt('Choose a friendly token to defeat');
                expect(context.player1).toBeAbleToSelectExactly([
                    // Only P1 tokens are valid targets
                    context.p1Tokens.force,
                    context.p1Tokens.credit,
                    context.p1Tokens.experience,
                    context.p1Tokens.shield,
                    context.p1Tokens.spy,
                    context.p1Tokens.cloneTrooper,
                    context.p1Tokens.battleDroid
                ]);

                // Defeat the Credit token
                context.player1.clickCard(context.p1Tokens.credit);
                expect(context.p1Tokens.credit).toBeInZone('outsideTheGame');
                expect(context.player1.credits).toBe(0);

                // Verify final state
                expect(context.hanSolo.exhausted).toBeTrue();
                expect(context.consularSecurityForce.damage).toBe(1);
                expect(context.player2).toBeActivePlayer();
            });

            it('cannot be used if the player has no tokens to defeat', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hasForceToken: false,
                        leader: 'han-solo#i-got-a-really-good-feeling',
                        groundArena: ['battlefield-marine']
                    },
                    player2: {
                        hasForceToken: false,
                        groundArena: ['consular-security-force']
                    }
                });

                const { context } = contextRef;

                // Try to use Han Solo's action ability
                context.player1.clickCard(context.hanSolo);

                // Ability should not be available because there are no friendly tokens to defeat
                // Only Deploy and Cancel should be shown
                expect(context.player1).toHaveExactPromptButtons(['Deploy Han Solo', 'Cancel']);
                context.player1.clickPrompt('Cancel');

                expect(context.hanSolo.exhausted).toBeFalse();
                expect(context.player1).toBeActivePlayer();
            });
        });

        describe('Deployed unit-side ability', function() {
            it('defeats any number of friendly tokens and deals damage to a unit equal to the number defeated', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hasForceToken: true,
                        credits: 1,
                        leader: { card: 'han-solo#i-got-a-really-good-feeling', deployed: true },
                        groundArena: [
                            { card: 'battlefield-marine', upgrades: ['experience'] },
                            { card: 'secretive-sage', upgrades: ['shield'] },
                            'spy',
                            'clone-trooper',
                            'battle-droid'
                        ]
                    },
                    player2: {
                        hasForceToken: true,
                        credits: 1,
                        groundArena: [
                            'consular-security-force',
                            { card: 'imperial-dark-trooper', upgrades: ['experience'] },
                            'spy',
                            'clone-trooper',
                            'battle-droid'
                        ]
                    }
                });

                const { context } = contextRef;
                const p1Tokens = {
                    force: context.player1.findCardByName('the-force'),
                    credit: context.player1.findCardByName('credit'),
                    experience: context.player1.findCardByName('experience'),
                    shield: context.player1.findCardByName('shield'),
                    spy: context.player1.findCardByName('spy'),
                    cloneTrooper: context.player1.findCardByName('clone-trooper'),
                    battleDroid: context.player1.findCardByName('battle-droid'),
                };
                const p2Tokens = {
                    force: context.player2.findCardByName('the-force'),
                    credit: context.player2.findCardByName('credit'),
                    experience: context.player2.findCardByName('experience'),
                    spy: context.player2.findCardByName('spy'),
                    cloneTrooper: context.player2.findCardByName('clone-trooper'),
                    battleDroid: context.player2.findCardByName('battle-droid'),
                };

                // Attack with Han Solo to trigger his On Attack ability
                context.player1.clickCard(context.hanSolo);
                context.player1.clickCard(context.p2Base);

                // Select tokens to defeat
                expect(context.player1).toHavePrompt('Defeat any number of friendly tokens (0 selected)');
                expect(context.player1).toBeAbleToSelectExactly([
                    // Only P1 tokens are valid targets
                    p1Tokens.force,
                    p1Tokens.credit,
                    p1Tokens.experience,
                    p1Tokens.shield,
                    p1Tokens.spy,
                    p1Tokens.cloneTrooper,
                    p1Tokens.battleDroid
                ]);

                // Select multiple tokens
                context.player1.clickCard(p1Tokens.credit);
                expect(context.player1).toHavePrompt('Defeat any number of friendly tokens (1 selected)');

                context.player1.clickCard(p1Tokens.spy);
                expect(context.player1).toHavePrompt('Defeat any number of friendly tokens (2 selected)');

                context.player1.clickCard(p1Tokens.battleDroid);
                expect(context.player1).toHavePrompt('Defeat any number of friendly tokens (3 selected)');

                // Confirm selection
                context.player1.clickPrompt('Done');

                // Verify tokens were defeated
                expect(p1Tokens.credit).toBeInZone('outsideTheGame');
                expect(p1Tokens.spy).toBeInZone('outsideTheGame');
                expect(p1Tokens.battleDroid).toBeInZone('outsideTheGame');

                // Select a unit to deal 3 damage to (number of tokens defeated)
                expect(context.player1).toHavePrompt('Deal 3 damage to a unit');
                expect(context.player1).toBeAbleToSelectExactly([
                    // All P1 and P2 units are valid targets, including token units
                    context.battlefieldMarine,
                    context.secretiveSage,
                    p1Tokens.cloneTrooper,
                    context.hanSolo,
                    context.consularSecurityForce,
                    context.imperialDarkTrooper,
                    p2Tokens.spy,
                    p2Tokens.cloneTrooper,
                    p2Tokens.battleDroid
                ]);

                context.player1.clickCard(context.consularSecurityForce);

                // Verify final state
                expect(context.consularSecurityForce.damage).toBe(3);
                expect(context.player2).toBeActivePlayer();
            });

            it('can choose no tokens to defeat when tokens are available', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hasForceToken: true,
                        leader: { card: 'han-solo#i-got-a-really-good-feeling', deployed: true },
                        groundArena: ['spy', 'clone-trooper']
                    },
                    player2: {
                        groundArena: ['consular-security-force']
                    }
                });

                const { context } = contextRef;
                const p1Spy = context.player1.findCardByName('spy');
                const p1CloneTrooper = context.player1.findCardByName('clone-trooper');
                const p1Force = context.player1.findCardByName('the-force');

                // Attack with Han Solo to trigger his On Attack ability
                context.player1.clickCard(context.hanSolo);
                context.player1.clickCard(context.p2Base);

                // Select tokens to defeat, but choose nothing
                expect(context.player1).toHavePrompt('Defeat any number of friendly tokens (0 selected)');
                expect(context.player1).toBeAbleToSelectExactly([p1Spy, p1CloneTrooper, p1Force]);

                // Use Choose nothing without selecting any tokens
                context.player1.clickPrompt('Choose nothing');

                // No damage dealing prompt should appear since 0 tokens were defeated
                expect(p1Spy).toBeInZone('groundArena');
                expect(p1CloneTrooper).toBeInZone('groundArena');
                expect(p1Force).toBeInZone('base');
                expect(context.consularSecurityForce.damage).toBe(0);
                expect(context.player2).toBeActivePlayer();
            });

            it('is automatically skipped if there are no friendly tokens in play', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'han-solo#i-got-a-really-good-feeling', deployed: true },
                        groundArena: ['battlefield-marine']
                    },
                    player2: {
                        hasForceToken: true,
                        groundArena: ['consular-security-force']
                    }
                });

                const { context } = contextRef;

                // Attack with Han Solo to trigger his On Attack ability
                context.player1.clickCard(context.hanSolo);
                context.player1.clickCard(context.p2Base);

                // Since there are no friendly tokens to defeat, the token selection prompt should be automatically skipped and no damage should be dealt
                expect(context.player1).not.toHavePrompt('Defeat any number of friendly tokens (0 selected)');
                expect(context.consularSecurityForce.damage).toBe(0);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
