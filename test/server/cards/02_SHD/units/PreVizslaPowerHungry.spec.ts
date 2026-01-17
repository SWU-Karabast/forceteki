describe('Pre Vizsla, Power Hungry', function() {
    integration(function(contextRef) {
        describe('Pre Vizsla\'s when played ability', function() {
            beforeEach(async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['pre-vizsla#power-hungry'],
                        groundArena: [{ card: 'boba-fett#disintegrator', upgrades: ['boba-fetts-armor'] }],
                        base: 'spice-mines',
                        leader: 'darth-vader#dark-lord-of-the-sith',
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
                expect(context.player1).toHavePassAbilityButton();
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

            it('should not allow to take control of an upgrade that cannot be afforded', function () {
                const { context } = contextRef;

                context.player1.setResourceCount(8);

                context.player1.clickCard(context.preVizsla);
                expect(context.player1.readyResourceCount).toBe(1);
                expect(context.player1).toBeAbleToSelectExactly([context.namelessValor, context.shield]);

                context.player1.clickCard(context.namelessValor);

                expect(context.player1.readyResourceCount).toBe(0);
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
                        base: 'spice-mines',
                        leader: 'darth-vader#dark-lord-of-the-sith',
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
                expect(context.player1).toHavePassAbilityButton();
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

            it('should not allow to take control of an upgrade that cannot be afforded', function () {
                const { context } = contextRef;

                context.player1.setResourceCount(1);

                context.player1.clickCard(context.preVizsla);
                context.player1.clickCard(context.p2Base);
                expect(context.player1.readyResourceCount).toBe(1);
                expect(context.player1).toBeAbleToSelectExactly([context.namelessValor, context.shield]);

                context.player1.clickCard(context.namelessValor);

                expect(context.player1.readyResourceCount).toBe(0);
                expect(context.namelessValor).toBeInZone('discard');
            });
        });

        describe('Interaction with cost adjustments', function() {
            it('Credit tokens can be used to pay for the upgrade cost', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        credits: 4,
                        resources: 7,
                        hand: ['pre-vizsla#power-hungry'],
                    },
                    player2: {
                        groundArena: [
                            { card: 'sabine-wren#explosives-artist', upgrades: ['the-darksaber'] },
                        ],
                    }
                });

                const { context } = contextRef;

                // Play Pre Vizsla (without using Credit tokens)
                context.player1.clickCard(context.preVizsla);
                context.player1.clickPrompt('Pay costs without Credit tokens');
                expect(context.preVizsla).toBeInZone('groundArena');
                expect(context.player1.readyResourceCount).toBe(0);

                // Resolve When Played ability
                expect(context.player1).toHavePassAbilityButton();
                expect(context.player1).toBeAbleToSelectExactly([context.theDarksaber]);
                context.player1.clickCard(context.theDarksaber);

                // Resolve payment using Credit tokens
                expect(context.player1).toHavePrompt('Use Credit tokens to pay for Pre Vizsla\'s effect');
                expect(context.player1).toHaveExactPromptButtons([
                    'Use 4 Credits'
                ]);
                context.player1.clickPrompt('Use 4 Credits');

                // The Darksaber is now attached to Pre Vizsla
                expect(context.preVizsla).toHaveExactUpgradeNames(['the-darksaber']);
                expect(context.sabineWren).toHaveExactUpgradeNames([]);
                expect(context.player1.credits).toBe(0);
            });
        });
    });
});
