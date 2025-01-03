describe('Maul, Shadow Collective Visionary', function() {
    integration(function(contextRef) {
        describe('Maul\'s on attack ability', function() {
            it('redirects combat damage to another friendly Underworld unit', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['heroic-sacrifice', 'moment-of-peace', 'moment-of-peace'],
                        groundArena: [
                            { card: 'maul#shadow-collective-visionary', upgrades: ['resilient'] },
                            'mercenary-company',
                            'greedo#slow-on-the-draw'
                        ],
                        spaceArena: ['tieln-fighter', 'cartel-spacer']
                    },
                    player2: {
                        groundArena: [
                            'luminara-unduli#softspoken-master',
                            'hylobon-enforcer',
                            'tarfful#kashyyyk-chieftain'
                        ]
                    }
                });

                const { context } = contextRef;

                const reset = (pass = true) => {
                    context.setDamage(context.luminaraUnduli, 0);
                    context.setDamage(context.maul, 0);
                    context.setDamage(context.mercenaryCompany, 0);
                    context.maul.exhausted = false;

                    if (pass) {
                        context.player2.passAction();
                    }
                };

                // CASE 1: Maul redirects damage onto Mercenary Company
                context.player1.clickCard(context.maul);
                context.player1.clickCard(context.luminaraUnduli);

                // damage redirect target selection
                expect(context.player1).toBeAbleToSelectExactly([context.mercenaryCompany, context.cartelSpacer, context.greedo]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.mercenaryCompany);

                expect(context.maul.damage).toBe(0);
                expect(context.luminaraUnduli.damage).toBe(7);
                expect(context.mercenaryCompany.damage).toBe(4);

                reset(false);

                // CASE 2: Maul is attacked, ability should be gone
                context.player2.clickCard(context.luminaraUnduli);
                context.player2.clickCard(context.maul);
                expect(context.maul.damage).toBe(4);
                expect(context.luminaraUnduli.damage).toBe(7);
                expect(context.player1).toBeActivePlayer();

                reset(false);

                // CASE 3: Maul ability only redirects combat damage
                context.player1.clickCard(context.maul);
                context.player1.clickCard(context.tarfful);

                // damage redirect target selection
                expect(context.player1).toBeAbleToSelectExactly([context.mercenaryCompany, context.cartelSpacer, context.greedo]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.mercenaryCompany);

                // combat damage resolves first
                expect(context.maul.damage).toBe(0);
                expect(context.tarfful.damage).toBe(7);
                expect(context.mercenaryCompany.damage).toBe(3);

                // Tarfful ability triggers, damage is not redirected away from Maul since it's not combat damage
                expect(context.player2).toBeAbleToSelectExactly([context.maul, context.mercenaryCompany, context.greedo]);
                context.player2.clickCard(context.maul);
                expect(context.maul.damage).toBe(7);

                reset();

                // CASE 4: Maul ability doesn't trigger if no target is selected
                context.player1.clickCard(context.maul);
                context.player1.clickCard(context.luminaraUnduli);

                // damage redirect prompt
                expect(context.player1).toBeAbleToSelectExactly([context.mercenaryCompany, context.cartelSpacer, context.greedo]);
                context.player1.clickPrompt('Pass ability');

                expect(context.maul.damage).toBe(4);
                expect(context.luminaraUnduli.damage).toBe(7);
                expect(context.mercenaryCompany.damage).toBe(0);

                reset();

                // CASE 5: Maul ability doesn't prompt if attacking a base
                context.player1.clickCard(context.maul);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(7);
                expect(context.player2).toBeActivePlayer();

                reset();

                // CASE 6: If redirect target is defeated, "when defeated" abilities happen in the right timing window
                context.player1.clickCard(context.maul);
                context.player1.clickCard(context.luminaraUnduli);

                // damage redirect target selection
                expect(context.player1).toBeAbleToSelectExactly([context.mercenaryCompany, context.cartelSpacer, context.greedo]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.greedo);

                expect(context.maul.damage).toBe(0);
                expect(context.luminaraUnduli.damage).toBe(7);

                expect(context.greedo).toBeInZone('discard');
                expect(context.player1).toHavePassAbilityPrompt('Discard a card from your deck. If it\'s not a unit, deal 2 damage to a ground unit.');
                context.player1.clickPrompt('Pass');

                reset();

                // CASE 7: Maul gains two temporary abilities, both of them work correctly
                context.player1.clickCard(context.heroicSacrifice);
                context.player1.clickCard(context.maul);
                context.player1.clickCard(context.luminaraUnduli);

                // damage redirect target selection
                expect(context.player1).toBeAbleToSelectExactly([context.mercenaryCompany, context.cartelSpacer]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.mercenaryCompany);

                expect(context.maul).toBeInZone('discard');
                expect(context.luminaraUnduli).toBeInZone('discard');
                expect(context.mercenaryCompany.damage).toBe(4);
            });

            it('redirects combat damage to another friendly Underworld unit, handling shields correctly', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: [
                            { card: 'maul#shadow-collective-visionary', upgrades: ['shield'] },
                            { card: 'mercenary-company', upgrades: ['shield'] }
                        ]
                    },
                    player2: {
                        groundArena: ['luminara-unduli#softspoken-master']
                    }
                });

                const { context } = contextRef;

                // CASE 1: Resolve Maul ability before shield, Maul's shield stays and Mercenary Company's shield is defeated
                context.player1.clickCard(context.maul);
                context.player1.clickCard(context.luminaraUnduli);

                // damage redirect target selection
                expect(context.player1).toBeAbleToSelectExactly([context.mercenaryCompany]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.mercenaryCompany);

                expect(context.player1).toHaveExactPromptButtons([
                    'Defeat shield to prevent attached unit from taking damage',
                    'Redirect combat damage to another Underworld unit'
                ]);
                context.player1.clickPrompt('Redirect combat damage to another Underworld unit');

                expect(context.maul.damage).toBe(0);
                expect(context.luminaraUnduli.damage).toBe(7);
                expect(context.mercenaryCompany.damage).toBe(0);
                expect(context.mercenaryCompany.isUpgraded()).toBeFalse();
            });
        });
    });

    // TODO: test with Jango leader for attribution
});
