const { GameModes } = require('../../../../build/GameModes');

describe('Rally Keyword', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'setup',
                player1: {
                    inPlay: ['daidoji-nerishma'],
                    dynastyDeck: [],
                    dynastyDiscard: ['a-season-of-war', 'doji-challenger', 'prodigy-of-the-waves', 'a-season-of-war', 'hida-kisada']
                },
                player2: {
                    inPlay: []
                }
            });

            this.season = this.player1.filterCardsByName('a-season-of-war')[0];
            this.season2 = this.player1.filterCardsByName('a-season-of-war')[1];
            this.nerishma = this.player1.findCardByName('daidoji-nerishma');
            this.challenger = this.player1.findCardByName('doji-challenger');
            this.prodigy = this.player1.findCardByName('prodigy-of-the-waves');
            this.kisada = this.player1.findCardByName('hida-kisada');

            this.shameful = this.player1.findCardByName('shameful-display', 'province 1');
            this.shameful.facedown = true;
            this.player1.placeCardInProvince(this.season, 'province 1');
            this.season.facedown = true;
        });

        it('when revealed, should also move the top card of the dynasty deck to the same province', function() {
            this.keepDynasty();
            this.player1.reduceDeckToNumber('dynasty deck', 0);
            this.player1.moveCard(this.challenger, 'dynasty deck');
            this.player1.moveCard(this.prodigy, 'dynasty deck');
            this.player1.moveCard(this.season2, 'dynasty deck');
            this.player1.moveCard(this.kisada, 'dynasty deck');

            this.keepConflict();

            expect(this.season.location).toBe('province 1');
            expect(this.season.facedown).toBe(false);
            expect(this.kisada.location).toBe('province 1');
            expect(this.kisada.facedown).toBe(false);
            expect(this.getChatLogs(10)).toContain('player1 places Hida Kisada faceup in province 1 due to A Season of War\'s Rally');
        });

        it('message test - revealed province', function() {
            this.shameful.facedown = false;
            this.keepDynasty();
            this.player1.reduceDeckToNumber('dynasty deck', 0);
            this.player1.moveCard(this.prodigy, 'dynasty deck');
            this.player1.moveCard(this.season2, 'dynasty deck');
            this.player1.moveCard(this.kisada, 'dynasty deck');
            this.player1.moveCard(this.challenger, 'dynasty deck');

            this.keepConflict();

            expect(this.season.location).toBe('province 1');
            expect(this.season.facedown).toBe(false);
            expect(this.challenger.location).toBe('province 1');
            expect(this.challenger.facedown).toBe(false);
            expect(this.getChatLogs(10)).toContain('player1 places Doji Challenger faceup in Shameful Display due to A Season of War\'s Rally');
        });

        it('when chaining, should do nothing', function() {
            this.keepDynasty();
            this.player1.reduceDeckToNumber('dynasty deck', 0);
            this.player1.moveCard(this.prodigy, 'dynasty deck');
            this.player1.moveCard(this.kisada, 'dynasty deck');
            this.player1.moveCard(this.challenger, 'dynasty deck');
            this.player1.moveCard(this.season2, 'dynasty deck');

            this.keepConflict();

            expect(this.season.location).toBe('province 1');
            expect(this.season.facedown).toBe(false);
            expect(this.season2.location).toBe('province 1');
            expect(this.season2.facedown).toBe(false);

            expect(this.prodigy.location).toBe('dynasty deck');
            expect(this.kisada.location).toBe('dynasty deck');
            expect(this.challenger.location).toBe('dynasty deck');

            expect(this.getChatLogs(10)).toContain('player1 places A Season of War faceup in province 1 due to A Season of War\'s Rally');
        });

        it('when revealed via card effect, should trigger', function() {
            this.keepDynasty();
            this.player1.reduceDeckToNumber('dynasty deck', 0);
            this.player1.moveCard(this.prodigy, 'dynasty deck');
            this.player1.moveCard(this.kisada, 'dynasty deck');
            this.player1.moveCard(this.challenger, 'dynasty deck');
            this.player1.moveCard(this.season2, 'dynasty deck');

            this.keepConflict();

            expect(this.season.location).toBe('province 1');
            expect(this.season.facedown).toBe(false);
            expect(this.season2.location).toBe('province 1');
            expect(this.season2.facedown).toBe(false);

            expect(this.prodigy.location).toBe('dynasty deck');
            expect(this.kisada.location).toBe('dynasty deck');
            expect(this.challenger.location).toBe('dynasty deck');

            expect(this.getChatLogs(10)).toContain('player1 places A Season of War faceup in province 1 due to A Season of War\'s Rally');

            this.season.facedown = true;
            this.season.leavesPlay();
            this.game.checkGameState(true);
            this.player1.clickCard(this.nerishma);
            this.player1.clickCard(this.season);

            expect(this.getChatLogs(10)).toContain('player1 places Doji Challenger faceup in province 1 due to A Season of War\'s Rally');

            expect(this.season.location).toBe('province 1');
            expect(this.season.facedown).toBe(false);
            expect(this.challenger.location).toBe('province 1');
            expect(this.challenger.facedown).toBe(false);
        });

        it('should work if your deck is empty', function() {
            this.keepDynasty();
            this.player1.reduceDeckToNumber('dynasty deck', 0);
            this.keepConflict();

            expect(this.season.location).toBe('province 1');
            expect(this.season.facedown).toBe(false);
            expect(this.player1.player.getDynastyCardsInProvince('province 1').length).toBe(2);
            expect(this.getChatLogs(10)).toContain('player1 places a card faceup in province 1 due to A Season of War\'s Rally');
            expect(this.getChatLogs(10)).toContain('player1\'s dynasty deck has run out of cards, so they lose 5 honor');
            expect(this.getChatLogs(10)).toContain('player1 is shuffling their dynasty deck');
        });

        it('when an event is revealed outside of the dynasty phase, should still trigger', function() {
            this.keepDynasty();
            this.player1.reduceDeckToNumber('dynasty deck', 0);
            this.player1.moveCard(this.prodigy, 'dynasty deck');
            this.player1.moveCard(this.kisada, 'dynasty deck');
            this.player1.moveCard(this.challenger, 'dynasty deck');
            this.player1.moveCard(this.season2, 'dynasty deck');

            this.keepConflict();

            expect(this.season.location).toBe('province 1');
            expect(this.season.facedown).toBe(false);
            expect(this.season2.location).toBe('province 1');
            expect(this.season2.facedown).toBe(false);

            expect(this.prodigy.location).toBe('dynasty deck');
            expect(this.kisada.location).toBe('dynasty deck');
            expect(this.challenger.location).toBe('dynasty deck');

            expect(this.getChatLogs(10)).toContain('player1 places A Season of War faceup in province 1 due to A Season of War\'s Rally');

            this.season.facedown = true;
            this.season.leavesPlay();
            this.game.checkGameState(true);

            this.noMoreActions();
            this.player1.clickPrompt('1');
            this.player2.clickPrompt('1');

            this.player1.clickCard(this.nerishma);
            this.player1.clickCard(this.season);

            expect(this.getChatLogs(10)).toContain('player1 places Doji Challenger faceup in province 1 due to A Season of War\'s Rally');

            expect(this.season.location).toBe('province 1');
            expect(this.season.facedown).toBe(false);
            expect(this.challenger.location).toBe('province 1');
            expect(this.challenger.facedown).toBe(false);
        });
    });
});

