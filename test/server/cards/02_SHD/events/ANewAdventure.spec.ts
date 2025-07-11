describe('A New Adventure', function() {
    integration(function(contextRef) {
        describe('A New Adventure\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['a-new-adventure'],
                        groundArena: ['salacious-crumb#obnoxious-pet', 'atat-suppressor'],
                        spaceArena: ['cartel-spacer'],
                        leader: 'asajj-ventress#unparalleled-adversary',
                        base: { card: 'jedha-city', damage: 2 }
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['redemption#medical-frigate', 'patrolling-vwing']
                    }
                });
            });

            it('should return an enemy unit to hand and then the opponent can play it for free', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.aNewAdventure);
                expect(context.player1).toBeAbleToSelectExactly([context.salaciousCrumb, context.cartelSpacer, context.wampa, context.patrollingVwing]);

                context.player1.clickCard(context.patrollingVwing);
                expect(context.patrollingVwing).toBeInZone('hand');
                expect(context.player2).toHavePassAbilityPrompt('Play Patrolling V-Wing for free');

                context.player2.clickPrompt('Trigger');
                expect(context.patrollingVwing).toBeInZone('spaceArena');
                expect(context.player2.exhaustedResourceCount).toBe(0);
                expect(context.player2.handSize).toBe(1);   // from V-Wing ability
            });

            it('should return a friendly unit to hand and then the controller can play it for free', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.aNewAdventure);
                expect(context.player1).toBeAbleToSelectExactly([context.salaciousCrumb, context.cartelSpacer, context.wampa, context.patrollingVwing]);

                context.player1.clickCard(context.salaciousCrumb);
                expect(context.salaciousCrumb).toBeInZone('hand');
                expect(context.player1).toHavePassAbilityPrompt('Play Salacious Crumb for free');

                context.player1.clickPrompt('Trigger');
                expect(context.salaciousCrumb).toBeInZone('groundArena');
                expect(context.player1.exhaustedResourceCount).toBe(2); // just the cost of A New Adventure
                expect(context.p1Base.damage).toBe(1);   // from Crumb ability
            });
        });

        it('A New Adventure\'s ability should return a friendly-owned unit controlled by the opponent to hand and then the onwer can play it for free', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['a-new-adventure'],
                    groundArena: ['atat-suppressor'],
                    spaceArena: ['cartel-spacer'],
                    leader: 'asajj-ventress#unparalleled-adversary',
                    base: { card: 'jedha-city', damage: 2 }
                },
                player2: {
                    groundArena: ['wampa', { card: 'salacious-crumb#obnoxious-pet', owner: 'player1' }],
                    spaceArena: ['redemption#medical-frigate', 'patrolling-vwing']
                },

                // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                autoSingleTarget: true
            });

            const { context } = contextRef;

            context.player1.clickCard(context.aNewAdventure);
            expect(context.player1).toBeAbleToSelectExactly([context.salaciousCrumb, context.cartelSpacer, context.wampa, context.patrollingVwing]);

            context.player1.clickCard(context.salaciousCrumb);
            expect(context.salaciousCrumb).toBeInZone('hand', context.player1);
            expect(context.player1).toHavePassAbilityPrompt('Play Salacious Crumb for free');

            context.player1.clickPrompt('Trigger');
            expect(context.salaciousCrumb).toBeInZone('groundArena');
            expect(context.player1.exhaustedResourceCount).toBe(2); // just the cost of A New Adventure
            expect(context.p1Base.damage).toBe(1);   // from Crumb ability
        });

        it('can be played without a valid target', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['a-new-adventure'],
                },
                player2: {
                    leader: { card: 'grand-admiral-thrawn#how-unfortunate', deployed: true },
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.aNewAdventure);
            context.player1.clickPrompt('Play anyway');

            expect(context.aNewAdventure).toBeInZone('discard');
            expect(context.player2).toBeActivePlayer();
        });
    });
});
