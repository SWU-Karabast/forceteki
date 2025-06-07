describe('Oppo Rancisis, Ancient Councilor', function() {
    integration(function(contextRef) {
        it('Oppo Rancisis should do nothing when he is the only unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['oppo-rancisis#ancient-councilor'],
                }
            });

            const { context } = contextRef;
            context.player1.clickCard(context.oppoRancisis);
            expect(context.player2).toBeActivePlayer();
        });

        it('Oppo Rancisis should gain Ambush when a friendly unit has Ambush', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['cloudrider'],
                    hand: ['oppo-rancisis#ancient-councilor'],
                },
                player2: {
                    groundArena: ['battlefield-marine']
                }
            });

            const { context } = contextRef;
            context.player1.clickCard(context.oppoRancisis);
            expect(context.player1).toHavePassAbilityPrompt('Ambush');
            context.player1.clickPrompt('Trigger');

            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine]);
            context.player1.clickCard(context.battlefieldMarine);
            expect(context.battlefieldMarine).toBeInZone('discard');
            expect(context.oppoRancisis.damage).toBe(3);
            expect(context.player2).toBeActivePlayer();
        });

        it('Oppo Rancisis should gain Shielded when a friendly unit has Shielded', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['crafty-smuggler'],
                    hand: ['oppo-rancisis#ancient-councilor'],
                },
                player2: {
                    groundArena: ['battlefield-marine']
                }
            });

            const { context } = contextRef;
            context.player1.clickCard(context.oppoRancisis);
            expect(context.oppoRancisis).toHaveExactUpgradeNames(['shield']);
            expect(context.player2).toBeActivePlayer();
        });

        it('Oppo Rancisis should gain multiple keywords', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['crafty-smuggler', 'cloudrider'],
                    hand: ['oppo-rancisis#ancient-councilor'],
                },
                player2: {
                    groundArena: ['battlefield-marine']
                }
            });

            const { context } = contextRef;
            context.player1.clickCard(context.oppoRancisis);
            expect(context.player1).toHavePassAbilityPrompt('Ambush');
            context.player1.clickPrompt('Ambush');

            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine]);
            context.player1.clickCard(context.battlefieldMarine);
            expect(context.battlefieldMarine).toBeInZone('discard');
            expect(context.oppoRancisis.damage).toBe(3);

            context.player1.clickPrompt('Shielded');
            expect(context.oppoRancisis).toHaveExactUpgradeNames(['shield']);
            expect(context.player2).toBeActivePlayer();
        });
    });
});