describe('Butcher of the Fallen', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['butcher-of-the-fallen', 'brash-samurai']
                },
                player2: {
                    inPlay: ['doji-whisperer', 'alluring-patron', 'acolyte-of-koyane', 'doji-challenger', 'kakita-toshimoko', 'doji-kuwanan', 'aranat'],
                    hand: ['fine-katana']
                }
            });

            this.butcher = this.player1.findCardByName('butcher-of-the-fallen');
            this.brash = this.player1.findCardByName('brash-samurai');

            this.mil0 = this.player2.findCardByName('doji-whisperer');
            this.mil1 = this.player2.findCardByName('alluring-patron');
            this.mil2 = this.player2.findCardByName('acolyte-of-koyane');
            this.mil3 = this.player2.findCardByName('doji-challenger');
            this.mil4 = this.player2.findCardByName('kakita-toshimoko');
            this.mil5 = this.player2.findCardByName('doji-kuwanan');
            this.mil6 = this.player2.findCardByName('aranat');

            this.sd1 = this.player1.findCardByName('shameful-display', 'province 1');
            this.sd2 = this.player1.findCardByName('shameful-display', 'province 2');
            this.sd3 = this.player1.findCardByName('shameful-display', 'province 3');
            this.sd4 = this.player1.findCardByName('shameful-display', 'province 4');
            this.sd5 = this.player1.findCardByName('shameful-display', 'stronghold province');
        });

        it('unbroken = 5, should not let anyone with less than mil 5 defend', function() {
            this.noMoreActions();

            this.initiateConflict({
                attackers: [this.butcher],
                type: 'military'
            });

            expect(this.player2).toHavePrompt('Choose Defenders');

            this.player2.clickCard(this.mil0);
            expect(this.game.currentConflict.defenders).not.toContain(this.mil0);
            this.player2.clickCard(this.mil1);
            expect(this.game.currentConflict.defenders).not.toContain(this.mil1);
            this.player2.clickCard(this.mil2);
            expect(this.game.currentConflict.defenders).not.toContain(this.mil2);
            this.player2.clickCard(this.mil3);
            expect(this.game.currentConflict.defenders).not.toContain(this.mil3);
            this.player2.clickCard(this.mil4);
            expect(this.game.currentConflict.defenders).not.toContain(this.mil4);
            this.player2.clickCard(this.mil5);
            expect(this.game.currentConflict.defenders).toContain(this.mil5);
            this.player2.clickCard(this.mil6);
            expect(this.game.currentConflict.defenders).toContain(this.mil6);
        });

        it('unbroken = 4, should not let anyone with less than mil 4 defend', function() {
            this.sd4.isBroken = true;
            this.noMoreActions();

            this.initiateConflict({
                attackers: [this.butcher],
                type: 'military'
            });

            expect(this.player2).toHavePrompt('Choose Defenders');

            this.player2.clickCard(this.mil0);
            expect(this.game.currentConflict.defenders).not.toContain(this.mil0);
            this.player2.clickCard(this.mil1);
            expect(this.game.currentConflict.defenders).not.toContain(this.mil1);
            this.player2.clickCard(this.mil2);
            expect(this.game.currentConflict.defenders).not.toContain(this.mil2);
            this.player2.clickCard(this.mil3);
            expect(this.game.currentConflict.defenders).not.toContain(this.mil3);
            this.player2.clickCard(this.mil4);
            expect(this.game.currentConflict.defenders).toContain(this.mil4);
            this.player2.clickCard(this.mil5);
            expect(this.game.currentConflict.defenders).toContain(this.mil5);
            this.player2.clickCard(this.mil6);
            expect(this.game.currentConflict.defenders).toContain(this.mil6);
        });

        it('unbroken = 2, should not let anyone with less than mil 2 defend', function() {
            this.sd2.isBroken = true;
            this.sd3.isBroken = true;
            this.sd4.isBroken = true;
            this.noMoreActions();

            this.initiateConflict({
                attackers: [this.butcher],
                type: 'military'
            });

            expect(this.player2).toHavePrompt('Choose Defenders');

            this.player2.clickCard(this.mil0);
            expect(this.game.currentConflict.defenders).not.toContain(this.mil0);
            this.player2.clickCard(this.mil1);
            expect(this.game.currentConflict.defenders).not.toContain(this.mil1);
            this.player2.clickCard(this.mil2);
            expect(this.game.currentConflict.defenders).toContain(this.mil2);
            this.player2.clickCard(this.mil3);
            expect(this.game.currentConflict.defenders).toContain(this.mil3);
            this.player2.clickCard(this.mil4);
            expect(this.game.currentConflict.defenders).toContain(this.mil4);
            this.player2.clickCard(this.mil5);
            expect(this.game.currentConflict.defenders).toContain(this.mil5);
            this.player2.clickCard(this.mil6);
            expect(this.game.currentConflict.defenders).toContain(this.mil6);
        });

        it('unbroken = 2, mil bonuses should matter - Imperial Law 2020/10/05', function() {
            this.player1.pass();
            this.player2.playAttachment('fine-katana', this.mil2);
            this.sd2.isBroken = true;
            this.sd3.isBroken = true;
            this.sd4.isBroken = true;
            this.noMoreActions();

            this.initiateConflict({
                attackers: [this.butcher],
                type: 'military'
            });

            expect(this.player2).toHavePrompt('Choose Defenders');

            this.player2.clickCard(this.mil0);
            expect(this.game.currentConflict.defenders).not.toContain(this.mil0);
            this.player2.clickCard(this.mil1);
            expect(this.game.currentConflict.defenders).not.toContain(this.mil1);
            this.player2.clickCard(this.mil2);
            expect(this.game.currentConflict.defenders).toContain(this.mil2);
            this.player2.clickCard(this.mil3);
            expect(this.game.currentConflict.defenders).toContain(this.mil3);
            this.player2.clickCard(this.mil4);
            expect(this.game.currentConflict.defenders).toContain(this.mil4);
            this.player2.clickCard(this.mil5);
            expect(this.game.currentConflict.defenders).toContain(this.mil5);
            this.player2.clickCard(this.mil6);
            expect(this.game.currentConflict.defenders).toContain(this.mil6);
        });

        it('should not work if not attacking', function() {
            this.noMoreActions();

            this.initiateConflict({
                attackers: [this.brash],
                type: 'military'
            });

            expect(this.player2).toHavePrompt('Choose Defenders');

            this.player2.clickCard(this.mil0);
            expect(this.game.currentConflict.defenders).toContain(this.mil0);
            this.player2.clickCard(this.mil1);
            expect(this.game.currentConflict.defenders).toContain(this.mil1);
            this.player2.clickCard(this.mil2);
            expect(this.game.currentConflict.defenders).toContain(this.mil2);
            this.player2.clickCard(this.mil3);
            expect(this.game.currentConflict.defenders).toContain(this.mil3);
            this.player2.clickCard(this.mil4);
            expect(this.game.currentConflict.defenders).toContain(this.mil4);
            this.player2.clickCard(this.mil5);
            expect(this.game.currentConflict.defenders).toContain(this.mil5);
            this.player2.clickCard(this.mil6);
            expect(this.game.currentConflict.defenders).toContain(this.mil6);
        });
    });
});
