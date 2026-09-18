describe('Tarfful, Fighting from the Shadowlands', function () {
    integration(function (contextRef) {
        describe('Tarfful\'s leader side ability', function () {
            it('should pay 2 resources, exhaust, and discard a card to create a Beast token', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'tarfful#fighting-from-the-shadowlands',
                        hand: ['wampa', 'protector'],
                        resources: 4
                    },
                    player2: {
                        groundArena: ['battlefield-marine']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.tarfful);

                expect(context.player1).toHavePrompt('Choose a card to discard');
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.protector]);
                context.player1.clickCard(context.wampa);

                expect(context.tarfful.exhausted).toBeTrue();
                expect(context.player1.exhaustedResourceCount).toBe(2);
                expect(context.wampa).toBeInZone('discard', context.player1);

                const beast = context.player1.findCardByName('beast');
                expect(beast).toBeInZone('groundArena', context.player1);
                expect(context.player2).toBeActivePlayer();
            });

            it('should not be usable with no cards in hand', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'tarfful#fighting-from-the-shadowlands',
                        hand: [],
                        resources: 4
                    }
                });

                const { context } = contextRef;

                expect(context.tarfful).not.toHaveAvailableActionWhenClickedBy(context.player1);
            });
        });

        describe('Tarfful\'s leader unit side ability', function () {
            it('should pay 1 resource to create a Beast token when attacking', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'tarfful#fighting-from-the-shadowlands', deployed: true },
                        resources: 6
                    },
                    player2: {
                        groundArena: ['battlefield-marine']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.tarfful);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toHavePassAbilityPrompt('Pay 1 resource to create a Beast token');
                context.player1.clickPrompt('Trigger');

                expect(context.player1.exhaustedResourceCount).toBe(1);

                const beast = context.player1.findCardByName('beast');
                expect(beast).toBeInZone('groundArena', context.player1);

                expect(context.p2Base.damage).toBe(3);
                expect(context.player2).toBeActivePlayer();
            });

            it('should allow the player to pass the on-attack ability', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'tarfful#fighting-from-the-shadowlands', deployed: true },
                        resources: 6
                    },
                    player2: {
                        groundArena: ['battlefield-marine']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.tarfful);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toHavePassAbilityPrompt('Pay 1 resource to create a Beast token');
                context.player1.clickPrompt('Pass');

                expect(() => context.player1.findCardByName('beast')).toThrowError('Could not find any cards matching name beast');
                expect(context.p2Base.damage).toBe(3);
                expect(context.player1.exhaustedResourceCount).toBe(0);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
