describe('Deserted Shrine', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['akodo-kage'],
                    hand: ['assassination', 'ambush', 'banzai', 'blackmail', 'castigated', 'censure', 'charge', 'chikara', 'compass', 'desolation', 'dispatch'],
                    dynastyDiscard: ['doji-challenger', 'doji-diplomat', 'doji-gift-giver', 'doji-hotaru', 'doji-kuwanan', 'doji-kuzunobu', 'doji-shigeru', 'doji-shizue', 'eager-scout', 'aranat', 'fire-and-oil', 'contested-countryside']
                },
                player2: {
                    provinces: ['deserted-shrine'],
                    hand: ['assassination', 'ambush', 'banzai', 'blackmail', 'castigated', 'censure', 'charge', 'chikara', 'compass', 'desolation', 'dispatch'],
                    dynastyDiscard: ['doji-challenger', 'doji-diplomat', 'doji-gift-giver', 'doji-hotaru', 'doji-kuwanan', 'doji-kuzunobu', 'doji-shigeru', 'doji-shizue', 'eager-scout', 'aranat', 'fire-and-oil']
                }
            });
            this.akodoKage = this.player1.findCardByName('akodo-kage');
            this.shrine = this.player2.findCardByName('deserted-shrine');
            this.countryside = this.player1.findCardByName('contested-countryside');
            this.player1.placeCardInProvince(this.countryside, 'province 1');
            this.countryside.facedown = true;

            this.c = [];
            this.c.push([this.player1.findCardByName('assassination'), this.player2.findCardByName('assassination')]);
            this.c.push([this.player1.findCardByName('ambush'), this.player2.findCardByName('ambush')]);
            this.c.push([this.player1.findCardByName('banzai'), this.player2.findCardByName('banzai')]);
            this.c.push([this.player1.findCardByName('blackmail'), this.player2.findCardByName('blackmail')]);
            this.c.push([this.player1.findCardByName('castigated'), this.player2.findCardByName('castigated')]);
            this.c.push([this.player1.findCardByName('censure'), this.player2.findCardByName('censure')]);
            this.c.push([this.player1.findCardByName('charge'), this.player2.findCardByName('charge')]);
            this.c.push([this.player1.findCardByName('chikara'), this.player2.findCardByName('chikara')]);
            this.c.push([this.player1.findCardByName('compass'), this.player2.findCardByName('compass')]);
            this.c.push([this.player1.findCardByName('desolation'), this.player2.findCardByName('desolation')]);
            this.c.push([this.player1.findCardByName('dispatch'), this.player2.findCardByName('dispatch')]);

            this.d = [];
            this.d.push([this.player1.findCardByName('doji-challenger'), this.player2.findCardByName('doji-challenger')]);
            this.d.push([this.player1.findCardByName('doji-diplomat'), this.player2.findCardByName('doji-diplomat')]);
            this.d.push([this.player1.findCardByName('doji-gift-giver'), this.player2.findCardByName('doji-gift-giver')]);
            this.d.push([this.player1.findCardByName('doji-hotaru'), this.player2.findCardByName('doji-hotaru')]);
            this.d.push([this.player1.findCardByName('doji-kuwanan'), this.player2.findCardByName('doji-kuwanan')]);
            this.d.push([this.player1.findCardByName('doji-kuzunobu'), this.player2.findCardByName('doji-kuzunobu')]);
            this.d.push([this.player1.findCardByName('doji-shigeru'), this.player2.findCardByName('doji-shigeru')]);
            this.d.push([this.player1.findCardByName('doji-shizue'), this.player2.findCardByName('doji-shizue')]);
            this.d.push([this.player1.findCardByName('eager-scout'), this.player2.findCardByName('eager-scout')]);
            this.d.push([this.player1.findCardByName('aranat'), this.player2.findCardByName('aranat')]);
            this.d.push([this.player1.findCardByName('fire-and-oil'), this.player2.findCardByName('fire-and-oil')]);

            this.player1.reduceDeckToNumber('conflict deck', 0);
            this.player1.reduceDeckToNumber('dynasty deck', 0);
            this.player2.reduceDeckToNumber('conflict deck', 0);
            this.player2.reduceDeckToNumber('dynasty deck', 0);

            this.d.forEach(cards => {
                this.player1.moveCard(cards[0], 'dynasty deck');
                this.player2.moveCard(cards[1], 'dynasty deck');
            });
            this.c.forEach(cards => {
                this.player1.moveCard(cards[0], 'conflict deck');
                this.player2.moveCard(cards[1], 'conflict deck');
            });
        });

        it('should trigger when revealed', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.akodoKage],
                type: 'political',
                province: this.shrine
            });
            expect(this.player2).toHavePrompt('Triggered Abilities');
            expect(this.player2).toBeAbleToSelect(this.shrine);
        });

        it('should let you select a deck', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.akodoKage],
                type: 'political',
                province: this.shrine
            });
            this.player2.clickCard(this.shrine);

            expect(this.player2).toHavePromptButton('player1\'s Dynasty');
            expect(this.player2).toHavePromptButton('player1\'s Conflict');
            expect(this.player2).toHavePromptButton('player2\'s Dynasty');
            expect(this.player2).toHavePromptButton('player2\'s Conflict');
        });

        it('should not let you select a deck that is empty', function() {
            this.player1.reduceDeckToNumber('conflict deck', 0);
            this.player2.reduceDeckToNumber('dynasty deck', 0);

            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.akodoKage],
                type: 'political',
                province: this.shrine
            });
            this.player2.clickCard(this.shrine);

            expect(this.player2).toHavePromptButton('player1\'s Dynasty');
            expect(this.player2).not.toHavePromptButton('player1\'s Conflict');
            expect(this.player2).not.toHavePromptButton('player2\'s Dynasty');
            expect(this.player2).toHavePromptButton('player2\'s Conflict');
        });

        it('should discard the top 10 cards - player1 dynasty', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.akodoKage],
                type: 'political',
                province: this.shrine
            });
            this.player2.clickCard(this.shrine);

            let size = this.player1.player.dynastyDiscardPile.size();
            this.player2.clickPrompt('player1\'s Dynasty');
            expect(this.player1.player.dynastyDiscardPile.size()).toBe(size + 10);
            this.d.forEach((cards, i) => {
                if(i === 0) {
                    expect(cards[0].location).toBe('dynasty deck');
                } else {
                    expect(cards[0].location).toBe('dynasty discard pile');
                }
            });
            expect(this.getChatLogs(5)).toContain('player2 uses Deserted Shrine to discard the top 10 cards of player1\'s Dynasty deck');
        });

        it('should discard the top 10 cards - player1 conflict', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.akodoKage],
                type: 'political',
                province: this.shrine
            });
            this.player2.clickCard(this.shrine);

            let size = this.player1.player.conflictDiscardPile.size();
            this.player2.clickPrompt('player1\'s Conflict');
            expect(this.player1.player.conflictDiscardPile.size()).toBe(size + 10);
            this.c.forEach((cards, i) => {
                if(i === 0) {
                    expect(cards[0].location).toBe('conflict deck');
                } else {
                    expect(cards[0].location).toBe('conflict discard pile');
                }
            });
        });

        it('should discard the top 10 cards - player2 dynasty', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.akodoKage],
                type: 'political',
                province: this.shrine
            });
            this.player2.clickCard(this.shrine);

            let size = this.player2.player.dynastyDiscardPile.size();
            this.player2.clickPrompt('player2\'s Dynasty');
            expect(this.player2.player.dynastyDiscardPile.size()).toBe(size + 10);
            this.d.forEach((cards, i) => {
                if(i === 0) {
                    expect(cards[1].location).toBe('dynasty deck');
                } else {
                    expect(cards[1].location).toBe('dynasty discard pile');
                }
            });
        });

        it('should discard the top 10 cards - player2 conflict', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.akodoKage],
                type: 'political',
                province: this.shrine
            });
            this.player2.clickCard(this.shrine);

            let size = this.player2.player.conflictDiscardPile.size();
            this.player2.clickPrompt('player2\'s Conflict');
            expect(this.player2.player.conflictDiscardPile.size()).toBe(size + 10);
            this.c.forEach((cards, i) => {
                if(i === 0) {
                    expect(cards[1].location).toBe('conflict deck');
                } else {
                    expect(cards[1].location).toBe('conflict discard pile');
                }
            });
        });

        it('Coco - names should be right - player2 conflict', function() {
            this.countryside.facedown = false;
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.akodoKage],
                type: 'political',
                province: this.shrine
            });
            expect(this.player1).toHavePrompt('Triggered Abilities');
            this.player1.clickCard(this.shrine);

            let size = this.player2.player.conflictDiscardPile.size();
            this.player1.clickPrompt('player2\'s Conflict');
            expect(this.player2.player.conflictDiscardPile.size()).toBe(size + 10);
            this.c.forEach((cards, i) => {
                if(i === 0) {
                    expect(cards[1].location).toBe('conflict deck');
                } else {
                    expect(cards[1].location).toBe('conflict discard pile');
                }
            });
        });

        it('Coco - names should be right - player1 dynasty', function() {
            this.countryside.facedown = false;
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.akodoKage],
                type: 'political',
                province: this.shrine
            });
            expect(this.player1).toHavePrompt('Triggered Abilities');
            this.player1.clickCard(this.shrine);

            let size = this.player1.player.dynastyDiscardPile.size();
            this.player1.clickPrompt('player1\'s Dynasty');
            expect(this.player1.player.dynastyDiscardPile.size()).toBe(size + 10);
            this.d.forEach((cards, i) => {
                if(i === 0) {
                    expect(cards[0].location).toBe('dynasty deck');
                } else {
                    expect(cards[0].location).toBe('dynasty discard pile');
                }
            });
        });
    });
});
