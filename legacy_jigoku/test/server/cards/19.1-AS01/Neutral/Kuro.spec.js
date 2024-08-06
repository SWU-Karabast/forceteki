describe('Kuro', function () {
    integration(function () {
        describe('attachment limitation', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['kuro'],
                        hand: ['fine-katana', 'above-question', 'adorned-barcha']
                    }
                });

                this.kuro = this.player1.findCardByName('kuro');
                this.katana = this.player1.findCardByName('fine-katana');
                this.aq = this.player1.findCardByName('above-question');
                this.barcha = this.player1.findCardByName('adorned-barcha');
            });

            it('should not allow for printed cost 0 to be attached', function () {
                this.player1.clickCard(this.katana);
                expect(this.player1).toHavePrompt('Action Window');
            });

            it('should allow for printed cost 1 to be attached', function () {
                this.player1.clickCard(this.aq);
                expect(this.player1).toHavePrompt('Choose a card');
                expect(this.player1).toBeAbleToSelect(this.kuro);
                this.player1.clickCard(this.kuro);
                expect(this.aq.parent).toBe(this.kuro);
            });

            it('should allow for printed cost 1 or higher to be attached', function () {
                this.player1.clickCard(this.barcha);
                expect(this.player1).toHavePrompt('Choose a card');
                expect(this.player1).toBeAbleToSelect(this.kuro);
                this.player1.clickCard(this.kuro);
                expect(this.barcha.parent).toBe(this.kuro);
            });
        });

        describe('action ability', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['kuro', 'ikoma-prodigy']
                    },
                    player2: {
                        conflictDiscard: ['fine-katana', 'above-question', 'adorned-barcha', 'total-warfare']
                    }
                });

                this.kuro = this.player1.findCardByName('kuro');
                this.ikomaProdigy = this.player1.findCardByName('ikoma-prodigy');

                this.katana = this.player2.findCardByName('fine-katana');
                this.aq = this.player2.findCardByName('above-question');
                this.barcha = this.player2.findCardByName('adorned-barcha');
                this.totalWarfare = this.player2.findCardByName('total-warfare');
            });

            it('should not work outside a conflict', function () {
                this.player1.clickCard(this.kuro);
                expect(this.player1).toHavePrompt('Action Window');
            });

            it('should allow to target attachments with printed cost 1 or higher in the opponent discard pile', function () {
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.kuro],
                    defenders: [],
                    type: 'military'
                });

                this.player2.pass();

                this.player1.clickCard(this.kuro);
                expect(this.player1).toHavePrompt('Choose an attachment');
                expect(this.player1).not.toBeAbleToSelect(this.katana);
                expect(this.player1).not.toBeAbleToSelect(this.totalWarfare);
                expect(this.player1).toBeAbleToSelect(this.aq);
                expect(this.player1).toBeAbleToSelect(this.barcha);
            });

            it('when choosing an attachment, it should play it on Kuro, reduced by 1 fate', function () {
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.kuro],
                    defenders: [],
                    type: 'military'
                });

                this.player2.pass();

                const initialFate = this.player1.fate;
                this.player1.clickCard(this.kuro);
                this.player1.clickCard(this.aq);
                expect(this.aq.parent).toBe(this.kuro);
                expect(this.player1.fate).toBe(initialFate - 0); // 1 cost attachment reduced by 1
            });

            it('when choosing an attachment, it should play it on Kuro, reduced by 1 fate, while still paying fate if printed cost higher than 2', function () {
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.kuro],
                    defenders: [],
                    type: 'military'
                });

                this.player2.pass();

                const initialFate = this.player1.fate;
                this.player1.clickCard(this.kuro);
                this.player1.clickCard(this.barcha);
                expect(this.barcha.parent).toBe(this.kuro);
                expect(this.player1.fate).toBe(initialFate - 1); // 2 cost attachment reduced by 1
            });

            it('after attaching, if Kuro was at home should move to the conflict', function () {
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.ikomaProdigy],
                    defenders: [],
                    type: 'military'
                });

                this.player2.pass();

                this.player1.clickCard(this.kuro);
                this.player1.clickCard(this.aq);
                expect(this.kuro.isParticipating()).toBe(true);
                expect(this.getChatLogs(5)).toContain('player1 uses Kuro to seek the lost treasure \'Above Question\'. Kuro swoops into the conflict');
            });

            it('after attaching, if Kuro was in the conflict, Kuro should move home', function () {
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.kuro],
                    defenders: [],
                    type: 'military'
                });

                this.player2.pass();

                this.player1.clickCard(this.kuro);
                this.player1.clickCard(this.aq);
                expect(this.kuro.isParticipating()).toBe(false);
                expect(this.getChatLogs(5)).toContain('player1 uses Kuro to seek the lost treasure \'Above Question\'. Kuro returns home with their treasure');
            });
        });
    });
});
