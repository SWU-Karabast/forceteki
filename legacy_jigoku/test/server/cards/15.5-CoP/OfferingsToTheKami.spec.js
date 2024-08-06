describe('Offerings To The Kami', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['matsu-berserker']
                },
                player2: {
                    provinces: ['offerings-to-the-kami']
                }
            });
            this.zerker = this.player1.findCardByName('matsu-berserker');
            this.kami = this.player2.findCardByName('offerings-to-the-kami');

            this.game.rings.void.fate = 2;

            this.noMoreActions();
            this.initiateConflict({
                ring: 'fire',
                attackers: [this.zerker],
                province: this.kami
            });
        });

        it('should trigger after being revealed', function () {
            expect(this.player2).toHavePrompt('Triggered Abilities');
            expect(this.player2).toBeAbleToSelect(this.kami);
        });

        it('should let you choose a ring', function () {
            this.player2.clickCard(this.kami);
            expect(this.player2).toHavePrompt('Choose a ring to claim and resolve');
            expect(this.player2).toBeAbleToSelectRing('air');
            expect(this.player2).toBeAbleToSelectRing('earth');
            expect(this.player2).not.toBeAbleToSelectRing('fire');
            expect(this.player2).toBeAbleToSelectRing('void');
            expect(this.player2).toBeAbleToSelectRing('water');
        });

        it('should allow the triggering the chosen ring', function () {
            this.player2.clickCard(this.kami);
            this.player2.clickRing('water');
            this.player2.clickCard(this.zerker);
            expect(this.zerker.bowed).toBe(true);
        });

        it('should claim the ring and get fate from it', function () {
            let fate = this.player2.fate;
            let voidFate = this.game.rings.void.fate;
            expect(voidFate).not.toBe(0);
            this.player2.clickCard(this.kami);
            this.player2.clickRing('void');
            expect(this.player2.fate).toBe(fate + voidFate);
            expect(this.game.rings.void.fate).toBe(0);
            expect(this.game.rings.void.claimedBy).toBe(this.player2.player.name);
            expect(this.game.rings.void.conflictType).toBe('political');

            expect(this.getChatLogs(5)).toContain('player2 uses Offerings to the Kami to resolve Void Ring effect and claim Void Ring');
            expect(this.getChatLogs(5)).toContain('player2 takes 2 fate from Void Ring');
            expect(this.getChatLogs(5)).toContain('player2 attempted to use Void Ring, but there are insufficient legal targets');
        });
    });
});
