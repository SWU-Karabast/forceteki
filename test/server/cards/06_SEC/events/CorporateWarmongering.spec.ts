describe('Corporate Warmongering', function() {
    integration(function(contextRef) {
        describe('Corporate Warmongering\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['corporate-warmongering'],
                        groundArena: ['isb-agent'],
                        spaceArena: ['cartel-spacer'],
                        leader: { card: 'asajj-ventress#unparalleled-adversary', deployed: true },
                        base: { card: 'echo-base', damage: 12 },
                    },
                    player2: {
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['patrolling-vwing'],
                        base: { card: 'echo-base', damage: 3 }
                    }
                });
            });

            it('should give a friendly ground unit +3/+3 and each other friendly unit +1/+1', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.corporateWarmongering);
                expect(context.player1).toBeAbleToSelectExactly([context.isbAgent, context.cartelSpacer, context.asajjVentressUnparalleledAdversary]);
                context.player1.clickCard(context.isbAgent);

                context.player2.clickCard(context.battlefieldMarine);
                context.player2.clickCard(context.p1Base);
                expect(context.p1Base.damage).toBe(15);

                context.player1.clickCard(context.isbAgent);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(7);

                context.player2.clickCard(context.patrollingVwing);
                context.player2.clickCard(context.p1Base);
                expect(context.p1Base.damage).toBe(16);

                context.player1.clickCard(context.cartelSpacer);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(10);

                context.player2.clickPrompt('Pass');
                context.player1.clickCard(context.asajjVentressUnparalleledAdversary);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(15);

                context.moveToNextActionPhase();

                context.player1.clickCard(context.isbAgent);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(16);

                context.player2.clickPrompt('Pass');
                context.player1.clickCard(context.cartelSpacer);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(18);
            });

            it('should give friendly space unit +3/+3 and each other friendly unit +1/+1', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.corporateWarmongering);
                expect(context.player1).toBeAbleToSelectExactly([context.isbAgent, context.cartelSpacer, context.asajjVentressUnparalleledAdversary]);
                context.player1.clickCard(context.cartelSpacer);

                context.player2.clickCard(context.battlefieldMarine);
                context.player2.clickCard(context.p1Base);
                expect(context.p1Base.damage).toBe(15);

                context.player1.clickCard(context.isbAgent);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(5);

                context.player2.clickCard(context.patrollingVwing);
                context.player2.clickCard(context.p1Base);
                expect(context.p1Base.damage).toBe(16);

                context.player1.clickCard(context.cartelSpacer);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(10);

                context.player2.clickPrompt('Pass');
                context.player1.clickCard(context.asajjVentressUnparalleledAdversary);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(15);

                context.moveToNextActionPhase();

                context.player1.clickCard(context.isbAgent);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(16);

                context.player2.clickPrompt('Pass');
                context.player1.clickCard(context.cartelSpacer);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(18);
            });

            it('should give friendly leader unit +3/+3 and each other friendly unit +1/+1', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.corporateWarmongering);
                expect(context.player1).toBeAbleToSelectExactly([context.isbAgent, context.cartelSpacer, context.asajjVentressUnparalleledAdversary]);
                context.player1.clickCard(context.asajjVentressUnparalleledAdversary);

                context.player2.clickCard(context.battlefieldMarine);
                context.player2.clickCard(context.p1Base);
                expect(context.p1Base.damage).toBe(15);

                context.player1.clickCard(context.isbAgent);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(5);

                context.player2.clickCard(context.patrollingVwing);
                context.player2.clickCard(context.p1Base);
                expect(context.p1Base.damage).toBe(16);

                context.player1.clickCard(context.cartelSpacer);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(8);

                context.player2.clickPrompt('Pass');
                context.player1.clickCard(context.asajjVentressUnparalleledAdversary);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(15);

                context.moveToNextActionPhase();

                context.player1.clickCard(context.isbAgent);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(16);

                context.player2.clickPrompt('Pass');
                context.player1.clickCard(context.cartelSpacer);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(18);
            });
        });
    });
});