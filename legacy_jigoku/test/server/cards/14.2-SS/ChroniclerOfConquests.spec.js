describe('Chronicler of Conquests', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['chronicler-of-conquests'],
                    hand: ['total-warfare'],
                    dynastyDiscard: ['borderlands-fortifications'],
                    provinces: ['dishonorable-assault']
                },
                player2: {
                    provinces: ['fertile-fields']
                }
            });

            this.chronicler = this.player1.findCardByName('chronicler-of-conquests');
            this.assault = this.player1.findCardByName('dishonorable-assault');
            this.fortification = this.player1.findCardByName('borderlands-fortifications');

            this.fields = this.player2.findCardByName('fertile-fields');
            this.totalWarfare = this.player1.findCardByName('total-warfare');

            this.noMoreActions();
            this.initiateConflict({
                type: 'political',
                attackers: [this.chronicler],
                defenders: []
            });
        });

        it('should not work if a battlefield is not in play', function() {
            this.player2.pass();
            expect(this.player1).toHavePrompt('Conflict Action Window');
            this.player1.clickCard(this.chronicler);
            expect(this.player1).toHavePrompt('Conflict Action Window');
        });

        it('should work if a battlefield is in play during a conflict - attachment', function() {
            let p1honor = this.player1.honor;
            let p2honor = this.player2.honor;
            this.player2.pass();
            this.player1.playAttachment(this.totalWarfare, this.fields);
            this.player2.pass();
            this.player1.clickCard(this.chronicler);
            expect(this.player1.honor).toBe(p1honor + 1);
            expect(this.player2.honor).toBe(p2honor);
            expect(this.getChatLogs(3)).toContain('player1 uses Chronicler of Conquests to gain 1 honor');
        });

        it('should work if a battlefield is in play during a conflict - province', function() {
            let p1honor = this.player1.honor;
            let p2honor = this.player2.honor;
            this.assault.facedown = false;
            this.player2.pass();
            this.player1.clickCard(this.chronicler);
            expect(this.player1.honor).toBe(p1honor + 1);
            expect(this.player2.honor).toBe(p2honor);
            expect(this.getChatLogs(3)).toContain('player1 uses Chronicler of Conquests to gain 1 honor');
        });

        it('should work if a battlefield is in play during a conflict - holding', function() {
            let p1honor = this.player1.honor;
            let p2honor = this.player2.honor;
            this.player1.placeCardInProvince(this.fortification, 'province 1');
            this.player2.pass();
            this.player1.clickCard(this.chronicler);
            expect(this.player1.honor).toBe(p1honor + 1);
            expect(this.player2.honor).toBe(p2honor);
            expect(this.getChatLogs(3)).toContain('player1 uses Chronicler of Conquests to gain 1 honor');
        });
    });
});
