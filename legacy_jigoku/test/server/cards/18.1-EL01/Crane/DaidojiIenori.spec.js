describe('Daidoji Ienori', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    honor: 10,
                    inPlay: ['moto-chagatai', 'master-alchemist']
                },
                player2: {
                    honor: 10,
                    inPlay: ['daidoji-ienori', 'kakita-yoshi']
                }
            });

            this.yoshi = this.player2.findCardByName('kakita-yoshi');
            this.ienori = this.player2.findCardByName('daidoji-ienori');
            this.chagatai = this.player1.findCardByName('moto-chagatai');
            this.alchemist = this.player1.findCardByName('master-alchemist');

            this.ienori.honor();

            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.chagatai],
                defenders: [this.ienori, this.yoshi]
            });
        });

        it('should set to 3/3 if honored and prevent gaining status tokens', function() {
            this.player2.clickCard(this.ienori);
            expect(this.player2).toBeAbleToSelect(this.chagatai);
            expect(this.player2).toBeAbleToSelect(this.yoshi);
            expect(this.player2).toBeAbleToSelect(this.ienori);
            this.player2.clickCard(this.chagatai);
            expect(this.chagatai.getMilitarySkill()).toBe(3);
            expect(this.chagatai.getPoliticalSkill()).toBe(3);

            expect(this.getChatLogs(5)).toContain('player2 uses Daidōji Ienori to set the skills of Moto Chagatai to 3military/3political and prevent them from receiving status tokens');

            this.player1.clickCard(this.alchemist);
            expect(this.player1).not.toBeAbleToSelect(this.chagatai);
            expect(this.player1).toBeAbleToSelect(this.yoshi);
            expect(this.player1).toBeAbleToSelect(this.ienori);
            this.player1.clickPrompt('Cancel');
            this.chagatai.honor();
            this.game.checkGameState(true);

            this.player1.clickCard(this.alchemist);
            expect(this.player1).toBeAbleToSelect(this.chagatai);
            expect(this.player1).toBeAbleToSelect(this.yoshi);
            expect(this.player1).toBeAbleToSelect(this.ienori);
        });

        it('should not block status tokens if not honored', function() {
            this.ienori.dishonor();
            this.game.checkGameState(true);
            expect(this.player2).toHavePrompt('Conflict Action Window');
            this.player2.clickCard(this.ienori);
            expect(this.player2).toBeAbleToSelect(this.chagatai);
            expect(this.player2).toBeAbleToSelect(this.yoshi);
            expect(this.player2).toBeAbleToSelect(this.ienori);
            this.player2.clickCard(this.chagatai);
            expect(this.chagatai.getMilitarySkill()).toBe(3);
            expect(this.chagatai.getPoliticalSkill()).toBe(3);

            expect(this.getChatLogs(5)).toContain('player2 uses Daidōji Ienori to set the skills of Moto Chagatai to 3military/3political');

            this.player1.clickCard(this.alchemist);
            expect(this.player1).toBeAbleToSelect(this.chagatai);
            expect(this.player1).toBeAbleToSelect(this.yoshi);
            expect(this.player1).toBeAbleToSelect(this.ienori);
        });
    });
});
