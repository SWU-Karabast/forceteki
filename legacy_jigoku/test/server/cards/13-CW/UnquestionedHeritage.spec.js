describe('Unquestioned Heritage', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['doji-kuwanan', 'doomed-shugenja'],
                    hand: [
                        'fine-katana',
                        'cloud-the-mind',
                        'finger-of-jade',
                        'height-of-fashion',
                        'force-of-the-river',
                        'unquestioned-heritage'
                    ]
                },
                player2: {
                    inPlay: ['iuchi-rimei', 'hida-kisada'],
                    hand: ['ornate-fan', 'finger-of-jade']
                }
            });

            this.rimei = this.player2.findCardByName('iuchi-rimei');
            this.kisada = this.player2.findCardByName('hida-kisada');
            this.fan = this.player2.findCardByName('ornate-fan');
            this.jade2 = this.player2.findCardByName('finger-of-jade');

            this.kuwanan = this.player1.findCardByName('doji-kuwanan');
            this.doomed = this.player1.findCardByName('doomed-shugenja');
            this.cloud = this.player1.findCardByName('cloud-the-mind');
            this.katana = this.player1.findCardByName('fine-katana');
            this.finger = this.player1.findCardByName('finger-of-jade');
            this.fashion = this.player1.findCardByName('height-of-fashion');
            this.river = this.player1.findCardByName('force-of-the-river');

            this.heritage = this.player1.findCardByName('unquestioned-heritage');

            this.player1.playAttachment(this.katana, this.rimei);
            this.player2.playAttachment(this.fan, this.doomed);
            this.player1.playAttachment(this.finger, this.kuwanan);
            this.player2.pass();
            this.player1.playAttachment(this.cloud, this.kisada);
            this.player2.pass();
            this.player1.playAttachment(this.fashion, this.kuwanan);
            this.player2.pass();
            this.player1.playAttachment(this.river, this.doomed);
            this.player2.playAttachment(this.jade2, this.kisada);
        });

        it('should not work if you have not claimed the air ring', function () {
            expect(this.player1).toHavePrompt('Action Window');
            this.player1.clickCard(this.heritage);
            expect(this.player1).toHavePrompt('Action Window');
        });

        it('should not work if opponent has claimed the air ring', function () {
            this.player2.claimRing('air');
            expect(this.player1).toHavePrompt('Action Window');
            this.player1.clickCard(this.heritage);
            expect(this.player1).toHavePrompt('Action Window');
        });

        it('should work you have claimed the air ring', function () {
            this.player1.claimRing('air');
            expect(this.player1).toHavePrompt('Action Window');
            this.player1.clickCard(this.heritage);
            expect(this.player1).toHavePrompt('Unquestioned Heritage');
        });

        it('should only allow targeting an attachment on a character you control', function () {
            this.player1.claimRing('air');
            this.player1.clickCard(this.heritage);
            expect(this.player1).not.toBeAbleToSelect(this.cloud);
            expect(this.player1).toBeAbleToSelect(this.finger);
            expect(this.player1).toBeAbleToSelect(this.fan);
            expect(this.player1).not.toBeAbleToSelect(this.katana);
            expect(this.player1).not.toBeAbleToSelect(this.jade2);
            expect(this.player1).toBeAbleToSelect(this.fashion);
            expect(this.player1).toBeAbleToSelect(this.river);
        });

        it('should allow moving the attachment to any other character', function () {
            this.player1.claimRing('air');
            this.player1.clickCard(this.heritage);
            this.player1.clickCard(this.fan);
            expect(this.player1).toBeAbleToSelect(this.rimei);
            expect(this.player1).toBeAbleToSelect(this.kisada);
            expect(this.player1).toBeAbleToSelect(this.kuwanan);
            expect(this.player1).not.toBeAbleToSelect(this.doomed);

            this.player1.clickCard(this.rimei);
            expect(this.rimei.attachments).toContain(this.fan);
            expect(this.doomed.attachments).not.toContain(this.fan);

            expect(this.getChatLogs(2)).toContain(
                'player1 plays Unquestioned Heritage to move Ornate Fan to another character'
            );
            expect(this.getChatLogs(1)).toContain('player1 moves Ornate Fan to Iuchi Rimei');
        });

        it('should allow moving an attachment that can only be attached to \'characters you control\'', function () {
            this.player1.claimRing('air');
            this.player1.clickCard(this.heritage);
            this.player1.clickCard(this.finger);
            expect(this.player1).toBeAbleToSelect(this.doomed);
            this.player1.clickCard(this.doomed);

            expect(this.kuwanan.attachments).not.toContain(this.finger);
            expect(this.doomed.attachments).toContain(this.finger);

            expect(this.finger.location).toBe('play area');
        });

        it('finger of jade should not stop', function () {
            this.player1.claimRing('air');
            this.player1.clickCard(this.heritage);
            this.player1.clickCard(this.fan);
            this.player1.clickCard(this.kisada);
            expect(this.player2).not.toHavePrompt('Triggered Abilities');

            expect(this.kisada.attachments).toContain(this.fan);
            expect(this.doomed.attachments).not.toContain(this.fan);
        });

        it('should discard newly illegal attachments', function () {
            this.player1.claimRing('air');
            this.player1.clickCard(this.heritage);
            this.player1.clickCard(this.river);
            this.player1.clickCard(this.kuwanan);
            expect(this.river.location).toBe('conflict discard pile');
            expect(this.getChatLogs(3)).toContain(
                'player1 plays Unquestioned Heritage to move Force of the River to another character'
            );
            expect(this.getChatLogs(2)).toContain('player1 moves Force of the River to Doji Kuwanan');
        });

        it('should discard newly illegal attachments', function () {
            this.player1.claimRing('air');
            this.player1.clickCard(this.heritage);
            this.player1.clickCard(this.finger);
            this.player1.clickCard(this.rimei);
            expect(this.finger.location).toBe('conflict discard pile');
            expect(this.getChatLogs(3)).toContain(
                'player1 plays Unquestioned Heritage to move Finger of Jade to another character'
            );
            expect(this.getChatLogs(2)).toContain('player1 moves Finger of Jade to Iuchi Rimei');
        });
    });
});
