describe('Ikoma Message Runner', function() {
    integration(function() {
        describe('Ikoma Message Runner\'s ability', function() {
            beforeEach(function() {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        dynastyDiscard: ['ikoma-prodigy', 'akodo-toturi', 'akodo-kaede']
                    },
                    player2: {
                        inPlay: ['ikoma-message-runner'],
                        dynastyDiscard: ['matsu-berserker', 'matsu-tsuko', 'kitsu-motso']
                    }
                });
                this.ikomaProdigy = this.player1.placeCardInProvince('ikoma-prodigy', 'province 1');
                this.toturi = this.player1.placeCardInProvince('akodo-toturi', 'province 2');
                this.kaede = this.player1.placeCardInProvince('akodo-kaede', 'province 3');

                this.ikomaMessageRunner = this.player2.findCardByName('ikoma-message-runner');
                this.berserker = this.player2.placeCardInProvince('matsu-berserker', 'province 1');
                this.tsuko = this.player2.placeCardInProvince('matsu-tsuko', 'province 2');
                this.motso = this.player2.placeCardInProvince('kitsu-motso', 'province 3');

                this.ikomaProdigy.facedown = true;
                this.toturi.facedown = true;
                this.kaede.facedown = false;

                this.berserker.facedown = true;
                this.tsuko.facedown = true;
                this.motso.facedown = false;

                this.player1.pass();
            });

            it('should reveal facedown cards', function() {
                this.player2.clickCard(this.ikomaMessageRunner);
                expect(this.player2).toHavePrompt('Choose a facedown card in your provinces');
                this.player2.clickCard(this.tsuko);
                expect(this.player2).toHavePromptButton('Done');
                this.player2.clickPrompt('Done');

                expect(this.toturi.facedown).toBe(true);
                expect(this.tsuko.facedown).toBe(true);

                expect(this.player2).toHavePrompt('Choose a facedown card in opponents provinces');
                this.player2.clickCard(this.toturi);
                expect(this.player2).toHavePromptButton('Done');
                this.player2.clickPrompt('Done');

                expect(this.toturi.facedown).toBe(false);
                expect(this.tsuko.facedown).toBe(false);
                expect(this.ikomaProdigy.facedown).toBe(true);
                expect(this.berserker.facedown).toBe(true);

                expect(this.getChatLogs(4)).toContain('player2 uses Ikoma Message Runner to reveal up to 1 facedown card in each player\'s provinces. Matsu Tsuko is revealed in player2\'s province 2. Akodo Toturi is revealed in player1\'s province 2.');
            });

            it('having no facedown cards should not prevent activating it.', function() {
                const dynastyCardsPlayer1 = [];
                const locations = ['province 1', 'province 2', 'province 3', 'province 4'];

                locations.forEach(location => {
                    dynastyCardsPlayer1.push(this.player2.player.getDynastyCardsInProvince(location)[0]);
                });

                dynastyCardsPlayer1.forEach(card => {
                    card.facedown = false;
                });

                this.game.checkGameState(true);

                this.player2.clickCard(this.ikomaMessageRunner);
                expect(this.player2).toHavePrompt('Choose a facedown card in your provinces');

                expect(this.player2).not.toBeAbleToSelect(this.berserker);
                expect(this.player2).not.toBeAbleToSelect(this.tsuko);
                expect(this.player2).not.toBeAbleToSelect(this.motso);
                expect(this.player2).toHavePromptButton('Done');
                this.player2.clickPrompt('Done');

                expect(this.toturi.facedown).toBe(true);
                expect(this.tsuko.facedown).toBe(false);

                expect(this.player2).toHavePrompt('Choose a facedown card in opponents provinces');
                this.player2.clickCard(this.toturi);
                expect(this.player2).toHavePromptButton('Done');
                this.player2.clickPrompt('Done');

                expect(this.toturi.facedown).toBe(false);
                expect(this.tsuko.facedown).toBe(false);
                expect(this.ikomaProdigy.facedown).toBe(true);
                expect(this.berserker.facedown).toBe(false);
                expect(this.getChatLogs(4)).toContain('player2 uses Ikoma Message Runner to reveal up to 1 facedown card in each player\'s provinces. Akodo Toturi is revealed in player1\'s province 2.');
            });
        });
    });
});
