
describe('Alliance Outpost', function() {
    integration(function(contextRef) {
        describe('Epic Action', function() {
            beforeEach(async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hasForceToken: true,
                        credits: 1,
                        base: 'alliance-outpost',
                        groundArena: [
                            'consular-security-force',
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
                            { card: 'imperial-dark-trooper', upgrades: ['experience'] },
                            { card: 'crafty-smuggler', upgrades: ['shield'] },
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
                    shield: context.player2.findCardByName('shield'),
                    spy: context.player2.findCardByName('spy'),
                    cloneTrooper: context.player2.findCardByName('clone-trooper'),
                    battleDroid: context.player2.findCardByName('battle-droid'),
                };
            });

            it('defeats a friendly token to give an Experience token to a unit', function () {
                const { context } = contextRef;

                // Use Alliance Outpost's epic action ability to give Experience token
                context.player1.clickCard(context.allianceOutpost);
                expect(context.player1).toHavePrompt('Select one');
                expect(context.player1).toHaveExactPromptButtons([
                    'Give Experience',
                    'Give Shield',
                    'Create Credit'
                ]);
                context.player1.clickPrompt('Give Experience');

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

                // Give Experience token to a unit
                expect(context.player1).toHavePrompt('Select a unit to give an Experience token');
                expect(context.player1).toBeAbleToSelectExactly([
                    // All P1 and P2 units are valid targets
                    context.consularSecurityForce,
                    context.battlefieldMarine,
                    context.secretiveSage,
                    context.p1Tokens.spy,
                    context.p1Tokens.cloneTrooper,
                    context.p1Tokens.battleDroid,
                    context.imperialDarkTrooper,
                    context.craftySmuggler,
                    context.p2Tokens.spy,
                    context.p2Tokens.cloneTrooper,
                    context.p2Tokens.battleDroid
                ]);
                context.player1.clickCard(context.consularSecurityForce);
                expect(context.consularSecurityForce).toHaveExactUpgradeNames(['experience']);
            });

            it('defeats a friendly token to give a Shield token to a unit', function () {
                const { context } = contextRef;

                // Use Alliance Outpost's epic action ability to give Shield token
                context.player1.clickCard(context.allianceOutpost);
                expect(context.player1).toHavePrompt('Select one');
                expect(context.player1).toHaveExactPromptButtons([
                    'Give Experience',
                    'Give Shield',
                    'Create Credit'
                ]);
                context.player1.clickPrompt('Give Shield');

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

                // Defeat the The Force token
                context.player1.clickCard(context.p1Tokens.force);
                expect(context.p1Tokens.force).toBeInZone('outsideTheGame');
                expect(context.player1.hasTheForce).toBe(false);

                // Give Shield token to a unit
                expect(context.player1).toHavePrompt('Select a unit to give a Shield token');
                expect(context.player1).toBeAbleToSelectExactly([
                    // All P1 and P2 units are valid targets
                    context.consularSecurityForce,
                    context.battlefieldMarine,
                    context.secretiveSage,
                    context.p1Tokens.spy,
                    context.p1Tokens.cloneTrooper,
                    context.p1Tokens.battleDroid,
                    context.imperialDarkTrooper,
                    context.craftySmuggler,
                    context.p2Tokens.spy,
                    context.p2Tokens.cloneTrooper,
                    context.p2Tokens.battleDroid
                ]);
                context.player1.clickCard(context.consularSecurityForce);
                expect(context.consularSecurityForce).toHaveExactUpgradeNames(['shield']);
            });

            it('defeats a friendly token to create a Credit token', function () {
                const { context } = contextRef;

                // Use Alliance Outpost's epic action ability to create Credit token
                context.player1.clickCard(context.allianceOutpost);
                expect(context.player1).toHavePrompt('Select one');
                expect(context.player1).toHaveExactPromptButtons([
                    'Give Experience',
                    'Give Shield',
                    'Create Credit'
                ]);
                context.player1.clickPrompt('Create Credit');

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

                // Defeat the Experience token
                context.player1.clickCard(context.p1Tokens.experience);
                expect(context.p1Tokens.experience).toBeInZone('outsideTheGame');
                expect(context.battlefieldMarine).toHaveExactUpgradeNames([]);

                // Create a Credit token
                expect(context.player1.credits).toBe(2);
            });
        });
    });
});