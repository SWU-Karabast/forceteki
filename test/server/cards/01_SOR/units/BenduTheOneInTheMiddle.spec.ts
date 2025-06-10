describe('Bendu, The One in the Middle', function() {
    integration(function(contextRef) {
        describe('Bendu\'s on-attack ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: [
                            'cloud-city-wing-guard',
                            'echo-base-defender',
                            'emperors-royal-guard',
                            'wilderness-fighter',
                            'consortium-starviper',
                            'homestead-militia',
                            'vanquish',
                            'hwk290-freighter',
                            'wroshyr-tree-tender'
                        ],
                        groundArena: ['bendu#the-one-in-the-middle'],
                        leader: 'luke-skywalker#faithful-friend',
                        base: 'echo-base'
                    },
                    player2: {
                        groundArena: ['wampa', 'battlefield-marine']
                    }
                });
            });

            it('should decrease the cost of the next non-Heroism, non-Villainy played by the controller by 2', function () {
                const { context } = contextRef;

                const resetState = () => {
                    context.player1.readyResources(10);
                    context.player2.passAction();
                };

                const benduAttack = () => {
                    context.player1.clickCard(context.bendu);
                    context.player1.clickCard(context.wampa);
                    context.setDamage(context.wampa, 0);
                    context.setDamage(context.bendu, 0);
                    context.readyCard(context.bendu);
                    context.player2.passAction();
                };

                // CASE 1: play non-Heroism, non-Villainy (NHNV) card before Bendu attacks - no discount
                context.player1.clickCard(context.cloudCityWingGuard);
                expect(context.cloudCityWingGuard).toBeInZone('groundArena');
                expect(context.player1.exhaustedResourceCount).toBe(3);

                resetState();

                // Bendu attacks to active discount
                benduAttack();

                // CASE 2: Heroism card played after Bendu attacks - no discount
                context.player1.clickCard(context.echoBaseDefender);
                expect(context.echoBaseDefender).toBeInZone('groundArena');
                expect(context.player1.exhaustedResourceCount).toBe(3);

                resetState();

                // CASE 3: Villainy card played after Bendu attacks - no discount
                context.player1.clickCard(context.emperorsRoyalGuard);
                expect(context.emperorsRoyalGuard).toBeInZone('groundArena');
                expect(context.player1.exhaustedResourceCount).toBe(5);  // 5 because of Villainy penalty

                resetState();

                // CASE 4: first NHNV card played after Bendu attacks - discount applied
                context.player1.clickCard(context.wildernessFighter);
                expect(context.player1.exhaustedResourceCount).toBe(1);
                expect(context.wildernessFighter).toBeInZone('groundArena');

                resetState();

                // CASE 5: second NHNV card played after Bendu attacks - no discount
                context.player1.clickCard(context.consortiumStarviper);
                expect(context.player1.exhaustedResourceCount).toBe(3);
                expect(context.consortiumStarviper).toBeInZone('spaceArena');

                resetState();

                // Bendu attacks again, pass phase
                benduAttack();
                context.moveToNextActionPhase();

                // CASE 6: NHNV card played after Bendu attacks in previous phase - no discount
                context.player1.clickCard(context.homesteadMilitia);
                expect(context.player1.exhaustedResourceCount).toBe(3);
                expect(context.homesteadMilitia).toBeInZone('groundArena');

                // Bendu attacks twice in a row to get double discount
                resetState();
                benduAttack();
                benduAttack();

                // CASE 7: next NHNV card played after two Bendu activations gets discount of 4
                context.player1.clickCard(context.vanquish);
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.player1.exhaustedResourceCount).toBe(1);

                resetState();

                // CASE 8: second NHNV card played after Bendu double attack - no discount
                context.player1.clickCard(context.hwk290Freighter);
                expect(context.player1.exhaustedResourceCount).toBe(3);
                expect(context.hwk290Freighter).toBeInZone('spaceArena');

                // Bendu defeated due to combat
                resetState();
                context.setDamage(context.bendu, 5);
                context.player1.clickCard(context.bendu);
                context.player1.clickCard(context.wampa);
                context.player2.passAction();

                // CASE 9: NHNV card played after Bendu defeated during attack - discount applied
                context.player1.clickCard(context.wroshyrTreeTender);
                expect(context.player1.exhaustedResourceCount).toBe(1);
                expect(context.wroshyrTreeTender).toBeInZone('groundArena');
            });
        });

        it('should decrease the cost of the next non-Heroism, non-Villainy played by the original controller by 2 after changing controller', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: [
                        'cloud-city-wing-guard',
                        'echo-base-defender',
                        'emperors-royal-guard',
                        'wilderness-fighter',
                        'consortium-starviper',
                        'homestead-militia',
                        'vanquish',
                        'hwk290-freighter',
                        'wroshyr-tree-tender'
                    ],
                    groundArena: ['bendu#the-one-in-the-middle'],
                    leader: 'luke-skywalker#faithful-friend',
                    base: 'echo-base'
                },
                player2: {
                    base: 'massassi-temple',
                    groundArena: ['battlefield-marine'],
                    hand: ['change-of-heart', 'wampa'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.bendu);
            context.player1.clickCard(context.p2Base);

            context.player2.clickCard(context.changeOfHeart);
            context.player2.clickCard(context.bendu);

            context.player1.clickCard(context.cloudCityWingGuard);
            expect(context.cloudCityWingGuard).toBeInZone('groundArena');
            expect(context.player1.exhaustedResourceCount).toBe(1);

            const exhaustedResourceCount = context.player2.exhaustedResourceCount;
            context.player2.clickCard(context.wampa);
            expect(context.wampa).toBeInZone('groundArena');
            expect(context.player2.exhaustedResourceCount).toBe(exhaustedResourceCount + 4);
        });
    });
});
