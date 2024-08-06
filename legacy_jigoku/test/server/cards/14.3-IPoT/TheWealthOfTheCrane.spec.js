describe('The Wealth of the Crane', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    fate: 30,
                    dynastyDiscard: ['doji-whisperer', 'kakita-yoshi', 'kakita-toshimoko', 'daidoji-kageyu', 'moto-chagatai', 'favorable-ground',
                        'imperial-storehouse', 'iron-mine', 'a-season-of-war', 'dispatch-to-nowhere', 'aranat'],
                    provinces: ['manicured-garden', 'endless-plains', 'fertile-fields', 'magistrate-station'],
                    hand: ['the-wealth-of-the-crane', 'the-wealth-of-the-crane']
                }
            });

            this.player1.player.promptedActionWindows.fate = true;
            this.player2.player.promptedActionWindows.fate = true;

            this.player1.reduceDeckToNumber('dynasty deck', 0);

            this.wealth = this.player1.filterCardsByName('the-wealth-of-the-crane')[0];
            this.wealth2 = this.player1.filterCardsByName('the-wealth-of-the-crane')[1];

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

        });

        it('should let you choose from the top 10 cards of your deck', function() {
            this.player1.clickCard(this.wealth);
            expect(this.getChatLogs(1)).toContain('player1 plays The Wealth of the Crane to look at the top ten cards of their dynasty deck');
            expect(this.player1).toHavePrompt('The Wealth of the Crane');
            expect(this.player1).toHavePrompt('Select a card to place in a province');
            expect(this.player1).not.toHavePromptButton('Doji Whisperer');
            expect(this.player1).toHavePromptButton('Kakita Yoshi');
            expect(this.player1).toHavePromptButton('Kakita Toshimoko');
            expect(this.player1).toHavePromptButton('Daidoji Kageyu');
            expect(this.player1).toHavePromptButton('Moto Chagatai');
            expect(this.player1).toHavePromptButton('Favorable Ground');
            expect(this.player1).toHavePromptButton('Imperial Storehouse');
            expect(this.player1).toHavePromptButton('Iron Mine');
            expect(this.player1).toHavePromptButton('A Season of War');
            expect(this.player1).toHavePromptButton('Dispatch to Nowhere');
            expect(this.player1).toHavePromptButton('Aranat');
            expect(this.player1).not.toHavePromptButton('Cancel');
            expect(this.player1).not.toHavePromptButton('Done');
            expect(this.player1).not.toHavePromptButton('Put nothing in this province');
        });

        it('should prompt you to pick a province for the chosen card', function() {
            this.player1.clickCard(this.wealth);
            expect(this.player1).toHavePrompt('The Wealth of the Crane');
            expect(this.player1).toHavePrompt('Select a card to place in a province');
            expect(this.player1).not.toHavePromptButton('Doji Whisperer');
            this.player1.clickPrompt('Kakita Yoshi');

            expect(this.player1).toHavePrompt('Choose a province for Kakita Yoshi');

            expect(this.player1).toBeAbleToSelect(this.p1);
            expect(this.player1).toBeAbleToSelect(this.p2);
            expect(this.player1).toBeAbleToSelect(this.p3);
            expect(this.player1).toBeAbleToSelect(this.p4);
            expect(this.player1).not.toBeAbleToSelect(this.pStronghold);

            this.player1.clickCard(this.p1);
            expect(this.yoshi.location).toBe('province 1');
            expect(this.yoshi.facedown).toBe(false);
            expect(this.getChatLogs(1)).toContain('player1 puts Kakita Yoshi into a facedown province');
        });

        it('should prompt you to pick another card after placing your first one', function() {
            this.player1.clickCard(this.wealth);
            expect(this.player1).toHavePrompt('The Wealth of the Crane');
            this.player1.clickPrompt('Kakita Yoshi');
            this.player1.clickCard(this.p1);

            expect(this.player1).toHavePrompt('Select a card to place in a province');
            expect(this.player1).not.toHavePromptButton('Doji Whisperer');
            expect(this.player1).not.toHavePromptButton('Kakita Yoshi');
            expect(this.player1).toHavePromptButton('Kakita Toshimoko');
            expect(this.player1).toHavePromptButton('Daidoji Kageyu');
            expect(this.player1).toHavePromptButton('Moto Chagatai');
            expect(this.player1).toHavePromptButton('Favorable Ground');
            expect(this.player1).toHavePromptButton('Imperial Storehouse');
            expect(this.player1).toHavePromptButton('Iron Mine');
            expect(this.player1).toHavePromptButton('A Season of War');
            expect(this.player1).toHavePromptButton('Dispatch to Nowhere');
            expect(this.player1).toHavePromptButton('Aranat');
        });

        it('should prompt you to put it into a different province than the first one', function() {
            this.player1.clickCard(this.wealth);
            expect(this.player1).toHavePrompt('The Wealth of the Crane');
            this.player1.clickPrompt('Kakita Yoshi');
            this.player1.clickCard(this.p1);
            this.player1.clickPrompt('Daidoji Kageyu');

            expect(this.player1).toHavePrompt('Choose a province for Daidoji Kageyu');

            expect(this.player1).not.toBeAbleToSelect(this.p1);
            expect(this.player1).toBeAbleToSelect(this.p2);
            expect(this.player1).toBeAbleToSelect(this.p3);
            expect(this.player1).toBeAbleToSelect(this.p4);
            expect(this.player1).not.toBeAbleToSelect(this.pStronghold);
        });

        it('should put a card into each province and then stop prompting you', function() {
            this.player1.clickCard(this.wealth);
            expect(this.player1).toHavePrompt('The Wealth of the Crane');
            this.player1.clickPrompt('Kakita Yoshi');
            expect(this.player1).toBeAbleToSelect(this.p1);
            expect(this.player1).toBeAbleToSelect(this.p2);
            expect(this.player1).toBeAbleToSelect(this.p3);
            expect(this.player1).toBeAbleToSelect(this.p4);
            expect(this.player1).not.toBeAbleToSelect(this.pStronghold);

            this.player1.clickCard(this.p4);
            this.player1.clickPrompt('Daidoji Kageyu');
            expect(this.player1).toBeAbleToSelect(this.p1);
            expect(this.player1).toBeAbleToSelect(this.p2);
            expect(this.player1).toBeAbleToSelect(this.p3);
            expect(this.player1).not.toBeAbleToSelect(this.p4);
            expect(this.player1).not.toBeAbleToSelect(this.pStronghold);

            this.player1.clickCard(this.p2);
            this.player1.clickPrompt('Iron Mine');
            expect(this.player1).toBeAbleToSelect(this.p1);
            expect(this.player1).not.toBeAbleToSelect(this.p2);
            expect(this.player1).toBeAbleToSelect(this.p3);
            expect(this.player1).not.toBeAbleToSelect(this.p4);
            expect(this.player1).not.toBeAbleToSelect(this.pStronghold);

            this.player1.clickCard(this.p3);
            this.player1.clickPrompt('A Season of War');
            expect(this.player1).toBeAbleToSelect(this.p1);
            expect(this.player1).not.toBeAbleToSelect(this.p2);
            expect(this.player1).not.toBeAbleToSelect(this.p3);
            expect(this.player1).not.toBeAbleToSelect(this.p4);
            expect(this.player1).not.toBeAbleToSelect(this.pStronghold);

            this.player1.clickCard(this.p1);
            expect(this.player2).toHavePrompt('Action Window');

            expect(this.yoshi.location).toBe(this.p4.location);
            expect(this.kageyu.location).toBe(this.p2.location);
            expect(this.mine.location).toBe(this.p3.location);
            expect(this.season.location).toBe(this.p1.location);

            expect(this.yoshi.facedown).toBe(false);
            expect(this.kageyu.facedown).toBe(false);
            expect(this.mine.facedown).toBe(false);
            expect(this.season.facedown).toBe(false);
        });

        it('should not discard the cards already there', function() {
            let p1Count = this.player1.player.getDynastyCardsInProvince('province 1').length;
            let p2Count = this.player1.player.getDynastyCardsInProvince('province 2').length;
            let p3Count = this.player1.player.getDynastyCardsInProvince('province 3').length;
            let p4Count = this.player1.player.getDynastyCardsInProvince('province 4').length;

            this.player1.clickCard(this.wealth);
            expect(this.player1).toHavePrompt('The Wealth of the Crane');
            this.player1.clickPrompt('Kakita Yoshi');
            this.player1.clickCard(this.p1);
            this.player1.clickPrompt('Daidoji Kageyu');
            this.player1.clickCard(this.p2);
            this.player1.clickPrompt('Iron Mine');
            this.player1.clickCard(this.p3);
            this.player1.clickPrompt('A Season of War');
            this.player1.clickCard(this.p4);
            expect(this.player2).toHavePrompt('Action Window');

            expect(this.player1.player.getDynastyCardsInProvince('province 1').length).toBe(p1Count + 1);
            expect(this.player1.player.getDynastyCardsInProvince('province 2').length).toBe(p2Count + 1);
            expect(this.player1.player.getDynastyCardsInProvince('province 3').length).toBe(p3Count + 1);
            expect(this.player1.player.getDynastyCardsInProvince('province 4').length).toBe(p4Count + 1);
        });

        it('should shuffle', function() {
            this.player1.clickCard(this.wealth);
            expect(this.player1).toHavePrompt('The Wealth of the Crane');
            this.player1.clickPrompt('Kakita Yoshi');
            this.player1.clickCard(this.p1);
            this.player1.clickPrompt('Daidoji Kageyu');
            this.player1.clickCard(this.p2);
            this.player1.clickPrompt('Iron Mine');
            this.player1.clickCard(this.p3);
            this.player1.clickPrompt('A Season of War');
            this.player1.clickCard(this.p4);
            expect(this.getChatLogs(1)).toContain('player1 is shuffling their dynasty deck');
        });

        it('testing chat messages', function() {
            this.p2.facedown = false;
            this.player1.clickCard(this.wealth);
            this.player1.clickPrompt('Kakita Yoshi');
            this.player1.clickCard(this.p4);
            this.player1.clickPrompt('Daidoji Kageyu');
            this.player1.clickCard(this.p3);
            this.player1.clickPrompt('Iron Mine');
            this.player1.clickCard(this.p2);
            this.player1.clickPrompt('A Season of War');
            this.player1.clickCard(this.p1);

            expect(this.getChatLogs(10)).toContain('player1 plays The Wealth of the Crane to look at the top ten cards of their dynasty deck');
            expect(this.getChatLogs(10)).toContain('player1 puts Kakita Yoshi into a facedown province');
            expect(this.getChatLogs(10)).toContain('player1 puts Daidoji Kageyu into a facedown province');
            expect(this.getChatLogs(10)).toContain('player1 puts Iron Mine into Endless Plains');
            expect(this.getChatLogs(10)).toContain('player1 puts A Season of War into a facedown province');
            expect(this.getChatLogs(1)).toContain('player1 is shuffling their dynasty deck');

        });

        describe('Cost Reduction', function() {
            it('should cost 5 with no faceup provinces', function() {
                let fate = this.player1.fate;
                this.player1.clickCard(this.wealth);
                expect(this.player1.fate).toBe(fate - 5);
            });

            it('should cost 4 with 1 faceup province', function() {
                this.p1.facedown = false;
                let fate = this.player1.fate;
                this.player1.clickCard(this.wealth);
                expect(this.player1.fate).toBe(fate - 4);
            });

            it('should cost 3 with 2 faceup provinces', function() {
                this.p1.facedown = false;
                this.p2.facedown = false;
                let fate = this.player1.fate;
                this.player1.clickCard(this.wealth);
                expect(this.player1.fate).toBe(fate - 3);
            });

            it('should cost 2 with 3 faceup provinces', function() {
                this.p1.facedown = false;
                this.p2.facedown = false;
                this.p3.facedown = false;
                let fate = this.player1.fate;
                this.player1.clickCard(this.wealth);
                expect(this.player1.fate).toBe(fate - 2);
            });

            it('should cost 1 with 4 faceup provinces', function() {
                this.p1.facedown = false;
                this.p2.facedown = false;
                this.p3.facedown = false;
                this.p4.facedown = false;
                let fate = this.player1.fate;
                this.player1.clickCard(this.wealth);
                expect(this.player1.fate).toBe(fate - 1);
            });

            it('should cost 0 with 5 faceup provinces', function() {
                this.p1.facedown = false;
                this.p2.facedown = false;
                this.p3.facedown = false;
                this.p4.facedown = false;
                this.pStronghold.facedown = false;
                let fate = this.player1.fate;
                this.player1.clickCard(this.wealth);
                expect(this.player1.fate).toBe(fate - 0);
            });
        });

        describe('Limits and other edge cases', function() {
            it('should not be playable twice per phase', function() {
                this.player1.clickCard(this.wealth);
                expect(this.player1).toHavePrompt('The Wealth of the Crane');
                this.player1.clickPrompt('Kakita Yoshi');
                this.player1.clickCard(this.p1);
                this.player1.clickPrompt('Daidoji Kageyu');
                this.player1.clickCard(this.p2);
                this.player1.clickPrompt('Iron Mine');
                this.player1.clickCard(this.p3);
                this.player1.clickPrompt('A Season of War');
                this.player1.clickCard(this.p4);
                this.player2.pass();
                expect(this.player1).toHavePrompt('Action Window');
                this.player1.clickCard(this.wealth2);
                expect(this.player1).toHavePrompt('Action Window');
            });

            it('should be playable multiple times per round', function() {
                this.player1.clickCard(this.wealth);
                expect(this.player1).toHavePrompt('The Wealth of the Crane');
                expect(this.player1).toHavePrompt('Select a card to place in a province');
                expect(this.player1).not.toHavePromptButton('Doji Whisperer');
                this.player1.clickPrompt('Kakita Yoshi');
                this.player1.clickCard(this.p1);
                this.player1.clickPrompt('Daidoji Kageyu');
                this.player1.clickCard(this.p2);
                this.player1.clickPrompt('Iron Mine');
                this.player1.clickCard(this.p3);
                this.player1.clickPrompt('A Season of War');
                this.player1.clickCard(this.p4);
                this.noMoreActions();
                this.noMoreActions();
                this.noMoreActions();
                this.noMoreActions();
                this.noMoreActions();
                expect(this.game.currentPhase).toBe('fate');
                this.player1.clickCard(this.wealth2);
                expect(this.player1).toHavePrompt('The Wealth of the Crane');
                expect(this.player1).toHavePrompt('Select a card to place in a province');
            });

            it('should be playable with less than 10 cards', function() {
                this.player1.moveCard(this.yoshi, 'dynasty discard pile');
                this.player1.moveCard(this.kageyu, 'dynasty discard pile');
                this.player1.moveCard(this.chagatai, 'dynasty discard pile');
                this.player1.moveCard(this.mine, 'dynasty discard pile');

                this.player1.clickCard(this.wealth);
                expect(this.getChatLogs(1)).toContain('player1 plays The Wealth of the Crane to look at the top ten cards of their dynasty deck');
                expect(this.player1).toHavePrompt('The Wealth of the Crane');
                expect(this.player1).toHavePromptButton('Doji Whisperer');
                expect(this.player1).not.toHavePromptButton('Kakita Yoshi');
                expect(this.player1).toHavePromptButton('Kakita Toshimoko');
                expect(this.player1).not.toHavePromptButton('Daidoji Kageyu');
                expect(this.player1).not.toHavePromptButton('Moto Chagatai');
                expect(this.player1).toHavePromptButton('Favorable Ground');
                expect(this.player1).toHavePromptButton('Imperial Storehouse');
                expect(this.player1).not.toHavePromptButton('Iron Mine');
                expect(this.player1).toHavePromptButton('A Season of War');
                expect(this.player1).toHavePromptButton('Dispatch to Nowhere');
                expect(this.player1).toHavePromptButton('Aranat');
            });

            it('should be playable with exactly 4 cards', function() {
                this.player1.moveCard(this.yoshi, 'dynasty discard pile');
                this.player1.moveCard(this.kageyu, 'dynasty discard pile');
                this.player1.moveCard(this.chagatai, 'dynasty discard pile');
                this.player1.moveCard(this.mine, 'dynasty discard pile');
                this.player1.moveCard(this.season, 'dynasty discard pile');
                this.player1.moveCard(this.dispatch, 'dynasty discard pile');
                this.player1.moveCard(this.storehouse, 'dynasty discard pile');

                this.player1.clickCard(this.wealth);
                expect(this.getChatLogs(1)).toContain('player1 plays The Wealth of the Crane to look at the top ten cards of their dynasty deck');
                expect(this.player1).toHavePrompt('The Wealth of the Crane');
                expect(this.player1).toHavePromptButton('Doji Whisperer');
                expect(this.player1).not.toHavePromptButton('Kakita Yoshi');
                expect(this.player1).toHavePromptButton('Kakita Toshimoko');
                expect(this.player1).not.toHavePromptButton('Daidoji Kageyu');
                expect(this.player1).not.toHavePromptButton('Moto Chagatai');
                expect(this.player1).toHavePromptButton('Favorable Ground');
                expect(this.player1).not.toHavePromptButton('Imperial Storehouse');
                expect(this.player1).not.toHavePromptButton('Iron Mine');
                expect(this.player1).not.toHavePromptButton('A Season of War');
                expect(this.player1).not.toHavePromptButton('Dispatch to Nowhere');
                expect(this.player1).toHavePromptButton('Aranat');
            });

            it('should let you skip provinces if you have less than 4 cards', function() {
                this.player1.moveCard(this.dojiWhisperer, 'dynasty discard pile');
                this.player1.moveCard(this.yoshi, 'dynasty discard pile');
                this.player1.moveCard(this.kageyu, 'dynasty discard pile');
                this.player1.moveCard(this.chagatai, 'dynasty discard pile');
                this.player1.moveCard(this.mine, 'dynasty discard pile');
                this.player1.moveCard(this.season, 'dynasty discard pile');
                this.player1.moveCard(this.dispatch, 'dynasty discard pile');
                this.player1.moveCard(this.storehouse, 'dynasty discard pile');
                this.player1.moveCard(this.aranat, 'dynasty discard pile');

                expect(this.player1).toHavePrompt('Action Window');
                this.player1.clickCard(this.wealth);
                expect(this.player1).toHavePrompt('Select a card to place in a province');
                expect(this.player1).not.toHavePromptButton('Doji Whisperer');
                expect(this.player1).not.toHavePromptButton('Kakita Yoshi');
                expect(this.player1).toHavePromptButton('Kakita Toshimoko');
                expect(this.player1).not.toHavePromptButton('Daidoji Kageyu');
                expect(this.player1).not.toHavePromptButton('Moto Chagatai');
                expect(this.player1).toHavePromptButton('Favorable Ground');
                expect(this.player1).not.toHavePromptButton('Imperial Storehouse');
                expect(this.player1).not.toHavePromptButton('Iron Mine');
                expect(this.player1).not.toHavePromptButton('A Season of War');
                expect(this.player1).not.toHavePromptButton('Dispatch to Nowhere');
                expect(this.player1).not.toHavePromptButton('Aranat');
                expect(this.player1).not.toHavePromptButton('Put nothing in this province');

                this.player1.clickPrompt('Kakita Toshimoko');
                this.player1.clickCard(this.p3);

                expect(this.player1).toHavePrompt('Select a card to place in a province');
                expect(this.player1).not.toHavePromptButton('Doji Whisperer');
                expect(this.player1).not.toHavePromptButton('Kakita Yoshi');
                expect(this.player1).not.toHavePromptButton('Kakita Toshimoko');
                expect(this.player1).not.toHavePromptButton('Daidoji Kageyu');
                expect(this.player1).not.toHavePromptButton('Moto Chagatai');
                expect(this.player1).toHavePromptButton('Favorable Ground');
                expect(this.player1).not.toHavePromptButton('Imperial Storehouse');
                expect(this.player1).not.toHavePromptButton('Iron Mine');
                expect(this.player1).not.toHavePromptButton('A Season of War');
                expect(this.player1).not.toHavePromptButton('Dispatch to Nowhere');
                expect(this.player1).not.toHavePromptButton('Aranat');
                expect(this.player1).not.toHavePromptButton('Put nothing in this province');

                this.player1.clickPrompt('Favorable Ground');
                expect(this.player1).toBeAbleToSelect(this.p1);
                expect(this.player1).toBeAbleToSelect(this.p2);
                expect(this.player1).not.toBeAbleToSelect(this.p3);
                expect(this.player1).toBeAbleToSelect(this.p4);
                expect(this.player1).not.toBeAbleToSelect(this.pStronghold);
                this.player1.clickCard(this.p4);

                expect(this.player1).not.toHavePrompt('Select a card to place in a province');
                expect(this.player2).toHavePrompt('Action Window');

                expect(this.toshimoko.location).toBe(this.p3.location);
                expect(this.favorable.location).toBe(this.p4.location);

                expect(this.getChatLogs(10)).toContain('player1 puts Kakita Toshimoko into a facedown province');
                expect(this.getChatLogs(10)).toContain('player1 puts Favorable Ground into a facedown province');
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

                expect(this.player1).toHavePrompt('Action Window');
                this.player1.clickCard(this.wealth);
                expect(this.player1).toHavePrompt('Action Window');
            });
        });
    });
});
