describe("Eagle's Rest Peak", function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['aggressive-moto'],
                    hand: ['i-can-swim', 'way-of-the-scorpion']
                },
                player2: {
                    inPlay: ['togashi-initiate', 'togashi-yokuni', 'doomed-shugenja'],
                    provinces: ['eagle-s-rest-peak']
                }
            });

            this.aggressiveMoto = this.player1.findCardByName('aggressive-moto');
            this.swim = this.player1.findCardByName('i-can-swim');
            this.scorpion = this.player1.findCardByName('way-of-the-scorpion');

            this.initiate = this.player2.findCardByName('togashi-initiate');
            this.yokuni = this.player2.findCardByName('togashi-yokuni');
            this.doomed = this.player2.findCardByName('doomed-shugenja');

            this.eaglesRestPeak = this.player2.findCardByName('eagle-s-rest-peak', 'province 1');
        });

        it("reveals random cards from opponent's hand", function () {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.aggressiveMoto],
                defenders: [this.yokuni, this.initiate],
                province: this.eaglesRestPeak
            });

            this.player2.clickCard(this.eaglesRestPeak);
            expect(this.player2).toBeAbleToSelect(this.yokuni);
            expect(this.player2).toBeAbleToSelect(this.initiate);
            expect(this.player2).not.toBeAbleToSelect(this.doomed);
            expect(this.player2).not.toBeAbleToSelect(this.aggressiveMoto);

            this.player2.clickCard(this.yokuni);
            expect(this.getChatLogs(10)).toContain(
                "player2 uses Eagle's Rest Peak to use the insight of Togashi Yokuni, revealing and setting aside 5 cards from player1's hand"
            );
        });
    });
});
