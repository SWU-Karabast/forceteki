describe('Show Me Your Stance', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    fate: 20,
                    inPlay: ['doji-challenger', 'kakita-yoshi', 'bayushi-yojiro'],
                    hand: ['show-me-your-stance', 'dutiful-assistant']
                },
                player2: {
                    inPlay: ['kakita-toshimoko', 'shiba-tsukune', 'shosuro-sadako'],
                    hand: ['embrace-the-void', 'policy-debate', 'lucky-coin']
                },
                gameMode: 'emerald'
            });

            this.yoshi = this.player1.findCardByName('kakita-yoshi');
            this.yojiro = this.player1.findCardByName('bayushi-yojiro');
            this.assistant = this.player1.findCardByName('dutiful-assistant');
            this.stance = this.player1.findCardByName('show-me-your-stance');
            this.challenger = this.player1.findCardByName('doji-challenger');

            this.toshimoko = this.player2.findCardByName('kakita-toshimoko');
            this.tsukune = this.player2.findCardByName('shiba-tsukune');
            this.sadako = this.player2.findCardByName('shosuro-sadako');
            this.coin = this.player2.findCardByName('lucky-coin');
            this.pd = this.player2.findCardByName('policy-debate');
        });

        describe('Duel Challenge', function () {
            it('should allow status tokens to count', function () {
                this.challenger.honor();
                this.toshimoko.dishonor();

                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.challenger],
                    defenders: [this.toshimoko]
                });

                this.player2.clickCard(this.pd);
                this.player2.clickCard(this.toshimoko);
                this.player2.clickCard(this.challenger);

                expect(this.player1).toHavePrompt('Triggered Abilities');
                expect(this.player1).toBeAbleToSelect(this.stance);
                this.player1.clickCard(this.stance);

                expect(this.getChatLogs(5)).toContain('player1 plays Show Me Your Stance to have status tokens count when resolving this duel');

                this.player1.clickPrompt('1');
                this.player2.clickPrompt('1');

                expect(this.getChatLogs(5)).toContain('Kakita Toshimoko: 2 vs 6: Doji Challenger');
            });

            it('without, should not allow status tokens to count', function () {
                this.challenger.honor();
                this.toshimoko.dishonor();

                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.challenger],
                    defenders: [this.toshimoko]
                });

                this.player2.clickCard(this.pd);
                this.player2.clickCard(this.toshimoko);
                this.player2.clickCard(this.challenger);

                this.player1.pass();

                this.player1.clickPrompt('1');
                this.player2.clickPrompt('1');

                expect(this.getChatLogs(5)).toContain('Kakita Toshimoko: 4 vs 4: Doji Challenger');
            });

            it('Sadako', function () {
                this.challenger.honor();
                this.sadako.dishonor();

                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.challenger],
                    defenders: [this.sadako]
                });

                this.player2.clickCard(this.pd);
                this.player2.clickCard(this.sadako);
                this.player2.clickCard(this.challenger);
                this.player1.clickCard(this.stance);

                this.player1.clickPrompt('1');
                this.player2.clickPrompt('1');

                expect(this.getChatLogs(5)).toContain('Shosuro Sadako: 5 vs 6: Doji Challenger');
            });

            it('Yojiro', function () {
                this.challenger.honor();
                this.sadako.dishonor();

                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.challenger, this.yojiro],
                    defenders: [this.sadako]
                });

                this.player2.clickCard(this.pd);
                this.player2.clickCard(this.sadako);
                this.player2.clickCard(this.challenger);
                this.player1.clickCard(this.stance);

                this.player1.clickPrompt('1');
                this.player2.clickPrompt('1');

                expect(this.getChatLogs(5)).toContain('Shosuro Sadako: 2 vs 4: Doji Challenger');
            });

            it('Glory change', function () {
                this.challenger.honor();
                this.tsukune.dishonor();

                this.player1.playAttachment(this.assistant, this.challenger);
                this.player2.playAttachment(this.coin, this.tsukune);

                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.challenger],
                    defenders: [this.tsukune]
                });

                this.player2.clickCard(this.pd);
                this.player2.clickCard(this.tsukune);
                this.player2.clickCard(this.challenger);
                this.player1.clickCard(this.stance);

                this.player1.clickPrompt('1');
                this.player2.clickPrompt('1');

                expect(this.getChatLogs(5)).toContain('Shiba Tsukune: 5 vs 8: Doji Challenger');
            });
        });

        describe('Send Home', function () {
            it('should let you pick an attacking character with glory equal to or less than a participating duelist you control and send them home', function () {
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.challenger],
                    defenders: [this.toshimoko, this.tsukune]
                });

                this.player2.pass();

                this.player1.clickCard(this.stance);
                expect(this.player1).not.toBeAbleToSelect(this.toshimoko);
                expect(this.player1).not.toBeAbleToSelect(this.tsukune);
                expect(this.player1).toBeAbleToSelect(this.challenger);
                this.player1.clickCard(this.challenger);

                expect(this.challenger.isParticipating()).toBe(false);
                expect(this.getChatLogs(5)).toContain(
                    'player1 plays Show Me Your Stance to send Doji Challenger home'
                );
            });

            it('should let you pick an attacking character with glory equal to or less than a participating duelist you control and send them home', function () {
                this.noMoreActions();
                this.player1.passConflict();
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.toshimoko, this.tsukune],
                    defenders: [this.challenger]
                });

                this.player1.clickCard(this.stance);
                expect(this.player1).toBeAbleToSelect(this.toshimoko);
                expect(this.player1).not.toBeAbleToSelect(this.tsukune);
                expect(this.player1).not.toBeAbleToSelect(this.challenger);
                this.player1.clickCard(this.toshimoko);

                expect(this.toshimoko.isParticipating()).toBe(false);
                expect(this.getChatLogs(5)).toContain(
                    'player1 plays Show Me Your Stance to send Kakita Toshimoko home'
                );
            });

            it('should not work without a participating duelist', function () {
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.yoshi],
                    defenders: [this.toshimoko]
                });

                this.player2.pass();

                expect(this.player1).toHavePrompt('Conflict Action Window');
                this.player1.clickCard(this.stance);
                expect(this.player1).toHavePrompt('Conflict Action Window');
            });
        });
    });
});
