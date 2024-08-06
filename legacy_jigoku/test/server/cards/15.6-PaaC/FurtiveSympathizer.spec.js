describe('Furtive Sympathizer', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['border-rider', 'moto-horde', 'furtive-sympathizer']
                },
                player2: {
                    inPlay: ['hida-amoro', 'crisis-breaker', 'kakita-toshimoko']
                }
            });

            this.borderRider = this.player1.findCardByName('border-rider');
            this.motoHorde = this.player1.findCardByName('moto-horde');
            this.furtive = this.player1.findCardByName('furtive-sympathizer');

            this.hidaAmoro = this.player2.findCardByName('hida-amoro');
            this.crisisBreaker = this.player2.findCardByName('crisis-breaker');
            this.toshimoko = this.player2.findCardByName('kakita-toshimoko');
        });

        it('should not be able to be triggered from home', function() {
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.borderRider, this.motoHorde],
                defenders: [this.hidaAmoro]
            });
            this.player2.pass();
            expect(this.player1).toHavePrompt('Conflict Action Window');
            this.player1.clickCard(this.furtive);
            expect(this.player1).toHavePrompt('Conflict Action Window');
        });

        it('should swap all participating characters base military and political skills', function() {
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.borderRider, this.motoHorde, this.furtive]
            });
            this.player1.clickPrompt('No Target');
            this.player2.clickCard(this.hidaAmoro);
            this.player2.clickPrompt('Done');
            this.player2.pass();
            this.player1.clickCard(this.furtive);

            expect(this.borderRider.getMilitarySkill()).toBe(1);
            expect(this.borderRider.getPoliticalSkill()).toBe(2);

            // cannot modify dash skills
            expect(this.motoHorde.getPoliticalSkill()).toBe(0);
            expect(this.motoHorde.getMilitarySkill()).toBe(6);

            // should not hit people at home
            expect(this.toshimoko.getPoliticalSkill()).toBe(3);
            expect(this.toshimoko.getMilitarySkill()).toBe(4);

            expect(this.getChatLogs(5)).toContain('player1 uses Furtive Sympathizer to switch all participating character\'s base military and political skill');
        });

        it('should not trigger if honored', function() {
            this.furtive.honor();
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.borderRider, this.motoHorde, this.furtive]
            });
            this.player1.clickPrompt('No Target');
            this.player2.clickCard(this.hidaAmoro);
            this.player2.clickPrompt('Done');
            this.player2.pass();
            expect(this.player1).toHavePrompt('Conflict Action Window');
            this.player1.clickCard(this.furtive);
            expect(this.player1).toHavePrompt('Conflict Action Window');
        });

        it('should not trigger if dishonored', function() {
            this.furtive.dishonor();
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.borderRider, this.motoHorde, this.furtive]
            });
            this.player1.clickPrompt('No Target');
            this.player2.clickCard(this.hidaAmoro);
            this.player2.clickPrompt('Done');
            this.player2.pass();
            expect(this.player1).toHavePrompt('Conflict Action Window');
            this.player1.clickCard(this.furtive);
            expect(this.player1).toHavePrompt('Conflict Action Window');
        });
    });
});
