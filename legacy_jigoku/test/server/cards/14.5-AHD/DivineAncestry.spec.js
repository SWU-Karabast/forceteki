describe('Divine Ancestry', function() {
    integration(function() {
        describe('Divine Ancestry\'s ability - draw phase', function() {
            beforeEach(function() {
                this.setupTest({
                    phase: 'dynasty',
                    player1: {
                        honor: 11,
                        conflictDiscard: ['divine-ancestry']
                    },
                    player2: {
                        honor: 9
                    }
                });
                this.ancestry = this.player1.findCardByName('divine-ancestry');
                this.player1.moveCard(this.ancestry, 'hand');
                this.noMoreActions();
            });

            it ('should react at the start of a phase', function() {
                expect(this.player1).toHavePrompt('Triggered Abilities');
                expect(this.player1).toBeAbleToSelect(this.ancestry);
            });

            it ('should prevent losing honor from a bid', function() {
                let honor = this.player1.honor;
                let p2honor = this.player2.honor;
                this.player1.clickCard(this.ancestry);
                this.player1.clickPrompt('5');
                this.player2.clickPrompt('1');
                expect(this.player1.honor).toBe(honor);
                expect(this.player2.honor).toBe(p2honor);
            });

            it ('should not prevent gaining honor from a bid', function() {
                let honor = this.player1.honor;
                let p2honor = this.player2.honor;
                this.player1.clickCard(this.ancestry);
                this.player1.clickPrompt('1');
                this.player2.clickPrompt('5');
                expect(this.player1.honor).toBe(honor + 4);
                expect(this.player2.honor).toBe(p2honor - 4);
            });

            it ('chat message', function() {
                this.player1.clickCard(this.ancestry);
                expect(this.getChatLogs(3)).toContain('player1 plays Divine Ancestry to prevent player1 from losing honor this phase');
            });
        });
    });
});

