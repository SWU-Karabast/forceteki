describe('Kakita Rusumi', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['wandering-ronin']
                },
                player2: {
                    inPlay: ['kakita-rusumi'],
                    dynastyDiscard: [
                        'brash-samurai',
                        'paragon-of-grace',
                        'doji-whisperer',
                        'otomo-sycophant',
                        'imperial-storehouse'
                    ]
                }
            });

            this.ronin = this.player1.findCardByName('wandering-ronin');

            this.player2.reduceDeckToNumber('dynasty deck', 0);

            this.storehouse = this.player2.moveCard('imperial-storehouse', 'dynasty deck');
            this.sycophant = this.player2.moveCard('otomo-sycophant', 'dynasty deck');
            this.whisperer = this.player2.moveCard('doji-whisperer', 'dynasty deck');
            this.paragon = this.player2.moveCard('paragon-of-grace', 'dynasty deck');
            this.brash = this.player2.moveCard('brash-samurai', 'dynasty deck');

            this.rusumi = this.player2.findCardByName('kakita-rusumi');
        });

        describe('not during conflicts', function () {
            it('should not work outside of a conflict', function () {
                this.player1.pass();
                expect(this.player2).toHavePrompt('Action Window');

                this.player2.clickCard(this.rusumi);
                expect(this.player2).toHavePrompt('Action Window');
            });
        });

        describe('while attacking', function () {
            beforeEach(function () {
                this.player1.pass();
                this.player2.pass();
                this.player1.passConflict();
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.rusumi],
                    defenders: []
                });
                this.player1.pass();
            });

            it('should not work while attacking', function () {
                expect(this.player2).toHavePrompt('Conflict Action Window');

                this.player2.clickCard(this.rusumi);
                expect(this.player2).toHavePrompt('Conflict Action Window');
            });
        });

        describe('while defending', function () {
            beforeEach(function () {
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.ronin],
                    defenders: []
                });
            });

            it('should search your top 4 cards', function () {
                this.player2.clickCard(this.rusumi);
                expect(this.player2).toHavePrompt('Choose a character to put into play');
                expect(this.player2).toHavePromptButton('Brash Samurai');
                expect(this.player2).toHaveDisabledPromptButton('Paragon of Grace');
                expect(this.player2).toHaveDisabledPromptButton('Otomo Sycophant');
                expect(this.player2).toHavePromptButton('Doji Whisperer');
                expect(this.player2).toHavePromptButton('Take nothing');
            });

            it('should put the chosen character into the conflict', function () {
                this.player2.clickCard(this.rusumi);
                this.player2.clickPrompt('Doji Whisperer');
                expect(this.game.currentConflict.defenders).toContain(this.whisperer);
                expect(this.whisperer.isHonored).toBe(false);
            });

            it('should put the chosen character into the conflict honored when rusumi is honored', function () {
                this.rusumi.honor();

                this.player2.clickCard(this.rusumi);
                this.player2.clickPrompt('Doji Whisperer');
                expect(this.game.currentConflict.defenders).toContain(this.whisperer);
                expect(this.whisperer.isHonored).toBe(true);
            });

            it('chat messages', function () {
                this.player2.clickCard(this.rusumi);
                this.player2.clickPrompt('Doji Whisperer');

                expect(this.getChatLogs(6)).toContain(
                    'player2 uses Kakita Rusumi to search their dynasty deck for a character to put into play'
                );
                expect(this.getChatLogs(6)).toContain('player2 puts Doji Whisperer into play ordinary');
            });

            it('chat messages - taking nothing', function () {
                this.player2.clickCard(this.rusumi);
                this.player2.clickPrompt('Take nothing');

                expect(this.getChatLogs(6)).toContain(
                    'player2 uses Kakita Rusumi to search their dynasty deck for a character to put into play'
                );
                expect(this.getChatLogs(6)).toContain('player2 takes nothing');
            });

            it('should shuffle your dynasty deck', function () {
                this.player2.clickCard(this.rusumi);
                this.player2.clickPrompt('Doji Whisperer');
                expect(this.getChatLogs(6)).toContain('player2 is shuffling their dynasty deck');
            });

            it('should discard the character at the end of the conflict', function () {
                this.player2.clickCard(this.rusumi);
                this.player2.clickPrompt('Doji Whisperer');
                expect(this.game.currentConflict.defenders).toContain(this.whisperer);
                expect(this.whisperer.isHonored).toBe(false);

                this.noMoreActions();
                this.player1.clickPrompt("Don't Resolve");
                expect(this.whisperer.location).toBe('dynasty discard pile');
                expect(this.getChatLogs(5)).toContain(
                    "Doji Whisperer is discarded from play due to Kakita Rusumi's effect"
                );
            });
        });
    });
});