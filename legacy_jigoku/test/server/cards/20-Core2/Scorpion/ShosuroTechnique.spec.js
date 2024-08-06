describe('Shosuro Technique', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    fate: 20,
                    inPlay: ['doji-challenger', 'kakita-yoshi', 'bayushi-aramoro'],
                    hand: ['shosuro-technique']
                },
                player2: {
                    inPlay: ['kakita-toshimoko', 'shiba-tsukune', 'shosuro-sadako'],
                    hand: ['embrace-the-void', 'policy-debate', 'shosuro-technique']
                },
                gameMode: 'emerald'
            });

            this.yoshi = this.player1.findCardByName('kakita-yoshi');
            this.aramoro = this.player1.findCardByName('bayushi-aramoro');
            this.technique = this.player1.findCardByName('shosuro-technique');
            this.challenger = this.player1.findCardByName('doji-challenger');

            this.toshimoko = this.player2.findCardByName('kakita-toshimoko');
            this.tsukune = this.player2.findCardByName('shiba-tsukune');
            this.sadako = this.player2.findCardByName('shosuro-sadako');
            this.technique2 = this.player2.findCardByName('shosuro-technique');
            this.pd = this.player2.findCardByName('policy-debate');
        });

        describe('Duel Challenge', function () {
            it('should make printed skill not count if you are challenged', function () {
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.challenger],
                    defenders: [this.toshimoko]
                });

                this.player2.clickCard(this.pd);
                this.player2.clickCard(this.toshimoko);
                this.player2.clickCard(this.challenger);

                expect(this.player1).toHavePrompt('Triggered Abilities');
                expect(this.player1).toBeAbleToSelect(this.technique);
                this.player1.clickCard(this.technique);

                expect(this.getChatLogs(5)).toContain('player1 plays Shosuro Technique to ignore printed skill when resolving this duel');

                this.player1.clickPrompt('1');
                this.player2.clickPrompt('1');

                expect(this.getChatLogs(5)).toContain('Kakita Toshimoko: 1 vs 1: Doji Challenger');
            });

            it('without, should allow base skill', function () {
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
                expect(this.player2).not.toHavePrompt('Triggered Abilities');

                this.player1.clickPrompt('1');
                this.player2.clickPrompt('1');

                expect(this.getChatLogs(5)).toContain('Kakita Toshimoko: 4 vs 4: Doji Challenger');
            });
        });

        describe('Skil setting', function () {
            it('should pick a shinobi and set their skills equal to an opponent', function () {
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.challenger, this.aramoro],
                    defenders: [this.toshimoko, this.sadako]
                });

                this.player2.clickCard(this.technique2);
                expect(this.player2).not.toBeAbleToSelect(this.aramoro);
                expect(this.player2).not.toBeAbleToSelect(this.challenger);
                expect(this.player2).not.toBeAbleToSelect(this.tsukune);
                expect(this.player2).toBeAbleToSelect(this.sadako);
                this.player2.clickCard(this.sadako);

                expect(this.player2).toBeAbleToSelect(this.aramoro);
                expect(this.player2).toBeAbleToSelect(this.challenger);
                expect(this.player2).not.toBeAbleToSelect(this.tsukune);
                expect(this.player2).not.toBeAbleToSelect(this.sadako);

                this.player2.clickCard(this.aramoro);

                expect(this.sadako.getMilitarySkill()).toBe(this.aramoro.getMilitarySkill());
                expect(this.getChatLogs(5)).toContain(
                    'player2 plays Shosuro Technique to set the military of Shosuro Sadako to 5military (equal to Bayushi Aramoro). There\'s no blade as keen as surprise.'
                );
            });

            it('should not work in pol', function () {
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.challenger, this.aramoro],
                    defenders: [this.toshimoko, this.sadako],
                    type: 'political'
                });

                expect(this.player2).toHavePrompt('Conflict Action Window');
                this.player2.clickCard(this.technique2);
                expect(this.player2).toHavePrompt('Conflict Action Window');
            });
        });
    });
});
