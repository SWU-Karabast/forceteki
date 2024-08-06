describe('Procedural Interference', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'dynasty',
                player1: {
                    dynastyDiscard: ['aranat', 'daidoji-uji', 'procedural-interference', 'procedural-interference'],
                    honor: 10
                },
                player2: {
                    dynastyDiscard: ['aranat', 'daidoji-uji', 'imperial-storehouse', 'heavy-ballista'],
                    honor: 10,
                    provinces:['shameful-display', 'silent-ones-monastery']
                }
            });
            this.interference = this.player1.filterCardsByName('procedural-interference')[0];
            this.interference2 = this.player1.filterCardsByName('procedural-interference')[1];
            this.arnat = this.player1.findCardByName('aranat');
            this.uji = this.player1.findCardByName('daidoji-uji');

            this.aranat2 = this.player2.findCardByName('aranat');
            this.uji2 = this.player2.findCardByName('daidoji-uji');
            this.storehouse2 = this.player2.findCardByName('imperial-storehouse');
            this.ballista2 = this.player2.findCardByName('heavy-ballista');

            this.shamefulDisplay = this.player2.findCardByName('shameful-display', 'province 1');
            this.shameful2 = this.player1.findCardByName('shameful-display', 'province 1');
            this.silent = this.player2.findCardByName('silent-ones-monastery', 'province 2');
            this.pStronghold = this.player2.findCardByName('shameful-display', 'stronghold province');

            this.player2.reduceDeckToNumber('dynasty deck', 0);
            this.player2.moveCard(this.aranat2, 'province 1');
            this.player2.moveCard(this.ballista2, 'dynasty deck');

            this.player1.reduceDeckToNumber('dynasty deck', 0);
            this.player1.moveCard(this.interference, 'province 1');
            this.player1.moveCard(this.interference2, 'province 1');
            this.player1.moveCard(this.uji, 'dynasty deck');
        });

        it('should prompt a province to be chosen', function () {
            this.player1.clickCard(this.interference);
            expect(this.player1).toBeAbleToSelect(this.shamefulDisplay);
        });

        it('should give the opponent an option to select between effects', function() {
            this.player1.clickCard(this.interference);
            this.player1.clickCard(this.shamefulDisplay);

            expect(this.player2).toHavePromptButton('Discard each card in the province');
            expect(this.player2).toHavePromptButton('Let opponent gain 2 honor');
        });

        it('should discard all cards in the province when selected', function() {
            this.player1.clickCard(this.interference);
            this.player1.clickCard(this.shamefulDisplay);
            this.player2.clickPrompt('Discard each card in the province');

            expect(this.aranat2.location).toBe('dynasty discard pile');
            expect(this.ballista2.location).toBe('province 1');
            expect(this.ballista2.facedown).toBe(true);
            expect(this.getChatLogs(5)).toContain('player1 plays Procedural Interference to discard Adept of the Waves and Aranat');
        });

        it('should let the player gain 2 honor', function() {
            this.player1.clickCard(this.interference);
            this.player1.clickCard(this.shamefulDisplay);
            this.player2.clickPrompt('Let opponent gain 2 honor');

            expect(this.player1.player.honor).toBe(12);
            expect(this.player2.player.honor).toBe(10);
        });

        it('should not let you gain 4 honor when Silent Ones is present', function() {
            this.player1.clickCard(this.interference);
            this.player1.clickCard(this.shamefulDisplay);
            this.player2.clickPrompt('Let opponent gain 2 honor');
            this.player2.pass();
            this.player1.clickCard(this.interference2);
            this.player1.clickCard(this.shamefulDisplay);
            expect(this.player2).not.toHavePromptButton('Let opponent gain 2 honor');
        });

        it('should not let you choose your own province', function() {
            this.player1.clickCard(this.interference);
            expect(this.player1).not.toBeAbleToSelect(this.shameful2);
        });

        it('should not let you choose a stronghold province', function() {
            this.player1.clickCard(this.interference);
            expect(this.player1).not.toBeAbleToSelect(this.pStronghold);
        });

    });
});
