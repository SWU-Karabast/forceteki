describe('In Search of Self', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['doji-whisperer', 'brash-samurai', 'doji-challenger', 'kakita-toshimoko', 'kakita-yoshi']
                },
                player2: {
                    inPlay: ['dazzling-duelist'],
                    hand: ['in-search-of-self']
                }
            });

            this.f1 = this.player1.findCardByName('doji-whisperer');
            this.f2 = this.player1.findCardByName('brash-samurai');
            this.f3 = this.player1.findCardByName('doji-challenger');
            this.f4 = this.player1.findCardByName('kakita-toshimoko');
            this.f5 = this.player1.findCardByName('kakita-yoshi');

            this.f1.dishonor();
            this.f2.dishonor();
            this.f3.dishonor();
            this.f4.dishonor();
            this.f5.dishonor();

            this.dazzling = this.player2.findCardByName('dazzling-duelist');
            this.sd1 = this.player2.findCardByName('shameful-display', 'province 1');
            this.sd2 = this.player2.findCardByName('shameful-display', 'province 2');
            this.sd3 = this.player2.findCardByName('shameful-display', 'province 3');
            this.sd4 = this.player2.findCardByName('shameful-display', 'province 4');
            this.sd5 = this.player2.findCardByName('shameful-display', 'stronghold province');
            this.self = this.player2.findCardByName('in-search-of-self');

            this.sd1.facedown = true;
            this.sd2.facedown = true;
            this.sd3.facedown = false;
            this.sd4.facedown = false;
            this.sd5.facedown = true;
        });

        it('should not be usable out of conflicts', function() {
            this.player1.pass();
            expect(this.player2).toHavePrompt('Action Window');
            this.player2.clickCard(this.self);
            expect(this.player2).toHavePrompt('Action Window');
        });

        it('should allow you to target an attacking character with cost equal or less than your facedown provinces', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.f1, this.f2, this.f3, this.f4, this.f5],
                defenders: [this.dazzling],
                type: 'military',
                province: this.sd3
            });

            this.player2.clickCard(this.self);
            expect(this.player2).toBeAbleToSelect(this.f1);
            expect(this.player2).toBeAbleToSelect(this.f2);
            expect(this.player2).toBeAbleToSelect(this.f3);
            expect(this.player2).not.toBeAbleToSelect(this.f4);
            expect(this.player2).not.toBeAbleToSelect(this.f5);
            expect(this.player2).not.toBeAbleToSelect(this.dazzling);
        });

        it('should bow the character', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.f1, this.f2, this.f3, this.f4, this.f5],
                defenders: [this.dazzling],
                type: 'military',
                province: this.sd3
            });

            this.player2.clickCard(this.self);
            this.player2.clickCard(this.f2);
            expect(this.f2.bowed).toBe(true);

            expect(this.getChatLogs(5)).toContain('player2 plays In Search of Self to bow Brash Samurai');
        });

        it('should be able to bow your own character', function() {
            this.noMoreActions();
            this.player1.passConflict();
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.dazzling],
                defenders: [this.f1]
            });

            this.player1.pass();
            this.player2.clickCard(this.self);
            expect(this.player2).not.toBeAbleToSelect(this.f1);
            expect(this.player2).toBeAbleToSelect(this.dazzling);
            this.player2.clickCard(this.dazzling);
            expect(this.dazzling.bowed).toBe(true);

            expect(this.getChatLogs(5)).toContain('player2 plays In Search of Self to bow Dazzling Duelist');
        });
    });
});
