describe('Talented Performer', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['talented-performer', 'doji-challenger', 'doji-diplomat'],
                    hand: ['above-question', 'heresy', 'way-of-the-crane', 'noble-sacrifice']
                },
                player2: {
                    inPlay: ['mirumoto-raitsugu', 'doji-whisperer'],
                    hand: ['banzai', 'court-games', 'harmonize', 'ornate-fan']
                }
            });

            this.challenger = this.player1.findCardByName('doji-challenger');
            this.performer = this.player1.findCardByName('talented-performer');
            this.crane = this.player1.findCardByName('way-of-the-crane');
            this.nobleSac = this.player1.findCardByName('noble-sacrifice');
            this.diplomat = this.player1.findCardByName('doji-diplomat');
            this.aboveQuestion = this.player1.findCardByName('above-question');
            this.heresy = this.player1.findCardByName('heresy');

            this.mirumotoRaitsugu = this.player2.findCardByName('mirumoto-raitsugu');
            this.whisperer = this.player2.findCardByName('doji-whisperer');
            this.banzai = this.player2.findCardByName('banzai');
            this.courtgames = this.player2.findCardByName('court-games');
            this.harmonize = this.player2.findCardByName('harmonize');
            this.fan = this.player2.findCardByName('ornate-fan');
            this.noMoreActions();
        });

        it('should not have to be selected by attachments', function() {
            this.initiateConflict({
                type: 'political',
                attackers: [this.performer, this.challenger],
                defenders: [this.mirumotoRaitsugu, this.whisperer]
            });
            this.player2.clickCard('ornate-fan');
            expect(this.player2).toHavePrompt('Ornate Fan');
            expect(this.player2).toBeAbleToSelect(this.performer);
            expect(this.player2).toBeAbleToSelect(this.challenger);
            expect(this.player2).toBeAbleToSelect(this.mirumotoRaitsugu);
            expect(this.player2).toBeAbleToSelect(this.whisperer);
        });

        it('should not have to be selected by character abilities', function() {
            this.initiateConflict({
                type: 'political',
                attackers: [this.performer, this.challenger],
                defenders: [this.mirumotoRaitsugu, this.whisperer]
            });
            this.player2.clickCard(this.mirumotoRaitsugu);
            expect(this.player2).toBeAbleToSelect(this.performer);
            expect(this.player2).toBeAbleToSelect(this.challenger);
        });

        it('should have to be selected by events - opponent', function() {
            this.initiateConflict({
                type: 'political',
                attackers: [this.performer, this.challenger],
                defenders: [this.mirumotoRaitsugu, this.whisperer]
            });
            let mil = this.performer.militarySkill;

            this.player2.clickCard(this.banzai);
            expect(this.player2).toHavePrompt('Banzai!');
            expect(this.player2).toBeAbleToSelect(this.performer);
            expect(this.player2).not.toBeAbleToSelect(this.challenger);
            expect(this.player2).not.toBeAbleToSelect(this.mirumotoRaitsugu);
            expect(this.player2).not.toBeAbleToSelect(this.whisperer);
            this.player2.clickCard(this.performer);
            this.player2.clickPrompt('Lose 1 honor to resolve this ability again');
            expect(this.player2).toBeAbleToSelect(this.performer);
            expect(this.player2).not.toBeAbleToSelect(this.challenger);
            expect(this.player2).not.toBeAbleToSelect(this.mirumotoRaitsugu);
            expect(this.player2).not.toBeAbleToSelect(this.whisperer);
            this.player2.clickCard(this.performer);
            this.player2.clickPrompt('Done');
            expect(this.performer.militarySkill).toBe(mil + 4);
        });

        it('should have to be selected by events - self', function() {
            this.initiateConflict({
                type: 'political',
                attackers: [this.performer, this.challenger],
                defenders: [this.mirumotoRaitsugu, this.whisperer]
            });

            this.player2.pass();
            this.player1.clickCard(this.crane);
            expect(this.player1).toBeAbleToSelect(this.performer);
            expect(this.player1).not.toBeAbleToSelect(this.challenger);
            expect(this.player1).not.toBeAbleToSelect(this.diplomat);
        });

        it('should have to be selected by events - not participating', function() {
            this.initiateConflict({
                type: 'political',
                attackers: [this.challenger],
                defenders: [this.mirumotoRaitsugu, this.whisperer]
            });

            this.player2.pass();
            this.player1.clickCard(this.crane);
            expect(this.player1).toBeAbleToSelect(this.performer);
            expect(this.player1).not.toBeAbleToSelect(this.challenger);
            expect(this.player1).not.toBeAbleToSelect(this.diplomat);
        });

        it('should not have to be selected by events - not eligible target', function() {
            this.initiateConflict({
                type: 'political',
                attackers: [this.challenger],
                defenders: [this.mirumotoRaitsugu, this.whisperer]
            });

            this.performer.honor();
            this.player2.pass();
            this.player1.clickCard(this.crane);
            expect(this.player1).not.toBeAbleToSelect(this.performer);
            expect(this.player1).toBeAbleToSelect(this.challenger);
            expect(this.player1).toBeAbleToSelect(this.diplomat);
        });

        it('should have to be selected by Court Games if you choose that option (but should let you pick either option)', function() {
            this.initiateConflict({
                type: 'political',
                attackers: [this.performer, this.challenger],
                defenders: [this.mirumotoRaitsugu, this.whisperer]
            });
            this.player2.clickCard(this.courtgames);
            expect(this.player2).toHavePromptButton('Honor a friendly character');
            expect(this.player2).toHavePromptButton('Dishonor an opposing character');
            this.player2.clickPrompt('Dishonor an opposing character');
            expect(this.player1).toHavePrompt('Court Games');
            expect(this.player1).toBeAbleToSelect(this.performer);
            expect(this.player1).not.toBeAbleToSelect(this.challenger);
            expect(this.player1).not.toBeAbleToSelect(this.mirumotoRaitsugu);
            expect(this.player1).not.toBeAbleToSelect(this.whisperer);
        });

        it('should not have to be selected if it cannot be targeted', function() {
            this.initiateConflict({
                type: 'political',
                attackers: [this.challenger],
                defenders: [this.mirumotoRaitsugu, this.whisperer]
            });
            this.player2.clickCard(this.courtgames);
            expect(this.player2).toHavePromptButton('Honor a friendly character');
            expect(this.player2).toHavePromptButton('Dishonor an opposing character');
            this.player2.clickPrompt('Dishonor an opposing character');
            expect(this.player1).toHavePrompt('Court Games');
            expect(this.player1).not.toBeAbleToSelect(this.performer);
            expect(this.player1).toBeAbleToSelect(this.challenger);
            expect(this.player1).not.toBeAbleToSelect(this.mirumotoRaitsugu);
            expect(this.player1).not.toBeAbleToSelect(this.whisperer);
        });

        it('should have to be selected by Harmonize if it is a legal target', function() {
            this.initiateConflict({
                type: 'political',
                attackers: [this.performer, this.diplomat],
                defenders: [this.mirumotoRaitsugu, this.whisperer]
            });
            this.player2.clickCard(this.harmonize);
            expect(this.player2).toHavePrompt('Harmonize');
            expect(this.player2).toBeAbleToSelect(this.mirumotoRaitsugu);
            expect(this.player2).toBeAbleToSelect(this.whisperer);
            expect(this.player2).not.toBeAbleToSelect(this.performer);
            this.player2.clickCard(this.mirumotoRaitsugu);
            expect(this.player2).toBeAbleToSelect(this.performer);
            expect(this.player2).not.toBeAbleToSelect(this.challenger);
            this.player2.clickPrompt('Cancel');
            this.player2.clickCard('harmonize');
            this.player2.clickCard(this.whisperer);
            expect(this.player2).not.toBeAbleToSelect(this.performer);
            expect(this.player2).toBeAbleToSelect(this.diplomat);
        });

        it('should not be able to be selected when it has Above Question', function() {
            this.initiateConflict({
                type: 'political',
                attackers: [this.performer, this.challenger],
                defenders: [this.mirumotoRaitsugu, this.whisperer]
            });
            this.player2.pass();
            this.player1.playAttachment(this.aboveQuestion, this.performer);
            this.player2.clickCard(this.banzai);
            expect(this.player2).toHavePrompt('Banzai!');
            expect(this.player2).not.toBeAbleToSelect(this.performer);
            expect(this.player2).toBeAbleToSelect(this.challenger);
            expect(this.player2).toBeAbleToSelect(this.mirumotoRaitsugu);
            expect(this.player2).toBeAbleToSelect(this.whisperer);
        });

        it('should not have to be selected for costs', function() {
            this.initiateConflict({
                type: 'political',
                attackers: [this.challenger],
                defenders: [this.mirumotoRaitsugu, this.whisperer]
            });

            this.performer.honor();
            this.diplomat.honor();
            this.mirumotoRaitsugu.dishonor();
            this.player2.pass();
            this.player1.clickCard(this.nobleSac);
            this.player1.clickCard(this.mirumotoRaitsugu);
            expect(this.player1).toBeAbleToSelect(this.performer);
            expect(this.player1).not.toBeAbleToSelect(this.challenger);
            expect(this.player1).toBeAbleToSelect(this.diplomat);
        });

        it('should have to be selected for duels that let opponent pick my target', function() {
            this.initiateConflict({
                type: 'political',
                attackers: [this.challenger, this.performer],
                defenders: [this.mirumotoRaitsugu, this.whisperer]
            });

            this.player2.pass();
            this.player1.clickCard(this.heresy);
            this.player1.clickCard(this.mirumotoRaitsugu);
            expect(this.player2).toBeAbleToSelect(this.performer);
            expect(this.player2).not.toBeAbleToSelect(this.challenger);
            expect(this.player2).not.toBeAbleToSelect(this.diplomat);
        });
    });
});
