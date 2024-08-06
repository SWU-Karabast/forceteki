describe('Hayaken No Shiro', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    stronghold: 'hayaken-no-shiro',
                    inPlay: ['matsu-berserker', 'doji-whisperer', 'doji-challenger', 'akodo-gunso']
                },
                player2: {
                    inPlay: ['caravan-guard']
                }
            });
            this.berserker = this.player1.findCardByName('matsu-berserker');
            this.whisperer = this.player1.findCardByName('doji-whisperer');
            this.challenger = this.player1.findCardByName('doji-challenger');
            this.gunso = this.player1.findCardByName('akodo-gunso');
            this.guard = this.player2.findCardByName('caravan-guard');

            this.hayaken = this.player1.findCardByName('hayaken-no-shiro');

            this.berserker.bowed = true;
            this.whisperer.bowed = true;
            this.challenger.bowed = true;
            this.gunso.bowed = false;
            this.guard.bowed = true;
        });

        it('should let you select a bowed bushi who costs 2 or less', function() {
            this.player1.clickCard(this.hayaken);
            expect(this.player1).toBeAbleToSelect(this.berserker);
            expect(this.player1).not.toBeAbleToSelect(this.whisperer);
            expect(this.player1).not.toBeAbleToSelect(this.challenger);
            expect(this.player1).not.toBeAbleToSelect(this.gunso);
            expect(this.player1).toBeAbleToSelect(this.guard);
        });

        it('should bow self and ready the selected character', function() {
            expect(this.hayaken.bowed).toBe(false);
            expect(this.berserker.bowed).toBe(true);
            this.player1.clickCard(this.hayaken);
            this.player1.clickCard(this.berserker);
            expect(this.hayaken.bowed).toBe(true);
            expect(this.berserker.bowed).toBe(false);
            expect(this.getChatLogs(1)).toContain('player1 uses Hayaken no Shiro, bowing Hayaken no Shiro to ready Matsu Berserker');
        });
    });
});
