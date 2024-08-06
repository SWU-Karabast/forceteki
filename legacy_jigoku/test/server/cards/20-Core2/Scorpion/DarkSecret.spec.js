describe('Dark Secret', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['adept-of-the-waves'],
                    hand: ['a-legion-of-one']
                },
                player2: {
                    inPlay: [],
                    hand: ['dark-secret']
                }
            });
            this.legion = this.player1.findCardByName('a-legion-of-one');
            this.adept = this.player1.findCardByName('adept-of-the-waves');
            this.adept.fate = 2;

            this.darkSecret = this.player2.findCardByName('dark-secret');

            this.player1.pass();
            this.player2.playAttachment(this.darkSecret, this.adept);
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.adept],
                defenders: []
            });
            this.player2.pass();
        });

        it('causes honor loss when fate is removed', function () {
            const player1StartHonor = this.player1.honor;
            this.player1.clickCard(this.legion);
            this.player1.clickCard(this.adept);
            this.player1.clickPrompt('Remove 1 fate to resolve this ability again');
            this.player1.clickCard(this.adept);
            this.player1.clickPrompt('Done');

            expect(this.player2).toHavePrompt('Triggered Abilities');
            expect(this.player2).toBeAbleToSelect(this.darkSecret);
            this.player2.clickCard(this.darkSecret);
            expect(this.player1.honor).toBe(player1StartHonor - 1);
            expect(this.getChatLogs(5)).toContain(
                'player2 uses Dark Secret to make player1 lose 1 honor - Three may keep a secret, if two of them are dead'
            );
        });
    });
});
