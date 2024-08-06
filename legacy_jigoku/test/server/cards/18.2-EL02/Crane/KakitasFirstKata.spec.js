describe('Kakita\'s First Kata', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['vice-proprietor'],
                    hand: ['a-fate-worse-than-death']
                },
                player2: {
                    inPlay: ['kakita-yoshi', 'doji-challenger', 'hantei-sotorii', 'mirumoto-raitsugu'],
                    hand: ['kakita-s-first-kata']
                }
            });

            this.vice = this.player1.findCardByName('vice-proprietor');
            this.yoshi = this.player2.findCardByName('kakita-yoshi');
            this.challenger = this.player2.findCardByName('doji-challenger');
            this.sotorii = this.player2.findCardByName('hantei-sotorii');
            this.raitsugu = this.player2.findCardByName('mirumoto-raitsugu');
            this.stance = this.player2.findCardByName('kakita-s-first-kata');

            this.afwtd = this.player1.findCardByName('a-fate-worse-than-death');
            this.challenger.bow();
        });

        it('should let you target a duelist or crane', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.vice],
                defenders: [this.yoshi, this.sotorii, this.raitsugu],
                type: 'political'
            });

            this.player2.clickCard(this.stance);
            expect(this.player2).toBeAbleToSelect(this.yoshi);
            expect(this.player2).not.toBeAbleToSelect(this.sotorii);
            expect(this.player2).toBeAbleToSelect(this.challenger);
            expect(this.player2).toBeAbleToSelect(this.raitsugu);
        });

        it('should prevent bowing and moving', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.vice],
                defenders: [this.yoshi, this.sotorii, this.raitsugu],
                type: 'political'
            });

            this.player2.clickCard(this.stance);
            this.player2.clickCard(this.yoshi);
            this.player1.clickCard(this.vice);
            expect(this.player2).toBeAbleToSelect(this.sotorii);
            expect(this.player2).toBeAbleToSelect(this.raitsugu);
            expect(this.player2).not.toBeAbleToSelect(this.yoshi);
            expect(this.getChatLogs(5)).toContain('player2 plays Kakita\'s First Kata to prevent opponents\' actions from bowing or moving Kakita Yoshi');
        });

        it('should prevent bowing and moving', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.vice],
                defenders: [this.yoshi, this.sotorii, this.raitsugu],
                type: 'political'
            });

            this.player2.clickCard(this.stance);
            this.player2.clickCard(this.yoshi);
            this.player1.clickCard(this.afwtd);
            this.player1.clickCard(this.yoshi);
            expect(this.yoshi.bowed).toBe(false);
            expect(this.yoshi.isParticipating()).toBe(true);
            expect(this.yoshi.isDishonored).toBe(true);
        });

        it('should ready if bowed during conflict', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.vice],
                defenders: [this.yoshi, this.sotorii, this.raitsugu],
                type: 'political'
            });

            this.player2.pass();
            this.player1.clickCard(this.vice);
            this.player2.clickCard(this.yoshi);
            expect(this.yoshi.bowed).toBe(true);

            this.player2.clickCard(this.stance);
            this.player2.clickCard(this.yoshi);

            expect(this.yoshi.bowed).toBe(false);
            expect(this.getChatLogs(5)).toContain('player2 plays Kakita\'s First Kata to ready and prevent opponents\' actions from bowing or moving Kakita Yoshi');
        });

        it('should not ready if not bowed during conflict', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.vice],
                defenders: [this.yoshi, this.sotorii, this.raitsugu],
                type: 'political'
            });

            this.player2.pass();
            this.player1.clickCard(this.vice);
            this.player2.clickCard(this.yoshi);
            expect(this.yoshi.bowed).toBe(true);

            this.player2.clickCard(this.stance);
            this.player2.clickCard(this.challenger);

            expect(this.challenger.bowed).toBe(true);
        });
    });
});
