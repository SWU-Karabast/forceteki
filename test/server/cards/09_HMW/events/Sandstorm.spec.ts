describe('Sandstorm', function() {
    integration(function(contextRef) {
        it('Sandstorm\'s ability should cost 1 less to play while you control a Tatooine base and should choose an arena to give a weakness to each enemy exhausted unit', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['sandstorm'],
                    base: 'jabbas-palace',
                    groundArena: [{ card: 'battlefield-marine', exhausted: true }],
                },
                player2: {
                    groundArena: [{ card: 'wampa', exhausted: true }, { card: 'yoda#old-master', exhausted: true }, 'atst'],
                    spaceArena: [{ card: 'awing', exhausted: true }]
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.sandstorm);
            expect(context.player1).toHavePrompt('Choose an arena');

            expect(context.player1).toHaveEnabledPromptButtons(['Ground', 'Space']);
            context.player1.clickPrompt('Ground');

            expect(context.player2).toBeActivePlayer();
            expect(context.player1.exhaustedResourceCount).toBe(2);

            expect(context.wampa).toHaveExactUpgradeNames(['weakness']);
            expect(context.yoda).toHaveExactUpgradeNames(['weakness']);
            expect(context.battlefieldMarine).toHaveExactUpgradeNames([]);
            expect(context.atst).toHaveExactUpgradeNames([]);
        });

        it('Sandstorm\'s ability should not cost 1 less to play while you do not control a Tatooine base', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['sandstorm'],
                    base: 'chopper-base',
                    groundArena: [{ card: 'battlefield-marine', exhausted: true }],
                },
                player2: {
                    groundArena: [{ card: 'wampa', exhausted: true }, { card: 'yoda#old-master', exhausted: true }, 'atst'],
                    spaceArena: [{ card: 'awing', exhausted: true }]
                }
            });

            const { context } = contextRef;
            context.player1.clickCard(context.sandstorm);

            expect(context.player1).toHavePrompt('Choose an arena');
            expect(context.player1).toHaveEnabledPromptButtons(['Ground', 'Space']);
            context.player1.clickPrompt('Ground');

            expect(context.player2).toBeActivePlayer();
            expect(context.player1.exhaustedResourceCount).toBe(3);

            expect(context.wampa).toHaveExactUpgradeNames(['weakness']);
            expect(context.yoda).toHaveExactUpgradeNames(['weakness']);
            expect(context.battlefieldMarine).toHaveExactUpgradeNames([]);
            expect(context.atst).toHaveExactUpgradeNames([]);
        });

        it('Sandstorm\'s ability should do not prompt if an arena is empty', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['sandstorm'],
                    base: 'chopper-base',
                    groundArena: [{ card: 'battlefield-marine', exhausted: true }],
                },
                player2: {
                    groundArena: [{ card: 'wampa', exhausted: true }, { card: 'yoda#old-master', exhausted: true }, 'atst'],
                }
            });

            const { context } = contextRef;
            context.player1.clickCard(context.sandstorm);

            expect(context.player2).toBeActivePlayer();
            expect(context.player1.exhaustedResourceCount).toBe(3);

            expect(context.wampa).toHaveExactUpgradeNames(['weakness']);
            expect(context.yoda).toHaveExactUpgradeNames(['weakness']);
            expect(context.battlefieldMarine).toHaveExactUpgradeNames([]);
            expect(context.atst).toHaveExactUpgradeNames([]);
        });
    });
});
