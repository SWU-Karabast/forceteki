describe('Lucky Coin - ATTENTION: FLAKY!!', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'fate',
                player1: {
                    inPlay: ['doji-kuwanan'],
                    hand: ['lucky-coin'],
                    dynastyDiscard: [
                        'iron-mine',
                        'miya-mystic',
                        'aranat',
                        'fushicho',
                        'imperial-storehouse',
                        'miya-library'
                    ]
                }
            });

            this.kuwanan = this.player1.findCardByName('doji-kuwanan');
            this.coin = this.player1.findCardByName('lucky-coin');

            this.mine = this.player1.findCardByName('iron-mine');
            this.mystic = this.player1.findCardByName('miya-mystic');
            this.aranat = this.player1.findCardByName('aranat');
            this.fushicho = this.player1.findCardByName('fushicho');
            this.storehouse = this.player1.findCardByName('imperial-storehouse');
            this.library = this.player1.findCardByName('miya-library');
        });

        describe('for flips with ok cost', function () {
            beforeEach(function () {
                this.player1.placeCardInProvince(this.mine, 'province 1');
                this.mine.facedown = true;
                this.player1.placeCardInProvince(this.library, 'province 2');
                this.library.facedown = true;
                this.player1.placeCardInProvince(this.fushicho, 'province 3');
                this.fushicho.facedown = true;
                this.player1.placeCardInProvince(this.mystic, 'province 4');
                this.mystic.facedown = true;
            });

            describe('with attachment in play', function () {
                beforeEach(function () {
                    this.player1.playAttachment(this.coin, this.kuwanan);

                    this.noMoreActions();
                    this.player2.clickPrompt('Done');
                    this.player2.clickPrompt('End Round');
                    this.player1.clickPrompt('End Round');
                });

                it('nothing happens', function () {
                    expect(this.player1).not.toHavePrompt('Triggered Abilities');
                });
            });

            describe('with attachment in hand', function () {
                beforeEach(function () {
                    this.noMoreActions();
                    this.player2.clickPrompt('Done');
                    this.player2.clickPrompt('End Round');
                    this.player1.clickPrompt('End Round');
                });

                it('nothing happens', function () {
                    expect(this.player1).not.toHavePrompt('Triggered Abilities');
                });
            });
        });

        describe('for too expensive flips', function () {
            beforeEach(function () {
                this.player1.placeCardInProvince(this.mine, 'province 1');
                this.mine.facedown = true;
                this.player1.placeCardInProvince(this.aranat, 'province 2');
                this.aranat.facedown = true;
                this.player1.placeCardInProvince(this.fushicho, 'province 3');
                this.fushicho.facedown = true;
                this.player1.placeCardInProvince(this.mystic, 'province 4');
                this.mystic.facedown = true;
            });

            describe('with attachment in play', function () {
                beforeEach(function () {
                    this.player1.playAttachment(this.coin, this.kuwanan);

                    this.noMoreActions();
                    this.player2.clickPrompt('Done');
                    this.player2.clickPrompt('End Round');
                    this.player1.clickPrompt('End Round');
                });

                it('mulligan everything', function () {
                    expect(this.player1).toHavePrompt('Triggered Abilities');

                    this.player1.clickCard(this.coin);
                    expect(this.getChatLogs(3)).toContain(
                        'player1 uses Lucky Coin, removing Lucky Coin from the game to to replace all cards in their provinces'
                    );
                });
            });

            describe('with attachment in hand', function () {
                beforeEach(function () {
                    this.noMoreActions();
                    this.player2.clickPrompt('Done');
                    this.player2.clickPrompt('End Round');
                    this.player1.clickPrompt('End Round');
                });

                it('mulligan everything', function () {
                    expect(this.player1).toHavePrompt('Triggered Abilities');

                    this.player1.clickCard(this.coin);
                    expect(this.getChatLogs(3)).toContain(
                        'player1 uses Lucky Coin, removing Lucky Coin from the game to to replace all cards in their provinces'
                    );
                });
            });
        });

        describe('for too cheap flips', function () {
            beforeEach(function () {
                this.player1.placeCardInProvince(this.mine, 'province 1');
                this.mine.facedown = true;
                this.player1.placeCardInProvince(this.library, 'province 2');
                this.library.facedown = true;
                this.player1.placeCardInProvince(this.storehouse, 'province 3');
                this.storehouse.facedown = true;
                this.player1.placeCardInProvince(this.mystic, 'province 4');
                this.mystic.facedown = true;
            });

            describe('with attachment in play', function () {
                beforeEach(function () {
                    this.player1.playAttachment(this.coin, this.kuwanan);

                    this.noMoreActions();
                    this.player2.clickPrompt('Done');
                    this.player2.clickPrompt('End Round');
                    this.player1.clickPrompt('End Round');
                });

                it('mulligan everything', function () {
                    expect(this.player1).toHavePrompt('Triggered Abilities');

                    this.player1.clickCard(this.coin);
                    expect(this.getChatLogs(3)).toContain(
                        'player1 uses Lucky Coin, removing Lucky Coin from the game to to replace all cards in their provinces'
                    );
                });
            });

            describe('with attachment in hand', function () {
                beforeEach(function () {
                    this.noMoreActions();
                    this.player2.clickPrompt('Done');
                    this.player2.clickPrompt('End Round');
                    this.player1.clickPrompt('End Round');
                });

                it('mulligan everything', function () {
                    expect(this.player1).toHavePrompt('Triggered Abilities');

                    this.player1.clickCard(this.coin);
                    expect(this.getChatLogs(3)).toContain(
                        'player1 uses Lucky Coin, removing Lucky Coin from the game to to replace all cards in their provinces'
                    );
                });
            });
        });
    });
});