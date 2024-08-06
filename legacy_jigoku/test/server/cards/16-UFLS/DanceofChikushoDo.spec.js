describe('Dance Of Chikusho-Do', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    fate: 30,
                    dynastyDiscard: ['doji-whisperer', 'kakita-yoshi', 'kakita-toshimoko', 'daidoji-kageyu', 'moto-chagatai', 'favorable-ground',
                        'imperial-storehouse', 'iron-mine', 'a-season-of-war', 'dispatch-to-nowhere', 'aranat'],
                    provinces: ['manicured-garden', 'endless-plains', 'fertile-fields', 'magistrate-station'],
                    hand: ['dance-of-chikusho-do', 'dance-of-chikusho-do']
                },
                player2: {
                    fate: 30,
                    dynastyDiscard: ['doji-whisperer', 'kakita-yoshi', 'kakita-toshimoko', 'daidoji-kageyu', 'moto-chagatai', 'favorable-ground',
                        'imperial-storehouse', 'iron-mine', 'a-season-of-war', 'dispatch-to-nowhere', 'aranat'],
                    provinces: ['manicured-garden', 'endless-plains', 'fertile-fields', 'magistrate-station']
                }
            });

            this.player1.player.promptedActionWindows.fate = true;
            this.player2.player.promptedActionWindows.fate = true;

            this.player1.reduceDeckToNumber('dynasty deck', 0);

            this.dance = this.player1.filterCardsByName('dance-of-chikusho-do')[0];
            this.dance2 = this.player1.filterCardsByName('dance-of-chikusho-do')[1];

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


            this.dojiWhisperer2 = this.player2.moveCard('doji-whisperer', 'dynasty deck');
            this.yoshi2 = this.player2.moveCard('kakita-yoshi', 'dynasty deck');
            this.toshimoko2 = this.player2.moveCard('kakita-toshimoko', 'dynasty deck');
            this.kageyu2 = this.player2.moveCard('daidoji-kageyu', 'dynasty deck');
            this.chagatai2 = this.player2.moveCard('moto-chagatai', 'dynasty deck');

            this.favorable2 = this.player2.moveCard('favorable-ground', 'dynasty deck');
            this.storehouse2 = this.player2.moveCard('imperial-storehouse', 'dynasty deck');
            this.mine2 = this.player2.moveCard('iron-mine', 'dynasty deck');
            this.season2 = this.player2.moveCard('a-season-of-war', 'dynasty deck');
            this.dispatch2 = this.player2.moveCard('dispatch-to-nowhere', 'dynasty deck');
            this.aranat2 = this.player2.moveCard('aranat', 'dynasty deck');

            this.p12 = this.player2.findCardByName('manicured-garden');
            this.p22 = this.player2.findCardByName('endless-plains');
            this.p32 = this.player2.findCardByName('fertile-fields');
            this.p42 = this.player2.findCardByName('magistrate-station');
            this.pStronghold2 = this.player2.findCardByName('shameful-display', 'stronghold province');

            this.p22.isBroken = true;
        });

        it('should let you choose a player', function() {
            this.player1.clickCard(this.dance);
            expect(this.player1).toHavePrompt('Choose any number of players');
            expect(this.player1).toHavePromptButton('player1');
            expect(this.player1).toHavePromptButton('player2');
            expect(this.player1).toHavePromptButton('player1 and player2');
        });

        it('should put 2 cards in each of their unbroken provinces - player1', function() {
            let cards = this.player1.player.getDynastyCardsInProvince('stronghold province').length;

            this.player1.clickCard(this.dance);
            this.player1.clickPrompt('player1');

            expect(this.aranat.location).toBe('province 1');
            expect(this.dispatch.location).toBe('province 1');
            expect(this.season.location).toBe('province 2');
            expect(this.mine.location).toBe('province 2');
            expect(this.storehouse.location).toBe('province 3');
            expect(this.favorable.location).toBe('province 3');
            expect(this.chagatai.location).toBe('province 4');
            expect(this.kageyu.location).toBe('province 4');

            expect(this.aranat.facedown).toBe(true);
            expect(this.dispatch.facedown).toBe(true);
            expect(this.season.facedown).toBe(true);
            expect(this.mine.facedown).toBe(true);
            expect(this.storehouse.facedown).toBe(true);
            expect(this.favorable.facedown).toBe(true);
            expect(this.chagatai.facedown).toBe(true);
            expect(this.kageyu.facedown).toBe(true);

            expect(this.player1.player.getDynastyCardsInProvince('stronghold province').length).toBe(cards);
            expect(this.getChatLogs(5)).toContain('player1 plays Dance of Chikushō-dō to have player1 place 2 cards in each unbroken province they control');
        });

        it('should put 2 cards in each of their unbroken provinces - player2', function() {
            this.player1.clickCard(this.dance);
            this.player1.clickPrompt('player2');

            expect(this.aranat2.location).toBe('province 1');
            expect(this.dispatch2.location).toBe('province 1');
            expect(this.season2.location).toBe('province 3');
            expect(this.mine2.location).toBe('province 3');
            expect(this.storehouse2.location).toBe('province 4');
            expect(this.favorable2.location).toBe('province 4');
            expect(this.chagatai2.location).toBe('dynasty deck');
            expect(this.kageyu2.location).toBe('dynasty deck');

            expect(this.aranat2.facedown).toBe(true);
            expect(this.dispatch2.facedown).toBe(true);
            expect(this.season2.facedown).toBe(true);
            expect(this.mine2.facedown).toBe(true);
            expect(this.storehouse2.facedown).toBe(true);
            expect(this.favorable2.facedown).toBe(true);

            expect(this.getChatLogs(5)).toContain('player1 plays Dance of Chikushō-dō to have player2 place 2 cards in each unbroken province they control');
        });

        it('should put 2 cards in each of their unbroken provinces - both', function() {
            this.player1.clickCard(this.dance);
            this.player1.clickPrompt('player1 and player2');

            expect(this.aranat.location).toBe('province 1');
            expect(this.dispatch.location).toBe('province 1');
            expect(this.season.location).toBe('province 2');
            expect(this.mine.location).toBe('province 2');
            expect(this.storehouse.location).toBe('province 3');
            expect(this.favorable.location).toBe('province 3');
            expect(this.chagatai.location).toBe('province 4');
            expect(this.kageyu.location).toBe('province 4');

            expect(this.aranat.facedown).toBe(true);
            expect(this.dispatch.facedown).toBe(true);
            expect(this.season.facedown).toBe(true);
            expect(this.mine.facedown).toBe(true);
            expect(this.storehouse.facedown).toBe(true);
            expect(this.favorable.facedown).toBe(true);
            expect(this.chagatai.facedown).toBe(true);
            expect(this.kageyu.facedown).toBe(true);

            expect(this.aranat2.location).toBe('province 1');
            expect(this.dispatch2.location).toBe('province 1');
            expect(this.season2.location).toBe('province 3');
            expect(this.mine2.location).toBe('province 3');
            expect(this.storehouse2.location).toBe('province 4');
            expect(this.favorable2.location).toBe('province 4');
            expect(this.chagatai2.location).toBe('dynasty deck');
            expect(this.kageyu2.location).toBe('dynasty deck');

            expect(this.aranat2.facedown).toBe(true);
            expect(this.dispatch2.facedown).toBe(true);
            expect(this.season2.facedown).toBe(true);
            expect(this.mine2.facedown).toBe(true);
            expect(this.storehouse2.facedown).toBe(true);
            expect(this.favorable2.facedown).toBe(true);

            expect(this.getChatLogs(5)).toContain('player1 plays Dance of Chikushō-dō to have player1 and player2 place 2 cards in each unbroken province they control');
        });

        it('should work if you deck yourself', function() {
            let cards1 = this.player1.player.getDynastyCardsInProvince('province 1').length;
            let cards2 = this.player1.player.getDynastyCardsInProvince('province 2').length;
            let cards3 = this.player1.player.getDynastyCardsInProvince('province 3').length;
            let cards4 = this.player1.player.getDynastyCardsInProvince('province 4').length;

            this.player1.reduceDeckToNumber('dynasty deck', 5);
            this.player1.moveCard(this.dojiWhisperer, 'dynasty discard pile');
            this.player1.moveCard(this.yoshi, 'dynasty discard pile');
            this.player1.moveCard(this.toshimoko, 'dynasty discard pile');
            this.player1.moveCard(this.kageyu, 'dynasty discard pile');
            this.player1.moveCard(this.chagatai, 'dynasty discard pile');

            this.player1.clickCard(this.dance);
            this.player1.clickPrompt('player1');

            expect(this.player1.player.getDynastyCardsInProvince('province 1').length).toBe(cards1 + 2);
            expect(this.player1.player.getDynastyCardsInProvince('province 2').length).toBe(cards2 + 2);
            expect(this.player1.player.getDynastyCardsInProvince('province 3').length).toBe(cards3 + 2);
            expect(this.player1.player.getDynastyCardsInProvince('province 4').length).toBe(cards4 + 2);

            expect(this.getChatLogs(10)).toContain('player1 plays Dance of Chikushō-dō to have player1 place 2 cards in each unbroken province they control');
            expect(this.getChatLogs(10)).toContain('player1\'s dynasty deck has run out of cards, so they lose 5 honor');
            expect(this.getChatLogs(10)).toContain('player1 is shuffling their dynasty deck');
        });
    });
});
