describe('Pre Vizsla, Power Hungry', function() {
    integration(function(contextRef) {
        describe('Pre Vizsla\'s when played ability', function() {
            beforeEach(async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['pre-vizsla#power-hungry'],
                        groundArena: [{ card: 'boba-fett#disintegrator', upgrades: ['boba-fetts-armor'] }],
                    },
                    player2: {
                        groundArena: [
                            { card: 'atst', upgrades: ['smuggling-compartment'] },
                            { card: 'luminara-unduli#softspoken-master', upgrades: ['shield'] },
                            { card: 'clone-trooper', upgrades: ['nameless-valor'] }
                        ],
                    }
                });
            });

            it('should allow to pay to attach an upgrade that can be attached', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.preVizsla);
                expect(context.player1).toHaveChooseNoTargetButton();
                expect(context.player1).toBeAbleToSelectExactly([context.bobaFettsArmor, context.namelessValor, context.shield]);

                const readyResources = context.player1.readyResourceCount;
                context.player1.clickCard(context.bobaFettsArmor);

                expect(context.player1.readyResourceCount).toBe(readyResources - 2);
                expect(context.bobaFettDisintegrator).toHaveExactUpgradeNames([]);
                expect(context.preVizsla).toHaveExactUpgradeNames(['boba-fetts-armor']);
            });

            it('should allow to attach a free token upgrade', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.preVizsla);
                expect(context.player1).toBeAbleToSelectExactly([context.bobaFettsArmor, context.namelessValor, context.shield]);

                const readyResources = context.player1.readyResourceCount;
                context.player1.clickCard(context.shield);

                expect(context.player1.readyResourceCount).toBe(readyResources);
                expect(context.luminaraUnduli).toHaveExactUpgradeNames([]);
                expect(context.preVizsla).toHaveExactUpgradeNames(['shield']);
            });

            it('should allow to pay to defeat an upgrade that cannot be attached to it', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.preVizsla);
                expect(context.player1).toBeAbleToSelectExactly([context.bobaFettsArmor, context.namelessValor, context.shield]);

                const readyResources = context.player1.readyResourceCount;
                context.player1.clickCard(context.namelessValor);

                expect(context.player1.readyResourceCount).toBe(readyResources - 1);
                expect(context.cloneTrooper).toHaveExactUpgradeNames([]);
                expect(context.preVizsla).toHaveExactUpgradeNames([]);
                expect(context.namelessValor).toBeInZone('discard');
            });
        });

        describe('Pre Vizsla\'s on attack ability', function() {
            beforeEach(async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [
                            'pre-vizsla#power-hungry',
                            { card: 'boba-fett#disintegrator', upgrades: ['boba-fetts-armor'] },
                        ],
                    },
                    player2: {
                        groundArena: [
                            { card: 'atst', upgrades: ['smuggling-compartment'] },
                            { card: 'luminara-unduli#softspoken-master', upgrades: ['shield'] },
                            { card: 'clone-trooper', upgrades: ['nameless-valor'] }
                        ],
                    }
                });
            });

            it('should allow to pay to attach an upgrade that can be attached', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.preVizsla);
                context.player1.clickCard(context.p2Base);
                expect(context.player1).toHaveChooseNoTargetButton();
                expect(context.player1).toBeAbleToSelectExactly([context.bobaFettsArmor, context.namelessValor, context.shield]);

                const readyResources = context.player1.readyResourceCount;
                context.player1.clickCard(context.bobaFettsArmor);

                expect(context.player1.readyResourceCount).toBe(readyResources - 2);
                expect(context.bobaFettDisintegrator).toHaveExactUpgradeNames([]);
                expect(context.preVizsla).toHaveExactUpgradeNames(['boba-fetts-armor']);
                expect(context.p2Base.damage).toBe(10);
            });

            it('should allow to attach a free token upgrade', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.preVizsla);
                context.player1.clickCard(context.luminaraUnduli);
                expect(context.player1).toBeAbleToSelectExactly([context.bobaFettsArmor, context.namelessValor, context.shield]);

                const readyResources = context.player1.readyResourceCount;
                context.player1.clickCard(context.shield);

                expect(context.player1.readyResourceCount).toBe(readyResources);
                expect(context.luminaraUnduli).toHaveExactUpgradeNames([]);
                expect(context.preVizsla).toHaveExactUpgradeNames([]);
                expect(context.luminaraUnduli.damage).toBe(8);
                expect(context.preVizsla.damage).toBe(0);
            });

            it('should allow to pay to defeat an upgrade that cannot be attached to it', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.preVizsla);
                context.player1.clickCard(context.p2Base);
                expect(context.player1).toBeAbleToSelectExactly([context.bobaFettsArmor, context.namelessValor, context.shield]);

                const readyResources = context.player1.readyResourceCount;
                context.player1.clickCard(context.namelessValor);

                expect(context.player1.readyResourceCount).toBe(readyResources - 1);
                expect(context.cloneTrooper).toHaveExactUpgradeNames([]);
                expect(context.preVizsla).toHaveExactUpgradeNames([]);
                expect(context.namelessValor).toBeInZone('discard');
                expect(context.p2Base.damage).toBe(8);
            });
        });
    });
});
