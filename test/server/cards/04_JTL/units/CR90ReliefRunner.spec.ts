describe('CR90 Relief Runner', function () {
    integration(function (contextRef) {
        describe('CR90 Relief Runner\'s ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['rivals-fall'],
                        groundArena: [{ card: 'consular-security-force', damage: 4 }],
                        spaceArena: ['green-squadron-awing'],
                    },
                    player2: {
                        spaceArena: ['cr90-relief-runner'],
                        base: { card: 'echo-base', damage: 5 }
                    }
                });
            });

            it('should heal up to 3 damage from a unit or a base when defeated', function () {
                const { context } = contextRef;

                // kill cr90 relief runner
                context.player1.clickCard(context.rivalsFall);
                context.player1.clickCard(context.cr90ReliefRunner);

                // can choose a unit or a base
                expect(context.player2).toBeAbleToSelectExactly([context.consularSecurityForce, context.greenSquadronAwing, context.p1Base, context.p2Base]);
                expect(context.player2).toHaveChooseNoTargetButton();

                context.player2.setDistributeHealingPromptState(new Map([
                    [context.p2Base, 3],
                ]));

                expect(context.p2Base.damage).toBe(2);
            });

            it('should heal up to 3 damage from a unit or a base when defeated (can distribute less)', function () {
                const { context } = contextRef;

                // kill cr90 relief runner
                context.player1.clickCard(context.rivalsFall);
                context.player1.clickCard(context.cr90ReliefRunner);

                // can choose a unit or a base
                expect(context.player2).toBeAbleToSelectExactly([context.consularSecurityForce, context.greenSquadronAwing, context.p1Base, context.p2Base]);
                expect(context.player2).toHaveChooseNoTargetButton();

                // can heal less than 3 damage
                context.player2.setDistributeHealingPromptState(new Map([
                    [context.consularSecurityForce, 1],
                ]));

                expect(context.consularSecurityForce.damage).toBe(3);
            });
        });
    });
});
