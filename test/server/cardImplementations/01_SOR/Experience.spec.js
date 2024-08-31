describe('Experience', function() {
    integration(function() {
        describe('Experience\'s ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        spaceArena: [{ card: 'cartel-spacer', upgrades: ['experience'] }]
                    },
                    player2: {
                        spaceArena: ['valiant-assault-ship']
                    }
                });

                this.cartelSpacer = this.player1.findCardByName('cartel-spacer');
                this.experience = this.player1.findCardByName('experience');
                this.assaultShip = this.player2.findCardByName('valiant-assault-ship');

                this.p2Base = this.player2.base;
            });

            it('should grant the attached unit +1/+1 and be removed from game when unit is defeated', function () {
                this.player1.clickCard(this.cartelSpacer);
                this.player1.clickCard(this.assaultShip);

                expect(this.cartelSpacer.damage).toBe(3);
                expect(this.assaultShip.damage).toBe(3);

                // second attack to confirm that experience effect is still on
                this.player2.passAction();
                this.cartelSpacer.exhausted = false;

                this.player1.clickCard(this.cartelSpacer);
                this.player1.clickCard(this.p2Base);
                expect(this.p2Base.damage).toBe(3);

                // third attack to confirm that token goes to discard
                this.player2.passAction();
                this.cartelSpacer.exhausted = false;

                this.player1.clickCard(this.cartelSpacer);
                this.player1.clickCard(this.assaultShip);
                expect(this.cartelSpacer).toBeInLocation('discard');
                expect(this.assaultShip).toBeInLocation('discard');
                expect(this.experience).toBeInLocation('outside the game');
            });
        });

        describe('Experience', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['confiscate'],
                        spaceArena: [{ card: 'cartel-spacer', upgrades: ['experience'] }]
                    },
                    player2: {
                    }
                });

                this.cartelSpacer = this.player1.findCardByName('cartel-spacer');
                this.experience = this.player1.findCardByName('experience');
                this.confiscate = this.player1.findCardByName('confiscate');
            });

            it('should be removed from the game when defeated', function () {
                this.player1.clickCard(this.confiscate);

                // ability will resolve automatically since there's only one legal target
                expect(this.cartelSpacer.upgrades.length).toBe(0);
                expect(this.experience).toBeInLocation('outside the game');
            });
        });

        describe('When an experience token is created', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['clan-wren-rescuer']
                    },
                    player2: {
                        spaceArena: ['tieln-fighter']
                    }
                });

                this.clanWrenRescuer = this.player1.findCardByName('clan-wren-rescuer');
                this.tieLn = this.player2.findCardByName('tieln-fighter');
            });

            it('its owner and controller should be the player who created it', function () {
                this.player1.clickCard(this.clanWrenRescuer);
                this.player1.clickCard(this.tieLn);

                expect(this.tieLn.upgrades.length).toBe(1);
                const experience = this.tieLn.upgrades[0];
                expect(experience.internalName).toBe('experience');
                expect(experience.owner).toBe(this.player1.player);
                expect(experience.controller).toBe(this.player1.player);
            });
        });
    });
});
