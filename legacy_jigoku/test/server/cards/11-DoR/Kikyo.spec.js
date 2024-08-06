describe('kikyo', function() {
    integration(function() {
        describe('kikyo attachment', function() {
            beforeEach(function() {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        fate: 3,
                        inPlay: ['hida-kisada', 'brash-samurai', 'hida-o-ushi', 'yoritomo'],
                        hand: ['kikyo', 'seal-of-the-crab', 'backhanded-compliment']
                    },
                    player2: {
                        inPlay: ['doji-challenger'],
                        hand: ['let-go', 'assassination'],
                        dynastyDiscard: ['daidoji-netsu']
                    }
                });
                this.kisadaP1 = this.player1.findCardByName('hida-kisada');
                this.brashSamurai = this.player1.findCardByName('brash-samurai');
                this.oushi = this.player1.findCardByName('hida-o-ushi');
                this.yoritomo = this.player1.findCardByName('yoritomo');
                this.kikyo = this.player1.findCardByName('kikyo');
                this.seal = this.player1.findCardByName('seal-of-the-crab');
                this.bhc = this.player1.findCardByName('backhanded-compliment');

                this.challenger = this.player2.findCardByName('doji-challenger');
                this.letGo = this.player2.findCardByName('let-go');
                this.netsu = this.player2.findCardByName('daidoji-netsu');
            });

            it('should only be able to attach to unique crab characters you control', function() {
                this.player1.clickCard(this.kikyo);
                expect(this.player1).toBeAbleToSelect(this.kisadaP1);
                expect(this.player1).not.toBeAbleToSelect(this.brashSamurai);
                expect(this.player1).toBeAbleToSelect(this.oushi);
                expect(this.player1).not.toBeAbleToSelect(this.yoritomo);
            });

            it('should grant the ability to a character when attached', function() {
                let actionCount = this.kisadaP1.getReactions().length;
                this.player1.playAttachment(this.kikyo, this.kisadaP1);
                expect(this.player2).toHavePrompt('Action Window');
                expect(this.kisadaP1.getReactions().length).toBe(actionCount + 1);
            });

            describe('unique non-crab character with the seal attached', function() {
                beforeEach(function () {
                    this.player1.playAttachment(this.seal, this.yoritomo);
                    this.player2.pass();
                });

                it('should attach', function() {
                    this.player1.clickCard(this.kikyo);
                    expect(this.player1).toBeAbleToSelect(this.yoritomo);
                });

                it('should grant the ability if the character is a champion', function() {
                    let actionCount = this.yoritomo.getReactions().length;
                    this.player1.playAttachment(this.kikyo, this.yoritomo);
                    expect(this.yoritomo.getReactions().length).toBe(actionCount + 1);
                });

                it('should discard if the character loses faction', function() {
                    this.player1.playAttachment(this.kikyo, this.yoritomo);
                    this.player2.clickCard(this.letGo);
                    this.player2.clickCard(this.seal);
                    expect(this.kikyo.location).toBe('conflict discard pile');
                });
            });

            describe('ability', function () {
                beforeEach(function () {
                    this.player1.playAttachment(this.kikyo, this.kisadaP1);
                    this.noMoreActions();

                    this.kisadaP1.fate = 4;
                    this.oushi.fate = 2;
                    this.yoritomo.fate = 0;
                });

                it('should trigger when holder\'s controller draws a card', function() {
                    this.initiateConflict({
                        type: 'military',
                        attackers: [this.kisadaP1, this.oushi, this.yoritomo],
                        defenders: [this.challenger]
                    });
                    this.player2.pass();
                    this.player1.clickCard(this.bhc);
                    this.player1.clickPrompt('player1');
                    expect(this.player1).toHavePrompt('Triggered Abilities');
                    expect(this.player1).toBeAbleToSelect(this.kisadaP1);
                    expect(this.player1).not.toBeAbleToSelect(this.kikyo);
                });

                it('should trigger when opponent draws a card', function() {
                    this.initiateConflict({
                        type: 'military',
                        attackers: [this.kisadaP1, this.oushi, this.yoritomo],
                        defenders: [this.challenger]
                    });
                    this.player2.pass();
                    this.player1.clickCard(this.bhc);
                    this.player1.clickPrompt('player2');
                    expect(this.player1).not.toHavePrompt('Triggered Abilities');
                });

                it('should not trigger if holder is not participating', function() {
                    this.initiateConflict({
                        type: 'military',
                        attackers: [this.oushi, this.yoritomo],
                        defenders: [this.challenger]
                    });
                    this.player2.pass();
                    this.player1.clickCard(this.bhc);
                    this.player1.clickPrompt('player1');
                    expect(this.player1).not.toHavePrompt('Triggered Abilities');
                });

                it('should force opponent to discard at random', function() {
                    this.initiateConflict({
                        type: 'military',
                        attackers: [this.kisadaP1, this.oushi, this.yoritomo],
                        defenders: [this.challenger]
                    });
                    let hand = this.player2.hand.length;
                    this.player2.pass();
                    this.player1.clickCard(this.bhc);
                    this.player1.clickPrompt('player1');
                    this.player1.clickCard(this.kisadaP1);
                    expect(this.player2.hand.length).toBe(hand - 1);
                    expect(this.getChatLogs(5)).toContain('player1 uses Hida Kisada\'s gained ability from Kikyo to make player2 discard 1 card at random');
                });
            });
        });
    });
});
