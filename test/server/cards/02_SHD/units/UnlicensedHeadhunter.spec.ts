describe('Unlicensed Headhunter', function() {
    integration(function(contextRef) {
        describe('Unlicensed Headhunter\'s Bounty ability', function() {
            it('should heal 5 damage from the opponent\'s base if the unit is exhausted', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: [{ card: 'unlicensed-headhunter', exhausted: true }]
                    },
                    player2: {
                        spaceArena: ['survivors-gauntlet'],
                        base: { card: 'echo-base', damage: 6 },
                        hasInitiative: true
                    }
                });

                const { context } = contextRef;

                context.player2.clickCard(context.survivorsGauntlet);
                context.player2.clickCard(context.unlicensedHeadhunter);

                expect(context.player2).toHavePassAbilityPrompt('Collect Bounty: Heal 5 damage from your base');
                context.player2.clickPrompt('Trigger');
                expect(context.p2Base.damage).toBe(1);
            });

            it('should heal 5 damage from the opponent\'s base if the unit is exhausted by its own attack', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['unlicensed-headhunter']
                    },
                    player2: {
                        spaceArena: ['survivors-gauntlet'],
                        base: { card: 'echo-base', damage: 6 }
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.unlicensedHeadhunter);
                context.player1.clickCard(context.survivorsGauntlet);

                expect(context.player2).toHavePassAbilityPrompt('Collect Bounty: Heal 5 damage from your base');
                context.player2.clickPrompt('Trigger');
                expect(context.p2Base.damage).toBe(1);
            });

            it('should do nothing if the unit is not exhausted', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['unlicensed-headhunter']
                    },
                    player2: {
                        spaceArena: ['survivors-gauntlet'],
                        hasInitiative: true
                    }
                });

                const { context } = contextRef;

                context.player2.clickCard(context.survivorsGauntlet);
                context.player2.clickCard(context.unlicensedHeadhunter);
                expect(context.player1).toBeActivePlayer();
            });
        });
    });
});
