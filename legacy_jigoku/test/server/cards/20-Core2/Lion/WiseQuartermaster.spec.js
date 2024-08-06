describe('Wise Quartermaster', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['wise-quartermaster', 'meticulous-scout', 'matsu-berserker'],
                    hand: ['the-lion-s-shadow', 'fiery-madness', 'makeshift-war-camp'],
                    provinces: ['ancestral-lands', 'manicured-garden']
                },
                player2: {
                    inPlay: ['wandering-ronin', 'doji-whisperer'],
                    hand: ['ornate-fan', 'treasured-gift'],
                    provinces: ['tsuma']
                }
            });

            this.wiseQuartermaster = this.player1.findCardByName('wise-quartermaster');
            this.meticulousScout = this.player1.findCardByName('meticulous-scout');
            this.matsuBerserker = this.player1.findCardByName('matsu-berserker');
            this.theLionsShadow = this.player1.findCardByName('the-lion-s-shadow');
            this.fieryMadness = this.player1.findCardByName('fiery-madness');
            this.makeshiftWarCamp = this.player1.findCardByName('makeshift-war-camp');
            this.manicuredGarden = this.player1.findCardByName('manicured-garden');
            this.ancestralLands = this.player1.findCardByName('ancestral-lands');

            this.wanderingRonin = this.player2.findCardByName('wandering-ronin');
            this.dojiWhisperer = this.player2.findCardByName('doji-whisperer');
            this.ornateFan = this.player2.findCardByName('ornate-fan');
            this.treasuredGift = this.player2.findCardByName('treasured-gift');
            this.tsuma = this.player2.findCardByName('tsuma');

            this.player1.playAttachment(this.theLionsShadow, this.meticulousScout);
            this.player2.playAttachment(this.ornateFan, this.dojiWhisperer);
            this.player1.playAttachment(this.fieryMadness, this.wanderingRonin);
            this.player2.playAttachment(this.treasuredGift, this.matsuBerserker);
            this.player1.playAttachment(this.fieryMadness, this.wanderingRonin);
            this.player1.playAttachment(this.makeshiftWarCamp, this.manicuredGarden);
            this.player2.pass();
        });

        it('chooses your attachments on a card you control', function () {
            this.player1.clickCard(this.wiseQuartermaster);
            expect(this.player1).toHavePrompt('Choose an attachment');
            expect(this.player1).toBeAbleToSelect(this.theLionsShadow);
            expect(this.player1).toBeAbleToSelect(this.makeshiftWarCamp);
            expect(this.player1).not.toBeAbleToSelect(this.ornateFan);
            expect(this.player1).not.toBeAbleToSelect(this.fieryMadness);
            expect(this.player1).not.toBeAbleToSelect(this.treasuredGift);
        });

        it('moves your attachments on your provinces to another province you control', function () {
            this.player1.clickCard(this.wiseQuartermaster);
            this.player1.clickCard(this.makeshiftWarCamp);
            expect(this.getChatLogs(2)).toContain(
                'player1 uses Wise Quartermaster to move Makeshift War Camp to another province'
            );
            expect(this.player1).toHavePrompt('Choose a province');
            expect(this.player1).toBeAbleToSelect(this.ancestralLands);
            expect(this.player1).not.toBeAbleToSelect(this.tsuma);

            this.player1.clickCard(this.ancestralLands);
            expect(this.ancestralLands.attachments).toContain(this.makeshiftWarCamp);
            expect(this.manicuredGarden.attachments).not.toContain(this.makeshiftWarCamp);
            expect(this.getChatLogs(2)).toContain('player1 moves Makeshift War Camp to Ancestral Lands');
        });

        it('moves your attachments on your characters to another character you control', function () {
            this.player1.clickCard(this.wiseQuartermaster);
            this.player1.clickCard(this.theLionsShadow);
            expect(this.getChatLogs(2)).toContain(
                "player1 uses Wise Quartermaster to move The Lion's Shadow to another character"
            );
            expect(this.player1).toHavePrompt('Choose a character');
            expect(this.player1).toBeAbleToSelect(this.wiseQuartermaster);
            expect(this.player1).not.toBeAbleToSelect(this.meticulousScout);
            expect(this.player1).not.toBeAbleToSelect(this.matsuBerserker);
            expect(this.player1).not.toBeAbleToSelect(this.theLionsShadow);
            expect(this.player1).not.toBeAbleToSelect(this.manicuredGarden);
            expect(this.player1).not.toBeAbleToSelect(this.wanderingRonin);
            expect(this.player1).not.toBeAbleToSelect(this.dojiWhisperer);
            expect(this.player1).not.toBeAbleToSelect(this.ornateFan);

            this.player1.clickCard(this.wiseQuartermaster);
            expect(this.wiseQuartermaster.attachments).toContain(this.theLionsShadow);
            expect(this.meticulousScout.attachments).not.toContain(this.theLionsShadow);
            expect(this.getChatLogs(2)).toContain("player1 moves The Lion's Shadow to Wise Quartermaster");
        });
    });
});