describe('Oggdo Bogdo, Bogano Brute', function () {
    integration(function (contextRef) {
        it('Oggdo Bogdo should not be able to attack the opponent\'s base when damaged', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['oggdo-bogdo#bogano-brute'],
                },
                player2: {
                    hand: ['daring-raid']
                }
            });

            const { context } = contextRef;

            expect(context.oggdoBogdo).not.toHaveAvailableActionWhenClickedBy(context.player1);
            context.player1.passAction();

            context.player2.clickCard(context.daringRaid);
            context.player2.clickCard(context.oggdoBogdo);

            context.player1.clickCard(context.oggdoBogdo);
            context.player1.clickCard(context.p2Base);

            expect(context.player2).toBeActivePlayer();
            expect(context.oggdoBogdo.damage).toBe(2);
        });

        it('Oggdo Bogdo should heal himself if he attacks and kill a unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: [{ card: 'oggdo-bogdo#bogano-brute', damage: 1 }],
                },
                player2: {
                    groundArena: ['battlefield-marine'],
                }
            });

            const { context } = contextRef;
            context.player1.clickCard(context.oggdoBogdo);
            context.player1.clickCard(context.battlefieldMarine);

            expect(context.player2).toBeActivePlayer();
            expect(context.oggdoBogdo.damage).toBe(2); // 1 + 3 -2
        });

        it('Oggdo Bogdo should not heal himself if he doesn\'t kill defender', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: [{ card: 'oggdo-bogdo#bogano-brute', damage: 1 }],
                },
                player2: {
                    groundArena: ['consular-security-force'],
                }
            });

            const { context } = contextRef;
            context.player1.clickCard(context.oggdoBogdo);
            context.player1.clickCard(context.consularSecurityForce);

            expect(context.player2).toBeActivePlayer();
            expect(context.oggdoBogdo.damage).toBe(4); // 1 + 3
        });

        it('Oggdo Bogdo should not heal himself if he dies before', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: [{ card: 'oggdo-bogdo#bogano-brute', damage: 1 }],
                },
                player2: {
                    groundArena: ['wampa'],
                }
            });

            const { context } = contextRef;
            context.player1.clickCard(context.oggdoBogdo);
            context.player1.clickCard(context.wampa);

            expect(context.player2).toBeActivePlayer();
            expect(context.oggdoBogdo).toBeInZone('discard');
        });
    });
});
