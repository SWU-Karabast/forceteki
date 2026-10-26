describe('Defoliator Tank', function () {
    integration(function (contextRef) {
        const promptTitle = 'Pay 2 resources to give 2 Weakness tokens to defending non-Droid non-Vehicle units';

        describe('Defoliator Tank\'s on attack ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['defoliator-tank'],
                        resources: 5
                    },
                    player2: {
                        groundArena: ['consular-security-force', 'battle-droid', 'snowspeeder'],
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
                expect(context.defoliatorTank.damage).toBe(3);
                expect(context.player2).toBeActivePlayer();
            });

            it('should not trigger when attacking a Droid', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.defoliatorTank);
                context.player1.clickCard(context.battleDroid);

                expect(context.player1.exhaustedResourceCount).toBe(0);
                expect(context.battleDroid).toBeInZone('outsideTheGame');
                expect(context.defoliatorTank.damage).toBe(1);
                expect(context.player2).toBeActivePlayer();
            });

            it('should not trigger when attacking a Vehicle', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.defoliatorTank);
                context.player1.clickCard(context.snowspeeder);

                expect(context.player1.exhaustedResourceCount).toBe(0);
                expect(context.snowspeeder).toHaveExactUpgradeNames([]);
                expect(context.snowspeeder.damage).toBe(4);
                expect(context.defoliatorTank.damage).toBe(3);
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
        it('Defoliator Tank\'s ability, gained by Darth Maul via Improvised Identity, should give Weakness to each eligible defender of a two-unit attack', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: [{ card: 'darth-maul#revenge-at-last', upgrades: ['improvised-identity'] }],
                    deck: ['defoliator-tank', 'cartel-spacer', 'takedown'],
                    resources: 5
                },
                player2: {
                    groundArena: ['krayt-dragon', 'atst']
                }
            });

            const { context } = contextRef;

            // Use Improvised Identity: discard Defoliator Tank from the top 3 and attack with its abilities
            context.player1.clickCard(context.darthMaul);
            context.player1.clickPrompt('Search the top 3 cards of your deck for a ground unit and discard it. Then, you may attack with this unit. For this attack, this unit gains the discarded unit\'s abilities.');
            context.player1.clickCardInDisplayCardPrompt(context.defoliatorTank);
            expect(context.defoliatorTank).toBeInZone('discard', context.player1);

            // Maul attacks two units at once: one eligible (Krayt Dragon), one Vehicle (AT-ST)
            context.player1.clickCard(context.kraytDragon);
            context.player1.clickCard(context.atst);
            context.player1.clickDone();

            expect(context.player1).toHavePassAbilityPrompt(promptTitle);
            context.player1.clickPrompt('Trigger');

            expect(context.player1.exhaustedResourceCount).toBe(2);
            // Only the non-Vehicle defender gets the tokens; a single-target accessor would have failed here
            expect(context.kraytDragon).toHaveExactUpgradeNames(['weakness', 'weakness']);
            expect(context.kraytDragon.getPower()).toBe(8);
            expect(context.atst).toHaveExactUpgradeNames([]);
        });
        it('Defoliator Tank\'s ability, gained by Darth Maul via Improvised Identity, should be paid for once and give Weakness to both defenders when both are eligible', async function () {
            // Judge ruling: it is one On Attack with two defenders, so pay 2 once and give 2 Weakness tokens to each.
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: [{ card: 'darth-maul#revenge-at-last', upgrades: ['improvised-identity'] }],
                    deck: ['defoliator-tank', 'cartel-spacer', 'takedown'],
                    resources: 5
                },
                player2: {
                    groundArena: ['krayt-dragon', 'gentle-giant']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.darthMaul);
            context.player1.clickPrompt('Search the top 3 cards of your deck for a ground unit and discard it. Then, you may attack with this unit. For this attack, this unit gains the discarded unit\'s abilities.');
            context.player1.clickCardInDisplayCardPrompt(context.defoliatorTank);

            context.player1.clickCard(context.kraytDragon);
            context.player1.clickCard(context.gentleGiant);
            context.player1.clickDone();

            expect(context.player1).toHavePassAbilityPrompt(promptTitle);
            context.player1.clickPrompt('Trigger');

            // Paid once, not once per defender
            expect(context.player1.exhaustedResourceCount).toBe(2);
            expect(context.kraytDragon).toHaveExactUpgradeNames(['weakness', 'weakness']);
            expect(context.gentleGiant).toHaveExactUpgradeNames(['weakness', 'weakness']);
            expect(context.kraytDragon.getPower()).toBe(8);
            // Gentle Giant: 2 base, -2 from Weakness, +5 from Grit after taking Maul's 5 damage
            expect(context.gentleGiant.getPower()).toBe(5);
        });
    });
});
