describe('Dedra Meero, Not Wasting Time', function () {
    integration(function (contextRef) {
        describe('Dedra Meero\'s leader side action ability', function () {
            it('should let opponent choose to deal 2 damage to the chosen unit (and apply costs)', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'dedra-meero#not-wasting-time',
                        resources: 3,
                        groundArena: ['wampa'],
                    },
                    player2: {
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['tieln-fighter']
                    }
                });

                const { context } = contextRef;

                // Activate leader action ability
                context.player1.clickCard(context.dedraMeero);

                // Only enemy units should be selectable
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.tielnFighter]);

                // Choose opponent's ground unit
                context.player1.clickCard(context.battlefieldMarine);

                // Opponent should now have a choice between damaging that unit or letting P1 draw
                expect(context.player2).toHaveExactPromptButtons([
                    `${context.battlefieldMarine.title} takes 2 damage`,
                    'Opponent draws 1 card'
                ]);
                context.player2.clickPrompt(`${context.battlefieldMarine.title} takes 2 damage`);

                // Damage is applied and costs are paid (1 resource, exhaust leader)
                expect(context.battlefieldMarine.damage).toBe(2);
                expect(context.dedraMeeroNotWastingTime.exhausted).toBeTrue();
                expect(context.player1.exhaustedResourceCount).toBe(1);
            });

            it('should let opponent choose to let P1 draw a card (no damage dealt)', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'dedra-meero#not-wasting-time',
                        resources: 3,
                        hand: ['alliance-xwing'] // start with 1 known card for count
                    },
                    player2: {
                        groundArena: ['first-legion-snowtrooper']
                    }
                });

                const { context } = contextRef;

                const startingHand = context.player1.handSize;

                context.player1.clickCard(context.dedraMeero);

                expect(context.player1).toBeAbleToSelectExactly([context.firstLegionSnowtrooper]);
                context.player1.clickCard(context.firstLegionSnowtrooper);

                // Opponent lets P1 draw
                context.player2.clickPrompt('Opponent draws 1 card');

                expect(context.player1.handSize).toBe(startingHand + 1);
                expect(context.firstLegionSnowtrooper.damage).toBe(0);
                expect(context.dedraMeeroNotWastingTime.exhausted).toBeTrue();
                expect(context.player1.exhaustedResourceCount).toBe(1);
            });
        });

        describe('Dedra Meero\'s leader unit side constant ability (Raid 2)', function () {
            it('should grant Raid 2 while you have more cards in hand than an opponent', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'dedra-meero#not-wasting-time', deployed: true },
                        hand: ['wampa', 'atst'] // 2 cards
                    },
                    player2: {
                        hand: ['battlefield-marine'] // 1 card
                    }
                });

                const { context } = contextRef;

                // Attack opponent base; Dedra has power 2, Raid 2 should make it 4 damage to base
                context.player1.clickCard(context.dedraMeero);
                context.player1.clickCard(context.p2Base);

                expect(context.p2Base.damage).toBe(4);
            });

            it('should not grant Raid if you do not have more cards than an opponent', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'dedra-meero#not-wasting-time', deployed: true },
                        hand: ['wampa'] // 1 card
                    },
                    player2: {
                        hand: ['battlefield-marine', 'green-squadron-awing'] // 2 cards
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.dedraMeero);
                context.player1.clickCard(context.p2Base);

                // No Raid, so base takes only 2 damage (Dedra's power)
                expect(context.p2Base.damage).toBe(2);
            });
        });
    });
});