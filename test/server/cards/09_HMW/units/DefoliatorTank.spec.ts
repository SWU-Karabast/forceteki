describe('Defoliator Tank', function () {
    integration(function (contextRef) {
        const promptTitle = 'If the defending unit isn\'t a Droid or Vehicle, pay 2 resources to give 2 Weakness tokens to it';

        describe('Defoliator Tank\'s on attack ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['defoliator-tank'],
                        resources: 5
                    },
                    player2: {
                        groundArena: ['consular-security-force', 'battle-droid', 'atst'],
                        spaceArena: ['tie-fighter']
                    }
                });
            });

            it('should let the player pay 2 resources to give the defender 2 Weakness tokens', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.defoliatorTank);
                context.player1.clickCard(context.consularSecurityForce);

                expect(context.player1).toHavePassAbilityPrompt(promptTitle);
                context.player1.clickPrompt('Trigger');

                expect(context.player1.exhaustedResourceCount).toBe(2);
                // Consular Security Force is 3/7; two Weakness tokens make it 1/5, and it survives the tank's 4 damage
                expect(context.consularSecurityForce).toHaveExactUpgradeNames(['weakness', 'weakness']);
                expect(context.consularSecurityForce.getPower()).toBe(1);
                expect(context.consularSecurityForce.getHp()).toBe(5);
                expect(context.consularSecurityForce.damage).toBe(4);
                expect(context.defoliatorTank.damage).toBe(1);
                expect(context.player2).toBeActivePlayer();
            });

            it('should do nothing if the player declines to pay', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.defoliatorTank);
                context.player1.clickCard(context.consularSecurityForce);

                expect(context.player1).toHavePassAbilityPrompt(promptTitle);
                context.player1.clickPrompt('Pass');

                expect(context.player1.exhaustedResourceCount).toBe(0);
                expect(context.consularSecurityForce).toHaveExactUpgradeNames([]);
                expect(context.consularSecurityForce.damage).toBe(4);
                expect(context.player2).toBeActivePlayer();
            });

            it('should not trigger when attacking a Droid', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.defoliatorTank);
                context.player1.clickCard(context.battleDroid);

                expect(context.player1.exhaustedResourceCount).toBe(0);
                expect(context.battleDroid).toBeInZone('outsideTheGame');
                expect(context.player2).toBeActivePlayer();
            });

            it('should not trigger when attacking a Vehicle', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.defoliatorTank);
                context.player1.clickCard(context.atst);

                expect(context.player1.exhaustedResourceCount).toBe(0);
                expect(context.atst).toHaveExactUpgradeNames([]);
                expect(context.atst.damage).toBe(4);
                expect(context.player2).toBeActivePlayer();
            });

            it('should not trigger when attacking a base', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.defoliatorTank);
                context.player1.clickCard(context.p2Base);

                expect(context.player1.exhaustedResourceCount).toBe(0);
                expect(context.p2Base.damage).toBe(4);
                expect(context.player2).toBeActivePlayer();
            });
        });

        it('Defoliator Tank\'s ability should not prompt when the player cannot pay 2 resources', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['defoliator-tank'],
                    resources: 1
                },
                player2: {
                    groundArena: ['wampa']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.defoliatorTank);
            context.player1.clickCard(context.wampa);

            expect(context.wampa).toHaveExactUpgradeNames([]);
            expect(context.wampa.damage).toBe(4);
            expect(context.player2).toBeActivePlayer();
        });
    });
});
