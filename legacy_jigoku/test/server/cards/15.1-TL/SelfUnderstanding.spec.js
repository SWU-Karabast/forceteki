describe('Self Understanding', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['doji-challenger', 'asako-azunami'],
                    hand: ['self-understanding', 'fine-katana']
                },
                player2: {
                    inPlay: ['kakita-yoshi', 'brash-samurai', 'miya-mystic'],
                    hand: ['let-go', 'policy-debate']
                }
            });
            this.katana = this.player1.findCardByName('fine-katana');
            this.challenger = this.player1.findCardByName('doji-challenger');
            this.azunami = this.player1.findCardByName('asako-azunami');
            this.brash = this.player2.findCardByName('brash-samurai');
            this.yoshi = this.player2.findCardByName('kakita-yoshi');
            this.understanding = this.player1.findCardByName('self-understanding');
            this.mystic = this.player2.findCardByName('miya-mystic');
            this.letGo = this.player2.findCardByName('let-go');
            this.pd = this.player2.findCardByName('policy-debate');
        });

        it('should react to winning', function() {
            this.player1.claimRing('air');
            this.player1.claimRing('fire');
            this.player1.claimRing('earth');
            this.player1.claimRing('void');

            this.player1.playAttachment(this.understanding, this.challenger);
            this.noMoreActions();

            this.initiateConflict({
                attackers: [this.challenger],
                defenders: [this.yoshi],
                type: 'political',
                ring: 'water'
            });

            this.noMoreActions();
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.challenger);
        });

        it('should trigger all claimed rings', function() {
            this.player1.claimRing('air');
            this.player1.claimRing('fire');
            this.player1.claimRing('earth');
            this.player1.claimRing('void');

            this.player1.playAttachment(this.understanding, this.challenger);
            this.noMoreActions();

            this.initiateConflict({
                attackers: [this.challenger],
                defenders: [this.yoshi],
                type: 'political',
                ring: 'water'
            });

            this.noMoreActions();
            this.player1.clickCard(this.challenger);

            expect(this.player1).toHavePrompt('Fire Ring');
            this.player1.clickCard(this.brash);
            this.player1.clickPrompt('Dishonor Brash Samurai');
            expect(this.player1).toHavePrompt('Air Ring');
            this.player1.clickPrompt('Gain 2 Honor');
            expect(this.getChatLogs(10)).toContain('player1 uses Doji Challenger\'s gained ability from Self-Understanding to resolve all their claimed ring effects');
            expect(this.getChatLogs(10)).toContain('player1 resolves the earth ring, drawing a card and forcing player2 to discard a card at random');
            expect(this.getChatLogs(10)).toContain('player1 attempted to use Void Ring, but there are insufficient legal targets');
            expect(this.getChatLogs(10)).toContain('player1 resolves the fire ring, dishonoring Brash Samurai');
            expect(this.getChatLogs(10)).toContain('player1 resolves the air ring, gaining 2 honor');
        });

        it('should allow ring replacement effects', function() {
            this.player1.claimRing('water');
            this.player1.playAttachment(this.understanding, this.challenger);
            this.noMoreActions();

            this.initiateConflict({
                attackers: [this.challenger],
                defenders: [this.yoshi],
                type: 'political'
            });

            this.noMoreActions();
            this.player1.clickCard(this.challenger);
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.azunami);
            this.player1.clickCard(this.azunami);
            expect(this.player1).toHavePrompt('Asako Azunami');
        });

        it('should not be playable if you have no claimed rings', function() {
            this.player1.playAttachment(this.understanding, this.challenger);
            this.noMoreActions();

            this.initiateConflict({
                attackers: [this.challenger],
                defenders: [this.yoshi],
                type: 'political'
            });

            this.noMoreActions();
            expect(this.player1).not.toHavePrompt('Triggered Abilities');
        });

        it('should not react to losing', function() {
            this.player1.claimRing('air');
            this.player1.claimRing('fire');
            this.player1.claimRing('earth');
            this.player1.claimRing('void');

            this.player1.playAttachment(this.understanding, this.challenger);
            this.noMoreActions();

            this.initiateConflict({
                attackers: [this.challenger],
                defenders: [this.yoshi, this.brash],
                type: 'political',
                ring: 'water'
            });

            this.noMoreActions();
            expect(this.player1).toHavePrompt('Action Window');
        });

        it('should not be targetable by events', function() {
            this.player1.playAttachment(this.understanding, this.challenger);
            this.player2.pass();
            this.player1.playAttachment(this.katana, this.challenger);
            this.player2.clickCard(this.letGo);
            expect(this.player2).toBeAbleToSelect(this.katana);
            expect(this.player2).not.toBeAbleToSelect(this.understanding);
        });

        it('should not be targetable by characters', function() {
            this.player1.playAttachment(this.understanding, this.challenger);
            this.player2.pass();
            this.player1.playAttachment(this.katana, this.challenger);
            this.player2.clickCard(this.mystic);
            expect(this.player2).toBeAbleToSelect(this.katana);
            expect(this.player2).toBeAbleToSelect(this.understanding);
        });

        it('should be targetable in hand', function() {
            this.noMoreActions();

            this.initiateConflict({
                attackers: [this.challenger],
                defenders: [this.yoshi, this.brash],
                type: 'political',
                ring: 'water'
            });

            this.player2.clickCard(this.pd);
            this.player2.clickCard(this.yoshi);
            this.player2.clickCard(this.challenger);
            this.player2.clickPrompt('1');
            this.player1.clickPrompt('1');

            expect(this.player2).toHavePromptButton('Self-Understanding');
            expect(this.player2).toHavePromptButton('Fine Katana');
            this.player2.clickPrompt('Self-Understanding');
            expect(this.understanding.location).toBe('conflict discard pile');
        });
    });
});
