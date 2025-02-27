describe('Heroic Sacrifice', function() {
    integration(function(contextRef) {
        describe('Heroic Sacrifice\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['heroic-sacrifice'],
                        groundArena: ['isb-agent', { card: 'lom-pyke#dealer-in-truths', upgrades: ['vambrace-flamethrower'] }],
                        spaceArena: ['tieln-fighter']
                    },
                    player2: {
                        groundArena: ['sundari-peacekeeper', 'atst', { card: 'crafty-smuggler', upgrades: ['shield'] }],
                    }
                });
            });

            it('should draw a card and attack with a unit giving +2/+0 for this attack and defeat it after dealing combat damage to a base', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.heroicSacrifice);

                expect(context.player1.handSize).toBe(1);

                expect(context.player1).toBeAbleToSelectExactly([context.isbAgent, context.tielnFighter, context.lomPyke]);

                context.player1.clickCard(context.isbAgent);
                expect(context.player1).toBeAbleToSelectExactly([context.sundariPeacekeeper, context.atst, context.craftySmuggler, context.p2Base]);

                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(3);
                expect(context.isbAgent).toBeInZone('discard');

                expect(context.player2).toBeActivePlayer();
            });

            it('should draw a card and attack with a unit giving +2/+0 for this attack and defeat it after dealing combat damage to a unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.heroicSacrifice);

                expect(context.player1.handSize).toBe(1);

                expect(context.player1).toBeAbleToSelectExactly([context.isbAgent, context.tielnFighter, context.lomPyke]);

                context.player1.clickCard(context.isbAgent);
                expect(context.player1).toBeAbleToSelectExactly([context.sundariPeacekeeper, context.atst, context.craftySmuggler, context.p2Base]);

                context.player1.clickCard(context.sundariPeacekeeper);
                expect(context.sundariPeacekeeper.damage).toBe(3);
                expect(context.isbAgent).toBeInZone('discard');

                expect(context.player2).toBeActivePlayer();
            });

            it('should draw a card and attack with a unit giving +2/+0 for this attack and not defeat unit if no combat damage is dealt', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.heroicSacrifice);

                expect(context.player1.handSize).toBe(1);

                expect(context.player1).toBeAbleToSelectExactly([context.isbAgent, context.tielnFighter, context.lomPyke]);

                context.player1.clickCard(context.isbAgent);
                expect(context.player1).toBeAbleToSelectExactly([context.sundariPeacekeeper, context.atst, context.craftySmuggler, context.p2Base]);

                context.player1.clickCard(context.craftySmuggler);

                expect(context.craftySmuggler.upgrades.length).toBe(0);
                expect(context.craftySmuggler).toBeInZone('groundArena');

                expect(context.isbAgent).toBeInZone('groundArena');

                expect(context.player2).toBeActivePlayer();
            });

            it('should draw a card and attack with a unit giving +2/+0 for this attack and not defeat unit if no combat damage is dealt, even when other type of damage is caused', function () {
                const { context } = contextRef;
                const flamethrowerPrompt = 'Deal 3 damage divided as you choose among enemy ground units';
                const lomPykePrompt = 'Give a Shield token to an enemy unit';

                context.player1.clickCard(context.heroicSacrifice);

                expect(context.player1.handSize).toBe(1);

                expect(context.player1).toBeAbleToSelectExactly([context.isbAgent, context.tielnFighter, context.lomPyke]);

                context.player1.clickCard(context.lomPyke);

                expect(context.player1).toBeAbleToSelectExactly([context.sundariPeacekeeper, context.atst, context.craftySmuggler, context.p2Base]);
                context.player1.clickCard(context.sundariPeacekeeper);

                // Deal first with Vambrace Flamethrower (which is not combat damage) and then attack shielded enemy given by Lom Pyke's Ability
                expect(context.player1).toHaveExactPromptButtons([lomPykePrompt, flamethrowerPrompt]);
                context.player1.clickPrompt(flamethrowerPrompt);

                expect(context.player1).toHavePassAbilityPrompt(flamethrowerPrompt);
                context.player1.clickPrompt(flamethrowerPrompt);

                expect(context.player1).toBeAbleToSelectExactly([context.sundariPeacekeeper, context.atst, context.craftySmuggler]);
                context.player1.setDistributeDamagePromptState(new Map([
                    [context.atst, 1],
                    [context.craftySmuggler, 2],
                ]));

                expect(context.atst.damage).toBe(1);
                expect(context.craftySmuggler.damage).toBe(0);
                expect(context.craftySmuggler.upgrades.length).toBe(0);
                expect(context.sundariPeacekeeper.damage).toBe(0);

                // opponent shield target selection
                expect(context.player1).toBeAbleToSelectExactly([context.sundariPeacekeeper, context.atst, context.craftySmuggler]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.sundariPeacekeeper);

                expect(context.sundariPeacekeeper).toHaveExactUpgradeNames(['shield']);

                // friendly shield target selection
                expect(context.player1).toBeAbleToSelectExactly([context.lomPyke, context.isbAgent, context.tielnFighter]);
                expect(context.player1).not.toHavePassAbilityButton();
                context.player1.clickCard(context.tielnFighter);
                expect(context.tielnFighter).toHaveExactUpgradeNames(['shield']);

                expect(context.isbAgent.isUpgraded()).toBeFalse();
                expect(context.atst.isUpgraded()).toBeFalse();

                expect(context.lomPyke.damage).toBe(1);
                expect(context.sundariPeacekeeper.damage).toBe(0);

                expect(context.lomPyke).toBeInZone('groundArena');

                expect(context.player2).toBeActivePlayer();
            });

            // TODO: Add test for Maul unit redirecting damage
        });
    });
});
