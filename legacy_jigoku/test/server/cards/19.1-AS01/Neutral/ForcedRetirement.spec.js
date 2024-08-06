describe('Forced Retirement', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['doji-hotaru', 'cautious-scout'],
                    hand: ['forced-retirement']
                },
                player2: {
                    inPlay: ['bayushi-aramoro']
                }
            });

            this.cautiousScout = this.player1.findCardByName('cautious-scout');
            this.cautiousScout.fate = 2;
            this.cautiousScout.taint();
            this.hotaru = this.player1.findCardByName('doji-hotaru');
            this.hotaru.fate = 2;
            this.hotaru.dishonor();
            this.aramoro = this.player2.findCardByName('bayushi-aramoro');
            this.aramoro.fate = 2;
            this.aramoro.dishonor();

            this.forcedRetirement = this.player1.findCardByName('forced-retirement');
        });

        it('can only choose your own characters', function () {
            this.player1.clickCard(this.forcedRetirement);
            expect(this.player1).not.toBeAbleToSelect(this.aramoro);
            expect(this.player1).toBeAbleToSelect(this.hotaru);
            expect(this.player1).toBeAbleToSelect(this.cautiousScout);
        });

        it('can only choose characters at home', function () {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.hotaru],
                defenders: [this.aramoro]
            });
            this.player2.pass();
            this.player1.clickCard(this.forcedRetirement);
            expect(this.player1).not.toBeAbleToSelect(this.aramoro);
            expect(this.player1).not.toBeAbleToSelect(this.hotaru);
            expect(this.player1).toBeAbleToSelect(this.cautiousScout);
        });

        it('returns the fate from the character', function () {
            let p1FateBefore = this.player1.fate;
            this.player1.clickCard(this.forcedRetirement);
            this.player1.clickCard(this.hotaru);
            expect(this.player1.fate).toBe(p1FateBefore + 2);
        });

        it('discards all character status, then discard it', function () {
            let p1HonorBefore = this.player1.honor;
            this.player1.clickCard(this.forcedRetirement);
            this.player1.clickCard(this.hotaru);
            expect(this.player1.honor).toBe(p1HonorBefore + 1);
        });

        it('explains what happened in the chat logs', function () {
            this.player1.clickCard(this.forcedRetirement);
            this.player1.clickCard(this.hotaru);
            expect(this.getChatLogs(1)).toContain(
                'player1 plays Forced Retirement to expiate Doji Hotaru\'s misdeeds by retiring them to the nearest monatery, recovering their 2 fate. Let them contemplate their sins.'
            );
        });
    });
});
