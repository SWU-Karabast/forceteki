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
                const lomPykePrompt = 'Give a Shield token to an enemy unit. If you do, give a Shield token to a friendly unit';

                context.player1.clickCard(context.heroicSacrifice);

                expect(context.player1.handSize).toBe(1);

                expect(context.player1).toBeAbleToSelectExactly([context.isbAgent, context.tielnFighter, context.lomPyke]);

                context.player1.clickCard(context.lomPyke);

                expect(context.player1).toBeAbleToSelectExactly([context.sundariPeacekeeper, context.atst, context.craftySmuggler, context.p2Base]);
                context.player1.clickCard(context.sundariPeacekeeper);

                // Deal first with Vambrace Flamethrower (which is not combat damage) and then attack shielded enemy given by Lom Pyke's Ability
                expect(context.player1).toHaveExactPromptButtons([lomPykePrompt, flamethrowerPrompt]);
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
        });

        describe('Heroic Sacrifice\'s ability, when used with Maul redirecting combat damage', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['heroic-sacrifice'],
                        groundArena: ['maul#shadow-collective-visionary', 'mercenary-company'],
                    },
                    player2: {
                        groundArena: ['wampa', { card: 'crafty-smuggler', upgrades: ['shield'] }],
                    }
                });
            });

            it('should defeat Maul after it deals combat damage, while the redirected combat damage is dealt to the chosen unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.heroicSacrifice);
                expect(context.player1.handSize).toBe(1);

                context.player1.clickCard(context.maul);
                context.player1.clickCard(context.wampa);

                // damage redirect target selection
                expect(context.player1).toBeAbleToSelectExactly([context.mercenaryCompany]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.mercenaryCompany);

                // Maul deals 9 combat damage (7 + 2), Overwhelm deals the excess to the base
                expect(context.wampa).toBeInZone('discard');
                expect(context.p2Base.damage).toBe(4);

                // Wampa's combat damage is dealt to Mercenary Company instead of Maul
                expect(context.mercenaryCompany.damage).toBe(4);
                expect(context.mercenaryCompany).toBeInZone('groundArena');

                // Maul dealt combat damage, so it is defeated
                expect(context.maul).toBeInZone('discard');

                expect(context.player2).toBeActivePlayer();
            });

            it('should not defeat Maul or the chosen unit if Maul deals no combat damage', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.heroicSacrifice);
                expect(context.player1.handSize).toBe(1);

                context.player1.clickCard(context.maul);
                context.player1.clickCard(context.craftySmuggler);

                // damage redirect target selection
                expect(context.player1).toBeAbleToSelectExactly([context.mercenaryCompany]);
                context.player1.clickCard(context.mercenaryCompany);

                // both the Shield and Maul's redirect replace combat damage, so player1 chooses which player's effects resolve first
                expect(context.player1).toHavePrompt('Both players have triggered abilities in response. Choose a player to resolve all of their abilities first:');
                context.player1.clickPrompt('You');

                // the Shield prevents all of Maul's combat damage
                expect(context.craftySmuggler).toBeInZone('groundArena');
                expect(context.craftySmuggler.damage).toBe(0);
                expect(context.craftySmuggler.isUpgraded()).toBeFalse();

                // Crafty Smuggler's combat damage is dealt to Mercenary Company instead of Maul
                expect(context.maul.damage).toBe(0);
                expect(context.mercenaryCompany.damage).toBe(2);

                // neither Maul nor the unit that took the redirected damage is defeated
                expect(context.maul).toBeInZone('groundArena');
                expect(context.mercenaryCompany).toBeInZone('groundArena');

                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
