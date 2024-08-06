describe('Asahina Diviner', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['vice-proprietor', 'asahina-diviner', 'asahina-diviner'],
                    hand: ['a-new-name']
                },
                player2: {
                    inPlay: ['kakita-yoshi', 'doji-challenger', 'hantei-sotorii', 'mirumoto-raitsugu'],
                    hand: ['kakita-s-first-kata']
                }
            });

            this.diviner = this.player1.filterCardsByName('asahina-diviner')[0];
            this.diviner2 = this.player1.filterCardsByName('asahina-diviner')[1];
            this.vice = this.player1.findCardByName('vice-proprietor');
            this.yoshi = this.player2.findCardByName('kakita-yoshi');
            this.challenger = this.player2.findCardByName('doji-challenger');
            this.sotorii = this.player2.findCardByName('hantei-sotorii');
            this.raitsugu = this.player2.findCardByName('mirumoto-raitsugu');
            this.stance = this.player2.findCardByName('kakita-s-first-kata');
        });

        it('should give another participating character +3 glory', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.vice, this.diviner],
                defenders: [this.yoshi],
                type: 'political'
            });

            this.player2.pass();
            this.player1.clickCard(this.diviner);
            expect(this.player1).toBeAbleToSelect(this.vice);
            expect(this.player1).not.toBeAbleToSelect(this.diviner);
            expect(this.player1).toBeAbleToSelect(this.yoshi);
            expect(this.player1).not.toBeAbleToSelect(this.challenger);

            let glory = this.vice.glory;
            this.player1.clickCard(this.vice);
            expect(this.vice.glory).toBe(glory + 3);

            expect(this.getChatLogs(5)).toContain('player1 uses Asahina Diviner to give Vice Proprietor +3 glory until the end of the conflict');
        });

        it('should be max 1 per conflict', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.vice, this.diviner],
                defenders: [this.yoshi],
                type: 'political'
            });

            let glory = this.vice.glory;

            this.player2.pass();
            this.player1.clickCard(this.diviner);
            this.player1.clickCard(this.vice);
            expect(this.vice.glory).toBe(glory + 3);

            this.player2.pass();
            expect(this.player1).toHavePrompt('Conflict Action Window');
            this.player1.clickCard(this.diviner);
            expect(this.player1).toHavePrompt('Conflict Action Window');
        });

        it('should work at home', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.vice],
                defenders: [this.yoshi],
                type: 'political'
            });

            this.player2.pass();
            this.player1.clickCard(this.diviner);
            expect(this.player1).toBeAbleToSelect(this.vice);
            expect(this.player1).not.toBeAbleToSelect(this.diviner);
            expect(this.player1).toBeAbleToSelect(this.yoshi);
            expect(this.player1).not.toBeAbleToSelect(this.challenger);

            let glory = this.vice.glory;
            this.player1.clickCard(this.vice);
            expect(this.vice.glory).toBe(glory + 3);
        });

        it('should not work outside of a conflict', function() {
            expect(this.player1).toHavePrompt('Action Window');
            this.player1.clickCard(this.diviner);
            expect(this.player1).toHavePrompt('Action Window');
        });
    });
});
