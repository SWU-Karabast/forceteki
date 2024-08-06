describe('Two Hands', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    fate: 20,
                    inPlay: ['doji-challenger', 'kakita-yoshi', 'bayushi-yojiro', 'matsu-berserker'],
                    hand: ['two-hands', 'dutiful-assistant']
                },
                player2: {
                    inPlay: ['kakita-toshimoko', 'shiba-tsukune', 'shosuro-sadako'],
                    hand: ['embrace-the-void', 'duel-to-the-death', 'two-hands', 'disparaging-challenge', 'fine-katana']
                },
                gameMode: 'emerald'
            });

            this.yoshi = this.player1.findCardByName('kakita-yoshi');
            this.berserker = this.player1.findCardByName('matsu-berserker');
            this.yojiro = this.player1.findCardByName('bayushi-yojiro');
            this.assistant = this.player1.findCardByName('dutiful-assistant');
            this.hands1 = this.player1.findCardByName('two-hands');
            this.challenger = this.player1.findCardByName('doji-challenger');

            this.toshimoko = this.player2.findCardByName('kakita-toshimoko');
            this.tsukune = this.player2.findCardByName('shiba-tsukune');
            this.sadako = this.player2.findCardByName('shosuro-sadako');
            this.dttd = this.player2.findCardByName('duel-to-the-death');
            this.hands = this.player2.findCardByName('two-hands');
            this.challenge = this.player2.findCardByName('disparaging-challenge');
            this.katana = this.player2.findCardByName('fine-katana');
        });

        describe('Conflict action', function () {
            beforeEach(function () {
                this.player1.pass();
                this.player2.clickCard(this.katana);
                this.player2.clickCard(this.toshimoko);
                this.noMoreActions();
            });

            it('sets one enemy character skills equal to the other', function () {
                this.initiateConflict({
                    attackers: [this.challenger, this.yoshi],
                    defenders: [this.toshimoko]
                });

                this.player2.clickCard(this.hands);
                expect(this.player2).toHavePrompt('Choose the character that will remain unchanged');
                expect(this.player2).toBeAbleToSelect(this.challenger);
                expect(this.player2).toBeAbleToSelect(this.yoshi);
                expect(this.player2).not.toBeAbleToSelect(this.yojiro);
                expect(this.player2).not.toBeAbleToSelect(this.toshimoko);

                this.player2.clickCard(this.yoshi);
                expect(this.player2).toHavePrompt('Choose the character to that will have their skills changed');
                expect(this.player2).toBeAbleToSelect(this.challenger);
                expect(this.player2).not.toBeAbleToSelect(this.yoshi);
                expect(this.player2).not.toBeAbleToSelect(this.yojiro);
                expect(this.player2).not.toBeAbleToSelect(this.toshimoko);

                this.player2.clickCard(this.challenger);
                expect(this.challenger.getMilitarySkill()).toBe(2);
                expect(this.challenger.getPoliticalSkill()).toBe(6);
                expect(this.yoshi.getMilitarySkill()).toBe(2);
                expect(this.yoshi.getPoliticalSkill()).toBe(6);
                expect(this.getChatLogs(5)).toContain(
                    'player2 plays Two Hands to set Doji Challenger military and political skills equal to Kakita Yoshi'
                );
            });
        });

        describe('Duel Challenge', function () {
            it('should add a 2nd character to the duel', function () {
                this.challenger.dishonor();

                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.challenger, this.yoshi],
                    defenders: [this.toshimoko, this.tsukune]
                });

                this.player2.clickCard(this.dttd);
                this.player2.clickCard(this.toshimoko);
                this.player2.clickCard(this.challenger);

                expect(this.player2).toHavePrompt('Triggered Abilities');
                expect(this.player2).toBeAbleToSelect(this.hands);
                this.player2.clickCard(this.hands);

                expect(this.player2).toBeAbleToSelect(this.yoshi);
                expect(this.player2).not.toBeAbleToSelect(this.challenger);
                expect(this.player2).not.toBeAbleToSelect(this.yojiro);
                expect(this.player2).not.toBeAbleToSelect(this.toshimoko);
                expect(this.player2).not.toBeAbleToSelect(this.tsukune);

                this.player2.clickCard(this.yoshi);

                expect(this.getChatLogs(5)).toContain(
                    'player2 plays Two Hands to extend the duel challenge to Kakita Yoshi'
                );

                this.player1.clickPrompt('1');
                this.player2.clickPrompt('5');

                expect(this.getChatLogs(5)).toContain('Kakita Toshimoko: 9 vs 6: Doji Challenger and Kakita Yoshi');
                expect(this.getChatLogs(5)).toContain('Duel Effect: discard Doji Challenger and Kakita Yoshi');

                expect(this.challenger.location).toBe('dynasty discard pile');
                expect(this.yoshi.location).toBe('dynasty discard pile');
            });

            it('disparaging challenge - another condition, no valid 2nd target', function () {
                this.challenger.dishonor();

                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.challenger, this.yoshi],
                    defenders: [this.toshimoko, this.tsukune]
                });

                this.player2.clickCard(this.challenge);
                this.player2.clickCard(this.toshimoko);
                this.player2.clickCard(this.yojiro);

                expect(this.player2).not.toHavePrompt('Triggered Abilities');
                expect(this.player2).toHavePrompt('Honor Bid');
            });

            it('disparaging challenge - another condition, valid 2nd target', function () {
                this.challenger.dishonor();

                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.yoshi],
                    defenders: [this.toshimoko, this.tsukune]
                });

                this.player2.clickCard(this.challenge);
                this.player2.clickCard(this.toshimoko);
                this.player2.clickCard(this.yojiro);

                expect(this.player2).toHavePrompt('Triggered Abilities');
                expect(this.player2).toBeAbleToSelect(this.hands);
                this.player2.clickCard(this.hands);

                expect(this.player2).not.toBeAbleToSelect(this.yoshi);
                expect(this.player2).toBeAbleToSelect(this.challenger);
                expect(this.player2).not.toBeAbleToSelect(this.yojiro);
                expect(this.player2).not.toBeAbleToSelect(this.berserker);
                expect(this.player2).not.toBeAbleToSelect(this.toshimoko);
                expect(this.player2).not.toBeAbleToSelect(this.tsukune);

                this.player2.clickCard(this.challenger);

                expect(this.getChatLogs(5)).toContain(
                    'player2 plays Two Hands to extend the duel challenge to Doji Challenger'
                );

                this.player1.clickPrompt('1');
                this.player2.clickPrompt('5');

                expect(this.getChatLogs(5)).toContain('Kakita Toshimoko: 8 vs 5: Bayushi Yojiro and Doji Challenger');
                expect(this.getChatLogs(5)).toContain(
                    'Duel Effect: move Bayushi Yojiro and Doji Challenger into the conflict'
                );

                expect(this.challenger.isParticipating()).toBe(true);
                expect(this.yojiro.isParticipating()).toBe(true);
            });
        });
    });
});
