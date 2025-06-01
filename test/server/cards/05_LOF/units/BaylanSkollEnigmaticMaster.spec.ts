describe('Baylan Skoll, Enigmatic Master', function() {
    integration(function(contextRef) {
        describe('Baylan Skoll, Enigmatic Master\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['baylan-skoll#enigmatic-master'],
                        groundArena: ['salacious-crumb#obnoxious-pet', 'atat-suppressor'],
                        spaceArena: ['cartel-spacer'],
                        leader: 'asajj-ventress#unparalleled-adversary',
                        base: 'jedha-city',
                        hasForceToken: true
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['redemption#medical-frigate', 'patrolling-vwing']
                    }
                });
            });

            it('should return an enemy unit to hand and then the opponent can play it for free', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.baylanSkollEnigmaticMaster);
                context.player1.clickPrompt('Trigger');
                expect(context.player1).toBeAbleToSelectExactly([context.salaciousCrumb, context.cartelSpacer, context.wampa, context.patrollingVwing]);

                context.player1.clickCard(context.patrollingVwing);
                expect(context.patrollingVwing).toBeInZone('hand');
                expect(context.player2).toHavePassAbilityPrompt('Play Patrolling V-Wing for free');

                // Player 2 decides to play Patrolling V-Wing for free
                context.player2.clickPrompt('Trigger');
                expect(context.patrollingVwing).toBeInZone('spaceArena');
                expect(context.player2.exhaustedResourceCount).toBe(0);
                expect(context.player2.handSize).toBe(1);   // from V-Wing ability
            });

            it('should return a friendly unit to hand and then the controller can play it for free', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.baylanSkollEnigmaticMaster);
                context.player1.clickPrompt('Trigger');
                expect(context.player1).toBeAbleToSelectExactly([context.salaciousCrumb, context.cartelSpacer, context.wampa, context.patrollingVwing]);

                context.player1.clickCard(context.salaciousCrumb);
                expect(context.salaciousCrumb).toBeInZone('hand');
                expect(context.player1).toHavePassAbilityPrompt('Play Salacious Crumb for free');

                // Player 1 decides to play Salacious Crumb for free
                context.player1.clickPrompt('Trigger');
                expect(context.salaciousCrumb).toBeInZone('groundArena');

                expect(context.player1.exhaustedResourceCount).toBe(5); // Baylan Skoll costs 5
                expect(context.player2).toBeActivePlayer();
            });

            it('should return a friendly unit to hand and then the controller can play it for free but decides not to play it', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.baylanSkollEnigmaticMaster);
                context.player1.clickPrompt('Trigger');
                expect(context.player1).toBeAbleToSelectExactly([context.salaciousCrumb, context.cartelSpacer, context.wampa, context.patrollingVwing]);

                context.player1.clickCard(context.salaciousCrumb);
                expect(context.player1).toHavePassAbilityPrompt('Play Salacious Crumb for free');

                // Player 1 decides not to play Salacious Crumb
                context.player1.clickPrompt('Pass');
                expect(context.salaciousCrumb).toBeInZone('hand');

                expect(context.player2).toBeActivePlayer();
            });

            it('should not be triggered as player decides not to use the Force', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.baylanSkollEnigmaticMaster);
                context.player1.clickPrompt('Pass');

                expect(context.player2).toBeActivePlayer();
            });
        });

        it('Baylan Skoll, Enigmatic Master\'s ability should return a friendly-owned unit controlled by the opponent to hand and then the owner can play it for free', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['baylan-skoll#enigmatic-master'],
                    groundArena: ['atat-suppressor'],
                    spaceArena: ['cartel-spacer'],
                    leader: 'asajj-ventress#unparalleled-adversary',
                    base: { card: 'jedha-city', damage: 2 },
                    hasForceToken: true
                },
                player2: {
                    groundArena: ['wampa', { card: 'salacious-crumb#obnoxious-pet', owner: 'player1' }],
                    spaceArena: ['redemption#medical-frigate', 'patrolling-vwing']
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.baylanSkoll);
            context.player1.clickPrompt('Trigger');
            expect(context.player1).toBeAbleToSelectExactly([context.salaciousCrumb, context.cartelSpacer, context.wampa, context.patrollingVwing]);

            context.player1.clickCard(context.salaciousCrumb);
            expect(context.salaciousCrumb).toBeInZone('hand', context.player1);
            expect(context.player1).toHavePassAbilityPrompt('Play Salacious Crumb for free');

            context.player1.clickPrompt('Trigger');
            expect(context.salaciousCrumb).toBeInZone('groundArena');
            expect(context.player1.exhaustedResourceCount).toBe(5); // just the cost of Baylan Skoll
            expect(context.p1Base.damage).toBe(1);   // from Crumb ability heals 1 damage from base
        });

        it('Baylan Skoll, Enigmatic Master\'s ability should not be triggered as player doesn\'t have the Force', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['baylan-skoll#enigmatic-master'],
                    groundArena: ['atat-suppressor'],
                    spaceArena: ['cartel-spacer']
                },
                player2: {
                    groundArena: ['wampa', 'salacious-crumb#obnoxious-pet'],
                    spaceArena: ['redemption#medical-frigate', 'patrolling-vwing']
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.baylanSkoll);
            expect(context.player2).toBeActivePlayer();
        });
    });
});
