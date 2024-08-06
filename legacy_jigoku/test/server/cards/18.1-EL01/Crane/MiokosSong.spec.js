const { GameModes } = require('../../../../build/GameModes');

describe("Mioko's Song", function () {
    integration(function () {
        describe('Static ability', function () {
            beforeEach(function () {
                this.setupTest({
                    player1: {
                        stronghold: ['mioko-s-song'],
                        inPlay: ['daidoji-ahma', 'kakita-yoshi', 'hantei-daisetsu']
                    }
                });

                this.ahma = this.player1.findCardByName('daidoji-ahma');
                this.yoshi = this.player1.findCardByName('kakita-yoshi');
                this.daisetsu = this.player1.findCardByName('hantei-daisetsu');

                this.ahma.dishonor();
                this.yoshi.dishonor();
                this.daisetsu.dishonor();
                this.noMoreActions();
            });

            it('gives skill bonus to dishonored crane characters', function () {
                expect(this.ahma.getMilitarySkill()).toBe(1);
                expect(this.ahma.getPoliticalSkill()).toBe(2);
                expect(this.yoshi.getMilitarySkill()).toBe(0);
                expect(this.yoshi.getPoliticalSkill()).toBe(4);
                expect(this.daisetsu.getMilitarySkill()).toBe(0);
                expect(this.daisetsu.getPoliticalSkill()).toBe(1);
            });
        });

        describe('Reaction', function () {
            beforeEach(function () {
                this.setupTest({
                    gameMode: GameModes.Emerald,
                    phase: 'dynasty',
                    player1: {
                        stronghold: ['mioko-s-song'],
                        dynastyDiscard: ['kakita-yoshi', 'hantei-daisetsu'],
                        inPlay: ['doji-whisperer']
                    },
                    player2: {
                        dynastyDiscard: ['aranat', 'border-rider', 'moto-youth'],
                        provinces: ['shameful-display']
                    }
                });

                this.miokosSong = this.player1.findCardByName('mioko-s-song');
                this.whisperer = this.player1.findCardByName('doji-whisperer');
                this.yoshi = this.player1.placeCardInProvince('kakita-yoshi', 'province 1');
                this.daisetsu = this.player1.moveCard('hantei-daisetsu', 'province 1');

                this.shamefulDisplay = this.player2.findCardByName('shameful-display', 'province 1');
                this.aranat = this.player2.findCardByName('aranat');
                this.borderRider = this.player2.findCardByName('border-rider');
                this.motoYouth = this.player2.findCardByName('moto-youth');
                this.shamefulDisplay = this.player2.findCardByName('shameful-display', 'province 1');
                this.shamefulDisplay.facedown = true;

                this.player2.moveCard(this.aranat, 'province 1');
                this.player2.moveCard(this.motoYouth, 'dynasty deck');
                this.player2.moveCard(this.borderRider, 'dynasty deck');
            });

            it('discards all cards from opponent province', function () {
                this.player1.clickCard(this.yoshi);
                this.player1.clickPrompt('0');
                expect(this.player1).toHavePrompt('Triggered Abilities');
                expect(this.player1).toBeAbleToSelect(this.miokosSong);

                this.player1.clickCard(this.miokosSong);
                expect(this.player1).toHavePrompt('Choose a province');

                this.player1.clickCard(this.shamefulDisplay);
                expect(this.player1).toHavePrompt('Select character to dishonor');
                expect(this.player1).toBeAbleToSelect(this.yoshi);
                expect(this.player1).not.toBeAbleToSelect(this.whisperer);

                this.player1.clickCard(this.yoshi);
                expect(this.yoshi.isDishonored).toBe(true);

                expect(this.player1).toHavePrompt('Which card do you want to put in the province?');
                expect(this.player1).toHavePromptButton(this.motoYouth.name);
                expect(this.player1).toHavePromptButton(this.borderRider.name);

                this.player1.clickPrompt(this.borderRider.name);
                expect(this.borderRider.location).toBe('province 1');
                expect(this.player2.player.dynastyDeck.slice(-1)[0]).toBe(this.motoYouth);
                expect(this.getChatLogs(5)).toContain(
                    'player1 puts Border Rider into province 1, discarding Adept of the Waves and Aranat'
                );
            });
        });
    });
});
