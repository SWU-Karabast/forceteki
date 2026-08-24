describe('Qimir, Everyone Has a Weakness', function() {
    integration(function(contextRef) {
        it('Qimir\'s ability should discard the top card of his deck, if it is not a Villainy, give a Weakness token to an enemy unit', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['qimir#everyone-has-a-weakness', 'porg'],
                    deck: ['gungi#finding-himself', 'atst']
                },
                player2: {
                    groundArena: ['wampa'],
                    spaceArena: ['awing'],
                    hasInitiative: true,
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.wampa);
            context.player2.clickCard(context.qimir);

            expect(context.player1).toHavePassAbilityPrompt('Discard the top card of your deck. If it\'s not Villainy, give a Weakness token to an enemy unit.');
            context.player1.clickPrompt('Trigger');

            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.awing]);
            context.player1.clickCard(context.awing);

            expect(context.player1).toBeActivePlayer();
            expect(context.awing).toHaveExactUpgradeNames(['weakness']);
        });

        it('Qimir\'s ability can be skipped', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['qimir#everyone-has-a-weakness', 'porg'],
                    deck: ['gungi#finding-himself']
                },
                player2: {
                    groundArena: ['wampa'],
                    spaceArena: ['awing'],
                    hasInitiative: true,
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.wampa);
            context.player2.clickCard(context.qimir);

            expect(context.player1).toHavePassAbilityPrompt('Discard the top card of your deck. If it\'s not Villainy, give a Weakness token to an enemy unit.');
            context.player1.clickPrompt('Pass');

            expect(context.player1).toBeActivePlayer();
            expect(context.gungi).toBeInZone('deck', context.player1);
            expect(context.awing).toHaveExactUpgradeNames([]);
            expect(context.wampa).toHaveExactUpgradeNames([]);
        });

        it('Qimir\'s ability should discard the top card of his deck, nothing happens when it is a Villainy card', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['qimir#everyone-has-a-weakness', 'porg'],
                    deck: ['atst']
                },
                player2: {
                    groundArena: ['wampa'],
                    spaceArena: ['awing'],
                    hasInitiative: true,
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.wampa);
            context.player2.clickCard(context.qimir);

            expect(context.player1).toHavePassAbilityPrompt('Discard the top card of your deck. If it\'s not Villainy, give a Weakness token to an enemy unit.');
            context.player1.clickPrompt('Trigger');

            expect(context.player1).toBeActivePlayer();
            expect(context.atst).toBeInZone('discard', context.player1);
            expect(context.awing).toHaveExactUpgradeNames([]);
            expect(context.wampa).toHaveExactUpgradeNames([]);
        });

        it('Qimir\'s ability should not trigger if deck is empty', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['qimir#everyone-has-a-weakness', 'porg'],
                    deck: []
                },
                player2: {
                    groundArena: ['wampa'],
                    spaceArena: ['awing'],
                    hasInitiative: true,
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.wampa);
            context.player2.clickCard(context.qimir);

            expect(context.player1).toBeActivePlayer();
            expect(context.awing).toHaveExactUpgradeNames([]);
            expect(context.wampa).toHaveExactUpgradeNames([]);
        });

        it('Qimir\'s ability should discard the top card of his deck, if it is not a Villainy, give a Weakness token to an enemy unit (No Glory Only Results)', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['qimir#everyone-has-a-weakness', 'wampa'],
                    spaceArena: ['awing'],
                },
                player2: {
                    hand: ['no-glory-only-results'],
                    deck: ['gungi#finding-himself'],
                    hasInitiative: true,
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.noGloryOnlyResults);
            context.player2.clickCard(context.qimir);

            expect(context.player2).toHavePassAbilityPrompt('Discard the top card of your deck. If it\'s not Villainy, give a Weakness token to an enemy unit.');
            context.player2.clickPrompt('Trigger');

            expect(context.player2).toBeAbleToSelectExactly([context.wampa, context.awing]);
            context.player2.clickCard(context.awing);

            expect(context.player1).toBeActivePlayer();
            expect(context.gungi).toBeInZone('discard', context.player2);
            expect(context.awing).toHaveExactUpgradeNames(['weakness']);
        });
    });
});
