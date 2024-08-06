describe('Endless Ranks', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['endless-ranks', 'doji-whisperer'],
                    dynastyDiscard: ['kakita-toshimoko', 'imperial-storehouse', 'isawa-tadaka'],
                    conflictDiscard: ['isawa-tadaka-2']
                },
                player2: {
                    inPlay: ['daidoji-uji']
                }
            });
            this.ranks = this.player1.findCardByName('endless-ranks');
            this.whisperer = this.player1.findCardByName('doji-whisperer');
            this.daidojiUji = this.player2.findCardByName('daidoji-uji');

            this.toshimoko = this.player1.findCardByName('kakita-toshimoko');
            this.storehouse = this.player1.findCardByName('imperial-storehouse');
            this.tadaka = this.player1.findCardByName('isawa-tadaka');
            this.tadaka2 = this.player1.findCardByName('isawa-tadaka-2');
            this.noMoreActions();
        });

        it('should trigger and bow an opponent\'s character with equal to or lower military skill after winning a conflict', function () {
            this.initiateConflict({
                attackers: [this.ranks],
                defenders: []
            });
            let deckSize = this.player1.dynastyDeck.length;
            this.player2.pass();
            this.player1.pass();
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.ranks);
            this.player1.clickCard(this.ranks);
            expect(this.player1).not.toBeAbleToSelect(this.whisperer);
            expect(this.player1).toBeAbleToSelect(this.toshimoko);
            expect(this.player1).not.toBeAbleToSelect(this.storehouse);
            expect(this.player1).toBeAbleToSelect(this.tadaka);
            expect(this.player1).not.toBeAbleToSelect(this.tadaka2);
            this.player1.clickCard(this.toshimoko);

            expect(this.player1.dynastyDeck.length).toBe(deckSize + 1);
            expect(this.player1.dynastyDeck[0]).toBe(this.toshimoko);
            expect(this.getChatLogs(5)).toContain('player1 uses Endless Ranks to move Kakita Toshimoko to player1\'s dynasty deck');
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
                attackers: [this.ranks],
                defenders: [this.daidojiUji]
            });
            this.player2.pass();
            this.player1.pass();
            expect(this.player1).not.toHavePrompt('Triggered Abilities');
        });
    });
});
