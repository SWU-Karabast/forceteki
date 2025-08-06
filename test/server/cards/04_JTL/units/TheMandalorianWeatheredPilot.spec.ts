describe('The Mandalorian, Weathered Pilot', function () {
    integration(function (contextRef) {
        describe('The Mandalorian\'s ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['the-mandalorian#weathered-pilot'],
                        groundArena: ['liberated-slaves', 'republic-attack-pod'],
                        spaceArena: ['millennium-falcon#piece-of-junk']
                    },
                    player2: {
                        groundArena: ['battlefield-marine', 'fleet-lieutenant', 'k2so#cassians-counterpart'],
                        spaceArena: ['green-squadron-awing', 'wing-leader']
                    }
                });
            });

            it('should exhaust up to 2 ground units when played as a unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.theMandalorianWeatheredPilot);
                context.player1.clickPrompt('Play The Mandalorian');

                expect(context.player1).toHavePrompt('Exhaust up to 2 ground units');
                expect(context.player1).toBeAbleToSelectExactly([
                    context.liberatedSlaves,
                    context.republicAttackPod,
                    context.theMandalorianWeatheredPilot,
                    context.battlefieldMarine,
                    context.fleetLieutenant,
                    context.k2soCassiansCounterpart
                ]);

                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.k2soCassiansCounterpart);
                context.player1.clickDone();

                expect(context.liberatedSlaves.exhausted).toBe(false);
                expect(context.republicAttackPod.exhausted).toBe(false);
                expect(context.battlefieldMarine.exhausted).toBe(true);
                expect(context.fleetLieutenant.exhausted).toBe(false);
                expect(context.k2soCassiansCounterpart.exhausted).toBe(true);
                expect(context.millenniumFalconPieceOfJunk.exhausted).toBe(false);
                expect(context.greenSquadronAwing.exhausted).toBe(false);
                expect(context.wingLeader.exhausted).toBe(false);
                expect(context.player2).toBeActivePlayer();
            });

            it('should exhaust an enemy ground unit when played as a pilot on a ground vehicle', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.theMandalorianWeatheredPilot);
                context.player1.clickPrompt('Play The Mandalorian with Piloting');

                expect(context.player1).toHavePrompt('Attach The Mandalorian to a unit');
                expect(context.player1).toBeAbleToSelectExactly([context.republicAttackPod, context.millenniumFalconPieceOfJunk]);

                context.player1.clickCard(context.republicAttackPod);

                expect(context.player1).toHavePrompt('Exhaust an enemy unit in this arena');
                expect(context.player1).toBeAbleToSelectExactly([
                    context.battlefieldMarine,
                    context.fleetLieutenant,
                    context.k2soCassiansCounterpart
                ]);

                context.player1.clickCard(context.battlefieldMarine);

                expect(context.battlefieldMarine.exhausted).toBe(true);
                expect(context.fleetLieutenant.exhausted).toBe(false);
                expect(context.k2soCassiansCounterpart.exhausted).toBe(false);
                expect(context.greenSquadronAwing.exhausted).toBe(false);
                expect(context.wingLeader.exhausted).toBe(false);
                expect(context.player2).toBeActivePlayer();
            });

            it('should exhaust an enemy ground unit when played as a pilot on a space vehicle', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.theMandalorianWeatheredPilot);
                context.player1.clickPrompt('Play The Mandalorian with Piloting');

                expect(context.player1).toHavePrompt('Attach The Mandalorian to a unit');
                expect(context.player1).toBeAbleToSelectExactly([context.republicAttackPod, context.millenniumFalconPieceOfJunk]);

                context.player1.clickCard(context.millenniumFalconPieceOfJunk);

                expect(context.player1).toHavePrompt('Exhaust an enemy unit in this arena');
                expect(context.player1).toBeAbleToSelectExactly([
                    context.greenSquadronAwing,
                    context.wingLeader
                ]);

                context.player1.clickCard(context.greenSquadronAwing);

                expect(context.battlefieldMarine.exhausted).toBe(false);
                expect(context.fleetLieutenant.exhausted).toBe(false);
                expect(context.k2soCassiansCounterpart.exhausted).toBe(false);
                expect(context.greenSquadronAwing.exhausted).toBe(true);
                expect(context.wingLeader.exhausted).toBe(false);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});