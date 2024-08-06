describe('To Sow the Earth', function () {
    integration(function () {
        describe('peasant replay ability', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['otter-fisherman'],
                        dynastyDiscard: ['ashigaru-levy', 'matsu-berserker'],
                        conflictDiscard: ['ashigaru-company', 'meek-informant'],
                        hand: ['to-sow-the-earth'],
                        provinces: ['shameful-display']
                    },
                    player2: {
                        dynastyDiscard: ['militant-faithful']
                    }
                });

                this.otterFisherman = this.player1.findCardByName('otter-fisherman');
                this.ashigaruLevy = this.player1.findCardByName('ashigaru-levy');
                this.matsuBerserker = this.player1.findCardByName('matsu-berserker');
                this.ashigaruCompany = this.player1.findCardByName('ashigaru-company');
                this.meekInformant = this.player1.findCardByName('meek-informant');

                this.toSowTheEarth = this.player1.findCardByName('to-sow-the-earth');
                this.shameful = this.player1.findCardByName('shameful-display', 'province 1');
            });

            it('should let you play a peasant character from your discard piles', function () {
                this.player1.clickCard(this.toSowTheEarth);
                expect(this.player1).toHavePrompt('Choose a character');

                expect(this.player1).toBeAbleToSelect(this.ashigaruLevy);
                expect(this.player1).toBeAbleToSelect(this.meekInformant);

                expect(this.player1).not.toBeAbleToSelect(this.matsuBerserker); // not a peasant
                expect(this.player1).not.toBeAbleToSelect(this.ashigaruCompany); // not a character
                expect(this.player1).not.toBeAbleToSelect(this.otterFisherman); // in play

                this.player1.clickCard(this.ashigaruLevy);
                this.player1.clickPrompt('0');
                expect(this.ashigaruLevy.location).toBe('play area');
                expect(this.getChatLogs(3)).toContain('player1 plays To Sow the Earth to play Ashigaru Levy from their discard pile');
            });

            it('should let you bow a peasant to put a province facedown', function () {
                this.shameful.facedown = false;

                this.player1.clickCard(this.toSowTheEarth);
                this.player1.clickPrompt('Place a province facedown');
                expect(this.player1).toHavePrompt('Choose a province');
                this.player1.clickCard(this.shameful);

                expect(this.player1).toHavePrompt('Select card to bow');
                this.player1.clickCard(this.otterFisherman);

                expect(this.otterFisherman.bowed).toBe(true);
                expect(this.shameful.facedown).toBe(true);
                expect(this.getChatLogs(3)).toContain('player1 plays To Sow the Earth, bowing Otter Fisherman to turn Shameful Display facedown');
            });
        });
    });
});
