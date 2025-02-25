describe('Enforced Loyalty', function() {
    integration(function(contextRef) {
        describe('Enforced Loyalty\'s ability', function() {
            it('should defeat a friendly unit and draw 2 cards', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['enforced-loyalty'],
                        groundArena: ['pyke-sentinel'],
                        spaceArena: ['cartel-spacer']
                    },
                    player2: {
                        groundArena: ['wampa']
                    },

                    // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                    autoSingleTarget: true
                });

                const { context } = contextRef;

                context.player1.clickCard(context.enforcedLoyalty);
                expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel, context.cartelSpacer]);

                context.player1.clickCard(context.pykeSentinel);
                expect(context.pykeSentinel).toBeInZone('discard');
                expect(context.player1.handSize).toBe(2);
                expect(context.player2).toBeActivePlayer();
            });
        });

        it('should do nothing if there are no friendly units', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['enforced-loyalty']
                },
                player2: {
                    groundArena: ['wampa']
                },

                // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                autoSingleTarget: true
            });

            const { context } = contextRef;

            context.player1.clickCard(context.enforcedLoyalty);
            expect(context.player1.handSize).toBe(0);
            expect(context.player2).toBeActivePlayer();
        });

        it('should draw 1 card and damage base for 3 if only 1 card in deck', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['enforced-loyalty'],
                    groundArena: ['pyke-sentinel'],
                    deck: ['atst']
                },

                // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                autoSingleTarget: true
            });

            const { context } = contextRef;

            context.player1.clickCard(context.enforcedLoyalty);
            expect(context.player1.handSize).toBe(1);
            expect(context.p1Base.damage).toBe(3);
            expect(context.player2).toBeActivePlayer();
        });

        it('should draw no cards and damage base for 6 if no cards in deck', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['enforced-loyalty'],
                    groundArena: ['pyke-sentinel'],
                    deck: []
                },

                // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                autoSingleTarget: true
            });

            const { context } = contextRef;

            context.player1.clickCard(context.enforcedLoyalty);
            expect(context.player1.handSize).toBe(0);
            expect(context.p1Base.damage).toBe(6);
            expect(context.player2).toBeActivePlayer();
        });
    });
});
