describe('Temptation Maho', function() {
    integration(function() {
        describe('functionality from an opponent standpoint', function () {
            beforeEach(function() {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        fate: 20,
                        inPlay: ['daidoji-uji', 'doji-challenger', 'doji-whisperer', 'kakita-yoshi', 'student-of-war'],
                        hand: ['a-fate-worse-than-death', 'desolation'],
                        dynastyDiscard: ['awakened-tsukumogami']
                    },
                    player2: {
                        inPlay: ['kakita-toshimoko'],
                        hand: ['embrace-the-void']
                    }
                });

                this.maho = this.player1.findCardByName('a-fate-worse-than-death');
                this.maho2 = this.player1.findCardByName('desolation');
                this.maho.isTemptationsMaho = () => {
                    return true;
                };
                this.maho2.isTemptationsMaho = () => {
                    return true;
                };

                this.player1.player.imperialFavor = 'military';

                this.uji = this.player1.findCardByName('daidoji-uji');
                this.challenger = this.player1.findCardByName('doji-challenger');
                this.whisperer = this.player1.findCardByName('doji-whisperer');
                this.yoshi = this.player1.findCardByName('kakita-yoshi');
                this.student = this.player1.findCardByName('student-of-war');
                this.toshimoko = this.player2.findCardByName('kakita-toshimoko');
                this.awakened = this.player1.findCardByName('awakened-tsukumogami');

                this.game.rings.earth.fate = 2;


                this.noMoreActions();
                this.initiateConflict({
                    type: 'political',
                    attackers: [this.uji, this.yoshi],
                    defenders: [this.toshimoko]
                });
            });

            it('should require fate to be paid from characters', function() {
                let fate = this.player1.fate;
                this.uji.fate = 3;
                this.yoshi.fate = 2;
                this.challenger.fate = 1;
                this.toshimoko.fate = 5;
                this.player2.pass();
                this.player1.clickCard(this.maho);
                this.player1.clickCard(this.toshimoko);

                expect(this.player1).toHavePrompt('Choose a card to help pay the fate cost of A Fate Worse Than Death');
                expect(this.player1).toBeAbleToSelect(this.uji);
                expect(this.player1).toBeAbleToSelect(this.yoshi);
                expect(this.player1).toBeAbleToSelect(this.challenger);
                expect(this.player1).not.toBeAbleToSelect(this.whisperer);
                expect(this.player1).not.toBeAbleToSelect(this.toshimoko);
                this.player1.clickCard(this.uji);

                expect(this.player1).toHavePrompt('Choose amount of fate to spend from Daidoji Uji');
                expect(this.player1.currentButtons.length).toBe(4);
                expect(this.player1.currentButtons).not.toContain('0');
                expect(this.player1.currentButtons).toContain('1');
                expect(this.player1.currentButtons).toContain('2');
                expect(this.player1.currentButtons).toContain('3');
                expect(this.player1.currentButtons).toContain('Cancel');
                this.player1.clickPrompt('2');

                expect(this.player1).toHavePrompt('Choose a card to help pay the fate cost of A Fate Worse Than Death');
                expect(this.player1).not.toBeAbleToSelect(this.uji);
                expect(this.player1).toBeAbleToSelect(this.yoshi);
                expect(this.player1).toBeAbleToSelect(this.challenger);
                expect(this.player1).not.toBeAbleToSelect(this.whisperer);
                expect(this.player1).not.toBeAbleToSelect(this.toshimoko);
                this.player1.clickCard(this.uji);
                expect(this.player1).toHavePrompt('Choose a card to help pay the fate cost of A Fate Worse Than Death');
                this.player1.clickCard(this.yoshi);

                expect(this.player1).toHavePrompt('Choose amount of fate to spend from Kakita Yoshi');
                expect(this.player1.currentButtons.length).toBe(3);
                expect(this.player1.currentButtons).not.toContain('0');
                expect(this.player1.currentButtons).toContain('1');
                expect(this.player1.currentButtons).toContain('2');
                expect(this.player1.currentButtons).toContain('Cancel');
                this.player1.clickPrompt('2');

                expect(this.player1).not.toHavePrompt('Choose a card to help pay the fate cost of A Fate Worse Than Death');

                expect(this.toshimoko.bowed).toBe(true);
                expect(this.toshimoko.isDishonored).toBe(true);

                expect(this.uji.fate).toBe(1);
                expect(this.yoshi.fate).toBe(0);
                expect(this.player1.fate).toBe(fate);

                expect(this.getChatLogs(10)).toContain('player1 takes 2 fate from Daidoji Uji to pay the cost of A Fate Worse Than Death');
                expect(this.getChatLogs(10)).toContain('player1 takes 2 fate from Kakita Yoshi to pay the cost of A Fate Worse Than Death');
            });

            it('should not be able to initiate without enough fate on characters', function() {
                this.uji.fate = 0;
                this.yoshi.fate = 0;
                this.player2.pass();
                expect(this.player1).toHavePrompt('Conflict Action Window');
                this.player1.clickCard(this.maho);
                expect(this.player1).toHavePrompt('Conflict Action Window');
            });

            it('should work properly if you cancel it', function() {
                this.uji.fate = 3;
                this.yoshi.fate = 2;
                this.challenger.fate = 1;
                this.toshimoko.fate = 5;
                this.player2.pass();
                this.player1.clickCard(this.maho);
                this.player1.clickCard(this.toshimoko);

                expect(this.player1).toHavePrompt('Choose a card to help pay the fate cost of A Fate Worse Than Death');
                expect(this.player1).toBeAbleToSelect(this.uji);
                expect(this.player1).toBeAbleToSelect(this.yoshi);
                expect(this.player1).toBeAbleToSelect(this.challenger);
                expect(this.player1).not.toBeAbleToSelect(this.whisperer);
                expect(this.player1).not.toBeAbleToSelect(this.toshimoko);
                this.player1.clickCard(this.uji);

                expect(this.player1).toHavePrompt('Choose amount of fate to spend from Daidoji Uji');
                expect(this.player1.currentButtons.length).toBe(4);
                expect(this.player1.currentButtons).not.toContain('0');
                expect(this.player1.currentButtons).toContain('1');
                expect(this.player1.currentButtons).toContain('2');
                expect(this.player1.currentButtons).toContain('3');
                expect(this.player1.currentButtons).toContain('Cancel');
                this.player1.clickPrompt('2');

                expect(this.player1).toHavePrompt('Choose a card to help pay the fate cost of A Fate Worse Than Death');
                expect(this.player1).not.toBeAbleToSelect(this.uji);
                expect(this.player1).toBeAbleToSelect(this.yoshi);
                expect(this.player1).toBeAbleToSelect(this.challenger);
                expect(this.player1).not.toBeAbleToSelect(this.whisperer);
                expect(this.player1).not.toBeAbleToSelect(this.toshimoko);
                expect(this.player1).toHavePromptButton('Cancel');
                this.player1.clickPrompt('Cancel');

                expect(this.toshimoko.bowed).toBe(false);
                expect(this.toshimoko.isDishonored).toBe(false);

                expect(this.uji.fate).toBe(3);

                expect(this.getChatLogs(10)).not.toContain('player1 takes 2 fate from Daidoji Uji to pay the cost of A Fate Worse Than Death');
                expect(this.player1).toHavePrompt('Conflict Action window');
            });

            it('should not let you use fate on characters that cannot have fate removed from them', function() {
                this.player1.player.showBid = 1;
                this.player2.player.showBid = 5;
                this.uji.fate = 3;
                this.yoshi.fate = 2;
                this.student.fate = 5;
                this.toshimoko.fate = 5;
                this.player2.pass();
                this.player1.clickCard(this.maho);
                this.player1.clickCard(this.toshimoko);

                expect(this.player1).toHavePrompt('Choose a card to help pay the fate cost of A Fate Worse Than Death');
                expect(this.player1).toBeAbleToSelect(this.uji);
                expect(this.player1).toBeAbleToSelect(this.yoshi);
                expect(this.player1).not.toBeAbleToSelect(this.student);
                this.player1.clickCard(this.student);
                expect(this.player1).toHavePrompt('Choose a card to help pay the fate cost of A Fate Worse Than Death');
                this.player1.clickCard(this.yoshi);

                expect(this.player1).toHavePrompt('Choose amount of fate to spend from Kakita Yoshi');
                expect(this.player1.currentButtons.length).toBe(3);
                expect(this.player1.currentButtons).not.toContain('0');
                expect(this.player1.currentButtons).toContain('1');
                expect(this.player1.currentButtons).toContain('2');
                expect(this.player1.currentButtons).toContain('Cancel');
            });

            it('should work with cost reduction', function() {
                let fate = this.player1.fate;
                this.uji.fate = 1;
                this.yoshi.fate = 1;
                this.challenger.fate = 0;
                this.toshimoko.fate = 5;
                this.player2.pass();
                this.player1.clickCard(this.maho);
                expect(this.player1).toHavePrompt('Conflict Action Window');
                this.player1.clickCard(this.yoshi);
                this.player2.pass();
                this.player1.clickCard(this.maho);
                expect(this.player1).toHavePrompt('A Fate Worse Than Death');
                this.player1.clickCard(this.toshimoko);

                expect(this.player1).toHavePrompt('Choose a card to help pay the fate cost of A Fate Worse Than Death');
                expect(this.player1).toBeAbleToSelect(this.uji);
                expect(this.player1).toBeAbleToSelect(this.yoshi);
                this.player1.clickCard(this.uji);

                expect(this.player1).toHavePrompt('Choose amount of fate to spend from Daidoji Uji');
                expect(this.player1.currentButtons.length).toBe(2);
                expect(this.player1.currentButtons).not.toContain('0');
                expect(this.player1.currentButtons).toContain('1');
                expect(this.player1.currentButtons).toContain('Cancel');
                this.player1.clickPrompt('1');

                expect(this.player1).toHavePrompt('Choose a card to help pay the fate cost of A Fate Worse Than Death');
                expect(this.player1).not.toBeAbleToSelect(this.uji);
                expect(this.player1).toBeAbleToSelect(this.yoshi);
                this.player1.clickCard(this.yoshi);

                expect(this.player1).toHavePrompt('Choose amount of fate to spend from Kakita Yoshi');
                expect(this.player1.currentButtons.length).toBe(2);
                expect(this.player1.currentButtons).not.toContain('0');
                expect(this.player1.currentButtons).toContain('1');
                expect(this.player1.currentButtons).toContain('Cancel');
                this.player1.clickPrompt('1');

                expect(this.player1).not.toHavePrompt('Choose a card to help pay the fate cost of A Fate Worse Than Death');

                expect(this.toshimoko.bowed).toBe(true);
                expect(this.toshimoko.isDishonored).toBe(true);

                expect(this.uji.fate).toBe(0);
                expect(this.yoshi.fate).toBe(0);
                expect(this.player1.fate).toBe(fate);

                expect(this.getChatLogs(10)).toContain('player1 takes 1 fate from Daidoji Uji to pay the cost of A Fate Worse Than Death');
                expect(this.getChatLogs(10)).toContain('player1 takes 1 fate from Kakita Yoshi to pay the cost of A Fate Worse Than Death');
            });

            it('should work with cost reduction - reduction to 0', function() {
                this.uji.fate = 0;
                this.yoshi.fate = 0;
                this.challenger.fate = 0;
                this.toshimoko.fate = 5;
                this.player2.pass();
                this.player1.clickCard(this.maho2);
                expect(this.player1).toHavePrompt('Conflict Action Window');
                this.player1.clickCard(this.yoshi);
                this.player2.pass();
                this.player1.clickCard(this.maho2);
                expect(this.player2).toHavePrompt('Conflict Action Window');

                expect(this.getChatLogs(10)).toContain('player1 plays Desolation, losing 2 honor to blank player2\'s provinces until the end of the phase');
            });

            it('should not let you use fate off rings via Awakened Tsukumogami', function() {
                this.uji.fate = 0;
                this.yoshi.fate = 0;
                this.challenger.fate = 0;
                this.player1.moveCard(this.awakened, 'play area');
                this.player2.pass();
                this.player1.clickCard(this.maho2);
                expect(this.player1).toHavePrompt('Conflict Action Window');
            });
        });
    });
});
