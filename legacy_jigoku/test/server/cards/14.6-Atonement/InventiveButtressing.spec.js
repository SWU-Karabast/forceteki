describe('Inventive Buttressing', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['doji-kuwanan']
                },
                player2: {
                    hand: ['inventive-buttressing'],
                    inPlay: ['prodigy-of-the-waves']
                }
            });

            this.kuwanan = this.player1.findCardByName('doji-kuwanan');
            this.prodigy = this.player2.findCardByName('prodigy-of-the-waves');
            this.buttressing = this.player2.findCardByName('inventive-buttressing');

            this.sd1 = this.player2.findCardByName('shameful-display', 'province 1');
            this.sd2 = this.player2.findCardByName('shameful-display', 'province 2');
            this.sd3 = this.player2.findCardByName('shameful-display', 'province 3');
            this.sd4 = this.player2.findCardByName('shameful-display', 'province 4');
            this.sd5 = this.player2.findCardByName('shameful-display', 'stronghold province');

            this.p1SD = this.player1.findCardByName('shameful-display', 'province 1');

            this.sd3.isBroken = true;
            this.sd4.isBroken = true;
        });

        it('should be able to played on an unbroken province you control', function() {
            this.player1.pass();
            this.player2.clickCard(this.buttressing);
            expect(this.player2).toBeAbleToSelect(this.sd1);
            expect(this.player2).toBeAbleToSelect(this.sd2);
            expect(this.player2).not.toBeAbleToSelect(this.sd3);
            expect(this.player2).not.toBeAbleToSelect(this.sd4);
            expect(this.player2).toBeAbleToSelect(this.sd5);
            expect(this.player2).not.toBeAbleToSelect(this.p1SD);
            this.player2.clickCard(this.sd1);
            expect(this.buttressing.parent).toBe(this.sd1);
        });

        it('should discard if the province is broken', function() {
            this.player1.pass();
            this.player2.clickCard(this.buttressing);
            this.player2.clickCard(this.sd1);

            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.kuwanan],
                defenders: [],
                type: 'political',
                province: this.sd1
            });

            this.noMoreActions();
            this.player1.clickPrompt('No');
            expect(this.buttressing.location).toBe('conflict discard pile');
            expect(this.getChatLogs(5)).toContain('Inventive Buttressing is discarded from Shameful Display as it is no longer legally attached');
        });

        it('should give +3 strength during mil conflicts', function() {
            this.player1.pass();
            this.player2.clickCard(this.buttressing);
            this.player2.clickCard(this.sd1);

            let strength = this.sd1.getStrength();

            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.kuwanan],
                defenders: [],
                type: 'military',
                province: this.sd1
            });

            expect(this.sd1.getStrength()).toBe(strength + 3);
        });

        it('should give +3 strength during mil conflicts even if this isn\'t the attacked province', function() {
            this.player1.pass();
            this.player2.clickCard(this.buttressing);
            this.player2.clickCard(this.sd1);

            let strength = this.sd1.getStrength();

            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.kuwanan],
                defenders: [],
                type: 'military',
                province: this.sd2
            });

            expect(this.sd1.getStrength()).toBe(strength + 3);
        });

        it('should not give +3 strength during pol conflicts', function() {
            this.player1.pass();
            this.player2.clickCard(this.buttressing);
            this.player2.clickCard(this.sd1);

            let strength = this.sd1.getStrength();

            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.kuwanan],
                defenders: [],
                type: 'political',
                province: this.sd1
            });

            expect(this.sd1.getStrength()).toBe(strength);
        });
    });
});
