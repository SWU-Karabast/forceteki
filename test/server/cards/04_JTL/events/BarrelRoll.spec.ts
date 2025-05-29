describe('Barrel Roll', function () {
    integration(function (contextRef) {
        describe('Barrel Roll\'s ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['barrel-roll', 'attack-run'],
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['green-squadron-awing', 'phoenix-squadron-awing'],
                    },
                    player2: {
                        groundArena: ['consular-security-force'],
                        spaceArena: ['alliance-xwing', 'cartel-spacer'],
                    },
                });
            });

            it('should attack with a space unit and then exhaust a space unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.barrelRoll);
                // should only choose space units
                expect(context.player1).toBeAbleToSelectExactly([context.greenSquadronAwing, context.phoenixSquadronAwing]);

                context.player1.clickCard(context.greenSquadronAwing);
                context.player1.clickCard(context.p2Base);

                expect(context.p2Base.damage).toBe(3);

                expect(context.player1).toBeAbleToSelectExactly([
                    context.greenSquadronAwing,
                    context.phoenixSquadronAwing,
                    context.allianceXwing,
                    context.cartelSpacer,
                ]);

                context.player1.clickCard(context.allianceXwing);
                expect(context.allianceXwing.exhausted).toBe(true);
                expect(context.player2).toBeActivePlayer();
            });

            it('should attack with a space unit and not exhaust if you can\'t attack', function () {
                const { context } = contextRef;

                // we attack with our units to exhaust them
                context.player1.clickCard(context.attackRun);
                context.player1.clickCard(context.greenSquadronAwing);
                context.player1.clickCard(context.p2Base);
                context.player1.clickCard(context.phoenixSquadronAwing);
                context.player1.clickCard(context.p2Base);
                context.player2.passAction();

                // should only choose space units
                context.player1.clickCard(context.barrelRoll);
                context.player1.clickPrompt('Play anyway');
                expect(context.barrelRoll).toBeInZone('discard');
                expect(context.player2).toBeActivePlayer();
            });

            it('should attack with a space unit and exhaust even if the unit is defeated after the attack', function () {
                const { context } = contextRef;

                // should only choose space units
                context.player1.clickCard(context.barrelRoll);
                expect(context.player1).toBeAbleToSelectExactly([context.greenSquadronAwing, context.phoenixSquadronAwing]);
                context.player1.clickCard(context.phoenixSquadronAwing);
                context.player1.clickCard(context.cartelSpacer);

                expect(context.cartelSpacer).toBeInZone('discard');
                expect(context.phoenixSquadronAwing).toBeInZone('discard');

                expect(context.player1).toBeAbleToSelectExactly([
                    context.greenSquadronAwing,
                    context.allianceXwing,
                ]);

                context.player1.clickCard(context.greenSquadronAwing);
                expect(context.greenSquadronAwing.exhausted).toBe(true);
                expect(context.player2).toBeActivePlayer();
            });

            // TODO: Make sure Blue Leader when deployed as ground unit can't be selected by Barrel Roll for the attack/exhaust ability
        });
    });
});
