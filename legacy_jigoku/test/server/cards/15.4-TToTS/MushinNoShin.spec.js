describe('Mushin No Shin', function() {
    integration(function() {
        describe('Mushin No Shin\'s ability', function() {
            beforeEach(function() {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['unassuming-yojimbo', 'young-rumormonger', 'iuchi-wayfinder'],
                        hand: ['duelist-training', 'fine-katana']
                    },
                    player2: {
                        stronghold: 'mountain-s-anvil-castle',
                        inPlay: ['doomed-shugenja', 'niten-master'],
                        hand: ['mushin-no-shin', 'fine-katana', 'ornate-fan' , 'display-of-power']
                    }
                });


                this.doomedShugenja = this.player2.findCardByName('doomed-shugenja');
                this.nitenMaster = this.player2.findCardByName('niten-master');
                this.katana = this.player2.findCardByName('fine-katana');
                this.ornate = this.player2.findCardByName('ornate-fan');
                this.castle = this.player2.findCardByName('mountain-s-anvil-castle');
                this.mushin = this.player2.findCardByName('mushin-no-shin');
                this.doomed = this.player2.findCardByName('display-of-power');

                this.monger = this.player1.findCardByName('young-rumormonger');
                this.training = this.player1.findCardByName('duelist-training');
                this.katana1 = this.player1.findCardByName('fine-katana');

                this.player1.playAttachment(this.katana1, this.monger);
                this.player2.playAttachment(this.katana, this.nitenMaster);
                this.player1.playAttachment(this.training, this.monger);
                this.player2.playAttachment(this.ornate, this.nitenMaster);
            });

            it('shouldn\'t be playable on opponent\'s characters', function() {
                this.player1.pass();
                this.player2.clickCard(this.castle);
                this.player2.clickCard(this.monger);
                expect(this.player2).not.toBeAbleToSelect(this.mushin);
            });

            it('should not prompt when the character has less than 2 attachments', function() {
                this.noMoreActions();
                this.initiateConflict({
                    ring: 'fire',
                    attackers: [this.monger],
                    defenders: [this.doomedShugenja]
                });
                this.player2.pass();
                this.player1.clickCard(this.monger);
                this.player1.clickCard(this.doomedShugenja);
                expect(this.player2).not.toBeAbleToSelect(this.mushin);
            });

            it('should not prompt the player when targeted with their own abilities', function() {
                this.noMoreActions();
                this.initiateConflict({
                    ring: 'fire',
                    attackers: [this.monger],
                    defenders: [this.nitenMaster]
                });
                this.player2.clickCard(this.castle);
                this.player2.clickCard(this.nitenMaster);
                expect(this.player2).not.toHavePrompt('Triggered Abilities');
                expect(this.player2).not.toBeAbleToSelect(this.mushin);

            });

            it('should prompt the player when targeted with their own abilities when option is selected', function() {
                this.player2.player.optionSettings.cancelOwnAbilities = true;
                this.noMoreActions();
                this.initiateConflict({
                    ring: 'fire',
                    attackers: [this.monger],
                    defenders: [this.nitenMaster]
                });
                this.player2.clickCard(this.castle);
                this.player2.clickCard(this.nitenMaster);
                expect(this.player2).toHavePrompt('Triggered Abilities');
                expect(this.player2).toBeAbleToSelect(this.mushin);

            });

            it('should prompt to cancel opponent\'s abilities', function() {

                this.noMoreActions();
                this.initiateConflict({
                    ring: 'fire',
                    attackers: [this.monger],
                    defenders: [this.nitenMaster]
                });
                this.player2.pass();
                this.player1.clickCard(this.monger);
                this.player1.clickCard(this.nitenMaster);
                expect(this.player2).toHavePrompt('Triggered Abilities');

            });

            it('chat', function() {

                this.noMoreActions();
                this.initiateConflict({
                    ring: 'fire',
                    attackers: [this.monger],
                    defenders: [this.nitenMaster]
                });
                this.player2.pass();
                this.player1.clickCard(this.monger);
                this.player1.clickCard(this.nitenMaster);
                expect(this.player2).toHavePrompt('Triggered Abilities');
                this.player2.clickCard(this.mushin);
                expect(this.getChatLogs(10)).toContain('player2 plays Mushin no Shin to cancel the effects of Young Rumormonger');
                expect(this.player2).toHavePrompt('Conflict Action Window');
            });
        });
    });
});
