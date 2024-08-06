describe('Shinjo Archer', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['shinjo-archer', 'isawa-tadaka']
                },
                player2: {
                    inPlay: ['solemn-scholar', 'kitsu-motso']
                }
            });

            this.shinjoArcher = this.player1.findCardByName('shinjo-archer');
            this.isawaTadaka = this.player1.findCardByName('isawa-tadaka');

            this.solemnScholar = this.player2.findCardByName('solemn-scholar');
            this.kitsuMotso = this.player2.findCardByName('kitsu-motso');
        });

        it('should not work outside a conflict', function() {
            expect(this.player1).toHavePrompt('Action Window');
            this.player1.clickCard(this.shinjoArcher);
            expect(this.player1).toHavePrompt('Action Window');
        });

        it('should be able to trigger in a conflict with another character and target participating characters', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.shinjoArcher],
                defenders: [this.solemnScholar],
                type: 'military'
            });

            this.player2.pass();
            this.player1.clickCard(this.shinjoArcher);
            expect(this.player1).toHavePrompt('Choose a character');

            expect(this.player1).toBeAbleToSelect(this.shinjoArcher);
            expect(this.player1).toBeAbleToSelect(this.solemnScholar);
            expect(this.player1).not.toBeAbleToSelect(this.isawaTadaka);
            expect(this.player1).not.toBeAbleToSelect(this.kitsuMotso);
        });

        it('should be able to trigger in a conflict where it is not participating to target participating characters', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.isawaTadaka],
                defenders: [this.solemnScholar],
                type: 'military'
            });

            this.player2.pass();
            this.player1.clickCard(this.shinjoArcher);
            expect(this.player1).toHavePrompt('Choose a character');

            expect(this.player1).not.toBeAbleToSelect(this.shinjoArcher);
            expect(this.player1).toBeAbleToSelect(this.solemnScholar);
            expect(this.player1).toBeAbleToSelect(this.isawaTadaka);
            expect(this.player1).not.toBeAbleToSelect(this.kitsuMotso);
        });

        it('should send home Shinjo Archer and give the target -2/-2 unitl end of conflict', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.shinjoArcher],
                defenders: [this.solemnScholar],
                type: 'military'
            });

            expect(this.shinjoArcher.inConflict).toBe(true);
            this.player2.pass();
            this.player1.clickCard(this.shinjoArcher);
            this.player1.clickCard(this.solemnScholar);

            expect(this.shinjoArcher.inConflict).toBe(false);
            expect(this.solemnScholar.getMilitarySkill()).toBe(0);
            expect(this.solemnScholar.getPoliticalSkill()).toBe(0);

            expect(this.getChatLogs(3)).toContain('player1 uses Shinjo Archer, moving Shinjo Archer home to give Solemn Scholar -2military/-2political');

            this.player2.pass();
            this.player1.pass();

            expect(this.player1).toHavePrompt('Action Window');
            expect(this.solemnScholar.getMilitarySkill()).toBe(1);
            expect(this.solemnScholar.getPoliticalSkill()).toBe(1);
        });

        it('should move Shinjo Archer to the conflict and give the target -2/-2 unitl end of conflict', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.isawaTadaka],
                defenders: [this.solemnScholar],
                type: 'military'
            });

            expect(this.shinjoArcher.inConflict).toBe(false);
            this.player2.pass();
            this.player1.clickCard(this.shinjoArcher);
            this.player1.clickCard(this.solemnScholar);

            expect(this.shinjoArcher.inConflict).toBe(true);
            expect(this.solemnScholar.getMilitarySkill()).toBe(0);
            expect(this.solemnScholar.getPoliticalSkill()).toBe(0);

            expect(this.getChatLogs(3)).toContain('player1 uses Shinjo Archer, moving Shinjo Archer to the conflict to give Solemn Scholar -2military/-2political');
        });
    });
});
