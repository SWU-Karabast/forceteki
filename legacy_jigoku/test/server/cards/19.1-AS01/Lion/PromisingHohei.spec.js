describe('Promising Hohei', function () {
    integration(function () {
        describe('Promising Hohei enter play ability', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['relentless-gloryseeker', 'ikoma-message-runner'],
                        hand: ['promising-hohei', 'ayubune-pilot', 'fine-katana', 'promising-hohei', 'ornate-fan'],
                        stronghold: ['pride']
                    },
                    player2: {
                        inPlay: ['solemn-scholar'],
                        hand: ['ayubune-pilot']
                    }
                });

                this.pride = this.player1.findCardByName('pride');
                this.relentlessGloryseeker = this.player1.findCardByName('relentless-gloryseeker');
                this.messageRunner = this.player1.findCardByName('ikoma-message-runner');
                this.promisingHohei1 = this.player1.filterCardsByName('promising-hohei')[0];
                this.promisingHohei2 = this.player1.filterCardsByName('promising-hohei')[1];
                this.fan = this.player1.findCardByName('ornate-fan');
                this.player1.moveCard(this.fan, 'conflict deck');

                this.ayubunePilot1 = this.player1.findCardByName('ayubune-pilot');
                this.fineKatana = this.player1.findCardByName('fine-katana');

                this.solemnScholar = this.player2.findCardByName('solemn-scholar');
                this.ayubunePilot2 = this.player2.findCardByName('ayubune-pilot');
            });

            it('should cost 0 if target has 2 glory', function () {
                let fate = this.player1.fate;

                this.player1.clickCard(this.promisingHohei1);
                this.player1.clickCard(this.relentlessGloryseeker);

                expect(this.player1.fate).toBe(fate);
            });

            it('should cost 1 if target has <2 glory', function () {
                let fate = this.player1.fate;

                this.player1.clickCard(this.promisingHohei1);
                this.player1.clickCard(this.messageRunner);

                expect(this.player1.fate).toBe(fate - 1);
            });

            it('should not trigger if there is no follower attachment', function () {
                this.player1.clickCard(this.fineKatana);
                this.player1.clickCard(this.relentlessGloryseeker);

                this.player2.pass();

                this.player1.clickCard(this.promisingHohei1);
                this.player1.clickCard(this.relentlessGloryseeker);

                expect(this.player1).not.toHavePrompt('Triggered Abilities');
                expect(this.player2).toHavePrompt('Action Window');
            });

            it('should prompt to return a follower you control back to hand', function () {
                this.player1.clickCard(this.ayubunePilot1);
                this.player1.clickCard(this.relentlessGloryseeker);

                this.player2.clickCard(this.ayubunePilot2);
                this.player2.clickCard(this.solemnScholar);

                this.player1.clickCard(this.promisingHohei1);
                this.player1.clickCard(this.relentlessGloryseeker);

                expect(this.player1).toHavePrompt('Triggered Abilities');
                expect(this.player1).toBeAbleToSelect(this.promisingHohei1);

                this.player1.clickCard(this.promisingHohei1);
                expect(this.player1).toBeAbleToSelect(this.ayubunePilot1);
                expect(this.player1).not.toBeAbleToSelect(this.ayubunePilot2);

                this.player1.clickCard(this.ayubunePilot1);
                expect(this.ayubunePilot1.location).toBe('hand');
            });

            it('cannot return cards named Promising Hohei', function () {
                this.player1.clickCard(this.ayubunePilot1);
                this.player1.clickCard(this.relentlessGloryseeker);
                this.player2.pass();
                this.player1.clickCard(this.promisingHohei1);
                this.player1.clickCard(this.relentlessGloryseeker);
                this.player1.clickPrompt('Pass'); // First Hohei
                this.player2.pass();
                this.player1.clickCard(this.promisingHohei2);
                this.player1.clickCard(this.messageRunner);

                expect(this.player1).toHavePrompt('Triggered Abilities');
                expect(this.player1).toBeAbleToSelect(this.promisingHohei2);

                this.player1.clickCard(this.promisingHohei2);
                expect(this.player1).toBeAbleToSelect(this.ayubunePilot1);
                expect(this.player1).not.toBeAbleToSelect(this.promisingHohei1);

                this.player1.clickCard(this.ayubunePilot1);
                expect(this.ayubunePilot1.location).toBe('hand');
            });

            it('returns soldier tokens to hand', function () {
                this.player1.clickCard(this.pride);
                this.player1.clickCard(this.relentlessGloryseeker);
                const soldier =
                    this.relentlessGloryseeker.attachments[this.relentlessGloryseeker.attachments.length - 1];

                this.player2.pass();
                this.player1.clickCard(this.promisingHohei1);
                this.player1.clickCard(this.relentlessGloryseeker);

                this.player1.clickCard(this.promisingHohei1);
                this.player1.clickCard(soldier);
                expect(this.fan.location).toBe('hand');
            });
        });
    });
});