describe('Divine Ancestry', function() {
    integration(function() {
        describe('Divine Ancestry\'s ability - conflict phase', function() {
            beforeEach(function() {
                this.setupTest({
                    phase: 'draw',
                    player1: {
                        honor: 11,
                        inPlay: ['shiba-tsukune', 'beloved-advisor'],
                        hand: ['assassination', 'game-of-sadane', 'backhanded-compliment', 'smuggling-deal', 'fine-katana'],
                        conflictDeck: ['let-go', 'calling-in-favors'],
                        conflictDiscard: ['divine-ancestry']
                    },
                    player2: {
                        stronghold: ['city-of-the-open-hand'],
                        honor: 9,
                        inPlay: ['shrine-maiden'],
                        hand: ['noble-sacrifice', 'watch-commander']
                    }
                });

                this.player1.player.promptedActionWindows.draw = true;
                this.player2.player.promptedActionWindows.draw = true;

                this.city = this.player2.findCardByName('city-of-the-open-hand');
                this.city.loadOriginalAction();

                this.shrineMaiden = this.player2.findCardByName('shrine-maiden');
                this.sac = this.player2.findCardByName('noble-sacrifice');
                this.watchCommander = this.player2.findCardByName('watch-commander');

                this.shibaTsukune = this.player1.findCardByName('shiba-tsukune');

                this.katana = this.player1.findCardByName('fine-katana');
                this.assassination = this.player1.findCardByName('assassination');
                this.backhanded = this.player1.findCardByName('backhanded-compliment');
                this.smuggling = this.player1.findCardByName('smuggling-deal');
                this.sadane = this.player1.findCardByName('game-of-sadane');
                this.advisor = this.player1.findCardByName('beloved-advisor');

                this.ancestry = this.player1.findCardByName('divine-ancestry');

                //HACK: the phase starts before the test finishes setting up, so this sometimes ends up in hand and able to be reacted to...
                //so we'll click it just in case
                this.player1.clickCard(this.ancestry);
                this.player1.clickPrompt('1');
                this.player2.clickPrompt('1');
                this.player1.moveCard(this.ancestry, 'hand');
                this.noMoreActions();
                this.player1.clickCard(this.ancestry);
            });

            it('shouldn\'t being able to play assassination or smuggling deal', function() {
                this.noMoreActions();
                this.initiateConflict({
                    type: 'military',
                    ring: 'air',
                    attackers: [this.shibaTsukune],
                    defenders: [this.shrineMaiden]
                });

                this.player2.pass();

                expect(this.player1).toHavePrompt('Conflict Action Window');
                this.player1.clickCard('assassination');
                expect(this.player1).toHavePrompt('Conflict Action Window');
                this.player1.clickCard('smuggling-deal');
                expect(this.player1).toHavePrompt('Conflict Action Window');
            });

            it('shouldn\'t lose honor when dishonored characters leave play', function() {
                let honor = this.player1.honor;

                this.shrineMaiden.honor();
                this.shibaTsukune.dishonor();
                this.player1.pass();
                this.player2.clickCard('noble-sacrifice');
                this.player2.clickPrompt('Pay Costs First');
                this.player2.clickCard(this.shrineMaiden);
                this.player2.clickCard(this.shibaTsukune);
                expect(this.shrineMaiden.location).toBe('conflict discard pile');
                expect(this.shibaTsukune.location).toBe('dynasty discard pile');
                expect(this.player1.honor).toBe(honor);
            });

            it('watch commander shouldn\'t cause you to lose honor', function() {
                this.noMoreActions();
                this.initiateConflict({
                    type: 'military',
                    ring: 'air',
                    attackers: [this.shibaTsukune],
                    defenders: [this.shrineMaiden]
                });

                this.player2.playAttachment(this.watchCommander, this.shrineMaiden);
                this.player1.playAttachment(this.katana, this.shibaTsukune);
                expect(this.player2).not.toHavePrompt('Triggered Abilities');
                expect(this.player2).toHavePrompt('Conflict Action Window');
            });

            it('should stop you from losing honor during duels', function() {
                let honor = this.player1.honor;
                let honor2 = this.player2.honor;

                this.noMoreActions();
                this.initiateConflict({
                    type: 'military',
                    ring: 'air',
                    attackers: [this.shibaTsukune],
                    defenders: [this.shrineMaiden]
                });

                this.player2.pass();
                this.player1.clickCard('game-of-sadane');
                this.player1.clickCard(this.shibaTsukune);
                this.player1.clickCard(this.shrineMaiden);
                this.player1.clickPrompt('5');
                this.player2.clickPrompt('1');
                expect(this.player1.honor).toBe(honor);
                expect(this.player2.honor).toBe(honor2);
            });

            it('should be able to play cards with losing honor in the effect', function() {
                let honor = this.player1.honor;
                let hand = this.player1.hand.length;

                this.player1.clickCard(this.backhanded);
                this.player1.clickPrompt('player1');
                expect(this.player1.honor).toBe(honor);
                expect(this.player1.hand.length).toBe(hand);
                expect(this.backhanded.location).toBe('conflict discard pile');
            });

            it('opponent should not be able to take honor', function() {
                this.player1.pass();
                expect(this.player2).toHavePrompt('Action Window');
                this.player2.clickCard(this.city);
                expect(this.player2).toHavePrompt('Action Window');
            });

            it('unopposed and air ring', function() {
                this.noMoreActions();
                this.player1.passConflict();
                this.noMoreActions();
                let honor = this.player1.honor;

                this.initiateConflict({
                    type: 'military',
                    ring: 'air',
                    attackers: [this.shrineMaiden],
                    defenders: []
                });

                this.noMoreActions();
                expect(this.player2).toHavePrompt('Air Ring');
                expect(this.player2).toHavePromptButton('Gain 2 Honor');
                expect(this.player2).not.toHavePromptButton('Take 1 Honor from opponent');
                this.player2.clickPrompt('Gain 2 Honor');
                expect(this.player1.honor).toBe(honor);
            });

            it('reshuffling', function() {
                this.player1.reduceDeckToNumber('conflict deck', 0);
                let honor = this.player1.honor;
                this.player1.clickCard(this.advisor);
                expect(this.player1.honor).toBe(honor);
                expect(this.getChatLogs(5)).toContain('player1 is shuffling their conflict deck');
            });

            // This locks the engine in a loop.
            // it('infinite reshuffling', function() {
            //     this.player1.reduceDeckToNumber('conflict deck', 0);
            //     this.player1.conflictDiscard.forEach(card => this.player1.moveCard(card, 'hand'));
            //     expect(this.player1.conflictDiscard.length).toBe(0);

            //     let honor = this.player1.honor;
            //     this.player1.clickCard(this.advisor);
            //     expect(this.player1.honor).toBe(honor);
            //     expect(this.getChatLogs(5)).toContain('player1 is shuffling their conflict deck');
            //     expect(this.player1.conflictDiscard.length).toBe(0);
            // });
        });
    });
});
