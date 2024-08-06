describe('Final Whisper', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['togashi-yokuni', 'togashi-initiate', 'young-harrier', 'kakita-toshimoko', 'maker-of-keepsakes']
                },
                player2: {
                    inPlay: ['shameless-gossip', 'soshi-illusionist', 'brash-samurai'],
                    hand: ['way-of-the-scorpion', 'final-whisper'],
                    conflictDiscard: ['final-whisper']
                }
            });

            this.gossip = this.player2.findCardByName('shameless-gossip');
            this.illusionist = this.player2.findCardByName('soshi-illusionist');
            this.brash = this.player2.findCardByName('brash-samurai');
            this.scorp = this.player2.findCardByName('way-of-the-scorpion');
            this.whisper = this.player2.findCardByName('final-whisper', 'hand');
            this.whisper2 = this.player2.findCardByName('final-whisper', 'conflict discard pile');

            this.yokuni = this.player1.findCardByName('togashi-yokuni');
            this.initiate = this.player1.findCardByName('togashi-initiate');
            this.harrier = this.player1.findCardByName('young-harrier');
            this.toshimoko = this.player1.findCardByName('kakita-toshimoko');
            this.keepsakes = this.player1.findCardByName('maker-of-keepsakes');

            this.yokuni.honor();

            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.yokuni, this.initiate, this.harrier, this.toshimoko],
                defenders: [this.gossip, this.illusionist, this.brash]
            });
        });

        it('should react to dishonoring a neutral character', function() {
            this.player2.clickCard(this.scorp);
            this.player2.clickCard(this.initiate);
            expect(this.player2).toHavePrompt('Triggered Abilities');
            expect(this.player2).toBeAbleToSelect(this.whisper);
        });

        it('should not react to dishonoring an honored character', function() {
            this.player2.clickCard(this.scorp);
            this.player2.clickCard(this.yokuni);
            expect(this.player2).not.toHavePrompt('Triggered Abilities');
        });

        it('should react to honoring a neutral character', function() {
            this.player2.pass();
            this.player1.clickCard(this.initiate);
            this.player1.clickRing('void');
            expect(this.player2).toHavePrompt('Triggered Abilities');
            expect(this.player2).toBeAbleToSelect(this.whisper);
        });

        it('should not react to dishonoring a character you control', function() {
            this.player2.clickCard(this.scorp);
            this.player2.clickCard(this.brash);
            expect(this.player2).not.toHavePrompt('Triggered Abilities');
        });

        it('should react to dishonoring as a cost', function() {
            this.player2.pass();
            this.player1.clickCard(this.harrier);
            expect(this.player2).toHavePrompt('Triggered Abilities');
            expect(this.player2).toBeAbleToSelect(this.whisper);
        });

        it('should let your opponent choose a character', function() {
            this.player2.clickCard(this.scorp);
            this.player2.clickCard(this.initiate);
            this.player2.clickCard(this.whisper);
            expect(this.player1).toHavePrompt('Choose a character');
            expect(this.player1).toBeAbleToSelect(this.yokuni);
            expect(this.player1).not.toBeAbleToSelect(this.initiate);
            expect(this.player1).toBeAbleToSelect(this.harrier);
            expect(this.player1).toBeAbleToSelect(this.toshimoko);
            expect(this.player1).not.toBeAbleToSelect(this.gossip);
            expect(this.player1).not.toBeAbleToSelect(this.illusionist);
            expect(this.player1).not.toBeAbleToSelect(this.brash);
        });

        it('should copy the status token over', function() {
            this.player2.clickCard(this.scorp);
            this.player2.clickCard(this.initiate);
            this.player2.clickCard(this.whisper);
            expect(this.player1).toHavePrompt('Choose a character');
            this.player1.clickCard(this.toshimoko);
            expect(this.toshimoko.isDishonored).toBe(true);
            expect(this.getChatLogs(5)).toContain('player2 plays Final Whisper to give Kakita Toshimoko a dishonored status token');
        });

        it('should not let you target someone who already has the status token', function() {
            this.toshimoko.dishonor();
            this.player2.clickCard(this.scorp);
            this.player2.clickCard(this.initiate);
            this.player2.clickCard(this.whisper);
            expect(this.player1).toHavePrompt('Choose a character');
            expect(this.player1).toBeAbleToSelect(this.yokuni);
            expect(this.player1).not.toBeAbleToSelect(this.initiate);
            expect(this.player1).toBeAbleToSelect(this.harrier);
            expect(this.player1).not.toBeAbleToSelect(this.toshimoko);
            expect(this.player1).not.toBeAbleToSelect(this.gossip);
            expect(this.player1).not.toBeAbleToSelect(this.illusionist);
            expect(this.player1).not.toBeAbleToSelect(this.brash);
        });

        it('should work through cannot be dishonored', function() {
            this.player2.pass();
            this.player1.clickCard(this.harrier);
            this.player2.clickCard(this.whisper);
            expect(this.player1).toHavePrompt('Choose a character');
            expect(this.player1).toBeAbleToSelect(this.yokuni);
            expect(this.player1).toBeAbleToSelect(this.initiate);
            expect(this.player1).not.toBeAbleToSelect(this.harrier);
            expect(this.player1).toBeAbleToSelect(this.toshimoko);
            expect(this.player1).not.toBeAbleToSelect(this.gossip);
            expect(this.player1).not.toBeAbleToSelect(this.illusionist);
            expect(this.player1).not.toBeAbleToSelect(this.brash);
        });

        it('should not work through cannot receive dishonored status tokens', function() {
            this.player2.pass();
            this.player1.clickCard(this.harrier);
            this.player2.clickCard(this.whisper);
            expect(this.player1).toHavePrompt('Choose a character');
            expect(this.player1).toBeAbleToSelect(this.yokuni);
            expect(this.player1).toBeAbleToSelect(this.initiate);
            expect(this.player1).not.toBeAbleToSelect(this.harrier);
            expect(this.player1).toBeAbleToSelect(this.toshimoko);
            expect(this.player1).not.toBeAbleToSelect(this.keepsakes);
            expect(this.player1).not.toBeAbleToSelect(this.gossip);
            expect(this.player1).not.toBeAbleToSelect(this.illusionist);
            expect(this.player1).not.toBeAbleToSelect(this.brash);
        });

        it('should react to moving a dishonored token to an honored character', function() {
            this.harrier.dishonor();
            this.player2.clickCard(this.gossip);
            this.player2.clickCard(this.harrier);
            this.player2.clickCard(this.yokuni);
            this.player2.clickCard(this.whisper);
            expect(this.player1).toHavePrompt('Choose a character');
            expect(this.player1).not.toBeAbleToSelect(this.yokuni);
            expect(this.player1).toBeAbleToSelect(this.initiate);
            expect(this.player1).toBeAbleToSelect(this.harrier);
            expect(this.player1).toBeAbleToSelect(this.toshimoko);
            expect(this.player1).not.toBeAbleToSelect(this.gossip);
            expect(this.player1).not.toBeAbleToSelect(this.illusionist);
            expect(this.player1).not.toBeAbleToSelect(this.brash);
        });

        it('should chain properly let your opponent choose a character', function() {
            this.player2.moveCard(this.whisper2, 'hand');

            this.player2.clickCard(this.scorp);
            this.player2.clickCard(this.initiate);
            this.player2.clickCard(this.whisper);
            expect(this.player1).toHavePrompt('Choose a character');
            expect(this.player1).toBeAbleToSelect(this.yokuni);
            expect(this.player1).not.toBeAbleToSelect(this.initiate);
            expect(this.player1).toBeAbleToSelect(this.harrier);
            expect(this.player1).toBeAbleToSelect(this.toshimoko);
            expect(this.player1).not.toBeAbleToSelect(this.gossip);
            expect(this.player1).not.toBeAbleToSelect(this.illusionist);
            expect(this.player1).not.toBeAbleToSelect(this.brash);

            this.player1.clickCard(this.yokuni);
            this.player2.clickCard(this.whisper2);

            expect(this.player1).toHavePrompt('Choose a character');
            expect(this.player1).not.toBeAbleToSelect(this.yokuni);
            expect(this.player1).not.toBeAbleToSelect(this.initiate);
            expect(this.player1).toBeAbleToSelect(this.harrier);
            expect(this.player1).toBeAbleToSelect(this.toshimoko);
            expect(this.player1).not.toBeAbleToSelect(this.gossip);
            expect(this.player1).not.toBeAbleToSelect(this.illusionist);
            expect(this.player1).not.toBeAbleToSelect(this.brash);

            this.player1.clickCard(this.harrier);
        });
    });
});
