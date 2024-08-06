describe('Iron Mountain Castle', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['togashi-mitsu', 'kakita-yoshi'],
                    hand: ['fine-katana', 'ornate-fan', 'kakita-blade', 'honored-blade', 'tattooed-wanderer'],
                    stronghold: ['iron-mountain-castle']
                },
                player2: {
                    inPlay: ['togashi-initiate'],
                    hand: ['fine-katana', 'ornate-fan', 'kakita-blade']
                }
            });

            this.mitsu = this.player1.findCardByName('togashi-mitsu');
            this.yoshi = this.player1.findCardByName('kakita-yoshi');
            this.katana = this.player1.findCardByName('fine-katana');
            this.fan = this.player1.findCardByName('ornate-fan');
            this.blade = this.player1.findCardByName('kakita-blade');
            this.honored = this.player1.findCardByName('honored-blade');
            this.wanderer = this.player1.findCardByName('tattooed-wanderer');
            this.iron = this.player1.findCardByName('iron-mountain-castle');

            this.initiate = this.player2.findCardByName('togashi-initiate');
            this.katana2 = this.player2.findCardByName('fine-katana');
            this.fan2 = this.player2.findCardByName('ornate-fan');
            this.blade2 = this.player2.findCardByName('kakita-blade');
        });

        it('should reduce the cost to play an attachment on a character you control', function () {
            let fate = this.player1.fate;
            this.player1.clickCard(this.blade);
            this.player1.clickCard(this.mitsu);
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.iron);
            this.player1.clickCard(this.iron);

            expect(this.player1.fate).toBe(fate);
            expect(this.mitsu.attachments).toContain(this.blade);

            expect(this.getChatLogs(5)).toContain(
                'player1 uses Iron Mountain Castle, bowing Iron Mountain Castle to reduce the cost of their next attachment by 1'
            );
        });

        it('should work with monks played as an attachment', function () {
            let fate = this.player1.fate;
            this.player1.clickCard(this.wanderer);
            this.player1.clickPrompt('Play Tattooed Wanderer as an attachment');
            this.player1.clickCard(this.mitsu);
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.iron);
            this.player1.clickCard(this.iron);

            expect(this.player1.fate).toBe(fate);
            expect(this.mitsu.attachments).toContain(this.wanderer);
        });

        it('should not work with monks played as a character', function () {
            let fate = this.player1.fate;
            this.player1.clickCard(this.wanderer);
            this.player1.clickPrompt('Play this character');
            this.player1.clickPrompt('0');
            expect(this.player1).not.toHavePrompt('Triggered Abilities');
            expect(this.player1.fate).toBe(fate - 1);
            expect(this.player2).toHavePrompt('Action Window');
        });

        it('should not trigger if attachment costs 0', function () {
            this.player1.clickCard(this.katana);
            this.player1.clickCard(this.mitsu);
            expect(this.player1).not.toHavePrompt('Triggered Abilities');
            expect(this.mitsu.attachments).toContain(this.katana);
        });

        it('should not trigger if attachment is played on opponent', function () {
            let fate = this.player1.fate;
            this.player1.clickCard(this.blade);
            this.player1.clickCard(this.initiate);
            expect(this.player1).not.toHavePrompt('Triggered Abilities');
            expect(this.initiate.attachments).toContain(this.blade);
            expect(this.player1.fate).toBe(fate - 1);
        });

        it('should not trigger if attachment is played by opponent', function () {
            this.player1.pass();
            this.player2.clickCard(this.blade2);
            this.player2.clickCard(this.mitsu);
            expect(this.player1).not.toHavePrompt('Triggered Abilities');
            expect(this.mitsu.attachments).toContain(this.blade2);
        });

        it('should reduce the cost to play an attachment on a character you control regardless of faction', function () {
            let fate = this.player1.fate;
            this.player1.clickCard(this.blade);
            this.player1.clickCard(this.yoshi);
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.iron);
            this.player1.clickCard(this.iron);

            expect(this.player1.fate).toBe(fate);
            expect(this.yoshi.attachments).toContain(this.blade);

            expect(this.getChatLogs(5)).toContain(
                'player1 uses Iron Mountain Castle, bowing Iron Mountain Castle to reduce the cost of their next attachment by 1'
            );
        });

        it('should let you play an attachment without any fate', function () {
            this.player1.fate = 0;
            this.player1.clickCard(this.blade);
            this.player1.clickCard(this.mitsu);
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.iron);
            this.player1.clickCard(this.iron);

            expect(this.mitsu.attachments).toContain(this.blade);

            expect(this.getChatLogs(5)).toContain(
                'player1 uses Iron Mountain Castle, bowing Iron Mountain Castle to reduce the cost of their next attachment by 1'
            );
        });

        it('should allow you to pass the activation, keeping your action opportunity', function () {
            this.player1.fate = 0;
            this.player1.clickCard(this.blade);
            this.player1.clickCard(this.mitsu);
            expect(this.player1).toHavePrompt('Triggered Abilities');
            this.player1.clickPrompt('Pass');

            expect(this.mitsu.attachments).not.toContain(this.blade);
            expect(this.blade.location).toBe('hand');
            expect(this.player1).toHavePrompt('Action Window');
        });

        it('should allow putting 3 restricted attachments on a dragon character you control', function () {
            let target = this.mitsu;
            this.player1.playAttachment(this.blade, target);
            this.player1.clickCard(this.iron);
            expect(target.attachments).toContain(this.blade);
            this.player2.pass();
            this.player1.playAttachment(this.katana, target);
            expect(target.attachments).toContain(this.katana);
            this.player2.pass();
            this.player1.playAttachment(this.fan, target);
            expect(target.attachments).toContain(this.fan);
            expect(this.player2).toHavePrompt('Action Window');
            this.player2.pass();
            this.player1.playAttachment(this.honored, target);
            expect(target.attachments).toContain(this.honored);
            expect(this.player1).toHavePrompt('Too many Restricted attachments');
        });

        it('should not allow putting 3 restricted attachments on a non-dragon character you control', function () {
            let target = this.yoshi;
            this.player1.playAttachment(this.blade, target);
            this.player1.clickCard(this.iron);
            expect(target.attachments).toContain(this.blade);
            this.player2.pass();
            this.player1.playAttachment(this.katana, target);
            expect(target.attachments).toContain(this.katana);
            this.player2.pass();
            this.player1.playAttachment(this.fan, target);
            expect(target.attachments).toContain(this.fan);
            expect(this.player1).toHavePrompt('Too many Restricted attachments');
        });

        it('should not allow putting 3 restricted attachments on a dragon character you don\'t control', function () {
            let target = this.initiate;
            this.player1.playAttachment(this.blade, target);
            this.player1.clickCard(this.iron);
            expect(target.attachments).toContain(this.blade);
            this.player2.pass();
            this.player1.playAttachment(this.katana, target);
            expect(target.attachments).toContain(this.katana);
            this.player2.pass();
            this.player1.playAttachment(this.fan, target);
            expect(target.attachments).toContain(this.fan);
            expect(this.player2).toHavePrompt('Too many Restricted attachments');
        });
    });
});
