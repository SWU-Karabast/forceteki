describe('Liquid Courage', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['kakita-yoshi', 'utaku-yumino']
                },
                player2: {
                    inPlay: ['serene-warrior', 'togashi-mitsu', 'bayushi-liar', 'brash-samurai'],
                    hand: ['liquid-courage']
                }
            });
            this.yoshi = this.player1.findCardByName('kakita-yoshi');
            this.yumino = this.player1.findCardByName('utaku-yumino');
            this.warrior = this.player2.findCardByName('serene-warrior');
            this.mitsu = this.player2.findCardByName('togashi-mitsu');
            this.liar = this.player2.findCardByName('bayushi-liar');
            this.brash = this.player2.findCardByName('brash-samurai');
            this.brash.bowed = true;
            this.courage = this.player2.findCardByName('liquid-courage');
            this.shamefulDisplay = this.player2.findCardByName('shameful-display', 'province 1');
            this.shamefulDisplayP1 = this.player1.findCardByName('shameful-display', 'province 1');
        });

        it('should give pride', function() {
            this.player1.pass();
            expect(this.warrior.hasKeyword('pride')).toBe(false);
            this.player2.playAttachment(this.courage, this.warrior);
            expect(this.warrior.hasKeyword('pride')).toBe(true);
        });

        it('should automatically add target as a defender', function() {
            this.player1.pass();
            this.player2.playAttachment(this.courage, this.warrior);

            this.noMoreActions();
            this.player1.clickRing('air');
            this.player1.clickCard(this.shamefulDisplay);
            this.player1.clickCard(this.yoshi);
            this.player1.clickPrompt('Initiate Conflict');

            expect(this.player2).toHavePrompt('Choose defenders');
            expect(this.game.currentConflict.defenders).toContain(this.warrior);
        });

        it('should not allow removing target from the conflict as a defender', function() {
            this.player1.pass();
            this.player2.playAttachment(this.courage, this.warrior);

            this.noMoreActions();
            this.player1.clickRing('air');
            this.player1.clickCard(this.shamefulDisplay);
            this.player1.clickCard(this.yoshi);
            this.player1.clickPrompt('Initiate Conflict');

            expect(this.player2).toHavePrompt('Choose defenders');
            expect(this.game.currentConflict.defenders).toContain(this.warrior);
            this.player2.clickCard(this.warrior);
            expect(this.game.currentConflict.defenders).toContain(this.warrior);
        });

        it('should not automatically add an illegal target as a defender', function() {
            this.player1.pass();
            this.player2.playAttachment(this.courage, this.brash);

            this.noMoreActions();
            this.player1.clickRing('air');
            this.player1.clickCard(this.shamefulDisplay);
            this.player1.clickCard(this.yoshi);
            this.player1.clickPrompt('Initiate Conflict');

            expect(this.player2).toHavePrompt('Choose defenders');
            expect(this.game.currentConflict.defenders).not.toContain(this.brash);
        });

        it('pol conflict - should not do anything', function() {
            this.player1.pass();
            this.player2.playAttachment(this.courage, this.warrior);

            this.noMoreActions();
            this.player1.clickRing('air');
            this.player1.clickRing('air');
            this.player1.clickCard(this.shamefulDisplay);
            this.player1.clickCard(this.yoshi);
            this.player1.clickPrompt('Initiate Conflict');

            expect(this.player2).toHavePrompt('Choose defenders');
            expect(this.game.currentConflict.defenders).not.toContain(this.warrior);
            this.player2.clickCard(this.warrior);
            expect(this.game.currentConflict.defenders).toContain(this.warrior);
        });

        it('should automatically add target as an attacker and not allow removing', function() {
            this.player1.pass();
            this.player2.playAttachment(this.courage, this.yumino);

            this.noMoreActions();
            this.player1.clickRing('air');
            expect(this.game.currentConflict.attackers).toContain(this.yumino);
            this.player1.clickCard(this.shamefulDisplay);
            this.player1.clickCard(this.yumino);
            expect(this.game.currentConflict.attackers).toContain(this.yumino);
        });

        it('should let you remove if you switch to pol', function() {
            this.player1.pass();
            this.player2.playAttachment(this.courage, this.yumino);

            this.noMoreActions();
            this.player1.clickRing('air');
            expect(this.game.currentConflict.attackers).toContain(this.yumino);
            this.player1.clickCard(this.yumino);
            expect(this.game.currentConflict.attackers).toContain(this.yumino);
            this.player1.clickRing('air');
            expect(this.game.currentConflict.attackers).toContain(this.yumino);
            this.player1.clickCard(this.yumino);
            expect(this.game.currentConflict.attackers).not.toContain(this.yumino);
        });
    });
});
