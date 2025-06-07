describe('Yoda\'s Lightsaber', function() {
    integration(function(contextRef) {
        describe('Yoda\'s Lightsabers\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['yodas-lightsaber'],
                        groundArena: ['salacious-crumb#obnoxious-pet'],
                        spaceArena: ['cartel-spacer'],
                        leader: 'asajj-ventress#unparalleled-adversary',
                        base: { card: 'echo-base', damage: 12 },
                        hasForceToken: true
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['patrolling-vwing'],
                        base: { card: 'echo-base', damage: 3 }
                    }
                });
            });

            it('should heal its own base', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.yodasLightsaber);
                expect(context.player1).toBeAbleToSelectExactly([context.salaciousCrumb, context.wampa]);
                context.player1.clickCard(context.salaciousCrumb);
                context.player1.clickPrompt('Trigger');

                expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base]);
                context.player1.clickCard(context.p1Base);
                expect(context.p1Base.damage).toBe(9);
            });

            it('should heal enemy base', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.yodasLightsaber);
                expect(context.player1).toBeAbleToSelectExactly([context.salaciousCrumb, context.wampa]);
                context.player1.clickCard(context.salaciousCrumb);
                context.player1.clickPrompt('Trigger');

                expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base]);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(0);
            });

            it('should be able to be played on an enemy unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.yodasLightsaber);
                expect(context.player1).toBeAbleToSelectExactly([context.salaciousCrumb, context.wampa]);
                context.player1.clickCard(context.wampa);
                context.player1.clickPrompt('Trigger');

                expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base]);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(0);
            });

            it('should not be triggered as player decides not to use the Force', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.yodasLightsaber);
                expect(context.player1).toBeAbleToSelectExactly([context.salaciousCrumb, context.wampa]);
                context.player1.clickCard(context.salaciousCrumb);
                context.player1.clickPrompt('Pass');

                expect(context.player2).toBeActivePlayer();
            });
        });

        it('Yoda\'s Lightsaber\'s ability should not be triggered as player doesn\'t have the Force', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['yodas-lightsaber'],
                    groundArena: ['salacious-crumb#obnoxious-pet'],
                    spaceArena: ['cartel-spacer'],
                    leader: 'asajj-ventress#unparalleled-adversary',
                    base: { card: 'echo-base', damage: 12 },
                },
                player2: {
                    groundArena: ['wampa'],
                    spaceArena: ['patrolling-vwing'],
                    base: { card: 'echo-base', damage: 3 }
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.yodasLightsaber);
            expect(context.player1).toBeAbleToSelectExactly([context.salaciousCrumb, context.wampa]);
            context.player1.clickCard(context.salaciousCrumb);
            expect(context.player2).toBeActivePlayer();
        });
    });
});