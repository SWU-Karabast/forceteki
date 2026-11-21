describe('Zygerrian Starhopper', function() {
    integration(function(contextRef) {
        it('Zygerrian Starhopper\'s ability should deal 2 indirect damage to a player when defeated', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: ['avenger#hunting-star-destroyer', 'zygerrian-starhopper'],
                },
                player2: {
                    groundArena: [{ card: 'wampa', upgrades: ['shield'] }],
                    hand: ['vanquish'],
                }
            });

            const { context } = contextRef;

            // Player 2 defeats Zygerrian Starhopper
            context.player1.passAction();
            context.player2.clickCard(context.vanquish);
            context.player2.clickCard(context.zygerrianStarhopper);

            expect(context.player1).toHaveEnabledPromptButtons(['Deal indirect damage to yourself', 'Deal indirect damage to opponent']);
            context.player1.clickPrompt('Deal indirect damage to opponent');
            expect(context.player2).toBeAbleToSelectExactly([context.wampa, context.p2Base]);
            expect(context.player2).not.toHaveChooseNothingButton();
            context.player2.setDistributeIndirectDamagePromptState(new Map([
                [context.wampa, 1],
                [context.p2Base, 1]
            ]));

            expect(context.player1).toBeActivePlayer();
            expect(context.wampa.damage).toBe(1);
            expect(context.wampa).toHaveExactUpgradeNames(['shield']);
            expect(context.p2Base.damage).toBe(1);
        });

        it('Zygerrian Starhopper\'s ability should be resolved by the new controller when defeated by No Glory, Only Results', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: ['zygerrian-starhopper'],
                    groundArena: [{ card: 'wampa', upgrades: ['shield'] }],
                },
                player2: {
                    hand: ['no-glory-only-results'],
                    groundArena: ['battlefield-marine'],
                    hasInitiative: true
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.noGloryOnlyResults);
            context.player2.clickCard(context.zygerrianStarhopper);

            // player2 controlled Zygerrian Starhopper when it was defeated, so "opponent" is player1
            expect(context.player2).toHaveEnabledPromptButtons(['Deal indirect damage to yourself', 'Deal indirect damage to opponent']);
            context.player2.clickPrompt('Deal indirect damage to opponent');

            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.p1Base]);
            context.player1.setDistributeIndirectDamagePromptState(new Map([
                [context.wampa, 1],
                [context.p1Base, 1]
            ]));

            expect(context.wampa.damage).toBe(1);
            expect(context.wampa).toHaveExactUpgradeNames(['shield']);
            expect(context.p1Base.damage).toBe(1);
            expect(context.p2Base.damage).toBe(0);
            expect(context.battlefieldMarine.damage).toBe(0);
            expect(context.zygerrianStarhopper).toBeInZone('discard', context.player1);
            expect(context.player1).toBeActivePlayer();
        });
    });
});
