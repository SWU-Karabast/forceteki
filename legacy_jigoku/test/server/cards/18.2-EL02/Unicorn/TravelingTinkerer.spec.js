describe('Traveling Tinker', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['kakita-yoshi', 'traveling-tinkerer', 'blatant-swindler'],
                    hand: ['fine-katana', 'a-new-name', 'talisman-of-the-sun']
                },
                player2: {
                    inPlay: ['vice-proprietor', 'doji-challenger'],
                    hand: ['ornate-fan', 'kakita-blade']
                }
            });

            this.yoshi = this.player1.findCardByName('kakita-yoshi');
            this.swindler = this.player1.findCardByName('blatant-swindler');
            this.tinkerer = this.player1.findCardByName('traveling-tinkerer');
            this.vice = this.player2.findCardByName('vice-proprietor');
            this.challenger = this.player2.findCardByName('doji-challenger');
            this.katana = this.player1.findCardByName('fine-katana');
            this.fan = this.player2.findCardByName('ornate-fan');
            this.ann = this.player1.findCardByName('a-new-name');
            this.blade = this.player2.findCardByName('kakita-blade');
            this.talisman = this.player1.findCardByName('talisman-of-the-sun');

            this.player1.playAttachment(this.katana, this.tinkerer);
            this.player2.playAttachment(this.fan, this.tinkerer);
            this.player1.playAttachment(this.ann, this.swindler);
            this.player2.playAttachment(this.blade, this.challenger);
            this.player1.playAttachment(this.talisman, this.yoshi);
        });

        it('flips an attachment modifiers', function () {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.swindler],
                defenders: [this.vice, this.tinkerer]
            });
            this.player2.pass();
            expect(this.tinkerer.getMilitarySkill()).toBe(3);
            expect(this.tinkerer.getPoliticalSkill()).toBe(5);

            this.player1.clickCard(this.tinkerer);
            expect(this.player1).toHavePrompt('Choose an attachment');
            expect(this.player1).toBeAbleToSelect(this.katana);
            expect(this.player1).toBeAbleToSelect(this.fan);
            expect(this.player1).toBeAbleToSelect(this.ann);
            expect(this.player1).toBeAbleToSelect(this.blade);
            expect(this.player1).toBeAbleToSelect(this.talisman);

            this.player1.clickCard(this.katana);
            expect(this.tinkerer.getMilitarySkill()).toBe(1);
            expect(this.tinkerer.getPoliticalSkill()).toBe(7);
            expect(this.getChatLogs(5)).toContain(
                'player1 uses Traveling Tinkerer to switch the skill modifiers of Fine Katana'
            );
        });
    });
});
