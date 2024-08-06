describe('Overrun', function() {
    integration(function() {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['togashi-yokuni'],
                    hand: ['overrun']
                },
                player2: {
                    inPlay: ['kakita-toshimoko'],
                    provinces: ['night-raid', 'manicured-garden', 'shameful-display', 'pilgrimage']
                }
            });

            this.yokuni = this.player1.findCardByName('togashi-yokuni');
            this.overrun = this.player1.findCardByName('overrun');
            this.toshimoko = this.player2.findCardByName('kakita-toshimoko');

            this.p1_1 = this.player1.findCardByName('shameful-display', 'province 1');
            this.p1_2 = this.player1.findCardByName('shameful-display', 'province 2');
            this.p1_3 = this.player1.findCardByName('shameful-display', 'province 3');
            this.p1_4 = this.player1.findCardByName('shameful-display', 'province 4');
            this.p1_4 = this.player1.findCardByName('shameful-display', 'province 4');
            this.p1_Stronghold = this.player1.findCardByName('shameful-display', 'stronghold province');

            this.nightRaid = this.player2.findCardByName('night-raid');
            this.manicured = this.player2.findCardByName('manicured-garden');
            this.shameful = this.player2.findCardByName('shameful-display');
            this.pilgrimage = this.player2.findCardByName('pilgrimage');
            this.p2_Stronghold = this.player2.findCardByName('shameful-display', 'stronghold province');

            this.pilgrimage.facedown = false;
            this.shameful.isBroken = true;
        });

        it('should prompt after you break a province', function () {
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.yokuni],
                defenders: [],
                province: this.manicured
            });
            this.noMoreActions();
            this.player1.clickPrompt('No');
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.overrun);
        });

        it('should not prompt if you don\'t break', function () {
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.yokuni],
                defenders: [],
                province: this.manicured
            });
            this.yokuni.dishonor();
            this.noMoreActions();
            expect(this.player1).not.toHavePrompt('Triggered Abilities');
            expect(this.player1).toHavePrompt('Air Ring');
        });

        it('should not prompt after your own province breaks', function () {
            this.noMoreActions();
            this.player1.passConflict();
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.toshimoko],
                defenders: []
            });
            this.noMoreActions();
            this.player2.clickPrompt('no');
            expect(this.player1).not.toHavePrompt('Triggered Abilities');
            expect(this.player2).toHavePrompt('air ring');
        });

        it('should let you choose a province regardless of revealed or not', function () {
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.yokuni],
                defenders: [],
                province: this.manicured
            });
            this.noMoreActions();
            this.player1.clickPrompt('No');
            this.player1.clickCard(this.overrun);

            expect(this.player1).toBeAbleToSelect(this.nightRaid);
            expect(this.player1).toBeAbleToSelect(this.manicured);
            expect(this.player1).toBeAbleToSelect(this.shameful);
            expect(this.player1).toBeAbleToSelect(this.pilgrimage);
            expect(this.player1).toBeAbleToSelect(this.p2_Stronghold);

            expect(this.player1).not.toBeAbleToSelect(this.p1_1);
            expect(this.player1).not.toBeAbleToSelect(this.p1_2);
            expect(this.player1).not.toBeAbleToSelect(this.p1_3);
            expect(this.player1).not.toBeAbleToSelect(this.p1_4);
            expect(this.player1).not.toBeAbleToSelect(this.p1_Stronghold);
        });

        it('should dishonor (blanking) and reveal the province', function () {
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.yokuni],
                defenders: [],
                province: this.manicured
            });
            this.noMoreActions();
            this.player1.clickPrompt('No');
            this.player1.clickCard(this.overrun);
            this.player1.clickCard(this.nightRaid);
            expect(this.nightRaid.isDishonored).toBe(true);
            expect(this.nightRaid.facedown).toBe(false);
            expect(this.player2).not.toHavePrompt('Triggered Abilities');
        });

        it('Chat Messages - unrevealed province', function () {
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.yokuni],
                defenders: [],
                province: this.pilgrimage
            });
            this.noMoreActions();
            this.player1.clickPrompt('No');
            this.player1.clickCard(this.overrun);
            this.player1.clickCard(this.manicured);

            expect(this.getChatLogs(10)).toContain('player1 plays Overrun to place a dishonored status token on province 2, blanking it');
            expect(this.getChatLogs(10)).toContain('player1 reveals Manicured Garden due to Overrun');
        });

        it('Chat Messages - revealed province', function () {
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.yokuni],
                defenders: [],
                province: this.manicured
            });
            this.noMoreActions();
            this.player1.clickPrompt('No');
            this.player1.clickCard(this.overrun);
            this.player1.clickCard(this.pilgrimage);

            expect(this.getChatLogs(10)).toContain('player1 plays Overrun to place a dishonored status token on Pilgrimage, blanking it');
            expect(this.getChatLogs(10)).not.toContain('player1 reveals Pilgrimage due to Overrun');
        });
    });
});
