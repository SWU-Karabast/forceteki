describe('Unleashed Experiment', function () {
    integration(function () {
        describe('Not Dire', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['unleashed-experiment', 'unleashed-experiment', 'acolyte-of-koyane'],
                        hand: ['duelist-training', 'tattooed-wanderer']
                    },
                    player2: {
                        inPlay: ['adept-of-the-waves']
                    }
                });

                this.experiment = this.player1.filterCardsByName('unleashed-experiment')[0];
                this.experiment2 = this.player1.filterCardsByName('unleashed-experiment')[1];
                this.experiment.fate = 1;
                this.experiment2.fate = 1;
                this.duelistTraining = this.player1.findCardByName('duelist-training');
                this.adept = this.player2.findCardByName('adept-of-the-waves');
                this.acolyte = this.player1.findCardByName('acolyte-of-koyane');
                this.wanderer = this.player1.findCardByName('tattooed-wanderer');
            });

            it('should make you lose 2 honor if you declare as an attacker', function () {
                let honor = this.player1.honor;
                this.noMoreActions();
                this.initiateConflict({
                    type: 'political',
                    attackers: [this.experiment],
                    defenders: [this.adept]
                });
                expect(this.getChatLogs(10)).toContain('player1 pays 2 honor to declare their attackers');

                expect(this.player1.honor).toBe(honor - 2);
            });

            it('should make you lose 2 honor if you declare as a defender', function () {
                let honor = this.player1.honor;
                this.noMoreActions();
                this.player1.passConflict();
                this.noMoreActions();
                this.initiateConflict({
                    type: 'political',
                    attackers: [this.adept],
                    defenders: [this.experiment]
                });
                expect(this.getChatLogs(10)).toContain('player1 pays 2 honor to declare their defenders');

                expect(this.player1.honor).toBe(honor - 2);
            });

            it('should properly stack', function () {
                let honor = this.player1.honor;
                this.noMoreActions();
                this.initiateConflict({
                    type: 'political',
                    attackers: [this.experiment, this.experiment2],
                    defenders: [this.adept]
                });
                expect(this.getChatLogs(10)).toContain('player1 pays 4 honor to declare their attackers');

                expect(this.player1.honor).toBe(honor - 4);
            });

            it('should be able to use gained abilities', function () {
                this.player1.playAttachment(this.duelistTraining, this.experiment);
                this.noMoreActions();
                this.initiateConflict({
                    type: 'political',
                    attackers: [this.experiment],
                    defenders: [this.adept]
                });
                this.player2.pass();
                this.player1.clickCard(this.experiment);
                expect(this.player1).toHavePrompt('Unleashed Experiment');
                expect(this.player1).toBeAbleToSelect(this.adept);
                this.player1.clickCard(this.adept);
                this.player1.clickPrompt('1');
                this.player2.clickPrompt('1');
                expect(this.adept.bowed).toBe(true);
            });

            it('should be able to use gained keywords - covert', function () {
                this.player1.clickCard(this.wanderer);
                this.player1.clickPrompt('Play Tattooed Wanderer as an attachment');
                this.player1.clickCard(this.experiment);
                this.noMoreActions();
                expect(this.experiment.hasKeyword('covert')).toBe(true);
                this.initiateConflict({
                    type: 'political',
                    attackers: [this.experiment]
                });
                expect(this.player1).toHavePrompt('Choose covert target for Unleashed Experiment');
            });

            it('should be able to use gained keywords - pride', function () {
                this.noMoreActions();
                this.initiateConflict({
                    type: 'political',
                    attackers: [this.experiment],
                    defenders: [this.adept]
                });
                this.player2.pass();
                this.player1.clickCard(this.acolyte);
                this.player1.clickCard(this.experiment);
                this.player1.clickPrompt('Gain Pride');
                expect(this.experiment.hasKeyword('pride')).toBe(true);
                this.noMoreActions();
                expect(this.experiment.isHonored).toBe(true);
            });
        });

        describe('Dire', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['unleashed-experiment', 'acolyte-of-koyane', 'inferno-guard-invoker'],
                        hand: ['duelist-training', 'tattooed-wanderer', 'kakita-blade', 'return-the-offense']
                    },
                    player2: {
                        inPlay: ['adept-of-the-waves']
                    }
                });

                this.experiment = this.player1.findCardByName('unleashed-experiment');
                this.experiment.fate = 0;
                this.duelistTraining = this.player1.findCardByName('duelist-training');
                this.adept = this.player2.findCardByName('adept-of-the-waves');
                this.acolyte = this.player1.findCardByName('acolyte-of-koyane');
                this.wanderer = this.player1.findCardByName('tattooed-wanderer');
                this.blade = this.player1.findCardByName('kakita-blade');
                this.rto = this.player1.findCardByName('return-the-offense');
                this.invoker = this.player1.findCardByName('inferno-guard-invoker');
            });

            it('should not make you lose 2 honor if you declare as an attacker', function () {
                let honor = this.player1.honor;
                this.noMoreActions();
                this.initiateConflict({
                    type: 'political',
                    attackers: [this.experiment],
                    defenders: [this.adept]
                });
                expect(this.getChatLogs(10)).not.toContain('player1 pays 2 honor to declare their attackers');
                expect(this.player1.honor).toBe(honor);
            });

            it('should not make you lose 2 honor if you declare as a defender', function () {
                let honor = this.player1.honor;
                this.noMoreActions();
                this.player1.passConflict();
                this.noMoreActions();
                this.initiateConflict({
                    type: 'political',
                    attackers: [this.adept],
                    defenders: [this.experiment]
                });
                expect(this.getChatLogs(10)).not.toContain('player1 pays 2 honor to declare their defenders');

                expect(this.player1.honor).toBe(honor);
            });

            it('should not be able to use gained abilities', function () {
                this.player1.playAttachment(this.duelistTraining, this.experiment);
                this.noMoreActions();
                this.initiateConflict({
                    type: 'political',
                    attackers: [this.experiment],
                    defenders: [this.adept]
                });
                this.player2.pass();
                expect(this.player1).toHavePrompt('Conflict Action Window');
                this.player1.clickCard(this.experiment);
                expect(this.player1).toHavePrompt('Conflict Action Window');
            });

            it('should be able to use gained keywords - covert', function () {
                this.player1.clickCard(this.wanderer);
                this.player1.clickPrompt('Play Tattooed Wanderer as an attachment');
                this.player1.clickCard(this.experiment);
                this.noMoreActions();
                expect(this.experiment.hasKeyword('covert')).toBe(true);
                this.initiateConflict({
                    type: 'political',
                    attackers: [this.experiment]
                });
                expect(this.player1).toHavePrompt('Choose covert target for Unleashed Experiment');
            });

            it('should be able to use gained keywords - pride', function () {
                this.noMoreActions();
                this.initiateConflict({
                    type: 'political',
                    attackers: [this.experiment],
                    defenders: [this.adept]
                });
                this.player2.pass();
                this.player1.clickCard(this.acolyte);
                this.player1.clickCard(this.experiment);
                this.player1.clickPrompt('Gain Pride');
                expect(this.experiment.hasKeyword('pride')).toBe(true);
                this.noMoreActions();
                expect(this.experiment.isHonored).toBe(true);
            });

            it('should still get stat bonuses', function () {
                let mil = this.experiment.militarySkill;
                this.player1.playAttachment(this.blade, this.experiment);
                expect(this.experiment.militarySkill).toBe(mil + 2);
            });

            it('should still be able to have constant effects applied from attachments', function () {
                let pol = this.experiment.politicalSkill;
                this.player1.playAttachment(this.blade, this.experiment);
                this.noMoreActions();
                this.initiateConflict({
                    type: 'political',
                    attackers: [this.experiment],
                    defenders: [this.adept]
                });
                this.player2.pass();
                this.player1.clickCard(this.rto);
                this.player1.clickCard(this.experiment);
                this.player1.clickCard(this.adept);
                expect(this.experiment.politicalSkill).toBe(pol + 2);
            });

            it('should still be able to have constant effects applied from characters', function () {
                this.noMoreActions();
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.experiment],
                    defenders: []
                });
                this.player2.pass();
                this.player1.clickCard(this.invoker);
                this.player1.clickCard(this.experiment);
                this.noMoreActions();
                this.player1.clickPrompt('No');
                this.player1.clickPrompt('Don\'t Resolve');
                expect(this.experiment.location).toBe('dynasty discard pile');
                expect(this.getChatLogs(5)).toContain('Unleashed Experiment is discarded, burned to a pile of ash due to the delayed effect of Inferno Guard Invoker');
            });
        });
    });
});
