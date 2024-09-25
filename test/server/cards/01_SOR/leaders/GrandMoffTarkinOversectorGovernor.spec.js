describe('Grand Moff Tarkin, Oversector Governor', function() {
    integration(function() {
        describe('Tarkin\'s undeployed ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['atst', 'battlefield-marine'],
                        spaceArena: ['tieln-fighter'],
                        leader: 'grand-moff-tarkin#oversector-governor'
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['tie-advanced']
                    }
                });
            });

            it('should give a friendly imperial unit an experience token', function () {
                this.player1.clickCard(this.grandMoffTarkin);
                this.player1.clickPrompt('Give an experience token to an Imperial unit');
                expect(this.player1).toBeAbleToSelectExactly([this.atst, this.tielnFighter]);

                this.player1.clickCard(this.atst);
                expect(this.grandMoffTarkin.exhausted).toBe(true);
                expect(this.atst.upgrades.length).toBe(1);
                expect(this.atst.upgrades[0].internalName).toBe('experience');
                expect(this.player1.countExhaustedResources()).toBe(1);
            });
        });

        describe('Tarkin\'s undeployed ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['battlefield-marine'],
                        leader: 'grand-moff-tarkin#oversector-governor'
                    },
                    player2: {
                        groundArena: ['wampa'],
                    }
                });
            });

            it('can be activated with no target', function () {
                this.player1.clickCard(this.grandMoffTarkin);
                this.player1.clickPrompt('Give an experience token to an Imperial unit');

                expect(this.player2).toBeActivePlayer();
                expect(this.grandMoffTarkin.exhausted).toBe(true);
                expect(this.player1.countExhaustedResources()).toBe(1);
            });
        });


        describe('Tarkin\'s deployed ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['atst', 'battlefield-marine'],
                        spaceArena: ['tieln-fighter'],
                        leader: { card: 'grand-moff-tarkin#oversector-governor', deployed: true }
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['tie-advanced']
                    }
                });
            });

            it('should give a friendly imperial unit an experience token on attack', function () {
                this.player1.clickCard(this.grandMoffTarkin);
                this.player1.clickCard(this.wampa);

                expect(this.player1).toHavePrompt('Choose a card');
                expect(this.player1).toHavePassAbilityButton();
                expect(this.player1).toBeAbleToSelectExactly([this.atst, this.tielnFighter]);
                this.player1.clickCard(this.tielnFighter);

                expect(this.tielnFighter).toHaveExactUpgradeNames(['experience']);
                expect(this.grandMoffTarkin.damage).toBe(4);
                expect(this.wampa.damage).toBe(2);
            });
        });
    });
});
