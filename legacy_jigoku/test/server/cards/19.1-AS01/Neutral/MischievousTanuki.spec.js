describe('Mischievous Tanuki', function () {
    integration(function () {
        describe('Tanuki ability - during conflict phase', function () {
            it('does not work during dynasty phase', function () {
                this.setupTest({
                    phase: 'dynasty',
                    player1: {
                        inPlay: ['mischievous-tanuki'],
                        hand: []
                    },
                    player2: {
                        inPlay: []
                    }
                });

                this.tanuki = this.player1.findCardByName('mischievous-tanuki');

                expect(this.player1).toHavePrompt('Click pass when done');
                this.player1.clickCard(this.tanuki);
                expect(this.player1).toHavePrompt('Click pass when done');
            });

            it('does not work during draw phase', function () {
                this.setupTest({
                    phase: 'draw',
                    player1: {
                        inPlay: ['mischievous-tanuki'],
                        hand: []
                    },
                    player2: {
                        inPlay: []
                    }
                });
                this.tanuki = this.player1.findCardByName('mischievous-tanuki');

                this.player1.clickPrompt('1');
                this.player2.clickPrompt('1');

                expect(this.player1).toHavePrompt('Initiate an action');
                this.player1.clickCard(this.tanuki);
                expect(this.player1).toHavePrompt('Initiate an action');
            });

            it('does not work during fate phase', function () {
                this.setupTest({
                    phase: 'fate',
                    player1: {
                        inPlay: ['mischievous-tanuki'],
                        hand: []
                    },
                    player2: {
                        inPlay: []
                    }
                });
                this.tanuki = this.player1.findCardByName('mischievous-tanuki');

                expect(this.player1).toHavePrompt('Initiate an action');
                this.player1.clickCard(this.tanuki);
                expect(this.player1).toHavePrompt('Initiate an action');
            });
        });

        describe('Tanuki ability - during conflict phase', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['mischievous-tanuki', 'bayushi-manipulator'],
                        hand: [],
                        dynastyDiscard: ['ide-negotiator']
                    },
                    player2: {
                        inPlay: []
                    }
                });

                this.player1.player.showBid = 5;
                this.player2.player.showBid = 5;

                this.tanuki = this.player1.findCardByName('mischievous-tanuki');
                this.ideNegotiator = this.player1.findCardByName('ide-negotiator');
            });

            it('should prompt each player to choose a bid and not transfer honor and should not proc dial revealed reactions', function () {
                let p1Honor = this.player1.honor;
                let p2Honor = this.player2.honor;
                this.player1.clickCard(this.tanuki);
                expect(this.player1).toHavePrompt('Choose your bid');
                expect(this.player2).toHavePrompt('Choose your bid');

                expect(this.player1).toHavePromptButton('1');
                expect(this.player1).toHavePromptButton('2');
                expect(this.player1).toHavePromptButton('3');
                expect(this.player1).toHavePromptButton('4');
                expect(this.player1).toHavePromptButton('5');

                expect(this.player2).toHavePromptButton('1');
                expect(this.player2).toHavePromptButton('2');
                expect(this.player2).toHavePromptButton('3');
                expect(this.player2).toHavePromptButton('4');
                expect(this.player2).toHavePromptButton('5');

                this.player1.clickPrompt('3');

                expect(this.getChatLogs(5)).toContain('player1 has chosen a bid.');
                expect(this.player1.player.showBid).toBe(5);

                this.player2.clickPrompt('1');

                expect(this.getChatLogs(5)).toContain('player2 has chosen a bid.');
                expect(this.getChatLogs(10)).toContain('player1 reveals a bid of 3');
                expect(this.getChatLogs(10)).toContain('player2 reveals a bid of 1');
                expect(this.player1.player.showBid).toBe(3);
                expect(this.player2.player.showBid).toBe(1);

                expect(this.player1.honor).toBe(p1Honor);
                expect(this.player2.honor).toBe(p2Honor);
            });

            it('both same parity', function () {
                let p1Fate = this.player1.fate;
                let p2Fate = this.player2.fate;

                this.player1.clickCard(this.tanuki);
                this.player1.clickPrompt('3');
                this.player2.clickPrompt('1');

                expect(this.player2).toHavePrompt('Action Window');

                expect(this.player1.fate).toBe(p1Fate + 2);
                expect(this.player2.fate).toBe(p2Fate - 2);
                expect(this.getChatLogs(10)).toContain('player1 takes 2 fate from player2');
            });

            it('different parity', function () {
                let p1Fate = this.player1.fate;
                let p2Fate = this.player2.fate;
                let p1Honor = this.player1.honor;
                let p2Honor = this.player2.honor;
                let p1cards = this.player1.hand.length;
                let p2cards = this.player2.hand.length;

                this.player1.clickCard(this.tanuki);
                this.player1.clickPrompt('3');
                this.player2.clickPrompt('2');

                expect(this.player1.fate).toBe(p1Fate);
                expect(this.player2.fate).toBe(p2Fate);

                expect(this.player1.honor).toBe(p1Honor);
                expect(this.player2.honor).toBe(p2Honor + 2);

                expect(this.player1.hand.length).toBe(p1cards + 2);
                expect(this.player2.hand.length).toBe(p2cards);

                expect(this.getChatLogs(10)).toContain('player1 draws 2 cards and player2 gains 2 honor');
            });

            it('interacts with abilities that change dials on reveal', function () {
                this.player1.moveCard(this.ideNegotiator, 'play area');

                let p1Fate = this.player1.fate;
                let p2Fate = this.player2.fate;

                this.player1.clickCard(this.tanuki);
                this.player1.clickPrompt('3');
                this.player2.clickPrompt('2');

                expect(this.player1).toHavePrompt('Triggered Abilities');
                expect(this.player1).toBeAbleToSelect(this.ideNegotiator);

                this.player1.clickCard(this.ideNegotiator);
                expect(this.player1).toHavePrompt('Ide Negotiator');

                this.player1.clickPrompt('Increase bid by 1');

                expect(this.player1.fate).toBe(p1Fate + 2);
                expect(this.player2.fate).toBe(p2Fate - 2);
                expect(this.getChatLogs(10)).toContain('player1 takes 2 fate from player2');
            });
        });
    });
});
