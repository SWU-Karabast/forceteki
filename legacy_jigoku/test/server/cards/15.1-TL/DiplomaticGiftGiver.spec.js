describe('Diplomatic Gift-Giver', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['diplomatic-gift-giver', 'doji-challenger']
                },
                player2: {
                    inPlay: ['borderlands-defender'],
                    provinces: ['blood-of-onnotangu', 'fertile-fields']
                }
            });
            this.diplomatic = this.player1.findCardByName('diplomatic-gift-giver');
            this.blood = this.player2.findCardByName('blood-of-onnotangu');
            this.fields = this.player2.findCardByName('fertile-fields');
            this.borderlandsDefender = this.player2.findCardByName('borderlands-defender');
            this.challenger = this.player1.findCardByName('doji-challenger');
        });


        it('should allow you to put fate on two characters', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.diplomatic],
                defenders: [this.borderlandsDefender],
                province: this.fields
            });
            let cFate = this.challenger.fate;
            let pFate = this.player2.fate;
            let bFate = this.borderlandsDefender.fate;
            let p1Fate = this.player1.fate;
            this.player2.pass();
            this.player1.clickCard(this.diplomatic);
            expect(this.player1).toBeAbleToSelect(this.borderlandsDefender);
            expect(this.player1).not.toBeAbleToSelect(this.diplomatic);
            this.player1.clickCard(this.borderlandsDefender);
            expect(this.player2).toBeAbleToSelect(this.diplomatic);
            expect(this.player2).not.toBeAbleToSelect(this.borderlandsDefender);
            expect(this.player2).toBeAbleToSelect(this.challenger);
            this.player2.clickCard(this.challenger);
            expect(this.challenger.fate).toBe(cFate + 1);
            expect(this.player2.fate).toBe(pFate - 1);
            expect(this.borderlandsDefender.fate).toBe(bFate + 1);
            expect(this.player1.fate).toBe(p1Fate - 1);
            expect(this.getChatLogs(5)).toContain('player1 uses Diplomatic Gift-Giver to gift a fate onto Borderlands Defender and Doji Challenger');
        });

        it('should not allow action if player 1 has no fate', function() {
            this.player1.fate = 0;
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.diplomatic],
                defenders: [this.borderlandsDefender],
                province: this.fields
            });
            this.player2.pass();
            this.player1.clickCard(this.diplomatic);
            expect(this.player1).toHavePrompt('Conflict Action Window');

        });

        it('should not allow action if player 2 has no fate', function() {
            this.player2.fate = 0;
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.diplomatic],
                defenders: [this.borderlandsDefender],
                province: this.fields
            });
            this.player2.pass();
            this.player1.clickCard(this.diplomatic);
            expect(this.player1).toHavePrompt('Conflict Action Window');

        });

        it('should not let you take the action if you cannot spend fate', function() {
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.diplomatic],
                defenders: [this.borderlandsDefender],
                province: this.blood
            });


            this.player2.pass();
            this.player1.clickCard(this.diplomatic);
            expect(this.player1).toHavePrompt('Conflict Action Window');
        });

        it('should not let you trigger if you are not participating', function() {
            this.noMoreActions();
            this.initiateConflict({
                type:'military',
                attackers:[this.challenger],
                defenders: [this.borderlandsDefender],
                province: this.fields
            });
            this.player2.pass();
            this.player1.clickCard(this.diplomatic);
            expect(this.player1).toHavePrompt('Conflict Action Window');
        });


    });
});


