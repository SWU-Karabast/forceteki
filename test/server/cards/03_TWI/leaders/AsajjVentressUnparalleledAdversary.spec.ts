describe('Asajj Ventress, Unparalleled Adversary', function () {
    integration(function (contextRef) {
        describe('Asajj Ventress\'s leader undeployed  ability', function () {
            it('should initiate attack and give +1/+0 as we play an event this phase', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['smugglers-aid', 'b1-security-team'],
                        spaceArena: ['green-squadron-awing'],
                        groundArena: ['battlefield-marine'],
                        leader: 'asajj-ventress#unparalleled-adversary',
                        resources: 3,
                    },
                    player2: {
                        hand: ['resupply'],
                        groundArena: ['admiral-yularen#advising-caution'],
                    },
                });

                const { context } = contextRef;

                // play an event
                context.player1.clickCard(context.smugglersAid);
                context.player2.passAction();

                // initiate attack
                context.player1.clickCard(context.asajjVentress);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.greenSquadronAwing]);
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);

                // as we have played an event, battlefield marine had one power more
                expect(context.player2).toBeActivePlayer();
                expect(context.asajjVentress.exhausted).toBeTrue();
                expect(context.p2Base.damage).toBe(4);

                context.moveToNextActionPhase();

                // play a unit
                context.player1.clickCard(context.b1SecurityTeam);

                // opponent plays an event
                context.player2.clickCard(context.resupply);

                context.player1.clickCard(context.asajjVentress);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.greenSquadronAwing]);
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);

                // as we did not have played an event this phase, battlefield marine had no power boost
                expect(context.player2).toBeActivePlayer();
                expect(context.asajjVentress.exhausted).toBeTrue();
                expect(context.p2Base.damage).toBe(7);
            });
        });

        describe('Asajj Ventress\'s leader deployed ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['smugglers-aid', 'b1-security-team'],
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
                    context.player2.passAction();
                }

                context.player1.clickCard(context.asajjVentress);
                context.player1.clickCard(context.battlefieldMarine);

                // no event played : nothing happen
                expect(context.player2).toBeActivePlayer();
                expect(context.battlefieldMarine).toBeInZone('discard');
                expect(context.asajjVentress.damage).toBe(3);

                reset();

                // we play a unit
                context.player1.clickCard(context.b1SecurityTeam);
                // opponent play an event
                context.player2.clickCard(context.resupply);

                context.player1.clickCard(context.asajjVentress);
                context.player1.clickCard(context.consularSecurityForce);

                // we do not have played an event : nothing happen
                expect(context.player2).toBeActivePlayer();
                expect(context.consularSecurityForce.damage).toBe(3);
                expect(context.asajjVentress.damage).toBe(3);

                reset();

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
