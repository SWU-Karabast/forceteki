describe('Developing Masterpiece', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'draw',
                player1: {
                    inPlay: ['brash-samurai', 'kakita-yoshi', 'master-at-arms', 'togashi-initiate'],
                    hand: ['developing-masterpiece']
                },
                player2: {
                    inPlay: ['doji-whisperer'],
                    hand: ['let-go']
                }
            });

            this.brash = this.player1.findCardByName('brash-samurai');
            this.yoshi = this.player1.findCardByName('kakita-yoshi');
            this.arms = this.player1.findCardByName('master-at-arms');
            this.initiate = this.player1.findCardByName('togashi-initiate');

            this.whisperer = this.player2.findCardByName('doji-whisperer');
            this.letGo = this.player2.findCardByName('let-go');

            this.masterpiece = this.player1.findCardByName('developing-masterpiece');

            this.player1.player.promptedActionWindows.draw = true;
            this.player2.player.promptedActionWindows.draw = true;

            this.player1.player.promptedActionWindows.fate = true;
            this.player2.player.promptedActionWindows.fate = true;

            this.player1.clickPrompt('1');
            this.player2.clickPrompt('1');
            this.yoshi.honor();
            this.yoshi.fate = 1;
        });

        it('should let you attach to a crane or courtier or an artisan', function () {
            this.player1.clickCard(this.masterpiece);
            expect(this.player1).toBeAbleToSelect(this.yoshi);
            expect(this.player1).toBeAbleToSelect(this.arms);
            expect(this.player1).toBeAbleToSelect(this.brash);
            expect(this.player1).not.toBeAbleToSelect(this.initiate);
            expect(this.player1).not.toBeAbleToSelect(this.whisperer);
            this.player1.clickCard(this.yoshi);

            expect(this.masterpiece.location).toBe('play area');
            expect(this.masterpiece.parent).toBe(this.yoshi);
        });

        it('should prevent participating', function () {
            this.player1.clickCard(this.masterpiece);
            this.player1.clickCard(this.yoshi);

            this.noMoreActions();
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.yoshi, this.initiate],
                defenders: []
            });

            expect(this.game.currentConflict.attackers).toContain(this.initiate);
            expect(this.game.currentConflict.attackers).not.toContain(this.yoshi);
        });

        it('should let you gain honor in the fate phase', function () {
            this.player1.clickCard(this.masterpiece);
            this.player1.clickCard(this.yoshi);
            this.noMoreActions();

            expect(this.player1).toHavePrompt('Action Window');
            this.player1.clickCard(this.masterpiece);
            expect(this.player1).toHavePrompt('Action Window');

            this.advancePhases('fate');

            this.player1.clickPrompt('Done');
            this.player2.clickPrompt('Done');

            let honor = this.player1.honor;
            this.player1.clickCard(this.masterpiece);
            expect(this.masterpiece.location).toBe('removed from game');
            expect(this.player1.honor).toBe(honor + 3);
            expect(this.getChatLogs(5)).toContain('player1 uses Developing Masterpiece, removing Developing Masterpiece from the game to gain 3 honor');
        });

        it('playable from discard', function () {
            this.player1.clickCard(this.masterpiece);
            this.player1.clickCard(this.yoshi);

            expect(this.masterpiece.location).toBe('play area');
            expect(this.masterpiece.parent).toBe(this.yoshi);

            this.player2.clickCard(this.letGo);
            this.player2.clickCard(this.masterpiece);

            this.player1.clickCard(this.masterpiece);
            this.player1.clickCard(this.arms);

            expect(this.masterpiece.location).toBe('play area');
            expect(this.masterpiece.parent).toBe(this.arms);
        });

        it('not playable in conflict', function () {
            this.noMoreActions();
            expect(this.player1).toHavePrompt('Action Window');
            this.player1.clickCard(this.masterpiece);
            expect(this.player1).toHavePrompt('Action Window');
        });
    });
});
