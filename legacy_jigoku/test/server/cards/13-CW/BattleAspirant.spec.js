describe('Battle Aspirant', function() {
    integration(function() {
        describe('Battle Aspirant\'s ability', function() {
            beforeEach(function() {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['battle-aspirant', 'utaku-yumino']
                    },
                    player2: {
                        inPlay: ['serene-warrior', 'togashi-mitsu', 'bayushi-liar', 'brash-samurai'],
                        hand: ['pacifism']
                    }
                });
                this.aspirant = this.player1.findCardByName('battle-aspirant');
                this.yumino = this.player1.findCardByName('utaku-yumino');
                this.warrior = this.player2.findCardByName('serene-warrior');
                this.mitsu = this.player2.findCardByName('togashi-mitsu');
                this.liar = this.player2.findCardByName('bayushi-liar');
                this.brash = this.player2.findCardByName('brash-samurai');
                this.brash.bowed = true;
                this.shamefulDisplay = this.player2.findCardByName('shameful-display', 'province 1');
                this.shamefulDisplayP1 = this.player1.findCardByName('shameful-display', 'province 1');
            });

            it('should react when assigned as an attacker in a mil conflict', function() {
                this.noMoreActions();
                this.player1.clickRing('air');
                this.player1.clickCard(this.shamefulDisplay);
                this.player1.clickCard(this.aspirant);
                this.player1.clickPrompt('Initiate Conflict');
                expect(this.player1).toHavePrompt('Triggered Abilities');
                expect(this.player1).toBeAbleToSelect(this.aspirant);
            });

            it('should not react when assigned as an attacker in a pol conflict', function() {
                this.noMoreActions();
                this.player1.clickRing('air');
                this.player1.clickRing('air');
                this.player1.clickCard(this.shamefulDisplay);
                this.player1.clickCard(this.aspirant);
                this.player1.clickPrompt('Initiate Conflict');
                expect(this.player1).not.toHavePrompt('Triggered Abilities');
                expect(this.player2).toHavePrompt('Choose defenders');
            });

            it('should not react when not assigned as an attacker', function() {
                this.noMoreActions();
                this.player1.clickRing('air');
                this.player1.clickCard(this.shamefulDisplay);
                this.player1.clickCard(this.yumino);
                this.player1.clickPrompt('Initiate Conflict');
                expect(this.player1).not.toHavePrompt('Triggered Abilities');
                expect(this.player2).toHavePrompt('Choose defenders');
            });

            it('should not react when assigned as a defender', function() {
                this.noMoreActions();
                this.player1.passConflict();
                this.noMoreActions();
                this.player2.clickRing('air');
                this.player2.clickCard(this.shamefulDisplayP1);
                this.player2.clickCard(this.warrior);
                this.player2.clickPrompt('Initiate Conflict');
                expect(this.player1).toHavePrompt('Choose defenders');
                this.player1.clickCard(this.aspirant);
                this.player1.clickPrompt('Done');
                expect(this.player1).not.toHavePrompt('Triggered Abilities');
                expect(this.player1).toHavePrompt('Conflict Action Window');
            });

            it('should allow chosing opponents characters without covert even if they can\'t defend', function() {
                this.noMoreActions();
                this.player1.clickRing('air');
                this.player1.clickCard(this.shamefulDisplay);
                this.player1.clickCard(this.aspirant);
                this.player1.clickPrompt('Initiate Conflict');
                expect(this.player1).toHavePrompt('Triggered Abilities');
                expect(this.player1).toBeAbleToSelect(this.aspirant);
                this.player1.clickCard(this.aspirant);
                expect(this.player1).toBeAbleToSelect(this.warrior);
                expect(this.player1).not.toBeAbleToSelect(this.mitsu);
                expect(this.player1).toBeAbleToSelect(this.liar);
                expect(this.player1).toBeAbleToSelect(this.brash);
                expect(this.player1).not.toBeAbleToSelect(this.yumino);
                expect(this.player1).not.toBeAbleToSelect(this.aspirant);
            });

            it('should automatically add target as a defender', function() {
                this.noMoreActions();
                this.player1.clickRing('air');
                this.player1.clickCard(this.shamefulDisplay);
                this.player1.clickCard(this.aspirant);
                this.player1.clickPrompt('Initiate Conflict');
                expect(this.player1).toHavePrompt('Triggered Abilities');
                expect(this.player1).toBeAbleToSelect(this.aspirant);
                this.player1.clickCard(this.aspirant);
                this.player1.clickCard(this.warrior);

                expect(this.player2).toHavePrompt('Choose defenders');
                expect(this.game.currentConflict.defenders).toContain(this.warrior);
            });

            it('should not allow removing target from the conflict as a defender', function() {
                this.noMoreActions();
                this.player1.clickRing('air');
                this.player1.clickCard(this.shamefulDisplay);
                this.player1.clickCard(this.aspirant);
                this.player1.clickPrompt('Initiate Conflict');
                expect(this.player1).toHavePrompt('Triggered Abilities');
                expect(this.player1).toBeAbleToSelect(this.aspirant);
                this.player1.clickCard(this.aspirant);
                this.player1.clickCard(this.warrior);

                expect(this.player2).toHavePrompt('Choose defenders');
                expect(this.game.currentConflict.defenders).toContain(this.warrior);
                this.player2.clickCard(this.warrior);
                expect(this.game.currentConflict.defenders).toContain(this.warrior);
            });

            it('should not automatically add an illegal target as a defender', function() {
                this.noMoreActions();
                this.player1.clickRing('air');
                this.player1.clickCard(this.shamefulDisplay);
                this.player1.clickCard(this.aspirant);
                this.player1.clickPrompt('Initiate Conflict');
                expect(this.player1).toHavePrompt('Triggered Abilities');
                expect(this.player1).toBeAbleToSelect(this.aspirant);
                this.player1.clickCard(this.aspirant);
                this.player1.clickCard(this.brash);

                expect(this.player2).toHavePrompt('Choose defenders');
                expect(this.game.currentConflict.defenders).not.toContain(this.brash);
            });

            it('should not last more than one conflict', function() {
                this.noMoreActions();
                this.player1.clickRing('air');
                this.player1.clickCard(this.shamefulDisplay);
                this.player1.clickCard(this.aspirant);
                this.player1.clickPrompt('Initiate Conflict');
                expect(this.player1).toHavePrompt('Triggered Abilities');
                expect(this.player1).toBeAbleToSelect(this.aspirant);
                this.player1.clickCard(this.aspirant);
                this.player1.clickCard(this.warrior);

                expect(this.player2).toHavePrompt('Choose defenders');
                expect(this.game.currentConflict.defenders).toContain(this.warrior);
                this.player2.clickCard(this.mitsu);
                this.player2.clickPrompt('Done');
                this.noMoreActions();
                this.warrior.bowed = false;

                this.noMoreActions();
                this.player2.passConflict();
                this.noMoreActions();

                this.player1.clickRing('earth');
                this.player1.clickCard(this.shamefulDisplay);
                this.player1.clickCard(this.yumino);
                this.player1.clickPrompt('Initiate Conflict');
                expect(this.player2).toHavePrompt('Choose defenders');
                expect(this.game.currentConflict.defenders).not.toContain(this.warrior);
            });
        });
    });
});
