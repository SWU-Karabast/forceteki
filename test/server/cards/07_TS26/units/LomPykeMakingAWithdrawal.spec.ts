describe('Lom Pyke, Making A Withdrawal', function () {
    integration(function (contextRef) {
        it('Lom Pyke\'s ability when opponent triggers the ability, should heal 5 damage from opponent base and give 2 Experience tokens to a unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['lom-pyke#making-a-withdrawal'],
                    groundArena: ['battlefield-marine'],
                    base: { card: 'echo-base', damage: 10 },
                },
                player2: {
                    base: { card: 'echo-base', damage: 10 },
                    groundArena: ['atst'],
                    spaceArena: ['awing']
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.lomPyke);
            expect(context.player2).toHavePassAbilityPrompt('Heal 5 damage from your base. If you do, your opponent gives 2 Experience tokens to a unit');
            context.player2.clickPrompt('Trigger');

            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.atst, context.lomPyke, context.awing]);
            context.player1.clickCard(context.atst);

            expect(context.player2).toBeActivePlayer();
            expect(context.p2Base.damage).toBe(5);
            expect(context.p1Base.damage).toBe(10);
            expect(context.atst).toHaveExactUpgradeNames(['experience', 'experience']);
        });

        it('Lom Pyke\'s ability when opponent pass the ability, should not heal 5 damage and give 2 Experience tokens to a unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['lom-pyke#making-a-withdrawal'],
                    groundArena: ['battlefield-marine'],
                    base: { card: 'echo-base', damage: 10 },
                },
                player2: {
                    base: { card: 'echo-base', damage: 10 },
                    groundArena: ['atst'],
                    spaceArena: ['awing']
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.lomPyke);
            expect(context.player2).toHavePassAbilityPrompt('Heal 5 damage from your base. If you do, your opponent gives 2 Experience tokens to a unit');
            context.player2.clickPrompt('Pass');

            expect(context.player2).toBeActivePlayer();
            expect(context.p2Base.damage).toBe(10);
            expect(context.p1Base.damage).toBe(10);
            expect(context.atst).toHaveExactUpgradeNames([]);
            expect(context.awing).toHaveExactUpgradeNames([]);
            expect(context.lomPyke).toHaveExactUpgradeNames([]);
        });

        it('Lom Pyke\'s ability when opponent cannot heal his base, should not give Experience tokens', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['lom-pyke#making-a-withdrawal'],
                },
                player2: {
                    groundArena: ['atst'],
                    spaceArena: ['awing']
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.lomPyke);

            expect(context.player2).toBeActivePlayer();
            expect(context.atst).toHaveExactUpgradeNames([]);
            expect(context.awing).toHaveExactUpgradeNames([]);
            expect(context.lomPyke).toHaveExactUpgradeNames([]);
        });

        it('Lom Pyke\'s ability when opponent cannot heal his base, should not give Experience tokens (with Confederate Tri-Fighter)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['lom-pyke#making-a-withdrawal'],
                    spaceArena: ['confederate-trifighter']
                },
                player2: {
                    groundArena: ['atst'],
                    spaceArena: ['awing'],
                    base: { card: 'echo-base', damage: 10 },
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.lomPyke);

            expect(context.player2).toBeActivePlayer();
            expect(context.atst).toHaveExactUpgradeNames([]);
            expect(context.awing).toHaveExactUpgradeNames([]);
            expect(context.confederateTrifighter).toHaveExactUpgradeNames([]);
            expect(context.lomPyke).toHaveExactUpgradeNames([]);
        });
    });
});
