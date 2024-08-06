describe('Oni Tyrant', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['oni-tyrant', 'doomed-shugenja']
                },
                player2: {
                    inPlay: ['doji-whisperer']
                }
            });

            this.doomed = this.player1.findCardByName('doomed-shugenja');
            this.tyrant = this.player1.findCardByName('oni-tyrant');
            this.whisperer = this.player2.findCardByName('doji-whisperer');
        });

        it('should let you summon a shadowlands creature', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.tyrant],
                defenders: [this.whisperer],
                type: 'military'
            });
            this.player2.pass();
            expect(this.player1).toHavePrompt('Conflict Action Window');
            this.player1.clickCard(this.tyrant);
            expect(this.player1).not.toHavePrompt('Select a fate cost');
            expect(this.player1).toHavePrompt('Select a creature to summon');
            expect(this.player1).toHavePromptButton('Skeletal Warrior');
            expect(this.player1).toHavePromptButton('Scavenging Goblin');
            expect(this.player1).toHavePromptButton('Insatiable Gaki');
            expect(this.player1).toHavePromptButton('Bloodthirsty Kansen');
            expect(this.player1).toHavePromptButton('Goblin Brawler');
            expect(this.player1).toHavePromptButton('Lost Samurai');
            expect(this.player1).toHavePromptButton('Penanggalan');
            expect(this.player1).toHavePromptButton('Shambling Servant');
            expect(this.player1).toHavePromptButton('Bog Hag');

            expect(this.player1).not.toHavePromptButton('Fouleye\'s Elite');
            expect(this.player1).not.toHavePromptButton('Endless Ranks');
            expect(this.player1).not.toHavePromptButton('Onikage Rider');
            expect(this.player1).not.toHavePromptButton('Wild Ogre');
            expect(this.player1).not.toHavePromptButton('Dark Moto');
            expect(this.player1).not.toHavePromptButton('Oni of Obsidian and Blood');
            expect(this.player1).not.toHavePromptButton('Undead Horror');

            this.player1.clickPrompt('Lost Samurai');
            expect(this.player1.player.cardsInPlay.filter(a => a.id === 'lost-samurai').length).toBe(1);

            this.oni = this.player1.player.cardsInPlay.filter(a => a.id === 'lost-samurai')[0];
            expect(this.oni.isAttacking()).toBe(true);
            expect(this.getChatLogs(5)).toContain('player1 uses Oni Tyrant, losing 1 honor to summon a Lost Samurai from the depths of the Shadowlands!');
            expect(this.player2).toHavePrompt('Conflict Action Window');
        });

        it('should not work when not participating', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.doomed],
                defenders: [this.whisperer],
                type: 'military'
            });
            this.player2.pass();
            expect(this.player1).toHavePrompt('Conflict Action Window');
            this.player1.clickCard(this.tyrant);
            expect(this.player1).toHavePrompt('Conflict Action Window');
        });
    });
});
