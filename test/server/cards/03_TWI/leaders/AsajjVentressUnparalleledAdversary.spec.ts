describe('Asajj Ventress, Unparalleled Adversary', function () {
    integration(function (contextRef) {
        describe('Asajj Ventress\'s leader ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['smugglers-aid'],
                        spaceArena: ['green-squadron-awing'],
                        groundArena: ['battlefield-marine'],
                        leader: 'asajj-ventress#unparalleled-adversary',
                        resources: 3,
                    },
                    player2: {
                        groundArena: ['admiral-yularen#advising-caution'],
                    },
                });
            });

            it('should initiate attack but does not give +1/+0 as we do not play any event this phase', function () {
                const { context } = contextRef;

                // initiate attack
                context.player1.clickCard(context.asajjVentress);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.greenSquadronAwing]);
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);

                expect(context.player2).toBeActivePlayer();
                expect(context.asajjVentress.exhausted).toBeTrue();
                expect(context.p2Base.damage).toBe(3);
            });

            it('should initiate attack and give +1/+0 as we play an event this phase', function () {
                const { context } = contextRef;

                // play an event
                context.player1.clickCard(context.smugglersAid);
                context.player2.passAction();

                // initiate attack
                context.player1.clickCard(context.asajjVentress);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.greenSquadronAwing]);
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);

                expect(context.player2).toBeActivePlayer();
                expect(context.asajjVentress.exhausted).toBeTrue();
                expect(context.p2Base.damage).toBe(4);
            });
        });

        describe('Asajj Ventress\'s leader deployed ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        leader: { card: 'asajj-ventress#unparalleled-adversary', deployed: true },
                    },
                    player2: {
                        groundArena: ['battlefield-marine'],
                    },
                });
            });

            it('should not have +1/+0 and deals before defender as we do not play any event this phase', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.asajjVentress);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.player2).toBeActivePlayer();
                expect(context.battlefieldMarine).toBeInZone('discard');
                expect(context.asajjVentress.damage).toBe(3);
            });
        });

        describe('Asajj Ventress\'s leader deployed ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        leader: { card: 'asajj-ventress#unparalleled-adversary', deployed: true },
                    },
                    player2: {
                        hand: ['resupply'],
                        groundArena: ['battlefield-marine'],
                        hasInitiative: true,
                    },
                });
            });

            it('should not have +1/+0 and deals before defender as we do not play any event this phase (even if opponent play an event)', function () {
                const { context } = contextRef;

                context.player2.clickCard(context.resupply);
                context.player1.clickCard(context.asajjVentress);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.player2).toBeActivePlayer();
                expect(context.battlefieldMarine).toBeInZone('discard');
                expect(context.asajjVentress.damage).toBe(3);
            });
        });

        describe('Asajj Ventress\'s leader deployed ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['smugglers-aid'],
                        leader: { card: 'asajj-ventress#unparalleled-adversary', deployed: true },
                    },
                    player2: {
                        groundArena: ['cloud-city-wing-guard'],
                    },
                });
            });

            it('should have +1/+0 and deals before defender as we play an event this phase', function () {
                const { context } = contextRef;

                // play an event
                context.player1.clickCard(context.smugglersAid);
                context.player2.passAction();

                context.player1.clickCard(context.asajjVentress);
                // cloud city guard is automatically choose

                expect(context.player2).toBeActivePlayer();
                expect(context.cloudCityWingGuard).toBeInZone('discard');
                expect(context.asajjVentress.damage).toBe(0);
                expect(context.asajjVentress.getPower()).toBe(3);
            });
        });
    });
});
