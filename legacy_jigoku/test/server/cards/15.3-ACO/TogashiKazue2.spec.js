describe('Togashi Kazue 2', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['togashi-kazue-2', 'doji-challenger', 'master-of-the-court', 'isawa-uona'],
                    hand: ['cloak-of-night', 'duelist-training', 'trick-of-the-light', 'talisman-of-the-sun'],
                    provinces: ['manicured-garden']
                },
                player2: {
                    inPlay: ['kudaka', 'ancient-master', 'border-rider'],
                    hand: ['against-the-waves', 'supernatural-storm', 'assassination', 'cloud-the-mind']
                }
            });

            this.kazue = this.player1.findCardByName('togashi-kazue-2');
            this.challenger = this.player1.findCardByName('doji-challenger');
            this.master = this.player1.findCardByName('master-of-the-court');
            this.uona = this.player1.findCardByName('isawa-uona');
            this.cloak = this.player1.findCardByName('cloak-of-night');
            this.duelist = this.player1.findCardByName('duelist-training');
            this.trick = this.player1.findCardByName('trick-of-the-light');
            this.talisman = this.player1.findCardByName('talisman-of-the-sun');
            this.garden = this.player1.findCardByName('manicured-garden');
            this.sd2 = this.player1.findCardByName('shameful-display', 'province 2');
            this.sd3 = this.player1.findCardByName('shameful-display', 'province 3');

            this.kudaka = this.player2.findCardByName('kudaka');
            this.atw = this.player2.findCardByName('against-the-waves');
            this.storm = this.player2.findCardByName('supernatural-storm');
            this.assassination = this.player2.findCardByName('assassination');
            this.cloud = this.player2.findCardByName('cloud-the-mind');
            this.ancientMaster = this.player2.findCardByName('ancient-master');
            this.borderRider = this.player2.findCardByName('border-rider');
        });

        it('should allow triggering interrupts twice if dire', function() {
            this.master.fate = 0;
            this.master.honor();
            this.player1.playAttachment(this.talisman, this.challenger);
            this.player2.clickCard(this.atw);
            this.player2.clickCard(this.kudaka);
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.master);
            this.player1.clickCard(this.master);
            expect(this.getChatLogs(5)).toContain('player1 uses Master of the Court, discarding a status token to cancel the effects of Against the Waves');
            this.master.honor();
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.challenger],
                defenders: [this.kudaka]
            });

            this.player2.clickCard(this.storm);
            this.player2.clickCard(this.kudaka);
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.master);
            this.player1.clickCard(this.master);
            expect(this.getChatLogs(5)).toContain('player1 uses Master of the Court, discarding a status token to cancel the effects of Supernatural Storm');
        });

        it('should not allow triggering interrupts again if not dire', function() {
            this.master.fate = 1;
            this.master.honor();
            this.player1.playAttachment(this.talisman, this.challenger);
            this.player2.clickCard(this.atw);
            this.player2.clickCard(this.kudaka);
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.master);
            this.player1.clickCard(this.master);
            expect(this.getChatLogs(5)).toContain('player1 uses Master of the Court, discarding a status token to cancel the effects of Against the Waves');
            this.master.honor();
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.challenger],
                defenders: [this.kudaka]
            });

            this.player2.clickCard(this.storm);
            this.player2.clickCard(this.kudaka);
            expect(this.player1).not.toHavePrompt('Triggered Abilities');
        });

        it('should allow triggering reactions twice if dire', function() {
            this.uona.fate = 0;
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.challenger],
                defenders: [this.kudaka, this.ancientMaster, this.borderRider]
            });

            this.player2.pass();
            this.player1.clickCard(this.cloak);
            this.player1.clickCard(this.challenger);
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.uona);
            this.player1.clickCard(this.uona);
            this.player1.clickCard(this.ancientMaster);
            expect(this.ancientMaster.bowed).toBe(true);

            this.player2.pass();
            this.player1.clickCard(this.trick);
            this.player1.clickCard(this.kudaka);
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.uona);
            this.player1.clickCard(this.uona);
            this.player1.clickCard(this.borderRider);
            expect(this.borderRider.bowed).toBe(true);
        });

        it('should not allow triggering reactions twice if not dire', function() {
            this.uona.fate = 1;
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.challenger],
                defenders: [this.kudaka, this.ancientMaster, this.borderRider]
            });

            this.player2.pass();
            this.player1.clickCard(this.cloak);
            this.player1.clickCard(this.challenger);
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.uona);
            this.player1.clickCard(this.uona);
            this.player1.clickCard(this.ancientMaster);
            expect(this.ancientMaster.bowed).toBe(true);

            this.player2.pass();
            this.player1.clickCard(this.trick);
            this.player1.clickCard(this.kudaka);
            expect(this.player1).not.toHavePrompt('Triggered Abilities');
        });

        it('should allow triggering actions twice if dire', function() {
            this.challenger.fate = 0;
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.challenger],
                defenders: [this.kudaka]
            });

            this.player2.pass();
            this.player1.clickCard(this.challenger);
            this.player1.clickCard(this.ancientMaster);
            expect(this.ancientMaster.inConflict).toBe(true);

            this.player2.pass();
            this.player1.clickCard(this.challenger);
            this.player1.clickCard(this.borderRider);
            expect(this.borderRider.inConflict).toBe(true);
        });

        it('should not allow triggering actions twice if not dire', function() {
            this.challenger.fate = 1;
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.challenger],
                defenders: [this.kudaka]
            });

            this.player2.pass();
            this.player1.clickCard(this.challenger);
            this.player1.clickCard(this.ancientMaster);
            expect(this.ancientMaster.inConflict).toBe(true);

            this.player2.pass();
            this.player1.clickCard(this.challenger);
            this.player1.clickCard(this.borderRider);
            expect(this.borderRider.inConflict).toBe(false);
        });

        it('should allow triggering gained abilities twice if dire', function() {
            this.player1.playAttachment(this.duelist, this.challenger);
            this.challenger.fate = 0;
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.challenger],
                defenders: [this.kudaka, this.borderRider, this.ancientMaster]
            });

            this.player2.pass();
            this.player1.clickCard(this.challenger);
            this.player1.clickCard(this.ancientMaster);
            this.player1.clickPrompt('1');
            this.player2.clickPrompt('1');
            expect(this.ancientMaster.bowed).toBe(true);

            this.player2.pass();
            this.player1.clickCard(this.challenger);
            this.player1.clickCard(this.borderRider);
            this.player1.clickPrompt('1');
            this.player2.clickPrompt('1');
            expect(this.borderRider.bowed).toBe(true);
        });

        it('should not allow opponents to trigger abilities twice', function() {
            this.player1.playAttachment(this.duelist, this.challenger);
            this.challenger.fate = 0;
            this.borderRider.fate = 0;
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.challenger],
                defenders: [this.kudaka, this.borderRider, this.ancientMaster]
            });

            this.player2.pass();
            this.player1.clickCard(this.challenger);
            this.player1.clickCard(this.borderRider);
            this.player1.clickPrompt('1');
            this.player2.clickPrompt('1');
            expect(this.borderRider.bowed).toBe(true);
            this.player2.clickCard(this.borderRider);
            expect(this.borderRider.bowed).toBe(false);

            this.player1.clickCard(this.challenger);
            this.player1.clickCard(this.borderRider);
            this.player1.clickPrompt('1');
            this.player2.clickPrompt('1');
            expect(this.borderRider.bowed).toBe(true);
            this.player2.clickCard(this.borderRider);
            expect(this.borderRider.bowed).toBe(true);
        });

        it('should not allow provinces to trigger abilities twice', function() {
            this.noMoreActions();
            this.player1.passConflict();
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.kudaka],
                defenders: [this.challenger],
                province: this.garden
            });

            let fate = this.player1.fate;
            this.player1.clickCard(this.garden);
            this.player2.pass();
            this.player1.clickCard(this.garden);
            expect(this.player1.fate).toBe(fate + 1);
        });

        it('should not allow provinces to trigger abilities twice', function() {
            this.noMoreActions();
            this.player1.passConflict();
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.kudaka],
                defenders: [this.challenger],
                province: this.garden
            });

            let fate = this.player1.fate;
            this.player1.clickCard(this.garden);
            this.player2.pass();
            this.player1.clickCard(this.garden);
            expect(this.player1.fate).toBe(fate + 1);
        });

        it('should not allow triggering attachment abilities twice', function() {
            this.player1.playAttachment(this.talisman, this.challenger);
            this.noMoreActions();
            this.player1.passConflict();
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.kudaka],
                defenders: [this.challenger],
                province: this.garden
            });

            this.player1.clickCard(this.talisman);
            this.player1.clickCard(this.sd2);
            expect(this.game.currentConflict.conflictProvince).toBe(this.sd2);
            this.talisman.bowed = false;
            this.player2.pass();
            this.player1.clickCard(this.talisman);
            this.player1.clickCard(this.garden);
            expect(this.game.currentConflict.conflictProvince).toBe(this.sd2);
        });

        it('should not crash when Kazue leaves play', function() {
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.challenger],
                defenders: [this.kudaka]
            });

            this.player2.clickCard(this.assassination);
            this.player2.clickCard(this.kazue);

            expect(this.kazue.location).toBe('dynasty discard pile');
        });

        it('should properly remove the second trigger if Kazue leaves play', function() {
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.challenger],
                defenders: [this.kudaka]
            });

            this.player2.pass();
            this.player1.clickCard(this.challenger);
            this.player1.clickCard(this.ancientMaster);
            expect(this.ancientMaster.inConflict).toBe(true);

            this.player2.clickCard(this.assassination);
            this.player2.clickCard(this.kazue);

            this.player1.clickCard(this.challenger);
            this.player1.clickCard(this.borderRider);
            expect(this.borderRider.inConflict).toBe(false);
        });

        it('should properly work even if other characters have fate', function() {
            this.uona.fate = 1;
            this.master.fate = 1;
            this.kazue.fate = 1;
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.challenger],
                defenders: [this.kudaka]
            });

            this.player2.pass();
            this.player1.clickCard(this.challenger);
            this.player1.clickCard(this.ancientMaster);
            expect(this.ancientMaster.inConflict).toBe(true);

            this.player2.pass();

            this.player1.clickCard(this.challenger);
            this.player1.clickCard(this.borderRider);
            expect(this.borderRider.inConflict).toBe(true);
        });
    });
});
