describe('Hot Springs', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['steadfast-witch-hunter', 'vanguard-warrior'],
                    dynastyDiscard: ['restorative-hot-spring']
                },
                player2: {
                    inPlay: ['doji-challenger'],
                    hand: ['assassination']
                }
            });
            this.steadfastWitchHunter = this.player1.findCardByName('steadfast-witch-hunter');
            this.warrior = this.player1.findCardByName('vanguard-warrior');
            this.springs = this.player1.findCardByName('restorative-hot-spring');

            this.challenger = this.player2.findCardByName('doji-challenger');
            this.assassination = this.player2.findCardByName('assassination');

            this.p1 = this.player1.findCardByName('shameful-display', 'province 1');
            this.p2 = this.player1.findCardByName('shameful-display', 'province 2');
            this.p3 = this.player1.findCardByName('shameful-display', 'province 3');
            this.p4 = this.player1.findCardByName('shameful-display', 'province 4');

            this.player1.placeCardInProvince(this.springs, 'province 3');
            this.springs.facedown = false;
            this.p3.isBroken = true;
        });

        it('should cost a fate to trigger', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.steadfastWitchHunter, this.warrior],
                defenders: [this.challenger],
                type: 'military'
            });

            let fate = this.player1.fate;

            this.player2.clickCard(this.assassination);
            this.player2.clickCard(this.warrior);
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.springs);
            this.player1.clickCard(this.springs);
            expect(this.warrior.location).toBe('play area');
            expect(this.springs.location).toBe('removed from game');
            expect(this.player1.fate).toBe(fate - 1);
            expect(this.getChatLogs(5)).toContain('player1 uses Restorative Hot Spring, spending 1 fate to prevent Vanguard Warrior from leaving play, removing itself from the game instead');
        });
    });
});
