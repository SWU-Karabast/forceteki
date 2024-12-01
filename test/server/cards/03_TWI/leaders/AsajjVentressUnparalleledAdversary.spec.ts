describe('Asajj Ventress, Unparalleled Adversary', function () {
    integration(function (contextRef) {
        describe('Asajj Ventress\'s leader undeployed ability', function () {
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
                        hand: ['smugglers-aid'],
                        leader: { card: 'asajj-ventress#unparalleled-adversary', deployed: true },
                    },
                    player2: {
                        hand: ['resupply'],
                        groundArena: ['battlefield-marine', 'consular-security-force', 'wilderness-fighter'],
                    },
                });
            });

            it('should have +1/+0 and deals before defender if we had play an event this phase', function () {
                const { context } = contextRef;

                function reset() {
                    context.asajjVentress.exhausted = false;
                    context.setDamage(context.asajjVentress, 0);
                }

                context.player1.clickCard(context.asajjVentress);
                context.player1.clickCard(context.battlefieldMarine);

                // no event played : nothing happen
                expect(context.player2).toBeActivePlayer();
                expect(context.battlefieldMarine).toBeInZone('discard');
                expect(context.asajjVentress.damage).toBe(3);

                reset();

                // opponent play an event
                context.player2.clickCard(context.resupply);

                context.player1.clickCard(context.asajjVentress);
                context.player1.clickCard(context.consularSecurityForce);

                // we do not have played an event : nothing happen
                expect(context.consularSecurityForce.damage).toBe(3);
                expect(context.asajjVentress.damage).toBe(3);

                reset();
                context.player2.passAction();

                // we play an event
                context.player1.clickCard(context.smugglersAid);
                context.player2.passAction();

                context.player1.clickCard(context.asajjVentress);
                context.player1.clickCard(context.wildernessFighter);

                // we had play an event : asajj get +1/+0 on attack and deals damage before defender
                expect(context.player2).toBeActivePlayer();
                expect(context.wildernessFighter).toBeInZone('discard');
                expect(context.asajjVentress.damage).toBe(0);
                expect(context.asajjVentress.getPower()).toBe(3);
            });
        });
    });
});
