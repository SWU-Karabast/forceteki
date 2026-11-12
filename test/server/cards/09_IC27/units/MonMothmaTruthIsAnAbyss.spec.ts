describe('Mon Mothma, Truth Is An Abyss', function () {
    integration(function (contextRef) {
        describe('Mon Mothma\'s When Played ability', function () {
            it('should allow attacking with another unit, even if it is exhausted, giving it Overwhelm and restricting it to unit targets', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['mon-mothma#truth-is-an-abyss'],
                        groundArena: ['consular-security-force', { card: 'massassi-group-marines', exhausted: true }],
                    },
                    player2: {
                        groundArena: ['battlefield-marine'],
                    },
                });
                const { context } = contextRef;

                context.player1.clickCard(context.monMothma);

                // Can choose any other unit, even the exhausted Massassi Group Marines (Mon Mothma itself is not selectable)
                expect(context.player1).toBeAbleToSelectExactly([context.consularSecurityForce, context.massassiGroupMarines]);
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickCard(context.massassiGroupMarines);

                // The enemy base is not a legal target
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine]);
                context.player1.clickCard(context.battlefieldMarine);

                // The Marines (4 power, no innate Overwhelm) gain Overwhelm for the attack: they kill the 3/3 marine and deal 1 excess damage to the base
                expect(context.battlefieldMarine).toBeInZone('discard');
                expect(context.p2Base.damage).toBe(1);
                expect(context.massassiGroupMarines.damage).toBe(3);

                // Only one attack is granted: the turn passes to player 2
                expect(context.player2).toBeActivePlayer();
            });

            it('should be able to be passed without attacking', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['mon-mothma#truth-is-an-abyss'],
                        groundArena: ['consular-security-force'],
                    },
                    player2: {
                        groundArena: ['battlefield-marine'],
                    },
                });
                const { context } = contextRef;

                context.player1.clickCard(context.monMothma);
                expect(context.player1).toHavePrompt('Attack with another unit, even if it\'s exhausted. It gains Overwhelm and can\'t attack bases for this attack');
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickPrompt('Pass');

                expect(context.consularSecurityForce.exhausted).toBe(false);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
