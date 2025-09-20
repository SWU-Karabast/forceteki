describe('Figure of Unity', function () {
    integration(function (contextRef) {
        it('while the attached unit is ready, each other friendly unit gains Overwhelm, Raid 1, and Restore 1', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['figure-of-unity'],
                    groundArena: ['echo#valiant-arc-trooper', 'battlefield-marine'],
                    base: { card: 'echo-base', damage: 10 }
                },
                player2: {
                    groundArena: ['death-star-stormtrooper', 'jedha-agitator']
                }
            });

            const { context } = contextRef;

            // Attach Figure of Unity to the unique unit (Echo)
            context.player1.clickCard(context.figureOfUnity);
            context.player1.clickCard(context.echo);

            context.player2.passAction();

            // Attack base with Battlefield Marine: should deal 3 + Raid 1 = 4 to Death Star Stormtrooper, 3 damage should be done to base due to Overwhelm
            context.player1.clickCard(context.battlefieldMarine);
            context.player1.clickCard(context.deathStarStormtrooper);
            expect(context.p2Base.damage).toBe(3);
            expect(context.p1Base.damage).toBe(9);

            context.player2.clickCard(context.jedhaAgitator);
            context.player2.clickCard(context.p1Base);

            expect(context.p1Base.damage).toBe(11); // 9 + 2
            expect(context.p2Base.damage).toBe(3);
        });
        it('while the attached unit is ready, each other friendly unit gains Overwhelm, Raid 1, and Restore 1 (test with Oppo Rancisis)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['figure-of-unity'],
                    groundArena: ['echo#valiant-arc-trooper', 'battlefield-marine', 'oppo-rancisis#ancient-councilor'],
                    base: { card: 'echo-base', damage: 10 }
                },
                player2: {
                    groundArena: ['death-star-stormtrooper']
                }
            });

            const { context } = contextRef;

            // Attach Figure of Unity to the unique unit (Echo)
            context.player1.clickCard(context.figureOfUnity);
            context.player1.clickCard(context.echo);

            context.player2.passAction();

            context.player1.clickCard(context.battlefieldMarine);
            context.player1.clickCard(context.p2Base);

            context.setDamage(context.p1Base, 10);
            context.setDamage(context.p2Base, 0);

            context.player2.passAction();

            context.player1.clickCard(context.oppoRancisis);
            context.player1.clickCard(context.deathStarStormtrooper);
            // should have restore 3, raid 3 and overwhelm

            expect(context.player2).toBeActivePlayer();
            expect(context.p1Base.damage).toBe(7);
            expect(context.p2Base.damage).toBe(5);
        });

        it('turns off when the attached unit is exhausted (no bonuses for other friendly units)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['figure-of-unity'],
                    groundArena: ['echo#valiant-arc-trooper', 'battlefield-marine'],
                    base: { card: 'echo-base', damage: 1 }
                }
            });

            const { context } = contextRef;

            // Attach to C-3PO
            context.player1.clickCard(context.figureOfUnity);
            context.player1.clickCard(context.echo);

            context.player2.passAction();

            // Exhaust the attached unit by attacking the base
            context.player1.clickCard(context.echo);
            context.player1.clickCard(context.p2Base);

            // Now Battlefield Marine should NOT get Raid 1 this phase
            const lastEnemyBaseDamage = context.p2Base.damage;
            context.player2.passAction();
            context.player1.clickCard(context.battlefieldMarine);
            context.player1.clickCard(context.p2Base);
            // Marine base power is 3; without Raid 1, only +3 damage should be added
            expect(context.p2Base.damage).toBe(lastEnemyBaseDamage + 3);
            expect(context.p1Base.damage).toBe(1);
        });
    });
});
