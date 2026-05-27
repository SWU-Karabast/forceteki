describe('Hera Syndulla, Renegade General', function() {
    integration(function(contextRef) {
        it('Hera Syndulla\'s ability should heal damage on your base equal to damage you deal on opponent base', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['hera-syndulla#renegade-general'],
                    base: { card: 'colossus', damage: 8 }
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.heraSyndulla);
            context.player1.clickCard(context.p2Base);

            expect(context.player2).toBeActivePlayer();
            expect(context.p1Base.damage).toBe(5);
            expect(context.p2Base.damage).toBe(3);
        });

        it('Hera Syndulla\'s ability should heal damage on your base equal to damage you deal on opponent base (modified power)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['flash-the-vents'],
                    groundArena: ['hera-syndulla#renegade-general'],
                    base: { card: 'colossus', damage: 8 }
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.flashTheVents);
            context.player1.clickCard(context.heraSyndulla);
            context.player1.clickCard(context.p2Base);

            expect(context.player2).toBeActivePlayer();
            expect(context.p1Base.damage).toBe(3);
            expect(context.p2Base.damage).toBe(5);
        });

        it('Hera Syndulla\'s ability should heal damage on your base equal to damage you deal on opponent base (overwhelm)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['flash-the-vents'],
                    groundArena: ['hera-syndulla#renegade-general', 'cassian-andor#everything-for-the-rebellion'],

                    base: { card: 'colossus', damage: 8 }
                },
                player2: {
                    groundArena: [{ card: 'wampa', damage: 3 }]
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.flashTheVents);
            context.player1.clickCard(context.heraSyndulla);
            context.player1.clickCard(context.wampa);

            expect(context.player1).toHaveExactPromptButtons(['Heal 3 damage from your base', 'If the defending unit was defeated, deal 2 damage to a base']);
            context.player1.clickPrompt('Heal 3 damage from your base');

            expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base]);
            context.player1.clickCard(context.p2Base);

            expect(context.player2).toBeActivePlayer();
            expect(context.p1Base.damage).toBe(5);
            expect(context.p2Base.damage).toBe(5);
            expect(context.wampa).toBeInZone('discard');
            expect(context.heraSyndulla).toBeInZone('discard');
        });

        it('Hera Syndulla\'s ability should not heal any damage on your base if she does not deal damage on opponent base', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['hera-syndulla#renegade-general'],
                    base: { card: 'colossus', damage: 8 }
                },
                player2: {
                    hand: ['close-the-shield-gate'],
                    hasInitiative: true,
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.closeTheShieldGate);
            context.player2.clickCard(context.p2Base);

            context.player1.clickCard(context.heraSyndulla);
            context.player1.clickCard(context.p2Base);

            expect(context.player2).toBeActivePlayer();
            expect(context.p1Base.damage).toBe(8);
            expect(context.p2Base.damage).toBe(0);
        });

        it('Hera Syndulla\'s ability should not heal damage on your base if she does not attack opponent base', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['hera-syndulla#renegade-general'],
                    base: { card: 'colossus', damage: 8 }
                },
                player2: {
                    groundArena: ['battlefield-marine'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.heraSyndulla);
            context.player1.clickCard(context.battlefieldMarine);

            expect(context.player2).toBeActivePlayer();
            expect(context.p1Base.damage).toBe(8);
            expect(context.p2Base.damage).toBe(0);
            expect(context.battlefieldMarine).toBeInZone('discard');
        });
    });
});
