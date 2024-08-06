const { GameModes } = require('../../../build/GameModes');

describe('Dynasty - Emerald', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'dynasty',
                player1: {
                    inPlay: ['togashi-mitsu', 'doji-challenger', 'agasha-swordsmith'],
                    hand: ['fine-katana', 'fine-katana', 'a-new-name', 'steward-of-law'],
                    dynastyDiscard: ['imperial-storehouse', 'a-season-of-war']
                },
                player2: {
                    inPlay: ['hantei-sotorii'],
                    hand: ['fine-katana']
                },
                gameMode: GameModes.Emerald
            });

            this.swordsmith = this.player1.findCardByName('agasha-swordsmith');
            this.mitsu = this.player1.findCardByName('togashi-mitsu');
            this.sotorii = this.player2.findCardByName('hantei-sotorii');
            this.challenger = this.player1.findCardByName('doji-challenger');
            this.steward = this.player1.findCardByName('steward-of-law');
            this.imperialStorehouse = this.player1.placeCardInProvince('imperial-storehouse', 'province 1');
            this.seasonOfWar = this.player1.placeCardInProvince('a-season-of-war', 'province 2');

            this.katana1 = this.player1.filterCardsByName('fine-katana')[0];
            this.katana2 = this.player1.filterCardsByName('fine-katana')[1];
            this.katana3 = this.player2.findCardByName('fine-katana');
            this.ann = this.player1.findCardByName('a-new-name');
        });

        it('should not let you play attachments', function () {
            this.player1.clickCard(this.katana1);
            this.player1.clickCard(this.mitsu);
            expect(this.mitsu.attachments).not.toContain(this.katana1);
        });

        it('should not let you play conflict characters', function () {
            this.player1.clickCard(this.steward);
            expect(this.player1).not.toHavePrompt('Choose additional fate');
            expect(this.steward.location).not.toBe('play area');
        });

        it('should not let you trigger Action on characters', function () {
            this.player1.clickCard(this.swordsmith);
            expect(this.player1).not.toHavePrompt('Select a card to reveal');
            expect(this.player1).toHavePrompt('Play cards from provinces');
            expect(this.getChatLogs(5)).not.toContain(
                'player1 uses Agasha Swordsmith to look at the top five cards of their deck'
            );
        });

        it('should not let you trigger Action on holdings', function () {
            this.player1.clickCard(this.imperialStorehouse);
            expect(this.player1).toHavePrompt('Play cards from provinces');
            expect(this.getChatLogs(5)).not.toContain(
                'player1 uses Imperial Storehouse, sacrificing Imperial Storehouse to draw 1 card'
            );
        });

        it('should let you trigger Action on dynasty events', function () {
            this.player1.clickCard(this.seasonOfWar);
            expect(this.getChatLogs(5)).toContain(
                'player1 plays A Season of War to discard all cards in all provinces, and refill each province faceup'
            );
        });
    });
});
