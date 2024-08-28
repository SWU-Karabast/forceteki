describe('Shield', function() {
    integration(function() {
        describe('Shield\'s ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        spaceArena: ['cartel-spacer']
                    },
                    player2: {
                        spaceArena: [{ card: 'tieln-fighter', upgrades: ['shield'] }]
                    }
                });

                this.cartelSpacer = this.player1.findCardByName('cartel-spacer');
                this.tieLn = this.player2.findCardByName('tieln-fighter');
                this.shield = this.player2.findCardByName('shield');
            });

            it('should defeat itself to prevent damage to the attached unit', function () {
                this.player1.clickCard(this.cartelSpacer);
                this.player1.clickCard(this.tieLn);

                expect(this.cartelSpacer.damage).toBe(2);
                expect(this.tieLn.damage).toBe(0);

                expect(this.shield.location).toBe('discard');
                // TODO THIS PR: token defeat logic
                // expect(this.tieLn.upgrades.length).toBe(0);

                // second attack to confirm that shield effect is off
                this.player2.clickCard(this.tieLn);
                this.player2.clickCard(this.cartelSpacer);
                expect(this.cartelSpacer.location).toBe('discard');
                expect(this.tieLn.location).toBe('discard');
            });

            // UP NEXT:
            // - defeat
            // - shield creation helper on UnitProperties
            // - TriggeredAbilityWindow updates + test with multiple shields
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
                // expect(this.tieLn.upgrades.length).toBe(1);

                expect(getShieldLocationsSorted(this.shields)).toEqual(['discard', 'space arena']);

                // second attack
                this.player2.clickCard(this.tieLn);
                this.player2.clickCard(this.cartelSpacer);
                expect(this.cartelSpacer.location).toBe('discard');
                expect(this.tieLn.damage).toBe(0);
                // expect(this.tieLn.upgrades.length).toBe(0);

                expect(getShieldLocationsSorted(this.shields)).toEqual(['discard', 'discard']);
            });

            // UP NEXT:
            // - defeat (including fixing general upgrades to unattach themselves on defeat)
            // - shield creation helper on UnitProperties
        });
    });
});
