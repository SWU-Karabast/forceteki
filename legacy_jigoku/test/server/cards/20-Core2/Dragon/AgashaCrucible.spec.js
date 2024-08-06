describe('Agasha Crucible', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['doomed-shugenja', 'miya-mystic'],
                    dynastyDiscard: ['agasha-crucible'],
                    hand: ['the-rushing-wave', 'grasp-of-earth-2']
                },
                player2: {
                    dynastyDiscard: ['favorable-ground']
                }
            });

            this.rushingWave = this.player1.findCardByName('the-rushing-wave');
            this.graspOfEarth = this.player1.findCardByName('grasp-of-earth-2');
            this.doomed = this.player1.findCardByName('doomed-shugenja');
            this.mystic = this.player1.findCardByName('miya-mystic');

            this.agashaCrucible = this.player1.placeCardInProvince('agasha-crucible', 'province 1');

            this.shamefulDisplay = this.player2.findCardByName('shameful-display', 'province 1');
            this.favorableGround = this.player2.placeCardInProvince('favorable-ground', 'province 1');
        });

        it('gives elemental Trait to a shugenja and gain an action', function () {
            this.player1.clickCard(this.agashaCrucible);
            expect(this.player1).toHavePrompt('Choose a character');
            expect(this.player1).toBeAbleToSelect(this.doomed);
            expect(this.player1).toBeAbleToSelect(this.mystic);

            this.player1.clickCard(this.doomed);
            expect(this.player1).toHavePrompt('Choose Trait to gain');
            expect(this.player1).toHavePromptButton('Air');
            expect(this.player1).toHavePromptButton('Earth');
            expect(this.player1).toHavePromptButton('Fire');
            expect(this.player1).toHavePromptButton('Void');
            expect(this.player1).toHavePromptButton('Water');
            this.player1.clickPrompt('Water');
            expect(this.getChatLogs(5)).toContain(
                'player1 uses Agasha Crucible to give Doomed Shugenja another Elemental Trait, and take another action!'
            );
            expect(this.getChatLogs(5)).toContain('Doomed Shugenja gains the Water Trait');

            this.player1.clickCard(this.rushingWave);
            expect(this.player1).toHavePrompt('Choose a province');
            this.player1.clickCard(this.shamefulDisplay);

            expect(this.getChatLogs(5)).toContain(
                "player1 plays The Rushing Wave to set province 1's strength to 0 until the end of the phase"
            );
            expect(this.getChatLogs(5)).toContain(
                'player1 channels their water affinity to also set the strength of province 2 to 0'
            );
        });
    });
});