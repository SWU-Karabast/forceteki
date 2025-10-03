describe('Malakili, Loving Rancor Keeper', function () {
    integration(function (contextRef) {
        it('Malakili\'s ability should decrease cost of the first friendly Creature unit played', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['wampa', 'tukata', 'hunting-nexu', 'cantina-braggart'],
                    groundArena: ['malakili#loving-rancor-keeper'],
                    base: 'kcm-mining-facility'
                },
                player2: {
                    hand: ['terentatek'],
                    base: 'echo-base'
                }
            });
            const { context } = contextRef;

            context.player1.passAction();

            // opponent play a unit, nothing happen
            context.player2.clickCard(context.terentatek);
            expect(context.player2.exhaustedResourceCount).toBe(5);

            // we play a creature unit, he should cost 1 resource less
            context.player1.clickCard(context.wampa);
            expect(context.player2).toBeActivePlayer();
            expect(context.player1.exhaustedResourceCount).toBe(3);

            context.player2.passAction();

            // the second unit we play must not have a discount
            context.player1.clickCard(context.tukata);
            expect(context.player1.exhaustedResourceCount).toBe(6);

            context.moveToNextActionPhase();

            // next phase, discount reset
            context.player1.clickCard(context.huntingNexu);
            expect(context.player1.exhaustedResourceCount).toBe(3);

            context.moveToNextActionPhase();

            // discount work only for Creature
            context.player1.clickCard(context.cantinaBraggart);
            expect(context.player1.exhaustedResourceCount).toBe(1);
        });

        it('Malakili\'s ability should prevent damage on friendly unit done by friendly Creature unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hasForceToken: true,
                    hand: ['wild-rancor'],
                    groundArena: ['malakili#loving-rancor-keeper', 'wampa', 'battlefield-marine'],
                },
                player2: {
                    groundArena: ['atst']
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.wildRancor);

            const promptTable = [
                'If a friendly Creature unit would deal damage to a friendly unit, prevent that damage: Malakili',
                'If a friendly Creature unit would deal damage to a friendly unit, prevent that damage: Wampa',
                'If a friendly Creature unit would deal damage to a friendly unit, prevent that damage: Battlefield Marine'
            ];

            expect(context.player1).toHaveExactPromptButtons(promptTable);
            context.player1.clickPrompt(promptTable[0]);
            context.player1.clickPrompt(promptTable[1]);

            expect(context.player2).toBeActivePlayer();
            expect(context.atst.damage).toBe(2);
            expect(context.malakili.damage).toBe(0);
            expect(context.wampa.damage).toBe(0);
            expect(context.battlefieldMarine.damage).toBe(0);
        });

        it('Malakili\'s ability should not prevent attack damage', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hasForceToken: true,
                    hand: ['wild-rancor'],
                    groundArena: ['malakili#loving-rancor-keeper', 'wampa', 'battlefield-marine'],
                },
                player2: {
                    groundArena: ['consular-security-force']
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.consularSecurityForce);

            expect(context.player2).toBeActivePlayer();
            expect(context.consularSecurityForce.damage).toBe(4);
            expect(context.wampa.damage).toBe(3);
        });

        // it('Malakili\'s ability should prevent damage on friendly unit done by friendly Creature unit (stolen)', async function () {
        //     await contextRef.setupTestAsync({
        //         phase: 'action',
        //         player1: {
        //             hasForceToken: true,
        //             hand: ['wild-rancor'],
        //             groundArena: ['malakili#loving-rancor-keeper', 'wampa', 'battlefield-marine'],
        //         },
        //         player2: {
        //             hand: ['change-of-heart', 'jabbas-rancor#pateesa'],
        //             groundArena: ['atst']
        //         }
        //     });
        //     const { context } = contextRef;

        //     context.player1.passAction();

        //     // steal malakili
        //     context.player2.clickCard(context.changeOfHeart);
        //     context.player2.clickCard(context.malakili);

        //     context.player1.clickCard(context.wildRancor);

        //     // wild rancor damage everyone
        //     expect(context.player2).toBeActivePlayer();
        //     expect(context.atst.damage).toBe(2);
        //     expect(context.malakili.damage).toBe(2);
        //     expect(context.wampa.damage).toBe(2);
        //     expect(context.battlefieldMarine.damage).toBe(2);

        //     context.setDamage(context.wampa, 0);
        //     context.setDamage(context.atst, 0);

        //     // play jabba's rancor
        //     context.player2.clickCard(context.jabbasRancor);
        //     context.player2.clickCard(context.atst);
        //     context.player2.clickCard(context.wampa);

        //     // damage should be prevented on player 2 friendly unit
        //     expect(context.player1).toBeActivePlayer();
        //     expect(context.atst.damage).toBe(0);
        //     expect(context.wampa.damage).toBe(3);
        // });
    });
});
