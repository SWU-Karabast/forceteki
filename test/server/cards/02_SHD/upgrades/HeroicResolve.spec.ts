describe('Heroic Resolve', function() {
    integration(function() {
        describe('Heroic Resolve\'s ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'frontier-atrt', upgrades: ['heroic-resolve'] }],
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });
            });

            it('should cost 2 resources and defeating the upgrade, then give the unit an attack with +4/+0 and Overwhelm', function () {
                this.player1.clickCard(this.frontierAtrt);
                // TODO: configure action ability prompts to include costs in button text
                expect(this.player1).toHaveEnabledPromptButton('Attack with this unit. It gains +4/+0 and Overwhelm for this attack.');

                this.player1.clickPrompt('Attack with this unit. It gains +4/+0 and Overwhelm for this attack.');
                expect(this.player1).not.toHavePassAbilityButton();
                expect(this.player1).toBeAbleToSelectExactly([this.p2Base, this.wampa]);

                this.player1.clickCard(this.wampa);
                expect(this.frontierAtrt.isUpgraded()).toBe(false);
                expect(this.heroicResolve).toBeInLocation('discard');
                expect(this.wampa).toBeInLocation('discard');
                expect(this.p2Base.damage).toBe(2);
                expect(this.player1.countExhaustedResources()).toBe(2);
            });

            it('should be able to be activated even if the unit cannot attack', function () {
                this.frontierAtrt.exhausted = true;

                // the Heroic Resolve action is the only one available on click so it is automatically selected.
                // it pays the costs and then the action ends since the unit can't attack
                this.player1.clickCard(this.frontierAtrt);
                expect(this.player2).toBeActivePlayer();
                expect(this.frontierAtrt.isUpgraded()).toBe(false);
                expect(this.heroicResolve).toBeInLocation('discard');
                expect(this.player1.countExhaustedResources()).toBe(2);
            });
        });

        describe('Heroic Resolve\'s ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'frontier-atrt', upgrades: ['heroic-resolve', 'heroic-resolve', 'academy-training'] }],
                    },
                    player2: {
                        groundArena: ['wampa', 'specforce-soldier', { card: 'battlefield-marine', upgrades: ['heroic-resolve'] }]
                    }
                });

                [this.p1HeroicResolve1, this.p1HeroicResolve2] = this.player1.findCardsByName('heroic-resolve');
                this.p2HeroicResolve = this.player2.findCardByName('heroic-resolve');
            });

            it('should allow any attached copy of Heroic Resolve to be defeated', function () {
                this.player1.clickCard(this.frontierAtrt);

                // check exact buttons to make sure that there is only one Heroic Resolve ability prompt
                expect(this.player1).toHaveExactPromptButtons([
                    'Attack',
                    'Attack with this unit. It gains +4/+0 and Overwhelm for this attack.',
                    'Cancel'
                ]);

                this.player1.clickPrompt('Attack with this unit. It gains +4/+0 and Overwhelm for this attack.');
                expect(this.player1).not.toHavePassAbilityButton();
                expect(this.player1).toBeAbleToSelectExactly([this.p1HeroicResolve1, this.p1HeroicResolve2]);   // should not be able to select opponent's upgrade
                this.player1.clickCard(this.p1HeroicResolve1);

                expect(this.player1).toBeAbleToSelectExactly([this.p2Base, this.wampa, this.specforceSoldier, this.battlefieldMarine]);
                this.player1.clickCard(this.wampa);
                expect(this.frontierAtrt).toHaveExactUpgradeNames(['heroic-resolve', 'academy-training']);
                expect(this.p1HeroicResolve1).toBeInLocation('discard');
                expect(this.wampa).toBeInLocation('discard');
                expect(this.p2Base.damage).toBe(5); // extra 3 damage from upgrade stat boosts
                expect(this.player1.countExhaustedResources()).toBe(2);

                // activate second Heroic Resolve
                this.player2.passAction();
                this.frontierAtrt.exhausted = false;
                this.frontierAtrt.damage = 0;
                this.player1.clickCard(this.frontierAtrt);
                expect(this.player1).toHaveEnabledPromptButton('Attack with this unit. It gains +4/+0 and Overwhelm for this attack.');

                this.player1.clickPrompt('Attack with this unit. It gains +4/+0 and Overwhelm for this attack.');
                expect(this.player1).not.toHavePassAbilityButton();
                expect(this.player1).toBeAbleToSelectExactly([this.p2Base, this.specforceSoldier, this.battlefieldMarine]);

                this.player1.clickCard(this.specforceSoldier);
                expect(this.frontierAtrt).toHaveExactUpgradeNames(['academy-training']);
                expect(this.p1HeroicResolve2).toBeInLocation('discard');
                expect(this.specforceSoldier).toBeInLocation('discard');
                expect(this.p2Base.damage).toBe(12);
                expect(this.player1.countExhaustedResources()).toBe(4);
            });
        });

        describe('Heroic Resolve\'s ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'frontier-atrt', upgrades: ['heroic-resolve'] }],
                    },
                    player2: {
                        hand: ['heroic-resolve'],
                        groundArena: ['wampa', 'specforce-soldier']
                    }
                });

                this.p1HeroicResolve = this.player1.findCardByName('heroic-resolve');
                this.p2HeroicResolve = this.player2.findCardByName('heroic-resolve');
            });

            it('should work even if it is attached to an opponent\'s card', function () {
                this.player1.passAction();

                // player 2 attaches their Heroic Resolve to player 1's AT-RT
                this.player2.clickCard(this.p2HeroicResolve);
                this.player2.clickCard(this.frontierAtrt);

                this.player1.clickCard(this.frontierAtrt);

                // check exact buttons to make sure that there is only one Heroic Resolve ability prompt
                expect(this.player1).toHaveExactPromptButtons([
                    'Attack',
                    'Attack with this unit. It gains +4/+0 and Overwhelm for this attack.',
                    'Cancel'
                ]);

                this.player1.clickPrompt('Attack with this unit. It gains +4/+0 and Overwhelm for this attack.');
                expect(this.player1).not.toHavePassAbilityButton();
                expect(this.player1).toBeAbleToSelectExactly([this.p1HeroicResolve, this.p2HeroicResolve]);
                this.player1.clickCard(this.p1HeroicResolve);

                expect(this.player1).toBeAbleToSelectExactly([this.p2Base, this.wampa, this.specforceSoldier]);
                this.player1.clickCard(this.wampa);
                expect(this.frontierAtrt).toHaveExactUpgradeNames(['heroic-resolve']);
                expect(this.p1HeroicResolve).toBeInLocation('discard');
                expect(this.wampa).toBeInLocation('discard');
                expect(this.p2Base.damage).toBe(3); // extra 1 damage from the heroic resolve stat boost
                expect(this.player1.countExhaustedResources()).toBe(2);

                // activate second Heroic Resolve
                this.player2.passAction();
                this.frontierAtrt.exhausted = false;
                this.frontierAtrt.damage = 0;
                this.player1.clickCard(this.frontierAtrt);
                expect(this.player1).toHaveEnabledPromptButton('Attack with this unit. It gains +4/+0 and Overwhelm for this attack.');

                this.player1.clickPrompt('Attack with this unit. It gains +4/+0 and Overwhelm for this attack.');
                expect(this.player1).not.toHavePassAbilityButton();
                expect(this.player1).toBeAbleToSelectExactly([this.p2Base, this.specforceSoldier]);

                this.player1.clickCard(this.specforceSoldier);
                expect(this.frontierAtrt.isUpgraded()).toBe(false);
                expect(this.p2HeroicResolve).toBeInLocation('discard');
                expect(this.specforceSoldier).toBeInLocation('discard');
                expect(this.p2Base.damage).toBe(8);
                expect(this.player1.countExhaustedResources()).toBe(4);
            });
        });
    });
});
