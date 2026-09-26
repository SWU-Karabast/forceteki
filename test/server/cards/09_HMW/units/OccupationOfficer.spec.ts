describe('Occupation Officer', function() {
    integration(function(contextRef) {
        it('Occupation Officer\'s ability should give Weakness if they have 6 or more resources', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['occupation-officer'],
                    leader: { card: 'cad-bane#he-who-needs-no-introduction', deployed: true },
                    resources: 6
                },
                player2: {
                    groundArena: ['battlefield-marine'],
                    spaceArena: ['lurking-tie-phantom'],
                    resources: 4
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.occupationOfficer);
            expect(context.player1).toBeAbleToSelectExactly([context.occupationOfficer, context.cadBane, context.battlefieldMarine, context.lurkingTiePhantom]);
            expect(context.player1).toHavePassAbilityButton();
            context.player1.clickCard(context.battlefieldMarine);

            expect(context.battlefieldMarine).toHaveExactUpgradeNames(['weakness']);
            expect(context.player2).toBeActivePlayer();
        });

        it('Occupation Officer\'s ability should give Weakness if they have more than 6 resources', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['occupation-officer'],
                    leader: { card: 'cad-bane#he-who-needs-no-introduction', deployed: true },
                    resources: 7
                },
                player2: {
                    groundArena: ['battlefield-marine'],
                    spaceArena: ['lurking-tie-phantom'],
                    resources: 4
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.occupationOfficer);
            expect(context.player1).toBeAbleToSelectExactly([context.occupationOfficer, context.cadBane, context.battlefieldMarine, context.lurkingTiePhantom]);
            expect(context.player1).toHavePassAbilityButton();
            context.player1.clickCard(context.battlefieldMarine);

            expect(context.battlefieldMarine).toHaveExactUpgradeNames(['weakness']);
            expect(context.player2).toBeActivePlayer();
        });

        it('Occupation Officer\'s ability should not trigger if the opp has 6 resources', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['occupation-officer'],
                    leader: { card: 'cad-bane#he-who-needs-no-introduction', deployed: true },
                    resources: 4
                },
                player2: {
                    groundArena: ['battlefield-marine'],
                    spaceArena: ['lurking-tie-phantom'],
                    resources: 6
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.occupationOfficer);

            expect(context.player2).toBeActivePlayer();
        });

        it('Occupation Officer\'s ability should be able to be passed', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['occupation-officer'],
                    leader: { card: 'cad-bane#he-who-needs-no-introduction', deployed: true },
                    resources: 7
                },
                player2: {
                    groundArena: ['battlefield-marine'],
                    spaceArena: ['lurking-tie-phantom'],
                    resources: 4
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.occupationOfficer);
            expect(context.player1).toBeAbleToSelectExactly([context.occupationOfficer, context.cadBane, context.battlefieldMarine, context.lurkingTiePhantom]);
            expect(context.player1).toHavePassAbilityButton();
            context.player1.clickPrompt('Pass');

            expect(context.occupationOfficer).toHaveExactUpgradeNames([]);
            expect(context.cadBane).toHaveExactUpgradeNames([]);
            expect(context.lurkingTiePhantom).toHaveExactUpgradeNames([]);
            expect(context.battlefieldMarine).toHaveExactUpgradeNames([]);
            expect(context.player2).toBeActivePlayer();
        });
    });
});