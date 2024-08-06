describe('Yatakabune Port', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['isawa-tadaka'],
                    hand: ['a-new-name']
                },
                player2: {
                    provinces: ['yatakabune-port']
                }
            });

            this.isawaTadaka = this.player1.findCardByName('isawa-tadaka');
            this.ann = this.player1.findCardByName('a-new-name');

            this.port = this.player2.findCardByName('yatakabune-port');
        });

        it('should claim favor when broken', function () {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.isawaTadaka],
                defenders: [],
                province: this.port,
                type: 'military'
            });

            this.noMoreActions();
            expect(this.player2).toHavePrompt('Triggered Abilities');
            expect(this.player2).toBeAbleToSelect(this.port);

            this.player2.clickCard(this.port);
            this.player2.clickPrompt('military');
            expect(this.player2.player.imperialFavor).toBe('military');
            expect(this.getChatLogs(10)).toContain("player2 claims the Emperor's military favor!");
            expect(this.getChatLogs(10)).toContain("player2 uses Yatakabune Port to claim the Emperor's favor");
        });
    });
});
