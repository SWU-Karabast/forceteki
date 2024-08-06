describe('Guardians of Rokugan', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['doji-whisperer', 'kakita-toshimoko']
                },
                player2: {
                    inPlay: ['akodo-toturi', 'matsu-berserker', 'doji-kuwanan'],
                    hand: ['guardians-of-rokugan'],
                    dynastyDiscard: ['imperial-storehouse', 'solemn-scholar', 'brash-samurai', 'seventh-tower', 'hida-kisada', 'doji-challenger', 'hida-kisada']
                }
            });
            this.toshimoko = this.player1.findCardByName('kakita-toshimoko');
            this.whisperer = this.player1.findCardByName('doji-whisperer');
            this.toturi = this.player2.findCardByName('akodo-toturi');
            this.kuwanan = this.player2.findCardByName('doji-kuwanan');
            this.berserker = this.player2.findCardByName('matsu-berserker');
            this.guardians = this.player2.findCardByName('guardians-of-rokugan');

            this.tower = this.player2.moveCard('seventh-tower', 'dynasty deck');
            this.challenger = this.player2.moveCard('doji-challenger', 'dynasty deck');
            this.scholar = this.player2.moveCard('solemn-scholar', 'dynasty deck');
            this.brash = this.player2.moveCard('brash-samurai', 'dynasty deck');
            this.storehouse = this.player2.moveCard('imperial-storehouse', 'dynasty deck');
            this.kisada = this.player2.moveCard('hida-kisada', 'dynasty deck');

            this.kisada2 = this.player2.findCardByName('hida-kisada', 'dynasty discard pile');

            this.noMoreActions();
        });

        it('should trigger if conflict won on defense', function() {
            this.initiateConflict({
                attackers: [this.whisperer],
                defenders: [this.toturi],
                type: 'military'
            });
            this.noMoreActions();
            expect(this.player2).toHavePrompt('Triggered Abilities');
            expect(this.player2).toBeAbleToSelect(this.guardians);
        });

        it('should let you look at a number of cards equal to the amount you won by and choose a character with cost <= skill difference', function() {
            this.initiateConflict({
                attackers: [this.whisperer],
                defenders: [this.berserker],
                type: 'military'
            });
            this.noMoreActions();
            this.player2.clickCard(this.guardians);
            expect(this.player2).toHavePrompt('Select a character to put into play');
            expect(this.player2).toHaveDisabledPromptButton('Hida Kisada');
            expect(this.player2).toHaveDisabledPromptButton('Imperial Storehouse');
            expect(this.player2).toHavePromptButton('Brash Samurai');
            expect(this.player2).not.toHavePromptButton('Solemn Scholar');
            expect(this.player2).not.toHavePromptButton('Doji Challenger');
            expect(this.player2).not.toHavePromptButton('Seventh Tower');
        });

        it('should put the chosen character into play', function() {
            this.initiateConflict({
                attackers: [this.whisperer],
                defenders: [this.berserker],
                type: 'military'
            });
            this.noMoreActions();
            this.player2.clickCard(this.guardians);
            this.player2.clickPrompt('Brash Samurai');
            expect(this.brash.location).toBe('play area');
            expect(this.brash.isParticipating()).not.toBe(true);
            expect(this.brash.bowed).toBe(false);
        });

        it('chat message', function() {
            this.initiateConflict({
                attackers: [this.whisperer],
                defenders: [this.berserker],
                type: 'military'
            });
            this.noMoreActions();
            this.player2.clickCard(this.guardians);
            this.player2.clickPrompt('Brash Samurai');
            expect(this.getChatLogs(7)).toContain('player2 plays Guardians of Rokugan to look at the top 3 cards of their deck for a character costing 3 or less to put into play');
            expect(this.getChatLogs(7)).toContain('player2 takes Brash Samurai');
        });

        it('should not shuffle if you don\'t look at your whole deck', function() {
            this.initiateConflict({
                attackers: [this.whisperer],
                defenders: [this.berserker],
                type: 'military'
            });
            this.noMoreActions();
            this.player2.clickCard(this.guardians);
            this.player2.clickPrompt('Brash Samurai');
            expect(this.getChatLogs(7)).not.toContain('player2 is shuffling their dynasty deck');
        });

        it('should shuffle if you look at your whole deck', function() {
            this.initiateConflict({
                attackers: [this.whisperer],
                defenders: [this.berserker, this.kuwanan, this.toturi],
                type: 'military'
            });
            this.noMoreActions();
            this.player2.clickCard(this.guardians);
            this.player2.clickPrompt('Brash Samurai');
            expect(this.getChatLogs(7)).toContain('player2 is shuffling their dynasty deck');
        });

        it('should let you look at a number of cards equal to the amount you won by and choose a character with cost <= skill difference (extra test)', function() {
            this.initiateConflict({
                attackers: [this.whisperer],
                defenders: [this.kuwanan],
                type: 'military'
            });
            this.noMoreActions();
            this.player2.clickCard(this.guardians);
            expect(this.player2).toHavePrompt('Select a character to put into play');
            expect(this.player2).toHavePromptButton('Hida Kisada');
            expect(this.player2).toHaveDisabledPromptButton('Imperial Storehouse');
            expect(this.player2).toHavePromptButton('Brash Samurai');
            expect(this.player2).toHavePromptButton('Solemn Scholar');
            expect(this.player2).toHavePromptButton('Doji Challenger');
            expect(this.player2).not.toHavePromptButton('Seventh Tower');

            this.player2.clickPrompt('Hida Kisada');
            expect(this.kisada.location).toBe('play area');
        });

        it('should not let you pick a character that cannot be put into play', function() {
            this.player2.moveCard(this.kisada2, 'play area');

            this.initiateConflict({
                attackers: [this.whisperer],
                defenders: [this.kuwanan],
                type: 'military'
            });
            this.noMoreActions();
            this.player2.clickCard(this.guardians);
            expect(this.player2).toHavePrompt('Select a character to put into play');
            expect(this.player2).toHaveDisabledPromptButton('Hida Kisada');
            expect(this.player2).toHaveDisabledPromptButton('Imperial Storehouse');
            expect(this.player2).toHavePromptButton('Brash Samurai');
            expect(this.player2).toHavePromptButton('Solemn Scholar');
            expect(this.player2).toHavePromptButton('Doji Challenger');
            expect(this.player2).not.toHavePromptButton('Seventh Tower');
        });
    });
});
