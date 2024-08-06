describe('Caverns of Stolen Hope', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['aggressive-moto', 'worldly-shiotome', 'utaku-tetsuko'],
                    hand: ['i-can-swim', 'way-of-the-scorpion']
                },
                player2: {
                    provinces: ['caverns-of-stolen-hope']
                }
            });

            this.aggressiveMoto = this.player1.findCardByName('aggressive-moto');
            this.wordlyShiotome = this.player1.findCardByName('worldly-shiotome');
            this.tetsuko = this.player1.findCardByName('utaku-tetsuko');

            this.caverns = this.player2.findCardByName('caverns-of-stolen-hope', 'province 1');
        });

        it('discards random cards from attacker hand', function () {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.aggressiveMoto, this.wordlyShiotome],
                province: this.caverns
            });

            expect(this.player2).toHavePrompt('Any reactions?');

            this.player2.clickCard(this.caverns);
            expect(this.getChatLogs(3)).toContain(
                'player2 uses Caverns of Stolen Hope to make player1 discard 2 cards at random'
            );
        });
    });
});
