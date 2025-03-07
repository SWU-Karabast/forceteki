describe('Cassian Andor, Threading the Eye', function() {
    integration(function(contextRef) {
        describe('Cassian Andor\'s on-attack ability', function () {
            it('should not trigger if he is a unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['cassian-andor#threading-the-eye']
                    },
                    player2: {
                        deck: ['wampa']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.cassianAndor);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(3);
                expect(context.wampa).toBeInZone('deck');
            });

            it('should discard a card from the opponent\'s deck and draw a card because it costed 3 or less', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        deck: ['wampa'],
                        spaceArena: [{ card: 'concord-dawn-interceptors', upgrades: ['cassian-andor#threading-the-eye'] }]
                    },
                    player2: {
                        deck: ['confiscate']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.concordDawnInterceptors);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(2);
                expect(context.confiscate).toBeInZone('discard');
                expect(context.wampa).toBeInZone('hand');
            });

            it('should discard a card from the opponent\'s deck but not draw a card because it costed more than 3', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        deck: ['confiscate'],
                        spaceArena: [{ card: 'concord-dawn-interceptors', upgrades: ['cassian-andor#threading-the-eye'] }]
                    },
                    player2: {
                        deck: ['wampa']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.concordDawnInterceptors);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(2);
                expect(context.wampa).toBeInZone('discard');
                expect(context.confiscate).toBeInZone('deck');
            });

            it('should not draw a card if no card is discarded from the opponent\'s deck', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        deck: ['confiscate'],
                        spaceArena: [{ card: 'concord-dawn-interceptors', upgrades: ['cassian-andor#threading-the-eye'] }]
                    },
                    player2: {
                        deck: []
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.concordDawnInterceptors);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(2);
                expect(context.confiscate).toBeInZone('deck');
            });
        });
    });
});