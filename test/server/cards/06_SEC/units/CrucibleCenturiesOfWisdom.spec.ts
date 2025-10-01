describe('Crucible, Centuries of Wisdom', function () {
    integration(function (contextRef) {
        it('Crucible\'s ability should give an experience to each other friendly unit when played', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['crucible#centuries-of-wisdom'],
                    groundArena: ['wampa', 'finn#on-the-run'],
                    spaceArena: ['green-squadron-awing'],
                    leader: { card: 'luke-skywalker#faithful-friend', deployed: true }
                },
                player2: {
                    hand: ['power-of-the-dark-side', 'no-glory-only-results'],
                    groundArena: ['battlefield-marine'],
                    spaceArena: ['lurking-tie-phantom'],
                    leader: { card: 'iden-versio#inferno-squad-commander', deployed: true }
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.crucibleCenturiesOfWisdom);

            expect(context.crucibleCenturiesOfWisdom).toHaveExactUpgradeNames([]);
            expect(context.battlefieldMarine).toHaveExactUpgradeNames([]);
            expect(context.lurkingTiePhantom).toHaveExactUpgradeNames([]);
            expect(context.idenVersioInfernoSquadCommander).toHaveExactUpgradeNames([]);
            expect(context.wampa).toHaveExactUpgradeNames(['experience']);
            expect(context.finnOnTheRun).toHaveExactUpgradeNames(['experience']);
            expect(context.lukeSkywalkerFaithfulFriend).toHaveExactUpgradeNames(['experience']);
            expect(context.greenSquadronAwing).toHaveExactUpgradeNames(['experience']);
        });

        it('Crucible\'s ability should give an experience to each other friendly unit when defeated', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['wampa', 'finn#on-the-run'],
                    spaceArena: ['green-squadron-awing', 'crucible#centuries-of-wisdom'],
                    leader: { card: 'luke-skywalker#faithful-friend', deployed: true }
                },
                player2: {
                    hand: ['power-of-the-dark-side', 'no-glory-only-results'],
                    groundArena: ['battlefield-marine'],
                    spaceArena: ['lurking-tie-phantom'],
                    leader: { card: 'iden-versio#inferno-squad-commander', deployed: true }
                }
            });
            const { context } = contextRef;

            context.player1.clickPrompt('Pass');

            context.player2.clickCard(context.powerOfTheDarkSide);
            context.player1.clickCard(context.crucibleCenturiesOfWisdom);

            context.player2.clickPrompt('You');

            expect(context.battlefieldMarine).toHaveExactUpgradeNames([]);
            expect(context.lurkingTiePhantom).toHaveExactUpgradeNames([]);
            expect(context.idenVersioInfernoSquadCommander).toHaveExactUpgradeNames([]);
            expect(context.wampa).toHaveExactUpgradeNames(['experience']);
            expect(context.finnOnTheRun).toHaveExactUpgradeNames(['experience']);
            expect(context.lukeSkywalkerFaithfulFriend).toHaveExactUpgradeNames(['experience']);
            expect(context.greenSquadronAwing).toHaveExactUpgradeNames(['experience']);
        });

        it('Crucible\'s ability should give an experience to each other friendly unit when defeated by No Glory Only Results', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['wampa', 'finn#on-the-run'],
                    spaceArena: ['green-squadron-awing', 'crucible#centuries-of-wisdom'],
                    leader: { card: 'luke-skywalker#faithful-friend', deployed: true }
                },
                player2: {
                    hand: ['power-of-the-dark-side', 'no-glory-only-results'],
                    groundArena: ['battlefield-marine'],
                    spaceArena: ['lurking-tie-phantom'],
                    leader: { card: 'iden-versio#inferno-squad-commander', deployed: true }
                }
            });
            const { context } = contextRef;

            context.player1.clickPrompt('Pass');

            context.player2.clickCard(context.noGloryOnlyResults);
            context.player2.clickCard(context.crucibleCenturiesOfWisdom);

            expect(context.battlefieldMarine).toHaveExactUpgradeNames(['experience']);
            expect(context.lurkingTiePhantom).toHaveExactUpgradeNames(['experience']);
            expect(context.idenVersioInfernoSquadCommander).toHaveExactUpgradeNames(['experience']);
            expect(context.wampa).toHaveExactUpgradeNames([]);
            expect(context.finnOnTheRun).toHaveExactUpgradeNames([]);
            expect(context.lukeSkywalkerFaithfulFriend).toHaveExactUpgradeNames([]);
            expect(context.greenSquadronAwing).toHaveExactUpgradeNames([]);
        });
    });
});