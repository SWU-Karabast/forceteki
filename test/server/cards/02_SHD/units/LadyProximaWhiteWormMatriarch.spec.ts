describe('Lady Proxima, White Worm Matriarch', function() {
    integration(function(contextRef) {
        describe('Lady Proxima\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['greedo#slow-on-the-draw', 'death-star-stormtrooper'],
                        groundArena: ['lady-proxima#white-worm-matriarch']
                    },
                    player2: {
                        hand: ['pyke-sentinel'],
                    }
                });
            });

            it('should allow dealing 1 damage to a base when playing an Underworld card', function () {
                const { context } = contextRef;

                // Player 1 plays Underworld card with Lady Proxima in play triggering ability
                context.player1.clickCard(context.greedoSlowOnTheDraw);
                expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base]);
                expect(context.player1).toHavePassAbilityButton();

                // Player 1 selects Player 2's base, dealing 1 damage
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(1);
                expect(context.player2).toBeActivePlayer();

                // Player 2 plays Underworld card, not triggering Lady Proxima's ability
                context.player2.clickCard(context.pykeSentinel);
                expect(context.p2Base.damage).toBe(1);
                expect(context.player1).toBeActivePlayer();

                // Player 1 play non-Underworld card, not triggering Lady Proxima's ability
                context.player1.clickCard(context.deathStarStormtrooper);
                expect(context.p2Base.damage).toBe(1);
                expect(context.player2).toBeActivePlayer();
            });
        });

        it('should trigger when its controller plays an opponent-owned Underworld unit from the discard pile with Stolen AT-Hauler', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['takedown'],
                    groundArena: ['lady-proxima#white-worm-matriarch']
                },
                player2: {
                    spaceArena: ['stolen-athauler']
                }
            });
            const { context } = contextRef;

            // Defeat the opponent's Stolen AT-Hauler so player1 may play it from player2's discard pile
            context.player1.clickCard(context.takedown);
            context.player1.clickCard(context.stolenAthauler);
            expect(context.stolenAthauler).toBeInZone('discard', context.player2);

            context.player2.passAction();

            context.player1.clickCard(context.stolenAthauler);
            expect(context.stolenAthauler).toBeInZone('spaceArena', context.player1);

            // Lady Proxima reacts to player1 playing the opponent-owned Underworld card
            expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base]);
            expect(context.player1).toHavePassAbilityButton();
            context.player1.clickCard(context.p2Base);

            expect(context.p2Base.damage).toBe(1);
            expect(context.player2).toBeActivePlayer();
        });
    });
});