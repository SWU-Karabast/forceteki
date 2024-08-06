describe('Mirumoto\'s Peak', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['doji-challenger', 'doji-kuwanan', 'mirumoto-rei', 'kakita-yoshi'],
                    hand: ['fine-katana', 'pathfinder-s-blade', 'inscribed-tanto', 'scarlet-sabre', 'ornate-fan', 'spell-scroll', 'a-perfect-cut', 'togashi-acolyte']
                },
                player2: {
                    inPlay: ['border-rider']
                }
            });

            this.rei = this.player1.findCardByName('mirumoto-rei');
            this.yoshi = this.player1.findCardByName('kakita-yoshi');
            this.challenger = this.player1.findCardByName('doji-challenger');
            this.kuwanan = this.player1.findCardByName('doji-kuwanan');
            this.borderRider = this.player2.findCardByName('border-rider');
            this.cut = this.player1.findCardByName('a-perfect-cut');
            this.acolyte = this.player1.findCardByName('togashi-acolyte');

            this.katana = this.player1.findCardByName('fine-katana');
            this.pfb = this.player1.findCardByName('pathfinder-s-blade');
            this.tanto = this.player1.findCardByName('inscribed-tanto');
            this.sabre = this.player1.findCardByName('scarlet-sabre');
            this.fan = this.player1.findCardByName('ornate-fan');
            this.scroll = this.player1.findCardByName('spell-scroll');
        });

        it('should let you choose another Bushi you control and give you a skill bonus equal to their attachment bonus', function() {
            let mil = this.rei.getMilitarySkill();
            let pol = this.rei.getPoliticalSkill();

            this.player1.playAttachment(this.fan, this.challenger);
            this.player2.pass();
            this.player1.playAttachment(this.scroll, this.challenger);
            this.player2.pass();
            this.player1.playAttachment(this.katana, this.challenger);
            this.player2.pass();
            this.player1.playAttachment(this.pfb, this.challenger);
            this.player2.pass();
            this.player1.playAttachment(this.tanto, this.challenger);
            this.player2.pass();
            this.player1.clickCard(this.acolyte);
            this.player1.clickPrompt('Play Togashi Acolyte as an attachment');
            this.player1.clickCard(this.challenger);

            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.rei, this.challenger, this.kuwanan, this.yoshi],
                defenders: [this.borderRider]
            });
            this.player2.pass();
            this.player1.clickCard(this.cut);
            this.player1.clickCard(this.challenger);
            this.player1.clickCard(this.acolyte);

            this.player2.pass();
            this.player1.clickCard(this.rei);
            expect(this.player1).toBeAbleToSelect(this.kuwanan);
            expect(this.player1).toBeAbleToSelect(this.challenger);
            expect(this.player1).not.toBeAbleToSelect(this.yoshi);
            expect(this.player1).not.toBeAbleToSelect(this.rei);
            expect(this.player1).not.toBeAbleToSelect(this.borderRider);

            this.player1.clickCard(this.challenger);
            expect(this.getChatLogs(5)).toContain('player1 uses Mirumoto Rei to give Mirumoto Rei a skill bonus equal to the total attachment skill bonus on Doji Challenger (4military/2political)');

            expect(this.rei.getMilitarySkill()).toBe(mil + 4);
            expect(this.rei.getPoliticalSkill()).toBe(pol + 2);
        });
    });
});
