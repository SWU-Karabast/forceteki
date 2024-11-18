describe('Frontline Shuttle', function() {
    integration(function(contextRef) {
        describe('Frontline Shuttle\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        spaceArena: ['frontline-shuttle'],
                        groundArena: ['battlefield-marine', 'r2d2#ignoring-protocol', 'c3po#protocol-droid']
                    },
                    player2: {
                        groundArena: ['bail-organa#rebel-councilor', 'sundari-peacekeeper'],
                    }
                });
            });

            it('should be able to activate action ability and attack with exhausted unit', function () {
                const { context } = contextRef;

                context.battlefieldMarine.exhausted = true;

                context.player1.clickCard(context.frontlineShuttle);

                context.player1.clickPrompt('Attack with a unit, even if it’s exhausted. It can’t attack bases for this attack.');
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.r2d2IgnoringProtocol, context.c3poProtocolDroid]);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.player1).toBeAbleToSelectExactly([context.bailOrganaRebelCouncilor, context.sundariPeacekeeper]);
                context.player1.clickCard(context.sundariPeacekeeper);

                expect(context.sundariPeacekeeper.damage).toBe(3);
                expect(context.battlefieldMarine.exhausted).toBe(true);
                expect(context.battlefieldMarine.damage).toBe(1);

                expect(context.frontlineShuttle).toBeInZone('discard');

                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
