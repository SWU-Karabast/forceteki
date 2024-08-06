describe('Shinjo Altansarnai 2', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['shinjo-altansarnai-2'],
                    dynastyDiscard: ['imperial-storehouse', 'moto-youth', 'shinjo-yasamura', 'utaku-tetsuko', 'moto-horde', 'border-rider', 'master-of-the-swift-waves', 'alibi-artist']
                }
            });

            this.player1.reduceDeckToNumber('dynasty deck', 0);

            this.storehouse = this.player1.moveCard('imperial-storehouse', 'dynasty deck');
            this.motoYouth = this.player1.moveCard('moto-youth', 'dynasty deck');
            this.yasamura = this.player1.moveCard('shinjo-yasamura', 'dynasty deck');
            this.tetsuko = this.player1.moveCard('utaku-tetsuko', 'dynasty deck');
            this.horde = this.player1.moveCard('moto-horde', 'dynasty deck');
            this.borderRider = this.player1.moveCard('border-rider', 'dynasty deck');
            this.swiftWaves = this.player1.moveCard('master-of-the-swift-waves', 'dynasty deck');
            this.alibiArtist = this.player1.moveCard('alibi-artist', 'dynasty deck');

            this.alty = this.player1.findCardByName('shinjo-altansarnai-2');
        });

        it('should not work outside of a conflict', function() {
            expect(this.player1).toHavePrompt('Action Window');
            this.player1.clickCard(this.alty);
            expect(this.player1).toHavePrompt('Action Window');
        });

        it('should not work in a pol conflict', function() {
            this.noMoreActions();

            this.initiateConflict({
                attackers: [this.alty],
                defenders: [],
                type: 'political'
            });
            this.player2.pass();
            expect(this.player1).toHavePrompt('Conflict Action Window');
            this.player1.clickCard(this.alty);
            expect(this.player1).toHavePrompt('Conflict Action Window');
        });

        it('should search your top 8 cards', function() {
            this.noMoreActions();

            this.initiateConflict({
                attackers: [this.alty],
                defenders: [],
                type: 'military'
            });
            this.player2.pass();
            this.player1.clickCard(this.alty);
            expect(this.player1).toHavePrompt('Choose a character that costs 3 or less');
            expect(this.player1).toHaveDisabledPromptButton('Imperial Storehouse');
            expect(this.player1).toHaveDisabledPromptButton('Shinjo Yasamura');
            expect(this.player1).toHaveDisabledPromptButton('Alibi Artist');
            expect(this.player1).toHaveDisabledPromptButton('Moto Horde');
            expect(this.player1).toHaveDisabledPromptButton('Utaku Tetsuko');
            expect(this.player1).toHavePromptButton('Moto Youth');
            expect(this.player1).toHavePromptButton('Border Rider');
            expect(this.player1).toHavePromptButton('Master of the Swift Waves');
            expect(this.player1).toHavePromptButton('Don\'t choose a character');
        });

        it('should put the chosen character into the conflict', function() {
            this.noMoreActions();

            this.initiateConflict({
                attackers: [this.alty],
                defenders: [],
                type: 'military'
            });
            this.player2.pass();
            this.player1.clickCard(this.alty);
            this.player1.clickPrompt('Border Rider');
            expect(this.game.currentConflict.attackers).toContain(this.borderRider);
        });

        it('chat messages', function() {
            this.noMoreActions();

            this.initiateConflict({
                attackers: [this.alty],
                defenders: [],
                type: 'military'
            });
            this.player2.pass();
            this.player1.clickCard(this.alty);
            this.player1.clickPrompt('Border Rider');

            expect(this.getChatLogs(6)).toContain('player1 uses Shinjo Altansarnai to search the top 8 cards of their dynasty deck for a character that costs 3 or less and put it into the conflict');
            expect(this.getChatLogs(6)).toContain('player1 chooses to put Border Rider into the conflict');
        });

        it('chat messages - taking nothing', function() {
            this.noMoreActions();

            this.initiateConflict({
                attackers: [this.alty],
                defenders: [],
                type: 'military'
            });
            this.player2.pass();
            this.player1.clickCard(this.alty);
            this.player1.clickPrompt('Don\'t choose a character');

            expect(this.getChatLogs(6)).toContain('player1 uses Shinjo Altansarnai to search the top 8 cards of their dynasty deck for a character that costs 3 or less and put it into the conflict');
            expect(this.getChatLogs(6)).toContain('player1 chooses not to put a character into play');
        });

        it('should shuffle your dynasty deck', function() {
            this.noMoreActions();

            this.initiateConflict({
                attackers: [this.alty],
                defenders: [],
                type: 'military'
            });
            this.player2.pass();
            this.player1.clickCard(this.alty);
            this.player1.clickPrompt('Border Rider');
            expect(this.getChatLogs(6)).toContain('player1 is shuffling their dynasty deck');
        });
    });
});
