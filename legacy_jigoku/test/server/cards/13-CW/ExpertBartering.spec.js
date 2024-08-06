describe('Expert Bartering', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    fate: 10,
                    inPlay: ['doji-kuwanan', 'doomed-shugenja'],
                    hand: [
                        'fine-katana',
                        'cloud-the-mind',
                        'finger-of-jade',
                        'height-of-fashion',
                        'force-of-the-river',
                        'expert-bartering'
                    ]
                },
                player2: {
                    inPlay: ['iuchi-rimei', 'hida-kisada'],
                    hand: ['ornate-fan', 'calling-in-favors', 'court-mask'],
                    provinces: ['blood-of-onnotangu']
                }
            });

            this.rimei = this.player2.findCardByName('iuchi-rimei');
            this.kisada = this.player2.findCardByName('hida-kisada');
            this.fan = this.player2.findCardByName('ornate-fan');
            this.calling = this.player2.findCardByName('calling-in-favors');
            this.blood = this.player2.findCardByName('blood-of-onnotangu');
            this.courtMask = this.player2.findCardByName('court-mask');

            this.kuwanan = this.player1.findCardByName('doji-kuwanan');
            this.doomed = this.player1.findCardByName('doomed-shugenja');
            this.cloud = this.player1.findCardByName('cloud-the-mind');
            this.katana = this.player1.findCardByName('fine-katana');
            this.finger = this.player1.findCardByName('finger-of-jade');
            this.fashion = this.player1.findCardByName('height-of-fashion');
            this.river = this.player1.findCardByName('force-of-the-river');
            this.expert = this.player1.findCardByName('expert-bartering');

            this.player1.playAttachment(this.katana, this.doomed);
            this.player2.playAttachment(this.fan, this.doomed);
            this.player1.playAttachment(this.finger, this.kuwanan);
            this.player2.playAttachment(this.courtMask, this.rimei);
            this.player1.playAttachment(this.cloud, this.kisada);
            this.player2.pass();
            this.player1.playAttachment(this.fashion, this.kuwanan);
            this.player2.pass();
            this.player1.playAttachment(this.river, this.doomed);
            this.player2.pass();
            this.player1.playAttachment(this.expert, this.kuwanan);
            this.player2.pass();
        });

        it('should prompt you to optionally spend a fate', function () {
            this.player1.clickCard(this.expert);
            expect(this.player1).toHavePrompt('Spend 1 fate?');
            expect(this.player1).toHavePromptButton('Yes');
            expect(this.player1).toHavePromptButton('No');
        });

        it('should take the fate if you want to spend it', function () {
            let fate = this.player1.fate;
            this.player1.clickCard(this.expert);
            expect(this.player1).toHavePrompt('Spend 1 fate?');
            expect(this.player1).toHavePromptButton('Yes');
            this.player1.clickPrompt('Yes');
            expect(this.player1.fate).toBe(fate - 1);
        });

        it('should not take the fate if you don\'t spend it', function () {
            let fate = this.player1.fate;
            this.player1.clickCard(this.expert);
            expect(this.player1).toHavePrompt('Spend 1 fate?');
            expect(this.player1).toHavePromptButton('No');
            this.player1.clickPrompt('No');
            expect(this.player1.fate).toBe(fate);
        });

        it('if you don\'t spend a fate should only allow targeting an attachment you control', function () {
            this.player1.clickCard(this.expert);
            this.player1.clickPrompt('No');

            expect(this.player1).toBeAbleToSelect(this.cloud);
            expect(this.player1).toBeAbleToSelect(this.finger);
            expect(this.player1).not.toBeAbleToSelect(this.fan);
            expect(this.player1).not.toBeAbleToSelect(this.courtMask);
            expect(this.player1).toBeAbleToSelect(this.katana);
            expect(this.player1).toBeAbleToSelect(this.fashion);
            expect(this.player1).toBeAbleToSelect(this.river);
            expect(this.player1).not.toBeAbleToSelect(this.expert);
        });

        it('if you spend a fate should allow targeting any attachment', function () {
            this.player1.clickCard(this.expert);
            this.player1.clickPrompt('Yes');

            expect(this.player1).toBeAbleToSelect(this.cloud);
            expect(this.player1).toBeAbleToSelect(this.finger);
            expect(this.player1).toBeAbleToSelect(this.fan);
            expect(this.player1).toBeAbleToSelect(this.courtMask);
            expect(this.player1).toBeAbleToSelect(this.katana);
            expect(this.player1).toBeAbleToSelect(this.fashion);
            expect(this.player1).toBeAbleToSelect(this.river);
            expect(this.player1).not.toBeAbleToSelect(this.expert);
        });

        it('should switch with the selected attachment', function () {
            this.player1.clickCard(this.expert);
            this.player1.clickPrompt('No');

            this.player1.clickCard(this.cloud);
            expect(this.kuwanan.attachments).toContain(this.cloud);
            expect(this.kisada.attachments).toContain(this.expert);

            expect(this.cloud.controller).toBe(this.player1.player);
            expect(this.expert.controller).toBe(this.player1.player);

            expect(this.getChatLogs(1)).toContain(
                'player1 uses Expert Bartering to switch Expert Bartering with Cloud the Mind'
            );
        });

        it('should switch control', function () {
            this.player1.clickCard(this.expert);
            this.player1.clickPrompt('Yes');

            this.player1.clickCard(this.fan);
            expect(this.kuwanan.attachments).toContain(this.fan);
            expect(this.doomed.attachments).toContain(this.expert);

            expect(this.fan.controller).toBe(this.player1.player);
            expect(this.expert.controller).toBe(this.player2.player);

            expect(this.getChatLogs(1)).toContain(
                'player1 uses Expert Bartering, paying 1 fate to switch Expert Bartering with Ornate Fan'
            );
        });

        it('should switch control on a attachment that must be attached to a character you control', function () {
            this.player1.clickCard(this.expert);
            this.player1.clickPrompt('Yes');

            this.player1.clickCard(this.courtMask);
            expect(this.kuwanan.attachments).toContain(this.courtMask);
            expect(this.rimei.attachments).toContain(this.expert);

            expect(this.courtMask.controller).toBe(this.player1.player);
            expect(this.expert.controller).toBe(this.player2.player);

            expect(this.getChatLogs(1)).toContain(
                'player1 uses Expert Bartering, paying 1 fate to switch Expert Bartering with Court Mask'
            );
        });

        it('should discard newly illegal attachments', function () {
            this.player1.clickCard(this.expert);
            this.player1.clickPrompt('No');

            this.player1.clickCard(this.river);
            expect(this.river.location).toBe('conflict discard pile');
            expect(this.getChatLogs(1)).toContain(
                'player1 uses Expert Bartering to switch Expert Bartering with Force of the River'
            );
        });

        it('should not prompt you to spend a fate if you do not have a fate', function () {
            this.player1.fate = 0;
            this.game.checkGameState(true);
            this.player1.clickCard(this.expert);
            expect(this.player1).toHavePrompt('Choose an attachment');
            expect(this.player1).toBeAbleToSelect(this.cloud);
            expect(this.player1).toBeAbleToSelect(this.finger);
            expect(this.player1).not.toBeAbleToSelect(this.fan);
            expect(this.player1).not.toBeAbleToSelect(this.courtMask);
            expect(this.player1).toBeAbleToSelect(this.katana);
            expect(this.player1).toBeAbleToSelect(this.fashion);
            expect(this.player1).toBeAbleToSelect(this.river);
            expect(this.player1).not.toBeAbleToSelect(this.expert);
        });

        it('should not prompt you to spend a fate if you cannot spend the fate', function () {
            this.player1.pass();
            this.initiateConflict({
                attackers: [this.kuwanan],
                defenders: [],
                type: 'military',
                province: this.blood
            });

            this.player2.pass();
            this.player1.clickCard(this.expert);
            expect(this.player1).toHavePrompt('Choose an attachment');
        });

        it('should allow using it immediately to switch back', function () {
            this.player1.clickCard(this.expert);
            this.player1.clickPrompt('Yes');

            this.player1.clickCard(this.fan);
            expect(this.kuwanan.attachments).toContain(this.fan);
            expect(this.doomed.attachments).toContain(this.expert);

            expect(this.fan.controller).toBe(this.player1.player);
            expect(this.expert.controller).toBe(this.player2.player);

            expect(this.getChatLogs(1)).toContain(
                'player1 uses Expert Bartering, paying 1 fate to switch Expert Bartering with Ornate Fan'
            );

            this.player2.clickCard(this.expert);
            this.player2.clickPrompt('Yes');

            this.player2.clickCard(this.fan);
            expect(this.kuwanan.attachments).toContain(this.expert);
            expect(this.doomed.attachments).toContain(this.fan);

            expect(this.fan.controller).toBe(this.player2.player);
            expect(this.expert.controller).toBe(this.player1.player);

            expect(this.getChatLogs(1)).toContain(
                'player2 uses Expert Bartering, paying 1 fate to switch Expert Bartering with Ornate Fan'
            );
        });

        it('should not allow the same player to use it twice in the same turn', function () {
            this.player1.clickCard(this.expert);
            this.player1.clickPrompt('Yes');

            this.player1.clickCard(this.fan);
            expect(this.kuwanan.attachments).toContain(this.fan);
            expect(this.doomed.attachments).toContain(this.expert);

            expect(this.fan.controller).toBe(this.player1.player);
            expect(this.expert.controller).toBe(this.player2.player);

            expect(this.getChatLogs(1)).toContain(
                'player1 uses Expert Bartering, paying 1 fate to switch Expert Bartering with Ornate Fan'
            );

            this.player2.clickCard(this.expert);
            this.player2.clickPrompt('Yes');

            this.player2.clickCard(this.fan);
            expect(this.kuwanan.attachments).toContain(this.expert);
            expect(this.doomed.attachments).toContain(this.fan);

            expect(this.fan.controller).toBe(this.player2.player);
            expect(this.expert.controller).toBe(this.player1.player);

            expect(this.getChatLogs(1)).toContain(
                'player2 uses Expert Bartering, paying 1 fate to switch Expert Bartering with Ornate Fan'
            );

            expect(this.player1).toHavePrompt('Action Window');
            this.player1.clickCard(this.expert);
            expect(this.player1).toHavePrompt('Action Window');
        });
    });
});
