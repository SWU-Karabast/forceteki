describe('Criminal Contact', function () {
    integration(function (contextRef) {
        describe('Criminal Contact\'s ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['criminal-contact'],
                    },
                });
            });

            it('should allow paying 2 resources to create a Credit token when attacking', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.criminalContact);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toHavePassAbilityPrompt('Pay 2 resources to create a Credit token');
                context.player1.clickPrompt('Trigger');

                expect(context.player2).toBeActivePlayer();
                expect(context.player1.credits).toBe(1);
                expect(context.player1.exhaustedResourceCount).toBe(2);
            });

            it('should allow the player to pass ability', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.criminalContact);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toHavePassAbilityPrompt('Pay 2 resources to create a Credit token');
                context.player1.clickPrompt('Pass');

                expect(context.player2).toBeActivePlayer();
                expect(context.player1.credits).toBe(0);
                expect(context.player1.exhaustedResourceCount).toBe(0);
            });
        });

        it('should allow paying 1 resource an 1 credit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['criminal-contact'],
                    resources: 1,
                    credits: 1
                },
            });
            const { context } = contextRef;


            context.player1.clickCard(context.criminalContact);
            context.player1.clickCard(context.p2Base);
            expect(context.player1).toHavePassAbilityPrompt('Pay 2 resources to create a Credit token');
            context.player1.clickPrompt('Trigger');
            expect(context.player1).toHavePrompt('Use Credit tokens to pay for Criminal Contact\'s effect');
            context.player1.clickPrompt('Use 1 Credit');

            expect(context.player2).toBeActivePlayer();
            expect(context.player1.credits).toBe(1);
            expect(context.player1.exhaustedResourceCount).toBe(1);
        });

        it('should not trigger if player cannot pay 2 resources', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['criminal-contact'],
                    resources: 1,
                },
            });
            const { context } = contextRef;


            context.player1.clickCard(context.criminalContact);
            context.player1.clickCard(context.p2Base);

            expect(context.player2).toBeActivePlayer();
            expect(context.player1.credits).toBe(0);
            expect(context.player1.exhaustedResourceCount).toBe(0);
        });
    });
});
