describe('Sabe, Queen\'s Shadow', function () {
    integration(function (contextRef) {
        describe('Sabe\'s undeployed ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'sabe#queens-shadow',
                        groundArena: ['wampa'],
                        deck: ['green-squadron-awing', 'yoda#old-master']
                    },
                    player2: {
                        groundArena: ['atst', 'specforce-soldier'],
                        deck: ['resupply', 'battlefield-marine', 'awing']
                    }
                });
            });

            it('should exhaust herself to look at the top 2 cards of opponent\'s deck and discard one when a friendly unit deals damage to a base', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toHavePassAbilityPrompt('Exhaust this leader. If you do, look at the top 2 cards of the defending player\'s deck. Discard 1 of those cards');
                context.player1.clickPrompt('Trigger');

                expect(context.player1).toHaveExactDisplayPromptCards({
                    selectable: [context.resupply, context.battlefieldMarine]
                });
                expect(context.player1).not.toHavePassAbilityButton();
                expect(context.player1).not.toHaveChooseNothingButton();

                context.player1.clickCardInDisplayCardPrompt(context.resupply);

                expect(context.player2).toBeActivePlayer();
                expect(context.resupply).toBeInZone('discard', context.player2);

                expect(context.player2.deck[0]).toBe(context.battlefieldMarine);
                expect(context.player2.deck[1]).toBe(context.awing);
            });

            it('should exhaust herself to look at the top 2 cards of opponent\'s deck and discard one when a friendly unit deals damage to a base (overwhelm)', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.specforceSoldier);

                expect(context.player1).toHavePassAbilityPrompt('Exhaust this leader. If you do, look at the top 2 cards of the defending player\'s deck. Discard 1 of those cards');
                context.player1.clickPrompt('Trigger');

                expect(context.player1).toHaveExactDisplayPromptCards({
                    selectable: [context.resupply, context.battlefieldMarine]
                });

                context.player1.clickCardInDisplayCardPrompt(context.resupply);

                expect(context.player2).toBeActivePlayer();
                expect(context.resupply).toBeInZone('discard', context.player2);

                expect(context.player2.deck[0]).toBe(context.battlefieldMarine);
                expect(context.player2.deck[1]).toBe(context.awing);
            });

            it('should does nothing when friendly unit does not deal damage to a base', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.atst);

                expect(context.player2).toBeActivePlayer();

                expect(context.player2.deck[0]).toBe(context.resupply);
                expect(context.player2.deck[1]).toBe(context.battlefieldMarine);
            });

            it('should does nothing when opponent unit deal damage to a base', function () {
                const { context } = contextRef;

                context.player1.passAction();

                context.player2.clickCard(context.atst);
                context.player2.clickCard(context.p1Base);

                expect(context.player1).toBeActivePlayer();
            });
        });

        it('Sabe\'s undeployed ability should exhaust herself to look at the top 2 cards of opponent\'s deck and discard one when a friendly unit deals damage to a base (empty deck)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'sabe#queens-shadow',
                    groundArena: ['wampa'],
                },
                player2: {
                    deck: []
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.p2Base);

            expect(context.player1).toHavePassAbilityPrompt('Exhaust this leader. If you do, look at the top 2 cards of the defending player\'s deck. Discard 1 of those cards');
            context.player1.clickPrompt('Trigger');

            expect(context.player2).toBeActivePlayer();
        });

        it('Sabe\'s undeployed ability should exhaust herself to look at the top 2 cards of opponent\'s deck and discard one when a friendly unit deals damage to a base (1 card left in deck)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'sabe#queens-shadow',
                    groundArena: ['wampa'],
                },
                player2: {
                    deck: ['awing']
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.p2Base);

            expect(context.player1).toHavePassAbilityPrompt('Exhaust this leader. If you do, look at the top 2 cards of the defending player\'s deck. Discard 1 of those cards');
            context.player1.clickPrompt('Trigger');

            expect(context.player1).toHaveExactDisplayPromptCards({
                selectable: [context.awing]
            });
            expect(context.player1).not.toHavePassAbilityButton();
            expect(context.player1).not.toHaveChooseNothingButton();

            context.player1.clickCardInDisplayCardPrompt(context.awing);

            expect(context.player2).toBeActivePlayer();
            expect(context.awing).toBeInZone('discard', context.player2);
        });

        describe('Sabe\'s deployed ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'sabe#queens-shadow', deployed: true },
                        groundArena: ['wampa', 'clone-commander-cody#commanding-the-212th'],
                    },
                    player2: {
                        groundArena: ['atst', 'specforce-soldier'],
                        hand: ['resupply', 'battlefield-marine', 'awing'],
                        deck: ['yoda#old-master']
                    }
                });
            });

            it('should look at opponent hand and may discard a card from it (opponent must draw) when she deals combat damage to base', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.sabe);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toHaveExactDisplayPromptCards({
                    selectable: [context.resupply, context.battlefieldMarine, context.awing]
                });
                expect(context.player1).toHaveEnabledPromptButton('Take nothing');

                context.player1.clickCardInDisplayCardPrompt(context.resupply);

                expect(context.player2).toBeActivePlayer();
                expect(context.p2Base.damage).toBe(5);
                expect(context.resupply).toBeInZone('discard', context.player2);
                expect(context.battlefieldMarine).toBeInZone('hand', context.player2);
                expect(context.awing).toBeInZone('hand', context.player2);
                expect(context.yoda).toBeInZone('hand', context.player2);
            });

            it('should look at opponent hand and may discard a card from it (opponent must draw) when she deals combat damage to base (overwhelm)', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.sabe);
                context.player1.clickCard(context.specforceSoldier);

                expect(context.player1).toHaveExactDisplayPromptCards({
                    selectable: [context.resupply, context.battlefieldMarine, context.awing]
                });
                expect(context.player1).toHaveEnabledPromptButton('Take nothing');

                context.player1.clickCardInDisplayCardPrompt(context.resupply);

                expect(context.player2).toBeActivePlayer();
                expect(context.resupply).toBeInZone('discard', context.player2);
                expect(context.battlefieldMarine).toBeInZone('hand', context.player2);
                expect(context.awing).toBeInZone('hand', context.player2);
                expect(context.yoda).toBeInZone('hand', context.player2);
            });

            it('should does nothing when she does not deal damage to base', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.sabe);
                context.player1.clickCard(context.atst);

                expect(context.player2).toBeActivePlayer();
            });

            it('should does nothing when friendly unit deal damage to base', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.p2Base);

                expect(context.player2).toBeActivePlayer();
            });

            it('should does nothing when enemy unit deal damage to base', function () {
                const { context } = contextRef;

                context.player1.passAction();

                context.player2.clickCard(context.atst);
                context.player2.clickCard(context.p1Base);

                expect(context.player1).toBeActivePlayer();
            });
        });

        it('Sabe\'s deployed ability should not break the game or make opponent to draw when he has empty hand', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: { card: 'sabe#queens-shadow', deployed: true },
                },
                player2: {
                    deck: ['yoda#old-master']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.sabe);
            context.player1.clickCard(context.p2Base);

            expect(context.player2).toBeActivePlayer();
            expect(context.yoda).toBeInZone('deck', context.player2);
        });
    });
});
