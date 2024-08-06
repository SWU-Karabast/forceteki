describe('Spirit of Valor', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['akodo-kaede', 'wandering-ronin'],
                    hand: ['spirit-of-valor'],
                    dynastyDiscard: ['bushido-adherent', 'doji-whisperer']
                }
            });

            this.wanderingRonin = this.player1.findCardByName('wandering-ronin');
            this.kaede = this.player1.findCardByName('akodo-kaede');
            this.spiritOfValor = this.player1.findCardByName('spirit-of-valor');
            this.bushidoAdherent = this.player1.findCardByName('bushido-adherent');
            this.dojiWhisperer = this.player1.findCardByName('doji-whisperer');
        });

        describe('cost discounts', function () {
            it('no discounts without shugenja', function () {
                const initialFate = this.player1.fate;
                this.player1.moveCard(this.kaede, 'dynasty discard pile');

                this.player1.clickCard(this.spiritOfValor);
                this.player1.clickCard(this.wanderingRonin);
                expect(this.player1.fate).toBe(initialFate - 1);
            });

            it('costs 1 less while controling shugenja', function () {
                const initialFate = this.player1.fate;

                this.player1.clickCard(this.spiritOfValor);
                this.player1.clickCard(this.wanderingRonin);
                expect(this.player1.fate).toBe(initialFate);
            });
        });

        describe('action ability', function () {
            beforeEach(function () {
                this.player1.playAttachment(this.spiritOfValor, this.kaede);
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.kaede],
                    defenders: []
                });
            });

            it('copies all abilities from a discarded Lion', function () {
                this.player2.pass();
                this.player1.clickCard(this.spiritOfValor);
                expect(this.player1).toHavePrompt('Choose a character from a discard pile');
                expect(this.player1).toBeAbleToSelect(this.bushidoAdherent);
                expect(this.player1).not.toBeAbleToSelect(this.dojiWhisperer);

                this.player1.clickCard(this.bushidoAdherent);
                expect(this.getChatLogs(3)).toContain(
                    "player1 uses Spirit of Valor, sacrificing Spirit of Valor to copy Bushidō Adherent's abilities onto Akodo Kaede"
                );

                this.player2.pass();
                this.player1.clickCard(this.kaede);
                this.player1.clickCard(this.kaede);
                expect(this.getChatLogs(3)).toContain(
                    "player1 uses Akodo Kaede's gained ability from Bushidō Adherent to honor Akodo Kaede and have player2 draw 1 card"
                );
            });
        });
    });
});