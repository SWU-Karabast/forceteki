describe('Entrenched', function() {
    integration(function() {
        describe('Entrenched\'s ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'wampa', upgrades: ['entrenched'] }],
                        spaceArena: [{ card: 'tieln-fighter', upgrades: ['entrenched'] }],
                    },
                    player2: {
                        spaceArena: ['bright-hope#the-last-transport']
                    }
                });
            });

            it('should prevent a unit from being able to attack base', function () {
                this.player1.clickCard(this.tielnFighter);

                // attack resolved automatically since there's only one legal target
                expect(this.brightHope.damage).toBe(5);
                expect(this.tielnFighter.damage).toBe(2);
            });

            it('should prevent a unit with no opposing arena units from having the option to attack', function () {
                expect(this.wampa).not.toHaveAvailableActionWhenClickedInActionPhaseBy(this.player1);
            });
        });

        describe('Entrenched\'s ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['entrenched'],
                        spaceArena: ['bright-hope#the-last-transport']
                    },
                    player2: {
                        spaceArena: ['tieln-fighter']
                    }
                });

                this.entrenched = this.player1.findCardByName('entrenched');
                this.brightHope = this.player1.findCardByName('bright-hope#the-last-transport');
                this.tielnFighter = this.player2.findCardByName('tieln-fighter');
                this.p2Base = this.player2.base;
            });

            it('should work on an opponent\'s unit', function () {
                // play entrenched on opponent's card
                this.player1.clickCard(this.entrenched);
                this.player1.clickCard(this.tielnFighter);

                // perform attack, resolves automatically since there's only one legal target
                this.player2.clickCard(this.tielnFighter);
                expect(this.brightHope.damage).toBe(5);
                expect(this.tielnFighter.damage).toBe(2);
            });
        });
    });
});
