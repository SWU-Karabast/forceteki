describe('Poggle the Lesser, Secret Designs', function () {
    integration(function (contextRef) {
        it('Poggle the Lesser\'s ability should pay 1 resource and discard a card to make the next card played this phase cost 3 resources less', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['poggle-the-lesser#secret-designs'],
                    hand: ['wampa', 'atst', 'droid-deployment'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.poggleTheLesser);
            context.player1.clickCard(context.p2Base);

            expect(context.player1).toHavePassAbilityPrompt('Pay 1 resource and discard a card from your hand to make the next card you play this phase cost 3 resources less');
            context.player1.clickPrompt('Trigger');

            expect(context.player1).toHavePrompt('Choose a card to discard for Poggle the Lesser\'s effect');
            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.atst, context.droidDeployment]);

            context.player1.clickCard(context.droidDeployment);

            // resource payment resolves together with the discard
            expect(context.droidDeployment).toBeInZone('discard', context.player1);
            expect(context.player1.exhaustedResourceCount).toBe(1);
            expect(context.player2).toBeActivePlayer();

            context.player2.passAction();

            // next card played costs 3 less (Wampa: 4 -> 1)
            context.player1.clickCard(context.wampa);
            expect(context.wampa).toBeInZone('groundArena', context.player1);
            expect(context.player1.exhaustedResourceCount).toBe(2);

            context.player2.passAction();

            // the discount is used up: AT-ST costs full 6
            context.player1.clickCard(context.atst);
            expect(context.atst).toBeInZone('groundArena', context.player1);
            expect(context.player1.exhaustedResourceCount).toBe(8);
        });

        it('Poggle the Lesser\'s ability should do nothing when the player passes', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['poggle-the-lesser#secret-designs'],
                    hand: ['wampa', 'atst'],
                    resources: 10
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.poggleTheLesser);
            context.player1.clickCard(context.p2Base);

            expect(context.player1).toHavePassAbilityPrompt('Pay 1 resource and discard a card from your hand to make the next card you play this phase cost 3 resources less');
            context.player1.clickPrompt('Pass');

            expect(context.player2).toBeActivePlayer();
            expect(context.player1.exhaustedResourceCount).toBe(0);
            expect(context.wampa).toBeInZone('hand', context.player1);
            expect(context.atst).toBeInZone('hand', context.player1);

            context.player2.passAction();

            // no discount applied (Wampa costs full 4)
            context.player1.clickCard(context.wampa);
            expect(context.wampa).toBeInZone('groundArena', context.player1);
            expect(context.player1.exhaustedResourceCount).toBe(4);
        });

        it('Poggle the Lesser\'s ability should not be available if the player has no cards in hand', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['poggle-the-lesser#secret-designs'],
                    hand: [],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.poggleTheLesser);
            context.player1.clickCard(context.p2Base);

            expect(context.player2).toBeActivePlayer();
            expect(context.player1.exhaustedResourceCount).toBe(0);
        });

        it('Poggle the Lesser\'s ability should not be available if all the player\'s resources are exhausted', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['poggle-the-lesser#secret-designs'],
                    hand: ['wampa', 'atst'],
                    resources: { readyCount: 0, exhaustedCount: 5 }
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.poggleTheLesser);
            context.player1.clickCard(context.p2Base);

            expect(context.player2).toBeActivePlayer();
            expect(context.wampa).toBeInZone('hand', context.player1);
            expect(context.atst).toBeInZone('hand', context.player1);
            expect(context.player1.exhaustedResourceCount).toBe(5);
        });

        it('Poggle the Lesser\'s discount should not apply to the opponent\'s cards and should not be consumed by them', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['poggle-the-lesser#secret-designs'],
                    hand: ['wampa', 'atst'],
                    resources: 10
                },
                player2: {
                    hand: ['cloud-city-wing-guard'],
                    resources: 10
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.poggleTheLesser);
            context.player1.clickCard(context.p2Base);
            context.player1.clickPrompt('Trigger');
            context.player1.clickCard(context.atst);

            expect(context.player2).toBeActivePlayer();

            // opponent's card is not discounted (Cloud City Wing Guard costs full 3)
            context.player2.clickCard(context.cloudCityWingGuard);
            expect(context.cloudCityWingGuard).toBeInZone('groundArena', context.player2);
            expect(context.player2.exhaustedResourceCount).toBe(3);

            // the discount is still available for the controller's next card (Wampa: 4 -> 1)
            context.player1.clickCard(context.wampa);
            expect(context.wampa).toBeInZone('groundArena', context.player1);
            expect(context.player1.exhaustedResourceCount).toBe(2);
        });

        it('Poggle the Lesser\'s discount should expire at the end of the phase', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['poggle-the-lesser#secret-designs'],
                    hand: ['wampa', 'atst'],
                    resources: 10
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.poggleTheLesser);
            context.player1.clickCard(context.p2Base);
            context.player1.clickPrompt('Trigger');
            context.player1.clickCard(context.atst);

            context.moveToNextActionPhase();

            // Wampa costs full 4 in the next phase
            context.player1.clickCard(context.wampa);
            expect(context.wampa).toBeInZone('groundArena', context.player1);
            expect(context.player1.exhaustedResourceCount).toBe(4);
        });

        it('Poggle the Lesser\'s discount should stack when the ability resolves twice in the same phase', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['poggle-the-lesser#secret-designs'],
                    hand: ['giant-gorax', 'atst', 'droid-deployment'],
                    resources: 10
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.poggleTheLesser);
            context.player1.clickCard(context.p2Base);
            context.player1.clickPrompt('Trigger');
            context.player1.clickCard(context.droidDeployment);

            context.player2.passAction();
            context.readyCard(context.poggleTheLesser);

            context.player1.clickCard(context.poggleTheLesser);
            context.player1.clickCard(context.p2Base);
            context.player1.clickPrompt('Trigger');
            context.player1.clickCard(context.atst);

            context.player2.passAction();

            expect(context.player1.exhaustedResourceCount).toBe(2);
            context.player1.clickCard(context.giantGorax);
            expect(context.player1.exhaustedResourceCount).toBe(3);
        });
    });
});
