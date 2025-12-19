describe('Common bases in A Lawless Time', function() {
    integration(function(contextRef) {
        describe('Epic Action', function() {
            it('plays a unit from hand, ignoring one of its non-Heroism, non-Villainy aspect penalties', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'kazuda-xiono#best-pilot-in-the-galaxy', // Cunning
                        base: 'daimyos-palace', // Vigilance
                        resources: 3,
                        hand: ['blue-leader#scarif-air-support'], // Command
                    }
                });

                const { context } = contextRef;

                // Blue Leader should not be playable initially due to Command aspect
                expect(context.player1).not.toBeAbleToSelect(context.blueLeader);

                // Use the base's Epic Action to play Blue Leader, ignoring Command aspect penalty
                context.player1.clickCard(context.daimyosPalace);
                expect(context.player1).toBeAbleToSelectExactly([context.blueLeader]);
                context.player1.clickCard(context.blueLeader);

                // Verify Blue Leader is now in play and resources were spent
                expect(context.blueLeader).toBeInZone('spaceArena', context.player1);
                expect(context.player1.exhaustedResourceCount).toBe(3);
                expect(context.daimyosPalace.epicActionSpent).toBeTrue();
            });

            it('when there are multiple different penalty aspects, only one is ignored', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'kazuda-xiono#best-pilot-in-the-galaxy', // Cunning
                        base: 'green-common-law-base', // Command
                        resources: 7,
                        hand: ['zeb-orrelios#spectre-four'], // Aggression, Vigilance, Heroism
                    }
                });

                const { context } = contextRef;

                // Zeb Orrelios should not be playable initially due to Aggression and Vigilance aspects
                expect(context.player1).not.toBeAbleToSelect(context.zebOrrelios);

                // Use the base's Epic Action to play Zeb Orrelios, ignoring one aspect penalty
                context.player1.clickCard(context.greenCommonLawBase);
                expect(context.player1).toBeAbleToSelectExactly([context.zebOrrelios]);
                context.player1.clickCard(context.zebOrrelios);
                context.player1.clickPrompt('Pass'); // Pass Zeb's when played ability

                // Verify Zeb Orrelios is now in play and resources were spent
                expect(context.zebOrrelios).toBeInZone('groundArena', context.player1);
                expect(context.player1.exhaustedResourceCount).toBe(7); // Base cost 5, ignoring 1 of 2 penalty aspects
                expect(context.greenCommonLawBase.epicActionSpent).toBeTrue();
            });

            it('when there are multiple of the same penalty aspect, only one of them is ignored', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'kazuda-xiono#best-pilot-in-the-galaxy', // Cunning
                        base: 'daimyos-palace', // Vigilance
                        resources: 6,
                        hand: ['enterprising-lackeys'], // Command, Command
                    }
                });

                const { context } = contextRef;

                // Enterprising Lackeys should not be playable initially due to double Command aspect
                expect(context.player1).not.toBeAbleToSelect(context.enterprisingLackeys);

                // Use the base's Epic Action to play Enterprising Lackeys, ignoring one Command aspect penalty
                context.player1.clickCard(context.daimyosPalace);
                expect(context.player1).toBeAbleToSelectExactly([context.enterprisingLackeys]);
                context.player1.clickCard(context.enterprisingLackeys);

                // Verify Enterprising Lackeys is now in play and resources were spent
                expect(context.enterprisingLackeys).toBeInZone('groundArena', context.player1);
                expect(context.player1.exhaustedResourceCount).toBe(6); // Base cost 4, ignoring 1 of 2 penalty aspects
                expect(context.daimyosPalace.epicActionSpent).toBeTrue();
            });

            it('when there are multiple of the same aspect, and only one is penalized, that one is ignored', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'kazuda-xiono#best-pilot-in-the-galaxy', // Cunning
                        base: 'daimyos-palace', // Vigilance
                        resources: 4,
                        hand: ['duchesss-champion'], // Vigilance, Vigilance
                    }
                });

                const { context } = contextRef;

                // Duchess's Champion should not be playable initially due to second Vigilance aspect
                expect(context.player1).not.toBeAbleToSelect(context.duchesssChampion);

                // Use the base's Epic Action to play Duchess's Champion, ignoring one Vigilance aspect penalty
                context.player1.clickCard(context.daimyosPalace);
                expect(context.player1).toBeAbleToSelectExactly([context.duchesssChampion]);
                context.player1.clickCard(context.duchesssChampion);

                // Verify Duchess's Champion is now in play and resources were spent
                expect(context.duchesssChampion).toBeInZone('groundArena', context.player1);
                expect(context.player1.exhaustedResourceCount).toBe(4); // Base cost 4, ignoring 1 Vigilance aspect penalty
                expect(context.daimyosPalace.epicActionSpent).toBeTrue();
            });

            it('does not ignore Heroism or Villainy aspect penalties', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'kazuda-xiono#best-pilot-in-the-galaxy', // Cunning
                        base: 'daimyos-palace', // Vigilance
                        hand: ['supremacy-tiesf'], // Vigilance, Villainy
                    },
                    player2: {
                        leader: 'kylo-ren#were-not-done-yet', // Vigilance
                        base: 'red-common-law-base', // Aggression
                        hand: ['village-protectors'], // Vigilance, Heroism
                    }
                });

                const { context } = contextRef;

                // P1 uses Daimyo's Palace to play Supremacy TIE/sf
                context.player1.clickCard(context.daimyosPalace);
                expect(context.player1).toBeAbleToSelectExactly([context.supremacyTiesf]);
                context.player1.clickCard(context.supremacyTiesf);

                // It was not discounted since ability does not ignore Villainy aspect penalty
                expect(context.supremacyTiesf).toBeInZone('spaceArena', context.player1);
                expect(context.player1.exhaustedResourceCount).toBe(5); // Base cost 3 + 2 penalty
                expect(context.daimyosPalace.epicActionSpent).toBeTrue();

                // P2 uses Red Common LAW Base to play Village Protectors
                context.player2.clickCard(context.redCommonLawBase);
                expect(context.player2).toBeAbleToSelectExactly([context.villageProtectors]);
                context.player2.clickCard(context.villageProtectors);

                // It was not discounted since ability does not ignore Heroism aspect penalty
                expect(context.villageProtectors).toBeInZone('groundArena', context.player2);
                expect(context.player2.exhaustedResourceCount).toBe(5); // Base cost 3 + 2 penalty
                expect(context.redCommonLawBase.epicActionSpent).toBeTrue();
            });

            it('gives no discount if there are no penalized aspects', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'kazuda-xiono#best-pilot-in-the-galaxy', // Cunning, Heroism
                        base: 'daimyos-palace', // Vigilance
                        resources: 2,
                        hand: ['fireball#an-explosion-with-wings'], // Cunning, Heroism
                    }
                });

                const { context } = contextRef;

                // Use the base's Epic Action to play Fireball
                context.player1.clickCard(context.daimyosPalace);
                expect(context.player1).toBeAbleToSelectExactly([context.fireball]);
                context.player1.clickCard(context.fireball);

                // Verify Fireball is now in play and resources were spent
                expect(context.fireball).toBeInZone('spaceArena', context.player1);
                expect(context.player1.exhaustedResourceCount).toBe(2); // No discount applied
                expect(context.daimyosPalace.epicActionSpent).toBeTrue();
            });

            it('gives no discount if the card has no aspects', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'kazuda-xiono#best-pilot-in-the-galaxy', deployed: true }, // Cunning
                        base: 'daimyos-palace', // Vigilance
                        hand: [
                            'restock',
                            'headhunter-squadron',
                            'death-star-plans'
                        ],
                    }
                });

                const { context } = contextRef;

                // Use the base's Epic Action to play Death Star Plans
                context.player1.clickCard(context.daimyosPalace);
                expect(context.player1).toBeAbleToSelectExactly([
                    // Can target all card types
                    context.restock,
                    context.headhunterSquadron,
                    context.deathStarPlans
                ]);
                context.player1.clickCard(context.deathStarPlans);
                context.player1.clickCard(context.kazudaXiono);

                // Verify Death Star Plans is now in play and resources were spent
                expect(context.kazudaXiono).toHaveExactUpgradeNames(['death-star-plans']);
                expect(context.player1.exhaustedResourceCount).toBe(2); // No discount applied
                expect(context.daimyosPalace.epicActionSpent).toBeTrue();
            });

            it('can be used to soft pass if there are no legal targets in hand', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        base: 'daimyos-palace',
                        hand: [],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.daimyosPalace);
                context.player1.clickPrompt('Use it anyway');

                expect(context.daimyosPalace.epicActionSpent).toBeTrue();
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
