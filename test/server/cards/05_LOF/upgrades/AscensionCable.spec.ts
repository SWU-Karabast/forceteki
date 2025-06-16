describe('Overpower', function() {
    integration(function(contextRef) {
        describe('Overpower\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['ascension-cable'],
                        groundArena: ['isb-agent', 'shadowed-hover-tank'],
                        spaceArena: ['cartel-spacer'],
                        leader: 'asajj-ventress#unparalleled-adversary',
                        base: { card: 'echo-base', damage: 12 },
                    },
                    player2: {
                        groundArena: ['battlefield-marine', 'echo-base-defender'],
                        spaceArena: ['patrolling-vwing'],
                        base: { card: 'echo-base', damage: 3 }
                    }
                });
            });

            it('should give its own non-vehicle unit saboteur', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.ascensionCable);
                expect(context.player1).toBeAbleToSelectExactly([context.isbAgent, context.battlefieldMarine, context.echoBaseDefender]);
                context.player1.clickCard(context.isbAgent);

                context.player2.clickPrompt('Pass');
                context.player1.clickCard(context.isbAgent);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.p2Base, context.echoBaseDefender]);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(5);
            });

            it('should give an enemy non-vehicle unit saboteur', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.ascensionCable);
                expect(context.player1).toBeAbleToSelectExactly([context.isbAgent, context.battlefieldMarine, context.echoBaseDefender]);
                context.player1.clickCard(context.battlefieldMarine);

                context.player2.clickCard(context.battlefieldMarine);
                expect(context.player2).toBeAbleToSelectExactly([context.shadowedHoverTank, context.isbAgent, context.p1Base]);
                context.player2.clickCard(context.p1Base);
                expect(context.p1Base.damage).toBe(16);
            });
        });
    });
});