describe('Second Wind', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['matsu-berserker'],
                    dynastyDiscard: ['bayushi-shoju']
                },
                player2: {
                    hand: ['second-wind'],
                    dynastyDiscard: ['master-tactician', 'kakita-toshimoko', 'daidoji-kageyu', 'moto-chagatai']
                }
            });

            this.berserker = this.player1.findCardByName('matsu-berserker');
            this.shoju = this.player1.findCardByName('bayushi-shoju');

            this.secondWind = this.player2.findCardByName('second-wind');
            this.masterTactician = this.player2.findCardByName('master-tactician');
            this.toshimoko = this.player2.findCardByName('kakita-toshimoko');
            this.kageyu = this.player2.findCardByName('daidoji-kageyu');
            this.chagatai = this.player2.findCardByName('moto-chagatai');

            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.berserker],
                defenders: [],
                type: 'military'
            });
        });

        it('discards 4, then put a non-unique in play', function () {
            this.player2.clickCard(this.secondWind);
            expect(this.getChatLogs(10)).toContain(
                'player2 plays Second Wind to find a character to put into play. player2 discards Adept of the Waves, Adept of the Waves, Adept of the Waves and Adept of the Waves'
            );
            expect(this.player2).toHavePrompt('Choose a character');
            expect(this.player2).toBeAbleToSelect(this.masterTactician);
            expect(this.player2).not.toBeAbleToSelect(this.toshimoko);
            expect(this.player2).not.toBeAbleToSelect(this.kageyu);
            expect(this.player2).not.toBeAbleToSelect(this.chagatai);
            expect(this.player2).not.toBeAbleToSelect(this.shoju);

            this.player2.clickCard(this.masterTactician);
            expect(this.masterTactician.location).toBe('play area');
            expect(this.getChatLogs(10)).toContain(
                "player2 puts Master Tactician into play. Master Tactician will be put on the bottom of the deck if it's still in play by the end of the conflict"
            );
        });

        it('when deck is getting empty, it discards as much as possible, then put a non-unique in play', function () {
            this.player2.reduceDeckToNumber('dynasty deck', 3);

            this.player2.clickCard(this.secondWind);
            expect(this.getChatLogs(10)).toContain(
                'player2 plays Second Wind to find a character to put into play. player2 discards Adept of the Waves, Adept of the Waves and Adept of the Waves'
            );
            expect(this.player2).toHavePrompt('Choose a character');
            expect(this.player2).toBeAbleToSelect(this.masterTactician);
            expect(this.player2).not.toBeAbleToSelect(this.toshimoko);
            expect(this.player2).not.toBeAbleToSelect(this.kageyu);
            expect(this.player2).not.toBeAbleToSelect(this.chagatai);
            expect(this.player2).not.toBeAbleToSelect(this.shoju);

            this.player2.clickCard(this.masterTactician);
            expect(this.masterTactician.location).toBe('play area');
            expect(this.getChatLogs(10)).toContain(
                "player2 puts Master Tactician into play. Master Tactician will be put on the bottom of the deck if it's still in play by the end of the conflict"
            );
        });

        it('should place on the bottom of the deck at the end of the phase', function () {
            this.player2.clickCard(this.secondWind);
            this.player2.clickCard(this.masterTactician);
            this.noMoreActions();
            expect(this.masterTactician.location).toBe('dynasty deck');
        });
    });
});
