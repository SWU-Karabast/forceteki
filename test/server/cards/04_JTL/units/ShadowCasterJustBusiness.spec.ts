describe('Shadow Caster, Just Business', function() {
    integration(function(contextRef) {
        describe('Shadow Caster\'s ability', function() {
            it('should allow a player to reuse a When Defeated', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['shadow-caster#just-business', 'rhokai-gunship'],
                    },
                    player2: {
                        hand: ['daring-raid']
                    }
                });

                const { context } = contextRef;

                context.player1.passAction();
                context.player2.clickCard(context.daringRaid);
                context.player2.clickCard(context.rhokaiGunship);

                context.player1.clickCard(context.p2Base);

                expect(context.player1).toHavePassAbilityPrompt('When a friendly unit is defeated, you may use all of its When Defeated abilities again');
                context.player1.clickPrompt('Trigger');
                context.player1.clickCard(context.p2Base);

                expect(context.p2Base.damage).toBe(2);
                expect(context.player1).toBeActivePlayer();
            });

            it('should not allow a player to reuse an enemy When Defeated', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['daring-raid'],
                        spaceArena: ['shadow-caster#just-business'],
                    },
                    player2: {
                        spaceArena: ['rhokai-gunship']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.daringRaid);
                context.player1.clickCard(context.rhokaiGunship);

                context.player2.clickCard(context.p2Base);

                expect(context.player2).toBeActivePlayer();
            });

            it('should allow a player to reuse a When Defeated gained from an event', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['in-defense-of-kamino'],
                        spaceArena: ['shadow-caster#just-business', 'padawan-starfighter'],
                    },
                    player2: {
                        hand: ['rivals-fall']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.inDefenseOfKamino);
                context.player2.clickCard(context.rivalsFall);
                context.player2.clickCard(context.padawanStarfighter);

                expect(context.player1.findCardsByName('clone-trooper').length).toBe(1);

                expect(context.player1).toHavePassAbilityPrompt('When a friendly unit is defeated, you may use all of its When Defeated abilities again');
                context.player1.clickPrompt('Trigger');

                expect(context.player1.findCardsByName('clone-trooper').length).toBe(2);
            });

            it('should allow a player to reuse multiple When Defeateds', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['in-defense-of-kamino'],
                        groundArena: ['atte-vanguard'],
                        spaceArena: ['shadow-caster#just-business'],
                    },
                    player2: {
                        hand: ['rivals-fall']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.inDefenseOfKamino);
                context.player2.clickCard(context.rivalsFall);
                context.player2.clickCard(context.atteVanguard);

                expect(context.player1).toHaveExactPromptButtons(['Create 2 Clone Trooper tokens', 'Create a Clone Trooper token.']);
                context.player1.clickPrompt('Create 2 Clone Trooper tokens');
                expect(context.player1.findCardsByName('clone-trooper').length).toBe(2);

                // Prompt to reuse AT-TE's When Defeated
                expect(context.player1).toHavePassAbilityPrompt('When a friendly unit is defeated, you may use all of its When Defeated abilities again');
                context.player1.clickPrompt('Trigger');

                // The Kamino When Defeated will also now automatically resolve
                expect(context.player1.findCardsByName('clone-trooper').length).toBe(5);

                // Now, we get to re-trigger the Kamino When Defeated
                expect(context.player1).toHavePassAbilityPrompt('When a friendly unit is defeated, you may use all of its When Defeated abilities again');
                context.player1.clickPrompt('Trigger');

                expect(context.player1.findCardsByName('clone-trooper').length).toBe(6);
                expect(context.player1).toBeActivePlayer();
            });


            // TODO: Add a test that ensures Chimaera doesn't trigger Shadow Caster
            // TODO: Add a test that ensures Chimaera triggers JTL Thrawn
        });
    });
});
