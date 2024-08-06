describe('Daidoji Ambusher', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['doji-diplomat', 'shosuro-sadako', 'daidoji-ambusher']
                },
                player2: {
                    inPlay: ['daidoji-uji', 'doji-challenger', 'adept-of-shadows']
                }
            });

            this.sadako = this.player1.findCardByName('shosuro-sadako');
            this.diplomat = this.player1.findCardByName('doji-diplomat');
            this.uji = this.player2.findCardByName('daidoji-uji');
            this.challenger = this.player2.findCardByName('doji-challenger');
            this.ambusher = this.player1.findCardByName('daidoji-ambusher');
            this.adept = this.player2.findCardByName('adept-of-shadows');

            this.adept.fate = 1;
        });

        it('should target participating characters', function () {
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.diplomat, this.ambusher],
                defenders: [this.challenger]
            });

            this.player2.pass();
            this.player1.clickCard(this.ambusher);
            expect(this.player1).toBeAbleToSelect(this.diplomat);
            expect(this.player1).toBeAbleToSelect(this.challenger);
            expect(this.player1).not.toBeAbleToSelect(this.sadako);
            expect(this.player1).not.toBeAbleToSelect(this.uji);
            expect(this.player1).toBeAbleToSelect(this.ambusher);
        });

        it('should give someone -2 mil and no kicker if not dishonored', function () {
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.diplomat, this.sadako, this.ambusher],
                defenders: [this.uji, this.challenger, this.adept]
            });
            this.player2.pass();

            this.player1.clickCard(this.ambusher);
            this.player1.clickCard(this.adept);
            expect(this.adept.getMilitarySkill()).toBe(0);
            expect(this.adept.fate).toBe(1);

            expect(this.getChatLogs(10)).toContain('player1 uses Daidōji Ambusher to give Adept of Shadows -2military');
        });

        it('should remove a fate', function () {
            this.ambusher.dishonor();
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.diplomat, this.sadako, this.ambusher],
                defenders: [this.uji, this.challenger, this.adept]
            });
            this.player2.pass();

            this.player1.clickCard(this.ambusher);
            this.player1.clickCard(this.adept);
            expect(this.adept.getMilitarySkill()).toBe(0);
            expect(this.adept.fate).toBe(0);
            expect(this.getChatLogs(10)).toContain('player1 uses Daidōji Ambusher to give Adept of Shadows -2military and remove a fate from them');
        });

        it('should discard', function () {
            this.ambusher.dishonor();
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.diplomat, this.sadako, this.ambusher],
                defenders: [this.uji, this.challenger, this.adept]
            });
            this.player2.pass();

            this.player1.clickCard(this.ambusher);
            this.player1.clickCard(this.diplomat);
            expect(this.diplomat.location).toBe('dynasty discard pile');
            expect(this.getChatLogs(10)).toContain('player1 uses Daidōji Ambusher to give Doji Diplomat -2military and discard them');
        });

        it('should not discard if skill isn\'t 0', function () {
            this.ambusher.dishonor();
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.diplomat, this.sadako, this.ambusher],
                defenders: [this.uji, this.challenger, this.adept]
            });
            this.player2.pass();

            this.player1.clickCard(this.ambusher);
            this.player1.clickCard(this.uji);
            expect(this.diplomat.location).toBe('play area');
            expect(this.getChatLogs(10)).toContain('player1 uses Daidōji Ambusher to give Daidoji Uji -2military');
        });
    });
});
