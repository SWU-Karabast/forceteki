describe('Nightshade Infiltrator', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    honor: 10,
                    inPlay: ['doji-kuwanan', 'border-rider']
                },
                player2: {
                    honor: 10,
                    inPlay: ['nightshade-infiltrator', 'kakita-yoshi'],
                    hand: ['fiery-madness', 'tainted-koku', 'softskin']
                }
            });

            this.yoshi = this.player2.findCardByName('kakita-yoshi');
            this.nightshade = this.player2.findCardByName('nightshade-infiltrator');
            this.kuwanan = this.player1.findCardByName('doji-kuwanan');
            this.rider = this.player1.findCardByName('border-rider');
            this.madness = this.player2.findCardByName('fiery-madness');
            this.koku = this.player2.findCardByName('tainted-koku');
            this.softskin = this.player2.findCardByName('softskin');
        });

        it('should dishonor to choose a participating character and give them -3/-3', function() {
            let mil = this.kuwanan.getMilitarySkill();
            let pol = this.kuwanan.getPoliticalSkill();

            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.kuwanan],
                defenders: [this.nightshade, this.yoshi]
            });
            this.player2.clickCard(this.nightshade);
            expect(this.player2).toBeAbleToSelect(this.kuwanan);
            expect(this.player2).toBeAbleToSelect(this.nightshade);
            expect(this.player2).toBeAbleToSelect(this.yoshi);
            expect(this.player2).not.toBeAbleToSelect(this.rider);
            this.player2.clickCard(this.kuwanan);
            expect(this.kuwanan.getMilitarySkill()).toBe(mil - 3);
            expect(this.kuwanan.getPoliticalSkill()).toBe(pol - 3);
            expect(this.nightshade.isDishonored).toBe(true);

            expect(this.getChatLogs(5)).toContain('player2 uses Nightshade Infiltrator, dishonoring Nightshade Infiltrator to give Doji Kuwanan -3military/-3political');
        });
    });
});
