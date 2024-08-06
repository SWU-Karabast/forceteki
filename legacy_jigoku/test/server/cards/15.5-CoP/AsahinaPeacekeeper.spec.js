describe('Asahina Peacekeeper', function() {
    integration(function() {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['doji-challenger', 'kakita-toshimoko', 'doomed-shugenja', 'kakita-yoshi'],
                    hand: ['against-the-waves', 'assassination', 'fine-katana']
                },
                player2: {
                    inPlay: ['asahina-peacekeeper', 'matsu-berserker']
                }
            });

            this.challenger = this.player1.findCardByName('doji-challenger');
            this.toshimoko = this.player1.findCardByName('kakita-toshimoko');
            this.doomedShugenja = this.player1.findCardByName('doomed-shugenja');
            this.yoshi = this.player1.findCardByName('kakita-yoshi');
            this.sd1 = this.player1.findCardByName('shameful-display', 'province 1');

            this.atw = this.player1.findCardByName('against-the-waves');
            this.assassination = this.player1.findCardByName('assassination');
            this.katana = this.player1.findCardByName('fine-katana');

            this.peacekeeper = this.player2.findCardByName('asahina-peacekeeper');
            this.berserker = this.player2.findCardByName('matsu-berserker');
            this.sd2 = this.player2.findCardByName('shameful-display', 'province 1');
        });

        it('should limit your attackers in military conflicts to the number of cards in your hand', function () {
            this.noMoreActions();

            expect(this.player1).toHavePrompt('Initiate Conflict');
            this.player1.clickRing('air');
            expect(this.player1).toHavePrompt('Military Air Conflict');
            this.player1.clickCard(this.challenger);
            expect(this.challenger.inConflict).toBe(true);

            this.player1.clickCard(this.toshimoko);
            expect(this.toshimoko.inConflict).toBe(true);

            this.player1.clickCard(this.doomedShugenja);
            expect(this.doomedShugenja.inConflict).toBe(true);

            this.player1.clickCard(this.yoshi);
            expect(this.yoshi.inConflict).toBe(false);
        });

        it('should not limit your attackers in political conflicts', function () {
            this.noMoreActions();

            expect(this.player1).toHavePrompt('Initiate Conflict');
            this.player1.clickRing('air');
            this.player1.clickRing('air');
            expect(this.player1).toHavePrompt('Political Air Conflict');
            this.player1.clickCard(this.challenger);
            expect(this.challenger.inConflict).toBe(true);

            this.player1.clickCard(this.toshimoko);
            expect(this.toshimoko.inConflict).toBe(true);

            this.player1.clickCard(this.doomedShugenja);
            expect(this.doomedShugenja.inConflict).toBe(true);

            this.player1.clickCard(this.yoshi);
            expect(this.yoshi.inConflict).toBe(true);
        });

        it('should remove a character if you switch to military without enough cards', function () {
            this.noMoreActions();

            expect(this.player1).toHavePrompt('Initiate Conflict');
            this.player1.clickRing('air');
            this.player1.clickRing('air');
            expect(this.player1).toHavePrompt('Political Air Conflict');
            this.player1.clickCard(this.challenger);
            expect(this.challenger.inConflict).toBe(true);

            this.player1.clickCard(this.toshimoko);
            expect(this.toshimoko.inConflict).toBe(true);

            this.player1.clickCard(this.doomedShugenja);
            expect(this.doomedShugenja.inConflict).toBe(true);

            this.player1.clickCard(this.yoshi);
            expect(this.yoshi.inConflict).toBe(true);

            this.player1.clickRing('air');
            expect(this.player1).toHavePrompt('Military Air Conflict');
            let totalAttackers = this.challenger.inConflict ? 1 : 0;
            totalAttackers += this.toshimoko.inConflict ? 1 : 0;
            totalAttackers += this.doomedShugenja.inConflict ? 1 : 0;
            totalAttackers += this.yoshi.inConflict ? 1 : 0;

            expect(totalAttackers).toBe(3);
        });

        it('should prompt you to discard cards', function () {
            this.noMoreActions();

            expect(this.player1).toHavePrompt('Initiate Conflict');
            this.player1.clickRing('air');
            expect(this.player1).toHavePrompt('Military Air Conflict');
            this.player1.clickCard(this.challenger);
            this.player1.clickCard(this.toshimoko);
            this.player1.clickCard(this.sd2);
            this.player1.clickPrompt('Initiate Conflict');
            expect(this.player1).toHavePrompt('Select 2 cards to discard');
            expect(this.player1).toBeAbleToSelect(this.atw);
            expect(this.player1).toBeAbleToSelect(this.assassination);
            expect(this.player1).toBeAbleToSelect(this.katana);
            expect(this.player1).not.toHavePromptButton('Cancel');
        });

        it('should prompt for defenders once you discard cards', function () {
            this.noMoreActions();

            expect(this.player1).toHavePrompt('Initiate Conflict');
            this.player1.clickRing('air');
            expect(this.player1).toHavePrompt('Military Air Conflict');
            this.player1.clickCard(this.challenger);
            this.player1.clickCard(this.toshimoko);
            this.player1.clickCard(this.sd2);
            this.player1.clickPrompt('Initiate Conflict');
            expect(this.player1).toHavePrompt('Select 2 cards to discard');
            this.player1.clickCard(this.atw);
            expect(this.player1).not.toHavePromptButton('Done');
            this.player1.clickCard(this.assassination);
            expect(this.player1).toHavePromptButton('Done');
            this.player1.clickCard(this.katana);
            expect(this.player1).toHavePromptButton('Done');
            expect(this.player1.player.promptState.selectedCards).toContain(this.atw);
            expect(this.player1.player.promptState.selectedCards).toContain(this.assassination);
            expect(this.player1.player.promptState.selectedCards).not.toContain(this.katana);
            this.player1.clickPrompt('Done');

            expect(this.atw.location).toBe('conflict discard pile');
            expect(this.assassination.location).toBe('conflict discard pile');
            expect(this.katana.location).toBe('hand');
            expect(this.player2).toHavePrompt('Choose Defenders');

            expect(this.getChatLogs(10)).toContain('player1 must discard 2 cards to declare their attackers');
            expect(this.getChatLogs(10)).toContain('player1 discards Against the Waves and Assassination');
        });

        it('discarding your entire hand', function () {
            this.noMoreActions();

            expect(this.player1).toHavePrompt('Initiate Conflict');
            this.player1.clickRing('air');
            expect(this.player1).toHavePrompt('Military Air Conflict');
            this.player1.clickCard(this.challenger);
            this.player1.clickCard(this.toshimoko);
            this.player1.clickCard(this.yoshi);
            this.player1.clickCard(this.sd2);
            this.player1.clickPrompt('Initiate Conflict');
            expect(this.player1).toHavePrompt('Select 3 cards to discard');
            this.player1.clickCard(this.atw);
            this.player1.clickCard(this.assassination);
            this.player1.clickCard(this.katana);
            this.player1.clickPrompt('Done');

            expect(this.atw.location).toBe('conflict discard pile');
            expect(this.assassination.location).toBe('conflict discard pile');
            expect(this.katana.location).toBe('conflict discard pile');
            expect(this.player2).toHavePrompt('Choose Defenders');

            expect(this.getChatLogs(10)).toContain('player1 must discard 3 cards to declare their attackers');
            expect(this.getChatLogs(10)).toContain('player1 discards Against the Waves, Assassination and Fine Katana');
        });

        it('should not trigger on political', function () {
            this.noMoreActions();

            expect(this.player1).toHavePrompt('Initiate Conflict');
            this.player1.clickRing('air');
            this.player1.clickRing('air');
            expect(this.player1).toHavePrompt('Political Air Conflict');
            this.player1.clickCard(this.challenger);
            this.player1.clickCard(this.toshimoko);
            this.player1.clickCard(this.yoshi);
            this.player1.clickCard(this.sd2);
            this.player1.clickPrompt('Initiate Conflict');
            expect(this.player1).not.toHavePrompt('Select 3 cards to discard');
            expect(this.player2).toHavePrompt('Choose Defenders');

            expect(this.getChatLogs(10)).not.toContain('player1 must discard 3 cards to declare their attackers');
        });

        it('should automatically pass your conflict if you can\'t do pol and you have no card', function () {
            this.peacekeeper.bowed = true;
            this.noMoreActions();
            this.player1.passConflict();
            this.noMoreActions();

            expect(this.getChatLogs(10)).toContain('player2 passes their conflict opportunity as none of their characters can be declared as an attacker');
        });
    });
});
