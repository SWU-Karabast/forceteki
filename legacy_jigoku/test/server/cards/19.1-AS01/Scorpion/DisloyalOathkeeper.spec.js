describe('Disloyal Oathkeeper', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['doji-whisperer', 'isawa-tadaka'],
                    hand: ['way-of-the-crane', 'against-the-waves', 'fine-katana', 'political-rival']
                },
                player2: {
                    inPlay: ['disloyal-oathkeeper', 'doji-challenger'],
                    hand: ['way-of-the-dragon', 'way-of-the-crane']
                }
            });

            this.whisperer = this.player1.findCardByName('doji-whisperer');
            this.isawaTadaka = this.player1.findCardByName('isawa-tadaka');
            this.crane = this.player1.findCardByName('way-of-the-crane');
            this.waves = this.player1.findCardByName('against-the-waves');
            this.katana = this.player1.findCardByName('fine-katana');
            this.rival = this.player1.findCardByName('political-rival');

            this.oathkeeper = this.player2.findCardByName('disloyal-oathkeeper');
            this.challenger = this.player2.findCardByName('doji-challenger');
            this.dragon = this.player2.findCardByName('way-of-the-dragon');
            this.crane2 = this.player2.findCardByName('way-of-the-crane');

            this.player1.pass();
            this.player2.playAttachment(this.dragon, this.oathkeeper);
        });

        it('should react to an opponent\'s event and put it underneath self', function () {
            this.player1.clickCard(this.crane);
            this.player1.clickCard(this.whisperer);

            expect(this.player2).toHavePrompt('Triggered Abilities');
            expect(this.player2).toBeAbleToSelect(this.oathkeeper);

            this.player2.clickCard(this.oathkeeper);
            expect(this.crane.location).toBe(this.oathkeeper.uuid);

            expect(this.getChatLogs(5)).toContain(
                'player2 uses Disloyal Oathkeeper to place Way of the Crane underneath Disloyal Oathkeeper'
            );
        });

        it('event should be playable', function () {
            this.player1.clickCard(this.crane);
            this.player1.clickCard(this.whisperer);
            this.player2.clickCard(this.oathkeeper);

            this.player2.clickCard(this.crane);
            this.player2.clickCard(this.challenger);
            expect(this.challenger.isHonored).toBe(true);

            expect(this.getChatLogs(5)).toContain('player2 plays Way of the Crane to honor Doji Challenger');
        });

        it('should not react if you already have a card underneath', function () {
            this.player1.clickCard(this.crane);
            this.player1.clickCard(this.whisperer);
            this.player2.clickCard(this.oathkeeper);
            expect(this.crane.location).toBe(this.oathkeeper.uuid);
            this.player2.pass();

            this.player1.clickCard(this.waves);
            this.player1.clickCard(this.isawaTadaka);
            expect(this.player2).toHavePrompt('Action Window');
        });

        it('should not react to an opponent\'s attachment', function () {
            this.player1.clickCard(this.katana);
            this.player1.clickCard(this.whisperer);

            expect(this.player2).toHavePrompt('Action Window');
        });

        it('should not react to an opponent\'s character', function () {
            this.player1.clickCard(this.rival);
            this.player1.clickPrompt('0');

            expect(this.player2).toHavePrompt('Action Window');
        });

        it('should not react to your own events', function () {
            this.player1.pass();
            this.player2.clickCard(this.crane2);
            this.player2.clickCard(this.challenger);

            expect(this.player1).toHavePrompt('Action Window');
        });
    });
});
