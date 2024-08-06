describe('Mantis Bootlegger', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['togashi-mitsu', 'kakita-yoshi', 'mantis-bootlegger'],
                    hand: ['fine-katana', 'ornate-fan', 'kakita-blade', 'honored-blade', 'tattooed-wanderer']
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
            this.bootlegger = this.player1.findCardByName('mantis-bootlegger');

            this.initiate = this.player2.findCardByName('togashi-initiate');
            this.katana2 = this.player2.findCardByName('fine-katana');
            this.fan2 = this.player2.findCardByName('ornate-fan');
            this.blade2 = this.player2.findCardByName('kakita-blade');
        });

        it('should give you a fate if you control 3 different characters with attachments', function() {
            expect(this.player1).toHavePrompt('Action Window');
            this.player1.clickCard(this.bootlegger);
            expect(this.player1).toHavePrompt('Action Window');

            this.player1.clickCard(this.blade);
            this.player1.clickCard(this.mitsu);
            this.player2.pass();
            expect(this.player1).toHavePrompt('Action Window');
            this.player1.clickCard(this.bootlegger);
            expect(this.player1).toHavePrompt('Action Window');

            this.player1.clickCard(this.katana);
            this.player1.clickCard(this.yoshi);
            this.player2.pass();
            expect(this.player1).toHavePrompt('Action Window');
            this.player1.clickCard(this.bootlegger);
            expect(this.player1).toHavePrompt('Action Window');

            this.player1.clickCard(this.fan);
            this.player1.clickCard(this.bootlegger);
            this.player2.pass();
            let fate = this.player1.fate;
            expect(this.player1).toHavePrompt('Action Window');
            this.player1.clickCard(this.bootlegger);
            expect(this.player2).toHavePrompt('Action Window');
            expect(this.player1.fate).toBe(fate + 1);
            expect(this.getChatLogs(5)).toContain('player1 uses Mantis Bootlegger to gain 1 fate');
        });

        it('should not give you a fate if you control 3 different attachments on 2 characters', function() {
            expect(this.player1).toHavePrompt('Action Window');
            this.player1.clickCard(this.bootlegger);
            expect(this.player1).toHavePrompt('Action Window');

            this.player1.clickCard(this.blade);
            this.player1.clickCard(this.mitsu);
            this.player2.pass();
            this.player1.clickCard(this.katana);
            this.player1.clickCard(this.yoshi);
            this.player2.pass();
            this.player1.clickCard(this.fan);
            this.player1.clickCard(this.yoshi);
            this.player2.pass();
            expect(this.player1).toHavePrompt('Action Window');
            this.player1.clickCard(this.bootlegger);
            expect(this.player1).toHavePrompt('Action Window');
        });
    });
});
