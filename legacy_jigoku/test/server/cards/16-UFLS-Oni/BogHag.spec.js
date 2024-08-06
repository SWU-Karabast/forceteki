describe('Bog Hag', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['bog-hag', 'doji-whisperer']
                },
                player2: {
                    inPlay: ['daidoji-uji', 'marauding-oni'],
                    hand: ['assassination', 'ambush', 'banzai', 'blackmail', 'castigated', 'censure', 'charge', 'chikara', 'compass', 'desolation', 'dispatch']
                }
            });
            this.hag = this.player1.findCardByName('bog-hag');
            this.whisperer = this.player1.findCardByName('doji-whisperer');
            this.daidojiUji = this.player2.findCardByName('daidoji-uji');
            this.maraudingOni = this.player2.findCardByName('marauding-oni');


            this.c = [];
            this.c.push(this.player2.findCardByName('assassination'));
            this.c.push(this.player2.findCardByName('ambush'));
            this.c.push(this.player2.findCardByName('banzai'));
            this.c.push(this.player2.findCardByName('blackmail'));
            this.c.push(this.player2.findCardByName('castigated'));
            this.c.push(this.player2.findCardByName('censure'));
            this.c.push(this.player2.findCardByName('charge'));
            this.c.push(this.player2.findCardByName('chikara'));
            this.c.push(this.player2.findCardByName('compass'));
            this.c.push(this.player2.findCardByName('desolation'));
            this.c.push(this.player2.findCardByName('dispatch'));

            this.player2.reduceDeckToNumber('conflict deck', 0);
            this.c.forEach(card => {
                this.player2.moveCard(card, 'conflict deck');
            });

            this.noMoreActions();
        });

        it('should trigger and discard the top 8 cards of your opponent\'s conflict deck after winning a conflict', function () {
            this.initiateConflict({
                attackers: [this.hag],
                defenders: []
            });
            this.player2.pass();
            this.player1.pass();

            let length = this.player2.conflictDeck.length;

            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.hag);
            this.player1.clickCard(this.hag);

            this.c.forEach((card, i) => {
                if(i < this.c.length - 8) {
                    expect(card.location).toBe('conflict deck');
                } else {
                    expect(card.location).toBe('conflict discard pile');
                }
            });
            expect(this.player2.conflictDeck.length).toBe(length - 8);
            expect(this.getChatLogs(5)).toContain('player1 uses Bog Hag to discard the top 8 cards of player2\'s conflict deck');
        });

        it('should not trigger if not participating', function () {
            this.initiateConflict({
                attackers: [this.whisperer],
                defenders: [],
                type: 'political'
            });
            this.player2.pass();
            this.player1.pass();
            expect(this.player1).not.toHavePrompt('Triggered Abilities');
        });

        it('should not trigger after losing the conflict', function () {
            this.initiateConflict({
                attackers: [this.hag],
                defenders: [this.daidojiUji]
            });
            this.player2.pass();
            this.player1.pass();
            expect(this.player1).not.toHavePrompt('Triggered Abilities');
        });
    });
});
