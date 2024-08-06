describe('Accursed Summoning', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['doomed-shugenja'],
                    hand: ['accursed-summoning']
                },
                player2: {
                    inPlay: ['doji-whisperer']
                }
            });

            this.doomed = this.player1.findCardByName('doomed-shugenja');
            this.whisperer = this.player2.findCardByName('doji-whisperer');
            this.doomed.fate = 1;

            this.summoning = this.player1.findCardByName('accursed-summoning');
        });

        it('should let you summon a shadowlands creature', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.doomed],
                defenders: [this.whisperer],
                type: 'military'
            });
            this.player2.pass();
            expect(this.player1).toHavePrompt('Conflict Action Window');
            this.player1.clickCard(this.summoning);
            expect(this.player1).toHavePrompt('Select a fate cost');
            expect(this.player1).toHavePromptButton('1');
            expect(this.player1).toHavePromptButton('2');
            expect(this.player1).toHavePromptButton('3');
            expect(this.player1).toHavePromptButton('4');
            expect(this.player1).toHavePromptButton('All');
            expect(this.player1).toHavePromptButton('Cancel');
            this.player1.clickPrompt('All');
            expect(this.player1).toHavePrompt('Select a creature to summon');
            expect(this.player1).toHavePromptButton('Bloodthirsty Kansen');
            expect(this.player1).toHavePromptButton('Bog Hag');
            expect(this.player1).toHavePromptButton('Dark Moto');
            expect(this.player1).toHavePromptButton('Endless Ranks');
            expect(this.player1).toHavePromptButton('Fouleye\'s Elite');
            expect(this.player1).toHavePromptButton('Goblin Brawler');
            expect(this.player1).toHavePromptButton('Insatiable Gaki');
            expect(this.player1).toHavePromptButton('Lost Samurai');
            expect(this.player1).toHavePromptButton('Onikage Rider');
            expect(this.player1).toHavePromptButton('Oni of Obsidian and Blood');
            expect(this.player1).toHavePromptButton('Penanggalan');
            expect(this.player1).toHavePromptButton('Scavenging Goblin');
            expect(this.player1).toHavePromptButton('Shambling Servant');
            expect(this.player1).toHavePromptButton('Skeletal Warrior');
            expect(this.player1).toHavePromptButton('Undead Horror');
            expect(this.player1).toHavePromptButton('Wild Ogre');

            this.player1.clickPrompt('Oni of Obsidian and Blood');
            expect(this.player1).toHavePrompt('Choose a card to help pay the fate cost of Accursed Summoning');
            this.player1.clickCard(this.doomed);
            this.player1.clickPrompt('1');

            expect(this.player1.player.cardsInPlay.filter(a => a.id === 'oni-of-obsidian-and-blood').length).toBe(1);

            this.oni = this.player1.player.cardsInPlay.filter(a => a.id === 'oni-of-obsidian-and-blood')[0];
            expect(this.oni.isAttacking()).toBe(true);
            expect(this.getChatLogs(5)).toContain('player1 plays Accursed Summoning, losing 4 honor to summon an Oni of Obsidian and Blood from the depths of the Shadowlands!');
            expect(this.player2).toHavePrompt('Conflict Action Window');
        });

        it('testing the prompt', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.doomed],
                defenders: [this.whisperer],
                type: 'military'
            });
            this.player2.pass();
            expect(this.player1).toHavePrompt('Conflict Action Window');
            this.player1.clickCard(this.summoning);
            expect(this.player1).toHavePrompt('Select a fate cost');
            expect(this.player1).toHavePromptButton('1');
            expect(this.player1).toHavePromptButton('2');
            expect(this.player1).toHavePromptButton('3');
            expect(this.player1).toHavePromptButton('4');
            expect(this.player1).toHavePromptButton('All');
            expect(this.player1).toHavePromptButton('Cancel');

            this.player1.clickPrompt('1');
            expect(this.player1).toHavePrompt('Select a creature to summon');
            expect(this.player1).toHavePromptButton('Skeletal Warrior');
            expect(this.player1).toHavePromptButton('Scavenging Goblin');
            expect(this.player1).toHavePromptButton('Insatiable Gaki');
            expect(this.player1).toHavePromptButton('Bloodthirsty Kansen');
            expect(this.player1).toHavePromptButton('Back');
            expect(this.player1).toHavePromptButton('Cancel');

            this.player1.clickPrompt('Back');
            expect(this.player1).toHavePrompt('Select a fate cost');
            expect(this.player1).toHavePromptButton('1');
            expect(this.player1).toHavePromptButton('2');
            expect(this.player1).toHavePromptButton('3');
            expect(this.player1).toHavePromptButton('4');
            expect(this.player1).toHavePromptButton('All');
            expect(this.player1).toHavePromptButton('Cancel');

            this.player1.clickPrompt('2');
            expect(this.player1).toHavePrompt('Select a creature to summon');
            expect(this.player1).toHavePromptButton('Goblin Brawler');
            expect(this.player1).toHavePromptButton('Lost Samurai');
            expect(this.player1).toHavePromptButton('Penanggalan');
            expect(this.player1).toHavePromptButton('Shambling Servant');
            expect(this.player1).toHavePromptButton('Bog Hag');
            expect(this.player1).toHavePromptButton('Back');
            expect(this.player1).toHavePromptButton('Cancel');

            this.player1.clickPrompt('Back');
            expect(this.player1).toHavePrompt('Select a fate cost');

            this.player1.clickPrompt('3');
            expect(this.player1).toHavePromptButton('Fouleye\'s Elite');
            expect(this.player1).toHavePromptButton('Endless Ranks');
            expect(this.player1).toHavePromptButton('Onikage Rider');
            expect(this.player1).toHavePromptButton('Wild Ogre');
            expect(this.player1).toHavePromptButton('Back');
            expect(this.player1).toHavePromptButton('Cancel');

            this.player1.clickPrompt('Back');
            expect(this.player1).toHavePrompt('Select a fate cost');

            this.player1.clickPrompt('4');
            expect(this.player1).toHavePromptButton('Dark Moto');
            expect(this.player1).toHavePromptButton('Oni of Obsidian and Blood');
            // expect(this.player1).toHavePromptButton('Undead Horror');
            expect(this.player1).toHavePromptButton('Back');
            expect(this.player1).toHavePromptButton('Cancel');

            this.player1.clickPrompt('Cancel');
            expect(this.player1).toHavePrompt('Conflict Action Window');
        });

        it('summoning using the menu', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.doomed],
                defenders: [this.whisperer],
                type: 'military'
            });
            this.player2.pass();
            expect(this.player1).toHavePrompt('Conflict Action Window');
            this.player1.clickCard(this.summoning);
            expect(this.player1).toHavePrompt('Select a fate cost');
            this.player1.clickPrompt('2');
            this.player1.clickPrompt('Bog Hag');
            this.player1.clickCard(this.doomed);
            this.player1.clickPrompt('1');

            expect(this.player1.player.cardsInPlay.filter(a => a.id === 'bog-hag').length).toBe(1);

            this.oni = this.player1.player.cardsInPlay.filter(a => a.id === 'bog-hag')[0];
            expect(this.oni.isAttacking()).toBe(true);
            expect(this.getChatLogs(5)).toContain('player1 plays Accursed Summoning, losing 2 honor to summon a Bog Hag from the depths of the Shadowlands!');
            expect(this.player2).toHavePrompt('Conflict Action Window');
        });

        it('should not let you summon dashes into the wrong conflict type', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.doomed],
                defenders: [this.whisperer],
                type: 'political'
            });
            this.player2.pass();
            expect(this.player1).toHavePrompt('Conflict Action Window');
            this.player1.clickCard(this.summoning);
            this.player1.clickPrompt('1');
            expect(this.player1).toHavePrompt('Select a creature to summon');
            expect(this.player1).not.toHavePromptButton('Skeletal Warrior');
            expect(this.player1).toHavePromptButton('Scavenging Goblin');
            expect(this.player1).toHavePromptButton('Insatiable Gaki');
            expect(this.player1).toHavePromptButton('Bloodthirsty Kansen');
            expect(this.player1).toHavePromptButton('Back');
            expect(this.player1).toHavePromptButton('Cancel');

            this.player1.clickPrompt('Back');
            this.player1.clickPrompt('All');
            expect(this.player1).not.toHavePromptButton('Skeletal Warrior');
            expect(this.player1).toHavePromptButton('Scavenging Goblin');
            expect(this.player1).toHavePromptButton('Fouleye\'s Elite');
            expect(this.player1).not.toHavePromptButton('Endless Ranks');
        });

        it('should not work outside of a conflict', function() {
            expect(this.player1).toHavePrompt('Action Window');
            this.player1.clickCard(this.summoning);
            expect(this.player1).toHavePrompt('Action Window');
        });
    });
});
