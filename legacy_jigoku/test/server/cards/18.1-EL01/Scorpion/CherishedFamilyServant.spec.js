describe('Cherished Family Servant', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    honor: 5,
                    inPlay: ['doomed-shugenja'],
                    hand: ['cherished-family-servant', 'fiery-madness', 'tainted-koku', 'assassination']
                },
                player2: {
                    honor: 10,
                    inPlay: ['miya-mystic'],
                    hand: ['finger-of-jade', 'assassination']
                }
            });
            this.shugenja = this.player1.findCardByName('doomed-shugenja');
            this.mystic = this.player2.findCardByName('miya-mystic');
            this.servant = this.player1.findCardByName('cherished-family-servant');
            this.jade = this.player2.findCardByName('finger-of-jade');
            this.assassination = this.player1.findCardByName('assassination');
            this.assassination2 = this.player2.findCardByName('assassination');
            this.madness = this.player1.findCardByName('fiery-madness');
            this.koku = this.player1.findCardByName('tainted-koku');

            this.shamefulDisplay = this.player2.findCardByName('shameful-display', 'province 1');

            this.player1.playAttachment(this.koku, this.shugenja);
            this.player2.pass();
            this.player1.playAttachment(this.madness, this.mystic);
            this.player2.pass();
        });

        it('should enter play under the control of your opponent', function () {
            this.player1.clickCard(this.servant);
            this.player1.clickPrompt('1');
            expect(this.getChatLogs(1)).toContain(
                'player1 plays Cherished Family Servant at home with 1 additional fate'
            );
            expect(this.servant.controller.name).toBe(this.player2.name);
            this.player2.clickCard(this.jade);
            expect(this.player2).toBeAbleToSelect(this.mystic);
            expect(this.player2).toBeAbleToSelect(this.servant);
            this.player2.clickCard(this.servant);
            expect(this.jade.location).toBe('play area');
            this.noMoreActions();
            expect(this.jade.location).toBe('play area');
        });

        it('should give poison attachments on friendly characters ancestral', function () {
            this.player1.clickCard(this.servant);
            this.player1.clickPrompt('0');

            expect(this.madness.hasKeyword('ancestral')).toBe(true);
            expect(this.koku.hasKeyword('ancestral')).toBe(false);

            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.shugenja],
                defenders: [this.mystic]
            });
            this.player2.pass();
            this.player1.clickCard(this.assassination);
            this.player1.clickCard(this.mystic);
            expect(this.madness.location).toBe('hand');
        });
    });
});
