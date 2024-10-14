describe('The Force is With Me', function() {
    integration(function() {
        describe('The Force is With Me\'s ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['the-force-is-with-me'],
                        groundArena: ['wampa'],
                        spaceArena: ['tieln-fighter'],
                        leader: 'chirrut-imwe#one-with-the-force'
                    },
                    player2: {
                        groundArena: ['specforce-soldier']
                    }
                });
            });

            it('should give 2 experience and attack, if no force unit present', function () {
                this.player1.clickCard(this.theForceIsWithMe);
                expect(this.player1).toBeAbleToSelectExactly([this.wampa, this.tielnFighter]);
                expect(this.player1).not.toHavePassAbilityButton();

                this.player1.clickCard(this.wampa);
                expect(this.wampa).toHaveExactUpgradeNames(['experience', 'experience']);
                expect(this.player1).toBeAbleToSelectExactly([this.specforceSoldier, this.p2Base]);
                expect(this.player1).toHavePassAttackButton();

                this.player1.clickCard(this.p2Base);
                expect(this.p2Base.damage).toBe(6);
                expect(this.wampa.exhausted).toBe(true);
            });
        });

        describe('The Force is With Me\'s ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['the-force-is-with-me'],
                        groundArena: ['wampa'],
                        spaceArena: ['tieln-fighter'],
                        leader: { card: 'chirrut-imwe#one-with-the-force', deployed: true, exhausted: true }
                    },
                    player2: {
                        groundArena: ['specforce-soldier']
                    }
                });
            });

            it('should give 2 experience, a shield, and then attack, if a force unit is present', function () {
                this.player1.clickCard(this.theForceIsWithMe);
                expect(this.player1).toBeAbleToSelectExactly([this.wampa, this.tielnFighter, this.chirrutImwe]);
                expect(this.player1).not.toHavePassAbilityButton();

                this.player1.clickCard(this.wampa);
                expect(this.wampa).toHaveExactUpgradeNames(['experience', 'experience', 'shield']);
                expect(this.player1).toBeAbleToSelectExactly([this.specforceSoldier, this.p2Base]);
                expect(this.player1).toHavePassAttackButton();

                this.player1.clickCard(this.p2Base);
                expect(this.p2Base.damage).toBe(6);
                expect(this.wampa.exhausted).toBe(true);
            });

            it('should work if the unit can\'t attack', function () {
                this.player1.clickCard(this.theForceIsWithMe);
                this.player1.clickCard(this.chirrutImwe);
                expect(this.chirrutImwe).toHaveExactUpgradeNames(['experience', 'experience', 'shield']);

                expect(this.player2).toBeActivePlayer();
            });
        });

        describe('The Force is With Me\'s ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['the-force-is-with-me'],
                    },
                    player2: {
                        groundArena: ['specforce-soldier']
                    }
                });
            });

            it('should do nothing if no legal target', function () {
                this.player1.clickCard(this.theForceIsWithMe);
                expect(this.theForceIsWithMe).toBeInLocation('discard');

                expect(this.player2).toBeActivePlayer();
            });
        });
    });
});
