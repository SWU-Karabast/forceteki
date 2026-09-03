describe('Cid Scaleback, Can\'t Be Trusted', function() {
    integration(function(contextRef) {
        it('Cid Scaleback\'s when played ability should give a Weakness token to an opponent\'s unit that they choose', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['cid-scaleback#cant-be-trusted'],
                },
                player2: {
                    groundArena: ['battlefield-marine'],
                    spaceArena: ['lurking-tie-phantom']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.cidScaleback);

            expect(context.player2).toBeAbleToSelectExactly([context.battlefieldMarine, context.lurkingTiePhantom]);
            context.player2.clickCard(context.battlefieldMarine);

            expect(context.battlefieldMarine).toHaveExactUpgradeNames(['weakness']);
            expect(context.lurkingTiePhantom).toHaveExactUpgradeNames([]);

            expect(context.player2).toBeActivePlayer();
        });

        it('Cid Scaleback\'s when played ability should give a Weakness token to an opponent\'s unit that they choose if that unit changed control', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['cid-scaleback#cant-be-trusted'],
                    groundArena: ['battlefield-marine']
                },
                player2: {
                    hand: ['change-of-heart'],
                    spaceArena: ['lurking-tie-phantom'],
                    hasInitiative: true
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.changeOfHeart);
            context.player2.clickCard(context.battlefieldMarine);

            context.player1.clickCard(context.cidScaleback);

            expect(context.player2).toBeAbleToSelectExactly([context.battlefieldMarine, context.lurkingTiePhantom]);
            context.player2.clickCard(context.battlefieldMarine);

            expect(context.battlefieldMarine).toHaveExactUpgradeNames(['weakness']);
            expect(context.lurkingTiePhantom).toHaveExactUpgradeNames([]);

            expect(context.player2).toBeActivePlayer();
        });

        it('should not allow selecting a unit they own but do not control', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['cid-scaleback#cant-be-trusted', 'change-of-heart'],
                },
                player2: {
                    spaceArena: ['lurking-tie-phantom'],
                    groundArena: ['battlefield-marine'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.changeOfHeart);
            context.player1.clickCard(context.lurkingTiePhantom);

            context.player2.passAction();

            context.player1.clickCard(context.cidScaleback);

            expect(context.player2).toBeAbleToSelectExactly([context.battlefieldMarine]);
            context.player2.clickCard(context.battlefieldMarine);

            expect(context.battlefieldMarine).toHaveExactUpgradeNames(['weakness']);
            expect(context.lurkingTiePhantom).toHaveExactUpgradeNames([]);

            expect(context.player2).toBeActivePlayer();
        });
    });
});