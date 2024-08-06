describe('The Western Wind', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    fate: 30,
                    dynastyDiscard: ['doji-whisperer', 'kakita-yoshi', 'kakita-toshimoko', 'daidoji-kageyu', 'moto-chagatai', 'favorable-ground',
                        'imperial-storehouse', 'iron-mine', 'a-season-of-war', 'dispatch-to-nowhere', 'aranat'],
                    provinces: ['manicured-garden', 'endless-plains', 'fertile-fields', 'magistrate-station'],
                    hand: ['the-western-wind']
                }
            });

            this.player1.reduceDeckToNumber('dynasty deck', 0);

            this.wind = this.player1.findCardByName('the-western-wind');

            this.dojiWhisperer = this.player1.moveCard('doji-whisperer', 'dynasty deck');
            this.yoshi = this.player1.moveCard('kakita-yoshi', 'dynasty deck');
            this.toshimoko = this.player1.moveCard('kakita-toshimoko', 'dynasty deck');
            this.kageyu = this.player1.moveCard('daidoji-kageyu', 'dynasty deck');
            this.chagatai = this.player1.moveCard('moto-chagatai', 'dynasty deck');

            this.favorable = this.player1.moveCard('favorable-ground', 'dynasty deck');
            this.storehouse = this.player1.moveCard('imperial-storehouse', 'dynasty deck');
            this.mine = this.player1.moveCard('iron-mine', 'dynasty deck');
            this.season = this.player1.moveCard('a-season-of-war', 'dynasty deck');
            this.dispatch = this.player1.moveCard('dispatch-to-nowhere', 'dynasty deck');
            this.aranat = this.player1.moveCard('aranat', 'dynasty deck');

            this.p1 = this.player1.findCardByName('manicured-garden');
            this.p2 = this.player1.findCardByName('endless-plains');
            this.p3 = this.player1.findCardByName('fertile-fields');
            this.p4 = this.player1.findCardByName('magistrate-station');
            this.pStronghold = this.player1.findCardByName('shameful-display', 'stronghold province');

            this.p21 = this.player2.findCardByName('shameful-display', 'province 1');
            this.p22 = this.player2.findCardByName('shameful-display', 'province 2');
            this.p23 = this.player2.findCardByName('shameful-display', 'province 3');
            this.p24 = this.player2.findCardByName('shameful-display', 'province 4');
            this.p25 = this.player2.findCardByName('shameful-display', 'stronghold province');
        });

        it('should not be playable when your opponent has no faceup provinces', function() {
            expect(this.player1).toHavePrompt('Action Window');
            this.player1.clickCard(this.wind);
            expect(this.player1).toHavePrompt('Action Window');
        });

        it('should not be playable when your opponent has no non-SH faceup provinces', function() {
            this.p25.facedown = false;
            this.game.checkGameState(true);
            expect(this.player1).toHavePrompt('Action Window');
            this.player1.clickCard(this.wind);
            expect(this.player1).toHavePrompt('Action Window');
        });

        it('should prompt you to choose a non-SH province you control', function() {
            this.p21.facedown = false;
            this.p22.facedown = false;
            this.game.checkGameState(true);
            expect(this.player1).toHavePrompt('Action Window');
            this.player1.clickCard(this.wind);
            expect(this.player1).toHavePrompt('Choose a province');
            expect(this.player1).toBeAbleToSelect(this.p1);
            expect(this.player1).toBeAbleToSelect(this.p2);
            expect(this.player1).toBeAbleToSelect(this.p3);
            expect(this.player1).toBeAbleToSelect(this.p4);
            expect(this.player1).not.toBeAbleToSelect(this.pStronghold);

            expect(this.player1).not.toBeAbleToSelect(this.p21);
            expect(this.player1).not.toBeAbleToSelect(this.p22);
            expect(this.player1).not.toBeAbleToSelect(this.p23);
            expect(this.player1).not.toBeAbleToSelect(this.p24);
            expect(this.player1).not.toBeAbleToSelect(this.p25);
        });

        it('should prompt you to choose characters from the top 8 cards of your deck', function() {
            this.p21.facedown = false;
            this.p22.facedown = false;
            this.game.checkGameState(true);
            this.player1.clickCard(this.wind);
            this.player1.clickCard(this.p1);
            expect(this.player1).toHavePrompt('Select up to 2 cards to reveal');

            expect(this.player1).not.toHavePromptButton('Doji Whisperer');
            expect(this.player1).not.toHavePromptButton('Kakita Yoshi');
            expect(this.player1).not.toHavePromptButton('Kakita Toshimoko');
            expect(this.player1).toHavePromptButton('Daidoji Kageyu');
            expect(this.player1).toHavePromptButton('Moto Chagatai');
            expect(this.player1).toHaveDisabledPromptButton('Favorable Ground');
            expect(this.player1).toHaveDisabledPromptButton('Imperial Storehouse');
            expect(this.player1).toHaveDisabledPromptButton('Iron Mine');
            expect(this.player1).toHaveDisabledPromptButton('A Season of War');
            expect(this.player1).toHaveDisabledPromptButton('Dispatch to Nowhere');
            expect(this.player1).toHavePromptButton('Aranat');
            expect(this.player1).toHavePromptButton('Take nothing');
        });

        it('should not discard the cards already there', function() {
            let p1Count = this.player1.player.getDynastyCardsInProvince('province 1').length;
            this.p21.facedown = false;
            this.p22.facedown = false;
            this.game.checkGameState(true);
            this.player1.clickCard(this.wind);
            this.player1.clickCard(this.p1);
            expect(this.player1).toHavePrompt('Select up to 2 cards to reveal');

            this.player1.clickPrompt('Moto Chagatai');
            this.player1.clickPrompt('Daidoji Kageyu');
            expect(this.player2).toHavePrompt('Action Window');

            expect(this.player1.player.getDynastyCardsInProvince('province 1').length).toBe(p1Count + 2);
        });

        it('should put the new cards in faceup', function() {
            this.p21.facedown = false;
            this.p22.facedown = false;
            this.game.checkGameState(true);
            this.player1.clickCard(this.wind);
            this.player1.clickCard(this.p1);
            this.player1.clickPrompt('Moto Chagatai');
            this.player1.clickPrompt('Daidoji Kageyu');

            expect(this.chagatai.location).toBe(this.p1.location);
            expect(this.kageyu.location).toBe(this.p1.location);
            expect(this.chagatai.facedown).toBe(false);
            expect(this.kageyu.facedown).toBe(false);
        });

        it('should shuffle', function() {
            this.p21.facedown = false;
            this.p22.facedown = false;
            this.game.checkGameState(true);
            this.player1.clickCard(this.wind);
            this.player1.clickCard(this.p1);
            this.player1.clickPrompt('Moto Chagatai');
            this.player1.clickPrompt('Daidoji Kageyu');
            expect(this.getChatLogs(1)).toContain('player1 is shuffling their dynasty deck');
        });

        it('testing chat messages (facedown target)', function() {
            this.p21.facedown = false;
            this.p22.facedown = false;
            this.game.checkGameState(true);
            this.player1.clickCard(this.wind);
            this.player1.clickCard(this.p1);
            this.player1.clickPrompt('Moto Chagatai');
            this.player1.clickPrompt('Daidoji Kageyu');

            expect(this.getChatLogs(10)).toContain('player1 plays The Western Wind to look at the top 8 cards of their deck');
            expect(this.getChatLogs(10)).toContain('player1 selects Moto Chagatai and Daidoji Kageyu and puts them into province 1');
        });

        it('testing chat messages (faceup target)', function() {
            this.p1.facedown = false;
            this.p21.facedown = false;
            this.p22.facedown = false;
            this.game.checkGameState(true);
            this.player1.clickCard(this.wind);
            this.player1.clickCard(this.p1);
            this.player1.clickPrompt('Moto Chagatai');
            this.player1.clickPrompt('Daidoji Kageyu');

            expect(this.getChatLogs(10)).toContain('player1 plays The Western Wind to look at the top 8 cards of their deck');
            expect(this.getChatLogs(10)).toContain('player1 selects Moto Chagatai and Daidoji Kageyu and puts them into Manicured Garden');
        });

        describe('Edge cases', function() {
            it('should be playable with less than 8 cards', function() {
                this.player1.moveCard(this.storehouse, 'dynasty discard pile');
                this.player1.moveCard(this.season, 'dynasty discard pile');
                this.player1.moveCard(this.dispatch, 'dynasty discard pile');
                this.player1.moveCard(this.mine, 'dynasty discard pile');
                this.player1.moveCard(this.yoshi, 'dynasty discard pile');
                this.player1.moveCard(this.dojiWhisperer, 'dynasty discard pile');

                this.p21.facedown = false;
                this.p22.facedown = false;
                this.game.checkGameState(true);
                this.player1.clickCard(this.wind);
                this.player1.clickCard(this.p1);
                expect(this.getChatLogs(10)).toContain('player1 plays The Western Wind to look at the top 8 cards of their deck');
                expect(this.player1).toHavePrompt('The Western Wind');
                expect(this.player1).not.toHavePromptButton('Doji Whisperer');
                expect(this.player1).not.toHavePromptButton('Kakita Yoshi');
                expect(this.player1).toHavePromptButton('Kakita Toshimoko');
                expect(this.player1).toHavePromptButton('Daidoji Kageyu');
                expect(this.player1).toHavePromptButton('Moto Chagatai');
                expect(this.player1).not.toHavePromptButton('Favorable Ground');
                expect(this.player1).not.toHavePromptButton('Imperial Storehouse');
                expect(this.player1).not.toHavePromptButton('Iron Mine');
                expect(this.player1).not.toHavePromptButton('A Season of War');
                expect(this.player1).not.toHavePromptButton('Dispatch to Nowhere');
                expect(this.player1).toHavePromptButton('Aranat');
            });

            it('should not work at 0 cards', function() {
                this.player1.moveCard(this.dojiWhisperer, 'dynasty discard pile');
                this.player1.moveCard(this.yoshi, 'dynasty discard pile');
                this.player1.moveCard(this.kageyu, 'dynasty discard pile');
                this.player1.moveCard(this.chagatai, 'dynasty discard pile');
                this.player1.moveCard(this.mine, 'dynasty discard pile');
                this.player1.moveCard(this.season, 'dynasty discard pile');
                this.player1.moveCard(this.dispatch, 'dynasty discard pile');
                this.player1.moveCard(this.storehouse, 'dynasty discard pile');
                this.player1.moveCard(this.aranat, 'dynasty discard pile');
                this.player1.moveCard(this.toshimoko, 'dynasty discard pile');
                this.player1.moveCard(this.favorable, 'dynasty discard pile');


                this.p21.facedown = false;
                this.p22.facedown = false;
                this.game.checkGameState(true);
                expect(this.player1).toHavePrompt('Action Window');
                this.player1.clickCard(this.wind);
                expect(this.player1).toHavePrompt('Action Window');
            });
        });
    });
});