describe('Rally Keyword - Jade Edict', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'setup',
                player1: {
                    inPlay: ['daidoji-nerishma'],
                    dynastyDeck: [],
                    dynastyDiscard: ['a-season-of-war', 'doji-challenger', 'prodigy-of-the-waves', 'a-season-of-war', 'hida-kisada']
                },
                player2: {
                    inPlay: []
                },
                gameMode: GameModes.JadeEdict
            });

            this.season = this.player1.filterCardsByName('a-season-of-war')[0];
            this.season2 = this.player1.filterCardsByName('a-season-of-war')[1];
            this.nerishma = this.player1.findCardByName('daidoji-nerishma');
            this.challenger = this.player1.findCardByName('doji-challenger');
            this.prodigy = this.player1.findCardByName('prodigy-of-the-waves');
            this.kisada = this.player1.findCardByName('hida-kisada');

            this.shameful = this.player1.findCardByName('shameful-display', 'province 1');
            this.shameful.facedown = true;
            this.player1.placeCardInProvince(this.season, 'province 1');
            this.season.facedown = true;
        });

        it('when revealed, should print error message', function() {
            this.keepDynasty();
            this.player1.reduceDeckToNumber('dynasty deck', 0);
            this.player1.moveCard(this.challenger, 'dynasty deck');
            this.player1.moveCard(this.prodigy, 'dynasty deck');
            this.player1.moveCard(this.season2, 'dynasty deck');
            this.player1.moveCard(this.kisada, 'dynasty deck');

            this.keepConflict();

            expect(this.season.location).toBe('province 1');
            expect(this.season.facedown).toBe(false);
            expect(this.kisada.location).toBe('dynasty deck');
            expect(this.kisada.facedown).toBe(false);
            expect(this.getChatLogs(10)).toContain('A Season of War\'s Rally effect is suppressed due to the power of the Jade Edict!');
        });

        it('when revealed via card effect, should print error message', function() {
            this.keepDynasty();
            this.player1.reduceDeckToNumber('dynasty deck', 0);
            this.player1.moveCard(this.prodigy, 'dynasty deck');
            this.player1.moveCard(this.kisada, 'dynasty deck');
            this.player1.moveCard(this.challenger, 'dynasty deck');
            this.player1.moveCard(this.season2, 'dynasty deck');

            this.keepConflict();

            expect(this.season.location).toBe('province 1');
            expect(this.season.facedown).toBe(false);
            expect(this.season2.location).toBe('dynasty deck');
            expect(this.prodigy.location).toBe('dynasty deck');
            expect(this.kisada.location).toBe('dynasty deck');
            expect(this.challenger.location).toBe('dynasty deck');

            expect(this.getChatLogs(10)).toContain('A Season of War\'s Rally effect is suppressed due to the power of the Jade Edict!');

            this.season.facedown = true;
            this.season.leavesPlay();
            this.game.checkGameState(true);
            this.player1.clickCard(this.nerishma);
            this.player1.clickCard(this.season);

            expect(this.getChatLogs(10)).toContain('A Season of War\'s Rally effect is suppressed due to the power of the Jade Edict!');

            expect(this.season.location).toBe('province 1');
            expect(this.season.facedown).toBe(false);
            expect(this.challenger.location).toBe('dynasty deck');
            expect(this.challenger.facedown).toBe(false);
        });

        it('when an event is revealed outside of the dynasty phase, should still print error message', function() {
            this.keepDynasty();
            this.player1.reduceDeckToNumber('dynasty deck', 0);
            this.player1.moveCard(this.prodigy, 'dynasty deck');
            this.player1.moveCard(this.kisada, 'dynasty deck');
            this.player1.moveCard(this.challenger, 'dynasty deck');
            this.player1.moveCard(this.season2, 'dynasty deck');

            this.keepConflict();

            expect(this.season.location).toBe('province 1');
            expect(this.season.facedown).toBe(false);
            expect(this.season2.location).toBe('dynasty deck');
            expect(this.season2.facedown).toBe(false);

            expect(this.prodigy.location).toBe('dynasty deck');
            expect(this.kisada.location).toBe('dynasty deck');
            expect(this.challenger.location).toBe('dynasty deck');

            expect(this.getChatLogs(10)).toContain('A Season of War\'s Rally effect is suppressed due to the power of the Jade Edict!');

            this.season.facedown = true;
            this.season.leavesPlay();
            this.game.checkGameState(true);

            this.noMoreActions();
            this.player1.clickPrompt('1');
            this.player2.clickPrompt('1');

            this.player1.clickCard(this.nerishma);
            this.player1.clickCard(this.season);

            expect(this.getChatLogs(10)).toContain('A Season of War\'s Rally effect is suppressed due to the power of the Jade Edict!');

            expect(this.season.location).toBe('province 1');
            expect(this.season.facedown).toBe(false);
            expect(this.challenger.location).toBe('dynasty deck');
            expect(this.challenger.facedown).toBe(false);
        });
    });
});
