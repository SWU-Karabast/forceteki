describe('Righteous Samurai', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['righteous-samurai', 'doji-challenger'],
                    hand: ['backhanded-compliment','policy-debate']
                },
                player2: {
                    inPlay: ['beloved-advisor'],
                    dynastyDeck: ['windswept-yurt'],
                    hand: ['backhanded-compliment', 'policy-debate', 'noble-sacrifice', 'overhear']
                }
            });
            this.challenger = this.player1.findCardByName('doji-challenger');
            this.righteous = this.player1.findCardByName('righteous-samurai');
            this.yurt = this.player2.placeCardInProvince('windswept-yurt', 'province 1');
            this.advisor = this.player2.findCardByName('beloved-advisor');
            this.overhear = this.player2.findCardByName('overhear');

            this.policyDebate = this.player1.findCardByName('policy-debate');
            this.backhand = this.player1.findCardByName('backhanded-compliment');

            this.bhc2 = this.player2.findCardByName('backhanded-compliment');
            this.pd2 = this.player2.findCardByName('policy-debate');
            this.ns = this.player2.findCardByName('noble-sacrifice');
        });

        it('will trigger from a honor loss caused by the opponent', function () {
            this.player1.clickPrompt('Pass');
            this.player2.clickCard(this.bhc2);
            this.player2.clickPrompt('player1');
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.righteous);
        });

        it('should let you choose and honor a character', function () {
            this.player1.clickPrompt('Pass');
            this.player2.clickCard(this.bhc2);
            this.player2.clickPrompt('player1');
            this.player1.clickCard(this.righteous);
            expect(this.player1).toBeAbleToSelect(this.righteous);
            expect(this.player1).toBeAbleToSelect(this.challenger);
            expect(this.player1).toBeAbleToSelect(this.advisor);

            this.player1.clickCard(this.advisor);
            expect(this.getChatLogs(3)).toContain('player1 uses Righteous Samurai to honor Beloved Advisor');
        });

        it('will not trigger for honor gains', function () {
            this.player1.clickPrompt('Pass');
            this.player2.clickCard(this.yurt);
            this.player2.clickPrompt('Each player gains 2 honor');
            expect(this.player1).not.toHavePrompt('Triggered Abilities');
        });

        it('will not trigger from an honor loss caused by the controller', function () {
            this.player1.clickCard(this.backhand, 'hand');
            this.player1.clickPrompt('player1');
            expect(this.player1).not.toHavePrompt('Triggered Abilities');
        });

        it('should not trigger from a duel', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.righteous],
                defenders: [this.advisor],
                type: 'military'
            });
            this.player2.clickCard(this.pd2);
            this.player2.clickCard(this.advisor);
            this.player2.clickCard(this.righteous);
            this.player1.clickPrompt('2');
            this.player2.clickPrompt('1');
            expect(this.player1).not.toHavePrompt('Triggered Abilities');
        });

        it('should not trigger from a dishonored character leaving', function() {
            this.challenger.dishonor();
            this.advisor.honor();
            this.player1.pass();
            this.player2.clickCard(this.ns);
            this.player2.clickCard(this.challenger);
            this.player2.clickCard(this.advisor);
            expect(this.player1).not.toHavePrompt('Triggered Abilities');
            expect(this.player1).toHavePrompt('Action Window');
        });

        it('should not trigger when your deck is empty', function() {
            this.player1.reduceDeckToNumber('conflict deck', 0);
            expect(this.player1.conflictDeck.length).toBe(0);
            this.player1.pass();
            this.player2.clickCard(this.advisor);
            expect(this.player1).not.toHavePrompt('Triggered Abilities');
            expect(this.player1).toHavePrompt('Action Window');
        });

        it('should not trigger from unopposed', function() {
            this.noMoreActions();
            this.player1.passConflict();
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.advisor],
                defenders: [],
                type: 'military'
            });
            this.noMoreActions();
            expect(this.player1).not.toHavePrompt('Triggered Abilities');
            this.player2.clickPrompt('Don\'t Resolve');
            expect(this.player1).toHavePrompt('Action Window');
        });

        it('should trigger from air ring', function() {
            this.noMoreActions();
            this.player1.passConflict();
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.advisor],
                defenders: [],
                type: 'military'
            });
            this.noMoreActions();
            this.player2.clickPrompt('Take 1 Honor from opponent');
            expect(this.player1).toHavePrompt('Triggered Abilities');
        });

        it('should not trigger if opponent gives you honor', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.righteous],
                defenders: [this.advisor],
                type: 'political'
            });
            this.player2.clickCard(this.overhear);
            this.player2.clickPrompt('Give 1 honor to resolve this ability again');
            this.player2.clickPrompt('Done');
            expect(this.player1).not.toHavePrompt('Triggered Abilities');
        });
    });
});
