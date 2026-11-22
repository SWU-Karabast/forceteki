describe('Kylo Ren, Supreme Leader', function () {
    integration(function (contextRef) {
        describe('Kylo Ren\'s undeployed ability', function () {
            it('should discard a card from hand to give an Experience token to any unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'kylo-ren#supreme-leader',
                        hand: ['waylay', 'protector'],
                        groundArena: ['death-star-stormtrooper'],
                        resources: 3,
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['awing']
                    }
                });

                const { context } = contextRef;

                // Activate Kylo Ren's ability and choose a unit
                context.player1.clickCard(context.kyloRen);
                expect(context.player1).toHavePrompt('Give an Experience token to a unit');
                expect(context.player1).toBeAbleToSelectExactly([context.deathStarStormtrooper, context.wampa, context.awing]);
                context.player1.clickCard(context.awing);

                // Choose a card to discard as a cost
                expect(context.player1).toBeAbleToSelectExactly([context.waylay, context.protector]);
                context.player1.clickCard(context.waylay);

                // Experience token is given, card is discarded, turn passes
                expect(context.kyloRen.exhausted).toBeTrue();
                expect(context.waylay).toBeInZone('discard');
                expect(context.protector).toBeInZone('hand');
                expect(context.awing).toHaveExactUpgradeNames(['experience']);
                expect(context.player1.exhaustedResourceCount).toBe(0);
                expect(context.player2).toBeActivePlayer();
            });

            it('should not be usable without a card in hand', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'kylo-ren#supreme-leader',
                        groundArena: ['death-star-stormtrooper'],
                        resources: 3,
                    }
                });

                const { context } = contextRef;

                // No card in hand to discard, so the action is unavailable
                expect(context.kyloRen).not.toHaveAvailableActionWhenClickedBy(context.player1);
            });

            it('should discard the only card in hand to pay the cost', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'kylo-ren#supreme-leader',
                        hand: ['waylay'],
                        groundArena: ['death-star-stormtrooper'],
                        resources: 3,
                    }
                });

                const { context } = contextRef;

                // Activate Kylo Ren's ability and choose a unit
                context.player1.clickCard(context.kyloRen);
                context.player1.clickCard(context.deathStarStormtrooper);

                // The discard is still chosen, even with a single card in hand
                expect(context.player1).toBeAbleToSelectExactly([context.waylay]);
                context.player1.clickCard(context.waylay);

                // Experience token is given, card is discarded, turn passes
                expect(context.kyloRen.exhausted).toBeTrue();
                expect(context.waylay).toBeInZone('discard');
                expect(context.deathStarStormtrooper).toHaveExactUpgradeNames(['experience']);
                expect(context.player2).toBeActivePlayer();
            });

            it('should still discard and exhaust when there is no unit to give the Experience token to', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'kylo-ren#supreme-leader',
                        hand: ['waylay', 'protector'],
                        resources: 3,
                    }
                });

                const { context } = contextRef;

                // Activate Kylo Ren's ability without any unit in play, and confirm anyway
                context.player1.clickCard(context.kyloRen);
                context.player1.clickPrompt('Use it anyway');
                context.player1.clickCard(context.waylay);

                // Costs are still paid
                expect(context.kyloRen.exhausted).toBeTrue();
                expect(context.waylay).toBeInZone('discard');
                expect(context.protector).toBeInZone('hand');
                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('Kylo Ren\'s deployed ability', function () {
            it('should return a unit from your discard pile to your hand when deployed', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'kylo-ren#supreme-leader',
                        discard: ['battlefield-marine', 'atst', 'waylay', 'entrenched'],
                        resources: 5,
                    },
                    player2: {
                        discard: ['wampa']
                    }
                });

                const { context } = contextRef;

                // Deploy Kylo Ren and choose a unit to return
                context.player1.clickCard(context.kyloRen);
                context.player1.clickPrompt('Deploy Kylo Ren');

                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.atst]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.atst);

                // Only the chosen unit returns to hand
                expect(context.kyloRen).toBeInZone('groundArena');
                expect(context.atst).toBeInZone('hand');
                expect(context.battlefieldMarine).toBeInZone('discard');
                expect(context.waylay).toBeInZone('discard');
                expect(context.entrenched).toBeInZone('discard');
                expect(context.wampa).toBeInZone('discard');
                expect(context.player2).toBeActivePlayer();
            });

            it('should allow the player to decline returning a unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'kylo-ren#supreme-leader',
                        discard: ['battlefield-marine'],
                        resources: 5,
                    }
                });

                const { context } = contextRef;

                // Deploy Kylo Ren and decline to return a unit
                context.player1.clickCard(context.kyloRen);
                context.player1.clickPrompt('Deploy Kylo Ren');

                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine]);
                context.player1.clickPrompt('Pass');

                // Discard pile is unchanged
                expect(context.kyloRen).toBeInZone('groundArena');
                expect(context.battlefieldMarine).toBeInZone('discard');
                expect(context.player2).toBeActivePlayer();
            });

            it('should do nothing when there is no unit in your discard pile', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'kylo-ren#supreme-leader',
                        discard: ['waylay'],
                        resources: 5,
                    },
                    player2: {
                        discard: ['wampa']
                    }
                });

                const { context } = contextRef;

                // Deploy Kylo Ren, no unit in discard pile to return
                context.player1.clickCard(context.kyloRen);
                context.player1.clickPrompt('Deploy Kylo Ren');

                expect(context.kyloRen).toBeInZone('groundArena');
                expect(context.waylay).toBeInZone('discard');
                expect(context.wampa).toBeInZone('discard');
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
