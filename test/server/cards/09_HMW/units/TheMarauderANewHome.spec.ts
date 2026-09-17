describe('The Marauder, A New Home', function () {
    integration(function (contextRef) {
        describe('The Marauder\'s cost reduction', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'leia-organa#alliance-general',
                        hand: ['the-marauder#a-new-home'],
                        groundArena: ['wampa', 'battlefield-marine'],
                        spaceArena: ['green-squadron-awing'],
                        resources: 10
                    },
                    player2: {
                        groundArena: ['atst']
                    }
                });
            });

            it('should offer to damage friendly units, and pay full cost when declined', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.theMarauder);
                expect(context.player1).toHaveExactPromptButtons(['Pay cost normally', 'Damage friendly units to reduce cost', 'Cancel']);
                context.player1.clickPrompt('Pay cost normally');

                expect(context.theMarauder).toBeInZone('spaceArena', context.player1);
                expect(context.player1.exhaustedResourceCount).toBe(7);
                expect(context.wampa.damage).toBe(0);
                expect(context.battlefieldMarine.damage).toBe(0);
                expect(context.greenSquadronAwing.damage).toBe(0);
                expect(context.player2).toBeActivePlayer();
            });

            it('should reduce the cost by 1 and deal 1 damage for each friendly unit chosen', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.theMarauder);
                context.player1.clickPrompt('Damage friendly units to reduce cost');

                // Only friendly units are offered, from either arena
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.battlefieldMarine, context.greenSquadronAwing]);

                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.greenSquadronAwing);
                context.player1.clickDone();

                expect(context.theMarauder).toBeInZone('spaceArena', context.player1);
                expect(context.player1.exhaustedResourceCount).toBe(5);
                expect(context.wampa.damage).toBe(1);
                expect(context.greenSquadronAwing.damage).toBe(1);
                expect(context.battlefieldMarine.damage).toBe(0);
                expect(context.atst.damage).toBe(0);
                expect(context.player2).toBeActivePlayer();
            });

            it('should allow choosing every friendly unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.theMarauder);
                context.player1.clickPrompt('Damage friendly units to reduce cost');

                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.greenSquadronAwing);
                context.player1.clickDone();

                expect(context.theMarauder).toBeInZone('spaceArena', context.player1);
                expect(context.player1.exhaustedResourceCount).toBe(4);
                expect(context.wampa.damage).toBe(1);
                expect(context.battlefieldMarine.damage).toBe(1);
                expect(context.greenSquadronAwing.damage).toBe(1);
            });

            it('should require enough units to be chosen to afford the card when resources are short', function () {
                const { context } = contextRef;

                // 5 ready resources against a cost of 7: at least 2 units must be chosen
                context.player1.exhaustResources(5);

                context.player1.clickCard(context.theMarauder);
                expect(context.player1).toHaveExactPromptButtons(['Damage friendly units to reduce cost', 'Cancel']);
                context.player1.clickPrompt('Damage friendly units to reduce cost');

                context.player1.clickCard(context.wampa);
                expect(context.player1).not.toHaveEnabledPromptButton('Done');

                context.player1.clickCard(context.battlefieldMarine);
                expect(context.player1).toHaveEnabledPromptButton('Done');
                context.player1.clickDone();

                expect(context.theMarauder).toBeInZone('spaceArena', context.player1);
                expect(context.player1.exhaustedResourceCount).toBe(10);
                expect(context.wampa.damage).toBe(1);
                expect(context.battlefieldMarine.damage).toBe(1);
            });
        });

        it('The Marauder\'s cost reduction should still apply when the damage defeats a unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'leia-organa#alliance-general',
                    hand: ['the-marauder#a-new-home'],
                    groundArena: ['death-star-stormtrooper', 'wampa'],
                    resources: 10
                },
                player2: {
                    groundArena: ['atst']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.theMarauder);
            context.player1.clickPrompt('Damage friendly units to reduce cost');
            context.player1.clickCard(context.deathStarStormtrooper);
            context.player1.clickDone();

            // The 1-HP trooper is defeated by the damage, but it still counted toward the discount
            expect(context.theMarauder).toBeInZone('spaceArena', context.player1);
            expect(context.deathStarStormtrooper).toBeInZone('discard', context.player1);
            expect(context.player1.exhaustedResourceCount).toBe(6);
        });

        it('The Marauder\'s cost reduction should still apply when a Shield absorbs the damage', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'leia-organa#alliance-general',
                    hand: ['the-marauder#a-new-home'],
                    groundArena: [{ card: 'wampa', upgrades: ['shield'] }],
                    resources: 10
                },
                player2: {
                    groundArena: ['atst']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.theMarauder);
            context.player1.clickPrompt('Damage friendly units to reduce cost');
            context.player1.clickCard(context.wampa);
            context.player1.clickDone();

            expect(context.theMarauder).toBeInZone('spaceArena', context.player1);
            expect(context.wampa.damage).toBe(0);
            expect(context.wampa).toHaveExactUpgradeNames([]);
            expect(context.player1.exhaustedResourceCount).toBe(6);
        });

        it('The Marauder should play normally with no prompt when there are no friendly units', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'leia-organa#alliance-general',
                    hand: ['the-marauder#a-new-home'],
                    resources: 10
                },
                player2: {
                    groundArena: ['atst']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.theMarauder);

            expect(context.theMarauder).toBeInZone('spaceArena', context.player1);
            expect(context.player1.exhaustedResourceCount).toBe(7);
            expect(context.player2).toBeActivePlayer();
        });
    });
});
