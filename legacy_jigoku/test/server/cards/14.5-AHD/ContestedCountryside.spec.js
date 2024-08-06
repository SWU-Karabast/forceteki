describe('Contested Countryside', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['ikoma-tsanuri-2', 'kakita-toshimoko', 'eager-scout'],
                    provinces: ['kenson-no-gakka', 'abandoning-honor', 'fertile-fields', 'temple-of-daikoku'],
                    hand: ['cloud-the-mind', 'fine-katana', 'ornate-fan'],
                    dynastyDiscard: ['contested-countryside'],
                    role: 'keeper-of-void'
                },
                player2: {
                    inPlay: ['cunning-negotiator'],
                    provinces: ['midnight-revels', 'the-pursuit-of-justice', 'manicured-garden', 'meditations-on-the-tao'],
                    hand: ['assassination', 'let-go'],
                    dynastyDiscard: ['contested-countryside'],
                    role: 'keeper-of-void'
                }
            });

            this.kensonNoGakka = this.player1.findCardByName('kenson-no-gakka');
            this.fields = this.player1.findCardByName('fertile-fields');
            this.abandoning = this.player1.findCardByName('abandoning-honor');
            this.temple = this.player1.findCardByName('temple-of-daikoku');

            this.revels = this.player2.findCardByName('midnight-revels');
            this.manicuredGarden = this.player2.findCardByName('manicured-garden');
            this.meditations = this.player2.findCardByName('meditations-on-the-tao');
            this.justice = this.player2.findCardByName('the-pursuit-of-justice');

            this.tsanuri = this.player1.findCardByName('ikoma-tsanuri-2');
            this.toshimoko = this.player1.findCardByName('kakita-toshimoko');
            this.scout = this.player1.findCardByName('eager-scout');
            this.negotiator = this.player2.findCardByName('cunning-negotiator');

            this.countryside1 = this.player1.findCardByName('contested-countryside');
            this.countryside2 = this.player2.findCardByName('contested-countryside');

            this.revels.facedown = false;
            this.manicuredGarden.facedown = false;
            this.justice.facedown = false;
            this.game.checkGameState(true);
        });

        it('should let both players trigger reactions', function() {
            this.player1.moveCard(this.countryside1, 'province 1');
            this.noMoreActions();

            this.initiateConflict({
                attackers: [this.toshimoko],
                type: 'military',
                province: this.revels
            });
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.revels);
            this.player1.clickCard(this.revels);
            expect(this.player1).toBeAbleToSelect(this.toshimoko);
            expect(this.player1).toBeAbleToSelect(this.negotiator);
            this.player1.clickCard(this.negotiator);
            expect(this.negotiator.bowed).toBe(true);

            expect(this.player2).toHavePrompt('Triggered Abilities');
            expect(this.player2).toBeAbleToSelect(this.revels);
            this.player2.clickCard(this.revels);
            expect(this.player2).toBeAbleToSelect(this.toshimoko);
            expect(this.player2).not.toBeAbleToSelect(this.negotiator);
            this.player2.clickCard(this.toshimoko);
            expect(this.toshimoko.bowed).toBe(true);

            expect(this.player2).toHavePrompt('Choose Defenders');
            this.player2.clickPrompt('Done');
            expect(this.player2).toHavePrompt('Conflict Action Window');

            expect(this.revels.anyEffect('canBeTriggeredByOpponent')).toBe(true);
        });

        it('should let both players trigger actions', function() {
            this.player1.moveCard(this.countryside1, 'province 1');
            this.noMoreActions();

            this.initiateConflict({
                attackers: [this.toshimoko],
                defenders: [this.negotiator],
                type: 'military',
                province: this.manicuredGarden
            });
            let fate1 = this.player1.fate;
            let fate2 = this.player2.fate;

            this.player2.clickCard(this.manicuredGarden);
            expect(this.player1.fate).toBe(fate1);
            expect(this.player2.fate).toBe(fate2 + 1);

            expect(this.player1).toHavePrompt('Conflict Action Window');
            this.player1.clickCard(this.manicuredGarden);
            expect(this.player2).toHavePrompt('Conflict Action Window');
            expect(this.player1.fate).toBe(fate1 + 1);
            expect(this.player2.fate).toBe(fate2 + 1);

            expect(this.getChatLogs(10)).toContain('player2 uses Manicured Garden to gain 1 fate');
            expect(this.getChatLogs(10)).toContain('player1 uses Manicured Garden to gain 1 fate');
        });

        it('should not let opponent trigger if it\'s my countryside', function() {
            this.player2.moveCard(this.countryside2, 'province 1');
            this.noMoreActions();

            this.initiateConflict({
                attackers: [this.toshimoko],
                defenders: [this.negotiator],
                type: 'military',
                province: this.manicuredGarden
            });
            let fate1 = this.player1.fate;
            let fate2 = this.player2.fate;

            this.player2.clickCard(this.manicuredGarden);
            expect(this.player1.fate).toBe(fate1);
            expect(this.player2.fate).toBe(fate2 + 1);

            expect(this.player1).toHavePrompt('Conflict Action Window');
            this.player1.clickCard(this.manicuredGarden);
            expect(this.player1).toHavePrompt('Conflict Action Window');
            expect(this.player1.fate).toBe(fate1);
            expect(this.player2.fate).toBe(fate2 + 1);

            expect(this.manicuredGarden.anyEffect('canBeTriggeredByOpponent')).toBe(false);
            expect(this.getChatLogs(10)).toContain('player2 uses Manicured Garden to gain 1 fate');
            expect(this.getChatLogs(10)).not.toContain('player1 uses Manicured Garden to gain 1 fate');
        });

        it('should work with interrupts', function() {
            this.player2.moveCard(this.countryside2, 'province 1');
            this.noMoreActions();
            this.player1.passConflict();
            this.noMoreActions();

            this.initiateConflict({
                attackers: [this.negotiator],
                defenders: [this.scout],
                type: 'political',
                province: this.abandoning
            });

            this.toshimoko.dishonor();
            this.negotiator.dishonor();

            expect(this.abandoning.anyEffect('canBeTriggeredByOpponent')).toBe(true);
            this.noMoreActions();

            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.abandoning);
            this.player1.clickCard(this.abandoning);
            expect(this.player1).toBeAbleToSelect(this.toshimoko);
            expect(this.player1).toBeAbleToSelect(this.negotiator);
            this.player1.clickCard(this.negotiator);
            expect(this.negotiator.location).toBe('dynasty discard pile');

            expect(this.player2).toHavePrompt('Triggered Abilities');
            expect(this.player2).toBeAbleToSelect(this.abandoning);
            this.player2.clickCard(this.abandoning);
            expect(this.player2).toBeAbleToSelect(this.toshimoko);
            this.player2.clickCard(this.toshimoko);
            expect(this.toshimoko.location).toBe('dynasty discard pile');
        });

        it('should not double up forced triggers', function() {
            this.player2.moveCard(this.countryside2, 'province 1');
            this.noMoreActions();
            this.player1.passConflict();
            this.noMoreActions();

            let fate = this.game.rings.water.fate;

            this.initiateConflict({
                attackers: [this.negotiator],
                defenders: [this.toshimoko],
                type: 'military',
                province: this.temple
            });

            expect(this.player1).toHavePrompt('Conflict Action Window');
            expect(this.game.rings.water.fate).toBe(fate + 1);

            expect(this.temple.anyEffect('canBeTriggeredByOpponent')).toBe(true);
            expect(this.getChatLogs(10)).toContain('player1 uses Temple of Daikoku to place 1 fate on Water Ring');
        });

        it('should only apply to the attacked province', function() {
            this.player1.moveCard(this.countryside1, 'province 1');
            this.noMoreActions();

            this.initiateConflict({
                attackers: [this.toshimoko],
                type: 'military',
                province: this.revels
            });
            this.player1.pass();
            this.player2.clickCard(this.revels);
            this.player2.clickCard(this.toshimoko);
            expect(this.toshimoko.bowed).toBe(true);
            this.player1.pass();

            expect(this.player2).toHavePrompt('Choose Defenders');
            this.player2.clickCard(this.negotiator);
            this.player2.clickPrompt('Done');
            this.negotiator.bowed = true;
            expect(this.player2).toHavePrompt('Conflict Action Window');

            expect(this.justice.anyEffect('canBeTriggeredByOpponent')).toBe(false);

            expect(this.negotiator.bowed).toBe(true);
            this.player2.clickCard(this.justice);
            this.player2.clickCard(this.negotiator);
            expect(this.negotiator.bowed).toBe(false);
            this.player1.clickCard(this.justice);
            expect(this.player1).toHavePrompt('Conflict Action Window');
        });

        it('Tsanuri - should not let opponent trigger', function() {
            this.player1.moveCard(this.countryside1, 'province 1');
            this.noMoreActions();

            this.initiateConflict({
                attackers: [this.tsanuri],
                defenders: [this.negotiator],
                type: 'military',
                province: this.manicuredGarden
            });
            let fate1 = this.player1.fate;
            let fate2 = this.player2.fate;

            this.player2.clickCard(this.manicuredGarden);
            expect(this.player2).toHavePrompt('Conflict Action Window');
            expect(this.player1.fate).toBe(fate1);
            expect(this.player2.fate).toBe(fate2);
            this.player2.pass();

            expect(this.player1).toHavePrompt('Conflict Action Window');
            this.player1.clickCard(this.manicuredGarden);
            expect(this.player2).toHavePrompt('Conflict Action Window');
            expect(this.player1.fate).toBe(fate1 + 1);
            expect(this.player2.fate).toBe(fate2);

            expect(this.getChatLogs(10)).toContain('player1 uses Manicured Garden to gain 1 fate');
        });

        it('Tsanuri on defense - should not let opponent triggers', function() {
            this.player2.moveCard(this.countryside2, 'province 1');
            this.noMoreActions();
            this.player1.passConflict();
            this.noMoreActions();

            this.initiateConflict({
                attackers: [this.negotiator],
                defenders: [this.tsanuri],
                type: 'military',
                province: this.fields
            });

            let cards1 = this.player1.hand.length;
            let cards2 = this.player2.hand.length;

            this.player1.clickCard(this.fields);
            expect(this.player1.hand.length).toBe(cards1 + 1);
            expect(this.player2.hand.length).toBe(cards2);

            this.player2.clickCard(this.fields);
            expect(this.player1.hand.length).toBe(cards1 + 1);
            expect(this.player2.hand.length).toBe(cards2);
            expect(this.player2).toHavePrompt('Conflict Action Window');

            expect(this.fields.anyEffect('canBeTriggeredByOpponent')).toBe(true);
        });

        it('should respect triggering limits - my province', function() {
            this.player1.moveCard(this.countryside1, 'province 1');
            this.noMoreActions();

            this.initiateConflict({
                attackers: [this.toshimoko],
                defenders: [this.negotiator],
                type: 'military',
                province: this.manicuredGarden
            });
            let fate1 = this.player1.fate;
            let fate2 = this.player2.fate;

            this.player2.clickCard(this.negotiator);
            this.player1.clickCard(this.toshimoko);
            this.player1.clickPrompt('1');
            this.player2.clickPrompt('1');
            this.player2.clickPrompt('Yes');
            expect(this.player1.fate).toBe(fate1);
            expect(this.player2.fate).toBe(fate2 + 1);

            this.player1.clickCard(this.manicuredGarden);
            expect(this.player1.fate).toBe(fate1 + 1);
            expect(this.player2.fate).toBe(fate2 + 1);

            expect(this.player2).toHavePrompt('Conflict Action Window');
            this.player2.clickCard(this.manicuredGarden);
            expect(this.player1.fate).toBe(fate1 + 1);
            expect(this.player2.fate).toBe(fate2 + 1);
            expect(this.player2).toHavePrompt('Conflict Action Window');
        });

        it('should respect triggering limits - opponent\'s province', function() {
            this.player1.moveCard(this.countryside1, 'province 1');
            this.noMoreActions();

            this.initiateConflict({
                attackers: [this.toshimoko],
                defenders: [this.negotiator],
                type: 'military',
                province: this.manicuredGarden
            });
            let fate1 = this.player1.fate;
            let fate2 = this.player2.fate;

            this.player2.clickCard(this.negotiator);
            this.player1.clickCard(this.toshimoko);
            this.player1.clickPrompt('5');
            this.player2.clickPrompt('1');
            this.player1.clickPrompt('Yes');
            expect(this.player1.fate).toBe(fate1 + 1);
            expect(this.player2.fate).toBe(fate2);

            expect(this.player1).toHavePrompt('Conflict Action Window');
            this.player1.clickCard(this.manicuredGarden);
            expect(this.player1).toHavePrompt('Conflict Action Window');
            expect(this.player1.fate).toBe(fate1 + 1);
            expect(this.player2.fate).toBe(fate2);
            this.player1.pass();

            this.player2.clickCard(this.manicuredGarden);
            expect(this.player1.fate).toBe(fate1 + 1);
            expect(this.player2.fate).toBe(fate2 + 1);
            expect(this.player1).toHavePrompt('Conflict Action Window');
        });
    });
});
