describe('Shield', function() {
    integration(function() {
        describe('Shield\'s ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['vanquish'],
                        spaceArena: ['cartel-spacer']
                    },
                    player2: {
                        spaceArena: [{ card: 'tieln-fighter', upgrades: ['shield'] }]
                    }
                });

                this.cartelSpacer = this.player1.findCardByName('cartel-spacer');
                this.vanquish = this.player1.findCardByName('vanquish');
                this.tieLn = this.player2.findCardByName('tieln-fighter');
                this.shield = this.player2.findCardByName('shield');
            });

            it('should defeat itself to prevent damage to the attached unit', function () {
                this.player1.clickCard(this.cartelSpacer);
                this.player1.clickCard(this.tieLn);

                expect(this.cartelSpacer.damage).toBe(2);
                expect(this.tieLn.damage).toBe(0);

                expect(this.shield.location).toBe('outside the game');
                expect(this.tieLn.upgrades.length).toBe(0);

                // second attack to confirm that shield effect is off
                this.player2.clickCard(this.tieLn);
                this.player2.clickCard(this.cartelSpacer);
                expect(this.cartelSpacer.location).toBe('discard');
                expect(this.tieLn.location).toBe('discard');
            });

            it('should be removed from the game when the attached unit is defeated', function () {
                this.player1.clickCard(this.vanquish);
                this.player1.clickCard(this.tieLn);

                expect(this.tieLn.location).toBe('discard');
                expect(this.shield.location).toBe('outside the game');
            });
        });

        describe('Shield\'s ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        spaceArena: ['cartel-spacer']
                    },
                    player2: {
                        spaceArena: [{ card: 'tieln-fighter', upgrades: ['shield', 'shield'] }]
                    }
                });

                this.cartelSpacer = this.player1.findCardByName('cartel-spacer');
                this.tieLn = this.player2.findCardByName('tieln-fighter');
                this.shields = this.player2.findCardsByName('shield');
            });

            it('should defeat itself to prevent damage to the attached unit', function () {
                const getShieldLocationsSorted = (shields) => shields.map((shield) => shield.location).sort();

                this.player1.clickCard(this.cartelSpacer);
                this.player1.clickCard(this.tieLn);

                expect(this.cartelSpacer.damage).toBe(2);
                expect(this.tieLn.damage).toBe(0);
                expect(this.tieLn.upgrades.length).toBe(1);

                expect(getShieldLocationsSorted(this.shields)).toEqual(['outside the game', 'space arena']);

                // second attack
                this.player2.clickCard(this.tieLn);
                this.player2.clickCard(this.cartelSpacer);
                expect(this.cartelSpacer.location).toBe('discard');
                expect(this.tieLn.damage).toBe(0);
                expect(this.tieLn.upgrades.length).toBe(0);

                expect(getShieldLocationsSorted(this.shields)).toEqual(['outside the game', 'outside the game']);
            });
        });
    });
});
