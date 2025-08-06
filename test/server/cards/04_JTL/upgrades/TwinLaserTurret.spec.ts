describe('Twin Laser Turret', function() {
    integration(function(contextRef) {
        describe('Twin Laser Turret\'s attached unit gain on Attack ability\'s', function() {
            beforeEach(function() {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['twin-laser-turret'],
                        groundArena: ['frontier-atrt', 'consular-security-force'],
                        spaceArena: ['green-squadron-awing'],
                    },
                    player2: {
                        groundArena: ['wampa', 'escort-skiff', 'atst', { card: 'battlefield-marine', upgrades: ['shield'] }],
                    }
                });
            });

            it('will deal 1 damage to up to 2 units in the same arena', function () {
                const { context } = contextRef;

                // Can we attach to only vehicles?
                context.player1.clickCard(context.twinLaserTurret);
                expect(context.player1).toBeAbleToSelectExactly([
                    context.frontierAtrt,
                    context.greenSquadronAwing,
                    context.escortSkiff,
                    context.atst,
                ]);
                context.player1.clickCard(context.frontierAtrt);
                context.player2.passAction();

                context.player1.clickCard(context.frontierAtrt);
                context.player1.clickCard(context.player2.base);
                expect(context.player1).toBeAbleToSelectExactly([
                    context.frontierAtrt,
                    context.consularSecurityForce,
                    context.wampa,
                    context.escortSkiff,
                    context.atst,
                    context.battlefieldMarine,
                ]);

                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCardNonChecking(context.atst);
                context.player1.clickCardNonChecking(context.escortSkiff);
                context.player1.clickCardNonChecking(context.consularSecurityForce);
                context.player1.clickCardNonChecking(context.frontierAtrt);
                context.player1.clickDone();
                expect(context.wampa.damage).toBe(1);
                expect(context.battlefieldMarine.isUpgraded()).toBeFalse();
                expect(context.battlefieldMarine.damage).toBe(0); // because of the shield
                expect(context.atst.damage).toBe(0);
                expect(context.escortSkiff.damage).toBe(0);
                expect(context.consularSecurityForce.damage).toBe(0);
                expect(context.frontierAtrt.damage).toBe(0);
            });

            it('allow to pass its ability ', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.twinLaserTurret);
                context.player1.clickCard(context.frontierAtrt);
                context.player2.passAction();

                context.player1.clickCard(context.frontierAtrt);
                context.player1.clickCard(context.player2.base);
                expect(context.player1).toBeAbleToSelectExactly([
                    context.frontierAtrt,
                    context.consularSecurityForce,
                    context.wampa,
                    context.escortSkiff,
                    context.atst,
                    context.battlefieldMarine,
                ]);

                expect(context.player1).toHaveChooseNothingButton();
                context.player1.clickPrompt('Choose nothing');
                expect(context.wampa.damage).toBe(0);
                expect(context.battlefieldMarine.isUpgraded()).toBeTrue();
                expect(context.battlefieldMarine.damage).toBe(0);
                expect(context.atst.damage).toBe(0);
                expect(context.escortSkiff.damage).toBe(0);
                expect(context.consularSecurityForce.damage).toBe(0);
                expect(context.frontierAtrt.damage).toBe(0);
            });

            it('works well also in the space areana', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.twinLaserTurret);
                context.player1.clickCard(context.greenSquadronAwing);
                context.player2.passAction();

                context.player1.clickCard(context.greenSquadronAwing);
                context.player1.clickCard(context.player2.base);
                expect(context.player1).toBeAbleToSelectExactly([
                    context.greenSquadronAwing,
                ]);

                expect(context.player1).toHaveChooseNothingButton();
                context.player1.clickCard(context.greenSquadronAwing);
                context.player1.clickDone();
                expect(context.greenSquadronAwing.damage).toBe(1);

                expect(context.wampa.damage).toBe(0);
                expect(context.battlefieldMarine.isUpgraded()).toBeTrue();
                expect(context.battlefieldMarine.damage).toBe(0);
                expect(context.atst.damage).toBe(0);
                expect(context.escortSkiff.damage).toBe(0);
                expect(context.consularSecurityForce.damage).toBe(0);
                expect(context.frontierAtrt.damage).toBe(0);
            });
        });
    });
});
