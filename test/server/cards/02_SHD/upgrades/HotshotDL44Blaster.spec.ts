describe('Hotshot DL-44 Blaster', function() {
    integration(function() {
        describe('Hotshot DL-44 Blaster\'s ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['collections-starhopper'],
                        hand: ['hotshot-dl44-blaster']
                    },
                    base: 'tarkintown'
                });
            });

            it('does not initiate an attack when played from hand', function () {
                this.player1.clickCard(this.hotshotDl44Blaster);
                expect(this.player2).toBeActivePlayer();
                expect(this.battlefieldMarine).toHaveExactUpgradeNames(['hotshot-dl44-blaster']);
                expect(this.battlefieldMarine.exhausted).toBe(false);
            });
        });

        describe('Hotshot DL-44 Blaster\'s ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: [],
                        deck: ['wampa'],
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['collections-starhopper'],
                        resources: ['hotshot-dl44-blaster', 'atst', 'atst', 'atst', 'atst', 'atst'],
                        base: 'administrators-tower'
                    }
                });
            });

            it('initiates an attack with the upgraded unit when Smuggled', function () {
                this.player1.clickCard(this.hotshotDl44Blaster);
                expect(this.player2).toBeActivePlayer();
                expect(this.battlefieldMarine).toHaveExactUpgradeNames(['hotshot-dl44-blaster']);
                expect(this.battlefieldMarine.exhausted).toBe(true);
                expect(this.p2Base.damage).toBe(5);
            });
        });
    });
});
