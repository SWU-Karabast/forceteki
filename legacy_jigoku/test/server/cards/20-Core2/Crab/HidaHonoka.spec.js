describe('Hida Honoka', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['hida-honoka'],
                    hand: ['smuggling-deal', 'ethereal-alignment'],
                    provinces: [
                        'manicured-garden',
                        'city-of-the-rich-frog',
                        'upholding-authority',
                        'magistrate-station'
                    ]
                }
            });

            this.hidaHonoka = this.player1.findCardByName('hida-honoka');
            this.smugglingDeal = this.player1.findCardByName('smuggling-deal');
            this.alignment = this.player1.findCardByName('ethereal-alignment');

            this.garden = this.player1.findCardByName('manicured-garden');
            this.richFrog = this.player1.findCardByName('city-of-the-rich-frog');
            this.upholding = this.player1.findCardByName('upholding-authority');
            this.station = this.player1.findCardByName('magistrate-station');

            this.richFrog.isBroken = true;
            this.upholding.isBroken = true;
            this.station.isBroken = true;

            this.player1.claimRing('void');
        });

        it('restores a province', function () {
            this.player1.clickCard(this.hidaHonoka);
            this.player1.clickCard(this.upholding);
            expect(this.upholding.isBroken).toBe(false);
            expect(this.getChatLogs(1)).toContain('player1 uses Hida Honoka to restore Upholding Authority');
        });

        it('does not work twice', function () {
            this.player1.clickCard(this.hidaHonoka);
            this.player1.clickCard(this.upholding);
            expect(this.upholding.isBroken).toBe(false);
            expect(this.getChatLogs(1)).toContain('player1 uses Hida Honoka to restore Upholding Authority');

            this.player2.pass();
            this.player1.clickCard(this.smugglingDeal);
            this.player1.clickCard(this.hidaHonoka);
            this.player2.pass();

            expect(this.player1).toHavePrompt('Action Window');
            this.player1.clickCard(this.hidaHonoka);
            expect(this.player1).toHavePrompt('Action Window');
        });

        it('should block other restoration effects', function () {
            this.player1.clickCard(this.hidaHonoka);
            this.player1.clickCard(this.upholding);
            expect(this.upholding.isBroken).toBe(false);
            expect(this.getChatLogs(1)).toContain('player1 uses Hida Honoka to restore Upholding Authority');

            this.noMoreActions();
            this.player1.passConflict();
            this.noMoreActions();
            this.noMoreActions();
            this.player1.passConflict();
            this.noMoreActions();
            this.noMoreActions();

            this.player1.clickPrompt('military');
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.alignment);

            expect(this.richFrog.isBroken).toBe(true);
            this.player1.clickCard(this.alignment);
            this.player1.clickCard(this.richFrog);
            expect(this.richFrog.isBroken).toBe(true);
            expect(this.alignment.location).toBe("removed from game");
        });
    });
});
