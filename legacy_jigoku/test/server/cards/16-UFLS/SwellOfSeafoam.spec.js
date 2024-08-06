describe('Swell of Seafoam', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['togashi-initiate', 'doji-challenger', 'togashi-mitsu'],
                    hand: ['swell-of-seafoam', 'hurricane-punch', 'fine-katana']
                },
                player2: {
                    inPlay: ['doji-kuwanan', 'togashi-kazue'],
                    hand: ['hurricane-punch']
                }
            });

            this.initiate = this.player1.findCardByName('togashi-initiate');
            this.mitsu = this.player1.findCardByName('togashi-mitsu');
            this.challenger = this.player1.findCardByName('doji-challenger');
            this.hurricane = this.player1.findCardByName('hurricane-punch');
            this.katana = this.player1.findCardByName('fine-katana');
            this.swell = this.player1.findCardByName('swell-of-seafoam');

            this.kuwanan = this.player2.findCardByName('doji-kuwanan');
            this.kazue = this.player2.findCardByName('togashi-kazue');
            this.hurricane2 = this.player2.findCardByName('hurricane-punch');
        });

        it('should allow selecting a participating monk', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.initiate, this.challenger],
                defenders: [this.kuwanan, this.kazue],
                type: 'military'
            });

            this.player2.pass();
            this.player1.clickCard(this.swell);
            expect(this.player1).toBeAbleToSelect(this.initiate);
            expect(this.player1).toBeAbleToSelect(this.kazue);
            expect(this.player1).not.toBeAbleToSelect(this.challenger);
            expect(this.player1).not.toBeAbleToSelect(this.mitsu);
        });

        it('should prevent bowing at the end of the conflict', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.initiate, this.challenger],
                defenders: [this.kuwanan],
                type: 'military'
            });

            this.player2.pass();
            this.player1.clickCard(this.swell);
            this.player1.clickCard(this.initiate);

            expect(this.getChatLogs(3)).toContain('player1 plays Swell of Seafoam to prevent Togashi Initiate from bowing at the end of the conflict');
            this.noMoreActions();
            expect(this.initiate.bowed).toBe(false);
            expect(this.kuwanan.bowed).toBe(true);
            expect(this.player1).toHavePrompt('Action Window');
        });

        it('should not honor if no kiho has been played', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.initiate, this.challenger],
                defenders: [this.kuwanan],
                type: 'military'
            });

            this.player2.pass();
            this.player1.clickCard(this.swell);
            this.player1.clickCard(this.initiate);
            expect(this.initiate.isHonored).toBe(false);
        });

        it('should not honor if only opponent has played a kiho', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.initiate, this.challenger],
                defenders: [this.kuwanan, this.kazue],
                type: 'military'
            });

            this.player2.clickCard(this.hurricane2);
            this.player2.clickCard(this.kazue);
            this.player1.clickCard(this.swell);
            this.player1.clickCard(this.initiate);
            expect(this.initiate.isHonored).toBe(false);
        });

        it('should not honor if a non-kiho has been played', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.initiate, this.challenger],
                defenders: [this.kuwanan],
                type: 'military'
            });

            this.player2.pass();
            this.player1.clickCard(this.katana);
            this.player1.clickCard(this.initiate);
            this.player2.pass();
            this.player1.clickCard(this.swell);
            this.player1.clickCard(this.initiate);
            expect(this.initiate.isHonored).toBe(false);
        });

        it('should honor if a kiho has been played', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.initiate, this.challenger],
                defenders: [this.kuwanan],
                type: 'military'
            });

            this.player2.pass();
            this.player1.clickCard(this.hurricane);
            this.player1.clickCard(this.initiate);
            this.player2.pass();
            this.player1.clickCard(this.swell);
            this.player1.clickCard(this.initiate);
            expect(this.initiate.isHonored).toBe(true);
            expect(this.getChatLogs(3)).toContain('player1 plays Swell of Seafoam to honor and prevent Togashi Initiate from bowing at the end of the conflict');
        });
    });
});
