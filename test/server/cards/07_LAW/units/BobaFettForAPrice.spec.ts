describe('Boba Fett, For a Price', function () {
    integration(function (contextRef) {
        it('should deal 3 damage to an enemy ground unit when played', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['boba-fett#for-a-price'],
                    groundArena: ['snowspeeder'],
                    spaceArena: ['strafing-gunship'],
                    leader: 'sly-moore#cipher-in-the-dark',
                    resources: 7,
                },
                player2: {
                    groundArena: ['consular-security-force'],
                    spaceArena: ['ruthless-raider']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.bobaFettForAPrice);

            context.player1.clickPrompt('Trigger');

            expect(context.player1).toBeAbleToSelectExactly([context.snowspeeder, context.bobaFettForAPrice, context.consularSecurityForce]);
            context.player1.clickCard(context.consularSecurityForce);

            expect(context.snowspeeder.damage).toBe(0);
            expect(context.bobaFettForAPrice.damage).toBe(0);
            expect(context.strafingGunship.damage).toBe(0);
            expect(context.consularSecurityForce.damage).toBe(3);
            expect(context.ruthlessRaider.damage).toBe(0);
            expect(context.player1.readyResourceCount).toBe(1);

            expect(context.player2).toBeActivePlayer();
        });

        it('should deal 3 damage to an enemy unit on attack', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['snowspeeder', 'boba-fett#for-a-price'],
                    spaceArena: ['strafing-gunship'],
                    resources: 5,
                },
                player2: {
                    groundArena: ['consular-security-force'],
                    spaceArena: ['ruthless-raider']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.bobaFettForAPrice);
            context.player1.clickCard(context.p2Base);

            context.player1.clickPrompt('Trigger');

            expect(context.player1).toBeAbleToSelectExactly([context.snowspeeder, context.bobaFettForAPrice, context.consularSecurityForce]);
            context.player1.clickCard(context.consularSecurityForce);

            expect(context.snowspeeder.damage).toBe(0);
            expect(context.bobaFettForAPrice.damage).toBe(0);
            expect(context.strafingGunship.damage).toBe(0);
            expect(context.consularSecurityForce.damage).toBe(3);
            expect(context.ruthlessRaider.damage).toBe(0);
            expect(context.player1.readyResourceCount).toBe(4);

            expect(context.player2).toBeActivePlayer();
        });

        it('should be able to be passed on attack', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['snowspeeder', 'boba-fett#for-a-price'],
                    spaceArena: ['strafing-gunship'],
                    resources: 5,
                },
                player2: {
                    groundArena: ['consular-security-force'],
                    spaceArena: ['ruthless-raider']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.bobaFettForAPrice);
            context.player1.clickCard(context.p2Base);

            context.player1.clickPrompt('Pass');

            expect(context.snowspeeder.damage).toBe(0);
            expect(context.bobaFettForAPrice.damage).toBe(0);
            expect(context.strafingGunship.damage).toBe(0);
            expect(context.consularSecurityForce.damage).toBe(0);
            expect(context.ruthlessRaider.damage).toBe(0);
            expect(context.player1.readyResourceCount).toBe(5);

            expect(context.player2).toBeActivePlayer();
        });

        it('should be able to be passed when played', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['boba-fett#for-a-price'],
                    groundArena: ['snowspeeder'],
                    spaceArena: ['strafing-gunship'],
                    leader: 'sly-moore#cipher-in-the-dark',
                    resources: 7,
                },
                player2: {
                    groundArena: ['consular-security-force'],
                    spaceArena: ['ruthless-raider']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.bobaFettForAPrice);

            context.player1.clickPrompt('Pass');

            expect(context.snowspeeder.damage).toBe(0);
            expect(context.bobaFettForAPrice.damage).toBe(0);
            expect(context.strafingGunship.damage).toBe(0);
            expect(context.consularSecurityForce.damage).toBe(0);
            expect(context.ruthlessRaider.damage).toBe(0);
            expect(context.player1.readyResourceCount).toBe(2);

            expect(context.player2).toBeActivePlayer();
        });

        it('should not trigger if there are not enough resources on attack', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['snowspeeder', 'boba-fett#for-a-price'],
                    spaceArena: ['strafing-gunship'],
                    resources: 0,
                },
                player2: {
                    groundArena: ['consular-security-force'],
                    spaceArena: ['ruthless-raider']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.bobaFettForAPrice);
            context.player1.clickCard(context.p2Base);

            expect(context.snowspeeder.damage).toBe(0);
            expect(context.bobaFettForAPrice.damage).toBe(0);
            expect(context.strafingGunship.damage).toBe(0);
            expect(context.consularSecurityForce.damage).toBe(0);
            expect(context.ruthlessRaider.damage).toBe(0);
            expect(context.player1.readyResourceCount).toBe(0);

            expect(context.player2).toBeActivePlayer();
        });

        it('should not trigger if there are not enough resources when played', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['boba-fett#for-a-price'],
                    groundArena: ['snowspeeder'],
                    spaceArena: ['strafing-gunship'],
                    leader: 'sly-moore#cipher-in-the-dark',
                    resources: 5,
                },
                player2: {
                    groundArena: ['consular-security-force'],
                    spaceArena: ['ruthless-raider']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.bobaFettForAPrice);

            expect(context.snowspeeder.damage).toBe(0);
            expect(context.bobaFettForAPrice.damage).toBe(0);
            expect(context.strafingGunship.damage).toBe(0);
            expect(context.consularSecurityForce.damage).toBe(0);
            expect(context.ruthlessRaider.damage).toBe(0);
            expect(context.player1.readyResourceCount).toBe(0);

            expect(context.player2).toBeActivePlayer();
        });
    });
});