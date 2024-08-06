describe('Bayushi Traitor', function() {
    integration(function() {
        describe('Bayushi Traitor\'s ability', function() {
            beforeEach(function() {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        honor: 5,
                        inPlay: ['doomed-shugenja'],
                        hand: ['bayushi-traitor', 'blackmail', 'assassination'],
                        dynastyDiscard: ['favorable-ground']
                    },
                    player2: {
                        honor: 10,
                        inPlay: ['miya-mystic'],
                        hand: ['finger-of-jade'],
                        dynastyDiscard: ['favorable-ground']
                    }
                });
                this.shugenja = this.player1.findCardByName('doomed-shugenja');
                this.mystic = this.player2.findCardByName('miya-mystic');
                this.traitor = this.player1.findCardByName('bayushi-traitor');
                this.jade = this.player2.findCardByName('finger-of-jade');
                this.blackmail = this.player1.findCardByName('blackmail');
                this.assassination = this.player1.findCardByName('assassination');

                this.fg1 = this.player1.placeCardInProvince('favorable-ground', 'province 1');
                this.fg2 = this.player2.placeCardInProvince('favorable-ground', 'province 2');
                this.fg1.facedown = false;
                this.fg2.facedown = false;
                this.shamefulDisplay = this.player2.findCardByName('shameful-display', 'province 1');
            });

            it('should enter play under the control of your opponent', function() {
                this.player1.clickCard(this.traitor);
                this.player1.clickPrompt('1');
                expect(this.getChatLogs(1)).toContain('player1 plays Bayushi Traitor at home with 1 additional fate');
                expect(this.traitor.controller.name).toBe(this.player2.name);
                this.player2.clickCard(this.jade);
                expect(this.player2).toBeAbleToSelect(this.mystic);
                expect(this.player2).toBeAbleToSelect(this.traitor);
                this.player2.clickCard(this.traitor);
                expect(this.jade.location).toBe('play area');
                this.noMoreActions();
                expect(this.jade.location).toBe('play area');
            });

            it('should contribute glory for your opponent', function() {
                this.player1.clickCard(this.traitor);
                this.player1.clickPrompt('1');
                expect(this.getChatLogs(1)).toContain('player1 plays Bayushi Traitor at home with 1 additional fate');
                expect(this.traitor.controller.name).toBe(this.player2.name);
                this.noMoreActions();
                this.player1.passConflict();
                this.noMoreActions();
                this.player2.passConflict();
                this.noMoreActions();
                this.player1.passConflict();
                this.noMoreActions();
                this.player2.passConflict();
                this.noMoreActions();
                expect(this.getChatLogs(3)).toContain('player2 wins the glory count 2 vs 0');
            });

            it('should not be allowed to participate against its owner (defending)', function() {
                this.player1.clickCard(this.traitor);
                this.player1.clickPrompt('1');
                this.noMoreActions();
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.shugenja],
                    defenders: [this.mystic, this.traitor]
                });
                expect(this.game.currentConflict.defenders).toContain(this.mystic);
                expect(this.game.currentConflict.defenders).not.toContain(this.traitor);

                this.player2.clickCard(this.fg2);
                expect(this.player2).toBeAbleToSelect(this.mystic);
                expect(this.player2).not.toBeAbleToSelect(this.traitor);
            });

            it('should not be allowed to participate against its owner (attacking)', function() {
                this.player1.clickCard(this.traitor);
                this.player1.clickPrompt('1');
                this.noMoreActions();
                this.player1.passConflict();
                this.noMoreActions();
                this.initiateConflict({
                    type: 'military',
                    defenders: [this.shugenja],
                    attackers: [this.mystic, this.traitor]
                });
                expect(this.game.currentConflict.attackers).toContain(this.mystic);
                expect(this.game.currentConflict.attackers).not.toContain(this.traitor);

                this.player1.pass();
                this.player2.clickCard(this.fg2);
                expect(this.player2).toBeAbleToSelect(this.mystic);
                expect(this.player2).not.toBeAbleToSelect(this.traitor);
            });

            it('should be allowed to participate for its owner (attacking)', function() {
                this.player1.clickCard(this.traitor);
                this.player1.clickPrompt('1');
                this.noMoreActions();
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.shugenja],
                    defenders: [this.mystic, this.traitor]
                });
                expect(this.game.currentConflict.defenders).toContain(this.mystic);
                expect(this.game.currentConflict.defenders).not.toContain(this.traitor);

                this.player2.pass();
                this.player1.clickCard(this.blackmail);
                expect(this.player1).toBeAbleToSelect(this.mystic);
                expect(this.player1).toBeAbleToSelect(this.traitor);
                this.player1.clickCard(this.traitor);

                expect(this.game.currentConflict.attackers).not.toContain(this.traitor);
                expect(this.game.currentConflict.defenders).not.toContain(this.traitor);

                this.player2.pass();
                this.player1.clickCard(this.fg1);
                expect(this.player1).toBeAbleToSelect(this.traitor);
                this.player1.clickCard(this.traitor);
                expect(this.game.currentConflict.attackers).toContain(this.traitor);

                expect(this.traitor.controller.name).toBe(this.player1.name);

                this.noMoreActions();
                this.player1.clickPrompt('Yes');
                this.player1.clickPrompt('Don\'t Resolve');
                expect(this.traitor.controller.name).toBe(this.player2.name);
            });

            it('should not be allowed to participate against its owner (attacking)', function() {
                this.player1.clickCard(this.traitor);
                this.player1.clickPrompt('1');
                this.noMoreActions();
                this.player1.passConflict();
                this.noMoreActions();
                this.initiateConflict({
                    type: 'military',
                    defenders: [this.shugenja],
                    attackers: [this.mystic, this.traitor]
                });
                expect(this.game.currentConflict.attackers).toContain(this.mystic);
                expect(this.game.currentConflict.attackers).not.toContain(this.traitor);

                this.player1.clickCard(this.blackmail);
                expect(this.player1).toBeAbleToSelect(this.mystic);
                expect(this.player1).toBeAbleToSelect(this.traitor);
                this.player1.clickCard(this.traitor);

                expect(this.game.currentConflict.attackers).not.toContain(this.traitor);
                expect(this.game.currentConflict.defenders).not.toContain(this.traitor);

                this.player2.pass();
                this.player1.clickCard(this.fg1);
                expect(this.player1).toBeAbleToSelect(this.traitor);
                this.player1.clickCard(this.traitor);
                expect(this.game.currentConflict.defenders).toContain(this.traitor);

                expect(this.traitor.controller.name).toBe(this.player1.name);
                this.noMoreActions();
                expect(this.traitor.controller.name).toBe(this.player2.name);
            });

            it('should go to the right discard pile when discarded', function() {
                this.player1.clickCard(this.traitor);
                this.player1.clickPrompt('1');
                this.noMoreActions();
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.shugenja],
                    defenders: [this.mystic]
                });
                this.player2.pass();
                this.player1.clickCard(this.assassination);
                this.player1.clickCard(this.traitor);
                expect(this.traitor.location).toBe('conflict discard pile');
                expect(this.player1.player.conflictDiscardPile.toArray()).toContain(this.traitor);
                expect(this.player2.player.conflictDiscardPile.toArray()).not.toContain(this.traitor);
            });

            it('should not be playable into a conflict', function() {
                this.noMoreActions();
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.shugenja],
                    defenders: [this.mystic]
                });
                this.player2.pass();

                this.player1.clickCard(this.traitor);
                this.player1.clickPrompt('1');
                expect(this.getChatLogs(3)).toContain('player1 plays Bayushi Traitor at home with 1 additional fate');
                expect(this.player2).toHavePrompt('Conflict Action Window');

                expect(this.game.currentConflict.defenders).not.toContain(this.traitor);
                expect(this.game.currentConflict.attackers).not.toContain(this.traitor);
            });
        });
    });
});
