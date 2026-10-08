describe('Fighters for Freedom', function() {
    integration(function(contextRef) {
        describe('Fighters for Freedom\'s ability', function() {
            it('should allow dealing 1 damage to a base when playing an aggression card', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['wampa', 'wilderness-fighter'],
                        groundArena: ['fighters-for-freedom']
                    },
                    player2: {
                        hand: ['death-star-stormtrooper'],
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.wampa);

                // Player1 playing aggression card triggers ability
                expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.p2Base);
                expect(context.player2).toBeActivePlayer();
                expect(context.p2Base.damage).toBe(1);

                // Player2 playing aggression does not trigger ability
                context.player2.clickCard(context.deathStarStormtrooper);
                expect(context.player1).toBeActivePlayer();

                // Player1 playing vigilance does not trigger ability
                context.player1.clickCard(context.wildernessFighter);
                expect(context.player2).toBeActivePlayer();
            });
        });

        it('should trigger when its controller plays an opponent-owned Aggression unit from the discard pile with Unrefusable Offer', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['fighters-for-freedom', 'wampa']
                },
                player2: {
                    groundArena: [{ card: 'death-star-stormtrooper', upgrades: ['unrefusable-offer'] }]
                }
            });
            const { context } = contextRef;

            // Defeat the opponent's Aggression unit and collect the bounty to play it under player1's control
            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.deathStarStormtrooper);
            expect(context.player1).toHavePassAbilityPrompt('Collect Bounty: Play this unit for free (under your control). It enters play ready. At the start of the regroup phase, defeat it');
            context.player1.clickPrompt('Trigger');

            expect(context.deathStarStormtrooper).toBeInZone('groundArena', context.player1);
            expect(context.deathStarStormtrooper.owner).toBe(context.player2.player);

            // Fighters for Freedom reacts to player1 playing the opponent-owned Aggression card
            expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base]);
            expect(context.player1).toHavePassAbilityButton();
            context.player1.clickCard(context.p2Base);

            expect(context.p2Base.damage).toBe(4); // 3 overwhelm damage from Wampa + 1 from Fighters for Freedom
            expect(context.player2).toBeActivePlayer();
        });
    });
});
