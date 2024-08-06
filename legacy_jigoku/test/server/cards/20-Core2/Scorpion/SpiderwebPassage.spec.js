describe('Spiderweb Passage', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    hand: ['fiery-madness'],
                    inPlay: ['shosuro-sadako', 'bayushi-aramoro', 'shosuro-actress'],
                    dynastyDiscard: ['spiderweb-passage']
                },
                player2: {
                    hand: ['fine-katana', 'ornate-fan'],
                    inPlay: [
                        'goblin-sneak',
                        'acolyte-of-koyane',
                        'feral-ningyo',
                        'adept-of-the-waves',
                        'fire-tensai-initiate'
                    ]
                }
            });

            this.fieryMadness = this.player1.findCardByName('fiery-madness');
            this.sadako = this.player1.findCardByName('shosuro-sadako');
            this.aramoro = this.player1.findCardByName('bayushi-aramoro');
            this.actress = this.player1.findCardByName('shosuro-actress');
            this.spiderwebPassage = this.player1.findCardByName('spiderweb-passage');
            this.player1.moveCard(this.spiderwebPassage, 'province 1');

            this.katana = this.player2.findCardByName('fine-katana');
            this.fan = this.player2.findCardByName('ornate-fan');
            this.goblin = this.player2.findCardByName('goblin-sneak');
            this.koyane = this.player2.findCardByName('acolyte-of-koyane');
            this.ningyo = this.player2.findCardByName('feral-ningyo');
            this.adept = this.player2.findCardByName('adept-of-the-waves');
            this.tensai = this.player2.findCardByName('fire-tensai-initiate');

            this.player1.clickCard(this.fieryMadness);
            this.player1.clickCard(this.koyane);

            this.noMoreActions();
        });

        it('targets characters with any 0 skill', function () {
            this.initiateConflict({
                attackers: [this.sadako, this.aramoro],
                defenders: [this.goblin, this.koyane, this.ningyo, this.adept, this.tensai],
                type: 'military'
            });

            this.player2.pass();
            this.player1.clickCard(this.spiderwebPassage);
            expect(this.player1).toHavePrompt('Choose a character');
            expect(this.player1).toBeAbleToSelect(this.tensai);
            expect(this.player1).toBeAbleToSelect(this.koyane);
            expect(this.player1).not.toBeAbleToSelect(this.adept);
            expect(this.player1).not.toBeAbleToSelect(this.goblin);
            expect(this.player1).not.toBeAbleToSelect(this.ningyo);
        });

        it('can make opponent discard cards', function () {
            this.initiateConflict({
                attackers: [this.sadako, this.aramoro],
                defenders: [this.tensai],
                type: 'military'
            });

            this.player2.pass();
            this.player1.clickCard(this.spiderwebPassage);
            expect(this.player1).toHavePrompt('Choose a character');
            expect(this.player1).toBeAbleToSelect(this.tensai);
            expect(this.player1).not.toBeAbleToSelect(this.goblin);
            expect(this.player1).not.toBeAbleToSelect(this.koyane);
            expect(this.player1).not.toBeAbleToSelect(this.ningyo);
            expect(this.player1).not.toBeAbleToSelect(this.adept);

            this.player1.clickCard(this.tensai);
            expect(this.getChatLogs(5)).toContain(
                'player1 uses Spiderweb Passage, sacrificing Spiderweb Passage to ambush Fire Tensai Initiate'
            );
            expect(this.player2).toHavePrompt('Select one');
            expect(this.player2).toHavePromptButton('Discard 2 random cards from hand');
            expect(this.player2).toHavePromptButton('Discard Fire Tensai Initiate');

            this.player2.clickPrompt('Discard 2 random cards from hand');
            expect(this.getChatLogs(5)).toContain('player2 distracts the Shinobi');
            expect(this.fan.location).toBe('conflict discard pile');
            expect(this.katana.location).toBe('conflict discard pile');
        });

        it('can discard character', function () {
            this.initiateConflict({
                attackers: [this.sadako, this.aramoro],
                defenders: [this.tensai],
                type: 'military'
            });

            this.player2.pass();
            this.player1.clickCard(this.spiderwebPassage);
            expect(this.player1).toHavePrompt('Choose a character');
            expect(this.player1).toBeAbleToSelect(this.tensai);
            expect(this.player1).not.toBeAbleToSelect(this.goblin);
            expect(this.player1).not.toBeAbleToSelect(this.koyane);
            expect(this.player1).not.toBeAbleToSelect(this.ningyo);
            expect(this.player1).not.toBeAbleToSelect(this.adept);

            this.player1.clickCard(this.tensai);
            expect(this.getChatLogs(5)).toContain(
                'player1 uses Spiderweb Passage, sacrificing Spiderweb Passage to ambush Fire Tensai Initiate'
            );
            expect(this.player2).toHavePrompt('Select one');
            expect(this.player2).toHavePromptButton('Discard 2 random cards from hand');
            expect(this.player2).toHavePromptButton('Discard Fire Tensai Initiate');

            this.player2.clickPrompt('Discard Fire Tensai Initiate');
            expect(this.getChatLogs(5)).toContain(
                'player2 refuses to discard 2 cards. Fire Tensai Initiate is discarded'
            );
            expect(this.tensai.location).toBe('dynasty discard pile');
        });

        it('direct to discard when opponent does not have enough cards in hand', function () {
            this.initiateConflict({
                attackers: [this.sadako, this.aramoro, this.actress],
                defenders: [this.tensai],
                type: 'military'
            });

            this.player2.pass();
            this.player1.clickCard(this.spiderwebPassage);
            expect(this.player1).toHavePrompt('Choose a character');
            expect(this.player1).toBeAbleToSelect(this.tensai);
            expect(this.player1).not.toBeAbleToSelect(this.goblin);
            expect(this.player1).not.toBeAbleToSelect(this.koyane);
            expect(this.player1).not.toBeAbleToSelect(this.ningyo);
            expect(this.player1).not.toBeAbleToSelect(this.adept);

            this.player1.clickCard(this.tensai);
            expect(this.getChatLogs(5)).toContain(
                'player1 uses Spiderweb Passage, sacrificing Spiderweb Passage to ambush Fire Tensai Initiate'
            );
        });
    });
});
