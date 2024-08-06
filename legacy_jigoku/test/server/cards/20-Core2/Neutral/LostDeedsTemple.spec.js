xdescribe('Lost Deeds Temple', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['aggressive-moto', 'worldly-shiotome', 'iuchi-rimei'],
                    hand: ['fine-katana', 'ornate-fan', 'cloud-the-mind']
                },
                player2: {
                    inPlay: ['togashi-initiate', 'togashi-yokuni', 'doomed-shugenja'],
                    hand: ['smoke', 'jade-masterpiece', 'seiji-s-fate'],
                    provinces: ['lost-deeds-temple']
                }
            });

            this.aggressiveMoto = this.player1.findCardByName('aggressive-moto');
            this.wordlyShiotome = this.player1.findCardByName('worldly-shiotome');
            this.rimei = this.player1.findCardByName('iuchi-rimei');
            this.fineKatana = this.player1.findCardByName('fine-katana');
            this.ornateFan = this.player1.findCardByName('ornate-fan');
            this.cloudTheMind = this.player1.findCardByName('cloud-the-mind');

            this.initiate = this.player2.findCardByName('togashi-initiate');
            this.yokuni = this.player2.findCardByName('togashi-yokuni');
            this.doomedShugenja = this.player2.findCardByName('doomed-shugenja');
            this.smoke = this.player2.findCardByName('smoke');
            this.jadeMasterpiece = this.player2.findCardByName('jade-masterpiece');
            this.seijisFate = this.player2.findCardByName('seiji-s-fate');

            this.lostDeedsTemple = this.player2.findCardByName('lost-deeds-temple', 'province 1');

            this.player1.playAttachment(this.fineKatana, this.aggressiveMoto);
            this.player2.playAttachment(this.smoke, this.yokuni);
            this.player1.playAttachment(this.ornateFan, this.rimei);
            this.player2.playAttachment(this.jadeMasterpiece, this.initiate);
            this.player1.playAttachment(this.cloudTheMind, this.yokuni);
            this.player2.playAttachment(this.seijisFate, this.wordlyShiotome);
        });

        it('removes all attachments from a participating character', function () {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.aggressiveMoto, this.wordlyShiotome],
                defenders: [this.yokuni, this.initiate, this.doomedShugenja],
                province: this.lostDeedsTemple
            });

            this.player2.clickCard(this.lostDeedsTemple);
            expect(this.player2).toBeAbleToSelect(this.aggressiveMoto);
            expect(this.player2).toBeAbleToSelect(this.wordlyShiotome);
            expect(this.player2).not.toBeAbleToSelect(this.rimei); // at home
            expect(this.player2).toBeAbleToSelect(this.initiate);
            expect(this.player2).toBeAbleToSelect(this.yokuni);
            expect(this.player2).not.toBeAbleToSelect(this.doomedShugenja); // no attachments

            this.player2.clickCard(this.aggressiveMoto);
            expect(this.fineKatana.location).toBe('conflict discard pile');
            expect(this.getChatLogs(3)).toContain(
                'player2 uses Lost Deeds Temple to remove all attachments from Aggressive Moto'
            );
        });
    });
});