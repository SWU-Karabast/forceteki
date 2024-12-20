describe('Heroic Resolve', function() {
    integration(function(contextRef) {
        describe('Heroic Resolve\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'frontier-atrt', upgrades: ['heroic-resolve'] }],
                    },
                    player2: {
                        groundArena: ['wampa']
                    },

                    // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                    autoSingleTarget: true
                });
            });

            it('should cost 2 resources and defeating the upgrade, then give the unit an attack with +4/+0 and Overwhelm', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.frontierAtrt);
                // TODO: configure action ability prompts to include costs in button text
                expect(context.player1).toHaveEnabledPromptButton('Attack with this unit. It gains +4/+0 and Overwhelm for this attack.');

                context.player1.clickPrompt('Attack with this unit. It gains +4/+0 and Overwhelm for this attack.');
                expect(context.player1).not.toHavePassAbilityButton();
                expect(context.player1).toBeAbleToSelectExactly([context.p2Base, context.wampa]);

                context.player1.clickCard(context.wampa);
                expect(context.frontierAtrt.isUpgraded()).toBe(false);
                expect(context.heroicResolve).toBeInZone('discard');
                expect(context.wampa).toBeInZone('discard');
                expect(context.p2Base.damage).toBe(2);
                expect(context.player1.exhaustedResourceCount).toBe(2);
            });

            it('should be able to be activated even if the unit cannot attack', function () {
                const { context } = contextRef;

                context.frontierAtrt.exhausted = true;

                // the Heroic Resolve action is the only one available on click so it is automatically selected.
                // it pays the costs and then the action ends since the unit can't attack
                context.player1.clickCard(context.frontierAtrt);
                expect(context.player2).toBeActivePlayer();
                expect(context.frontierAtrt.isUpgraded()).toBe(false);
                expect(context.heroicResolve).toBeInZone('discard');
                expect(context.player1.exhaustedResourceCount).toBe(2);
            });
        });

        describe('Heroic Resolve\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'frontier-atrt', upgrades: ['heroic-resolve', 'heroic-resolve', 'academy-training'] }],
                    },
                    player2: {
                        groundArena: ['wampa', 'specforce-soldier', { card: 'battlefield-marine', upgrades: ['heroic-resolve'] }]
                    },

                    // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                    autoSingleTarget: true
                });

                const { context } = contextRef;
                [context.p1HeroicResolve1, context.p1HeroicResolve2] = context.player1.findCardsByName('heroic-resolve');
                context.p2HeroicResolve = context.player2.findCardByName('heroic-resolve');
            });

            it('should allow any attached copy of Heroic Resolve to be defeated', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.frontierAtrt);

                // check exact buttons to make sure that there is only one Heroic Resolve ability prompt
                expect(context.player1).toHaveExactPromptButtons([
                    'Attack',
                    'Attack with this unit. It gains +4/+0 and Overwhelm for this attack.',
                    'Cancel'
                ]);

                context.player1.clickPrompt('Attack with this unit. It gains +4/+0 and Overwhelm for this attack.');
                expect(context.player1).not.toHavePassAbilityButton();
                expect(context.player1).toBeAbleToSelectExactly([context.p1HeroicResolve1, context.p1HeroicResolve2]);   // should not be able to select opponent's upgrade
                context.player1.clickCard(context.p1HeroicResolve1);

                expect(context.player1).toBeAbleToSelectExactly([context.p2Base, context.wampa, context.specforceSoldier, context.battlefieldMarine]);
                context.player1.clickCard(context.wampa);
                expect(context.frontierAtrt).toHaveExactUpgradeNames(['heroic-resolve', 'academy-training']);
                expect(context.p1HeroicResolve1).toBeInZone('discard');
                expect(context.wampa).toBeInZone('discard');
                expect(context.p2Base.damage).toBe(5); // extra 3 damage from upgrade stat boosts
                expect(context.player1.exhaustedResourceCount).toBe(2);

                // activate second Heroic Resolve
                context.player2.passAction();
                context.frontierAtrt.exhausted = false;
                context.setDamage(context.frontierAtrt, 0);
                context.player1.clickCard(context.frontierAtrt);
                expect(context.player1).toHaveEnabledPromptButton('Attack with this unit. It gains +4/+0 and Overwhelm for this attack.');

                context.player1.clickPrompt('Attack with this unit. It gains +4/+0 and Overwhelm for this attack.');
                expect(context.player1).not.toHavePassAbilityButton();
                expect(context.player1).toBeAbleToSelectExactly([context.p2Base, context.specforceSoldier, context.battlefieldMarine]);

                context.player1.clickCard(context.specforceSoldier);
                expect(context.frontierAtrt).toHaveExactUpgradeNames(['academy-training']);
                expect(context.p1HeroicResolve2).toBeInZone('discard');
                expect(context.specforceSoldier).toBeInZone('discard');
                expect(context.p2Base.damage).toBe(12);
                expect(context.player1.exhaustedResourceCount).toBe(4);
            });
        });

        describe('Heroic Resolve\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'frontier-atrt', upgrades: ['heroic-resolve'] }],
                    },
                    player2: {
                        hand: ['heroic-resolve'],
                        groundArena: ['wampa', 'specforce-soldier']
                    },

                    // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                    autoSingleTarget: true
                });

                const { context } = contextRef;
                context.p1HeroicResolve = context.player1.findCardByName('heroic-resolve');
                context.p2HeroicResolve = context.player2.findCardByName('heroic-resolve');
            });

            it('should work even if it is attached to an opponent\'s card', function () {
                const { context } = contextRef;

                context.player1.passAction();

                // player 2 attaches their Heroic Resolve to player 1's AT-RT
                context.player2.clickCard(context.p2HeroicResolve);
                context.player2.clickCard(context.frontierAtrt);

                context.player1.clickCard(context.frontierAtrt);

                // check exact buttons to make sure that there is only one Heroic Resolve ability prompt
                expect(context.player1).toHaveExactPromptButtons([
                    'Attack',
                    'Attack with this unit. It gains +4/+0 and Overwhelm for this attack.',
                    'Cancel'
                ]);

                context.player1.clickPrompt('Attack with this unit. It gains +4/+0 and Overwhelm for this attack.');
                expect(context.player1).not.toHavePassAbilityButton();
                expect(context.player1).toBeAbleToSelectExactly([context.p1HeroicResolve, context.p2HeroicResolve]);
                context.player1.clickCard(context.p1HeroicResolve);

                expect(context.player1).toBeAbleToSelectExactly([context.p2Base, context.wampa, context.specforceSoldier]);
                context.player1.clickCard(context.wampa);
                expect(context.frontierAtrt).toHaveExactUpgradeNames(['heroic-resolve']);
                expect(context.p1HeroicResolve).toBeInZone('discard');
                expect(context.wampa).toBeInZone('discard');
                expect(context.p2Base.damage).toBe(3); // extra 1 damage from the heroic resolve stat boost
                expect(context.player1.exhaustedResourceCount).toBe(2);

                // activate second Heroic Resolve
                context.player2.passAction();
                context.frontierAtrt.exhausted = false;
                context.setDamage(context.frontierAtrt, 0);
                context.player1.clickCard(context.frontierAtrt);
                expect(context.player1).toHaveEnabledPromptButton('Attack with this unit. It gains +4/+0 and Overwhelm for this attack.');

                context.player1.clickPrompt('Attack with this unit. It gains +4/+0 and Overwhelm for this attack.');
                expect(context.player1).not.toHavePassAbilityButton();
                expect(context.player1).toBeAbleToSelectExactly([context.p2Base, context.specforceSoldier]);

                context.player1.clickCard(context.specforceSoldier);
                expect(context.frontierAtrt.isUpgraded()).toBe(false);
                expect(context.p2HeroicResolve).toBeInZone('discard');
                expect(context.specforceSoldier).toBeInZone('discard');
                expect(context.p2Base.damage).toBe(8);
                expect(context.player1.exhaustedResourceCount).toBe(4);
            });
        });
    });
});
