describe('Dazzling Duelist', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['agasha-swordsmith'],
                    hand: ['fine-katana', 'way-of-the-open-hand']
                },
                player2: {
                    inPlay: ['dazzling-duelist'],
                    hand: ['display-of-power'],
                    stronghold: ['shiro-kitsuki']
                }
            });
            this.hand = this.player1.findCardByName('way-of-the-open-hand');
            this.agashaSwordsmith = this.player1.findCardByName('agasha-swordsmith');
            this.katana = this.player1.findCardByName('fine-katana');

            this.shiroKitsuki = this.player2.findCardByName('shiro-kitsuki');
            this.duelist = this.player2.findCardByName('dazzling-duelist');
            this.dop = this.player2.findCardByName('display-of-power');

            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.agashaSwordsmith],
                ring: 'air'
            });
            this.player2.clickCard(this.shiroKitsuki);
            this.player2.chooseCardInPrompt(this.katana.name, 'card-name');
            this.player2.clickCard(this.duelist);
            this.player2.clickPrompt('Done');
        });

        it('opponent should choose duel target', function() {
            this.player2.clickCard(this.duelist);
            expect(this.player1).toHavePrompt('Choose a character');
        });

        it('should initiate a military duel', function() {
            this.player2.clickCard(this.duelist);
            this.player1.clickCard(this.agashaSwordsmith);
            this.player1.clickPrompt('1');
            this.player2.clickPrompt('1');
            expect(this.getChatLogs(9)).toContain('player2 uses Dazzling Duelist to initiate a military duel : Dazzling Duelist vs. Agasha Swordsmith');
            expect(this.getChatLogs(4)).toContain('Dazzling Duelist: 3 vs 2: Agasha Swordsmith');
            expect(this.getChatLogs(3)).toContain('Duel Effect: prevent player1 from claiming rings this conflict');
        });

        it('should prevent the loser from claiming rings from conflict resolution - attacker wins ring', function() {
            this.player2.clickCard(this.duelist);
            this.player1.clickCard(this.agashaSwordsmith);
            this.player1.clickPrompt('1');
            this.player2.clickPrompt('1');
            this.duelist.bowed = true;
            this.noMoreActions();
            this.player1.clickPrompt('Gain 2 Honor');
            expect(this.player1).toHavePrompt('Action Window');
            expect(this.game.rings.air.claimed).toBe(false);
        });

        it('should prevent the loser from claiming rings from conflict resolution - defender wins ring', function() {
            this.player2.clickCard(this.duelist);
            this.player1.clickCard(this.agashaSwordsmith);
            this.player1.clickPrompt('5');
            this.player2.clickPrompt('1');
            this.noMoreActions();
            expect(this.player1).toHavePrompt('Action Window');
            expect(this.game.rings.air.claimed).toBe(false);
        });

        it('should prevent the loser from claiming rings - display of power', function() {
            this.player2.clickCard(this.duelist);
            this.player1.clickCard(this.agashaSwordsmith);
            this.player1.clickPrompt('5');
            this.player2.clickPrompt('1');
            this.player1.clickCard(this.hand);
            this.player1.clickCard(this.duelist);
            this.noMoreActions();
            expect(this.player2).toHavePrompt('Triggered Abilities');
            expect(this.player2).toBeAbleToSelect(this.dop);
            this.player2.clickCard(this.dop);
            this.player2.clickPrompt('Gain 2 Honor');
            expect(this.player1).toHavePrompt('Action Window');

            //player1 will claim the ring, since it's still contested when 3.2.7 rolls around due to DoP not being able to claim it
            expect(this.game.rings.air.claimed).toBe(true);
            expect(this.game.rings.air.claimedBy).toBe(this.player1.player.name);
        });

        it('should not prevent the winner from claiming rings - display of power', function() {
            this.player2.clickCard(this.duelist);
            this.player1.clickCard(this.agashaSwordsmith);
            this.player1.clickPrompt('1');
            this.player2.clickPrompt('1');
            this.player1.clickCard(this.hand);
            this.player1.clickCard(this.duelist);
            this.noMoreActions();
            expect(this.player2).toHavePrompt('Triggered Abilities');
            expect(this.player2).toBeAbleToSelect(this.dop);
            this.player2.clickCard(this.dop);
            this.player2.clickPrompt('Gain 2 Honor');
            expect(this.player1).toHavePrompt('Action Window');
            expect(this.game.rings.air.claimed).toBe(true);
            expect(this.game.rings.air.claimedBy).toBe(this.player2.player.name);
        });

        it('should prevent the loser from claiming rings - shiro kitsuki', function() {
            this.player2.clickCard(this.duelist);
            this.player1.clickCard(this.agashaSwordsmith);
            this.player1.clickPrompt('5');
            this.player2.clickPrompt('1');
            this.player1.clickCard(this.katana);
            this.player1.clickCard(this.agashaSwordsmith);
            expect(this.player2).toHavePrompt('Conflict Action Window');
        });

        it('should not prevent the winner from claiming rings - shiro kitsuki', function() {
            this.player2.clickCard(this.duelist);
            this.player1.clickCard(this.agashaSwordsmith);
            this.player1.clickPrompt('1');
            this.player2.clickPrompt('1');
            this.player1.clickCard(this.katana);
            this.player1.clickCard(this.agashaSwordsmith);
            expect(this.player2).toHavePrompt('Shiro Kitsuki');
        });

        it('should do nothing on a tie - opponent claims', function() {
            this.player2.clickCard(this.duelist);
            this.player1.clickCard(this.agashaSwordsmith);
            this.player1.clickPrompt('2');
            this.player2.clickPrompt('1');
            expect(this.getChatLogs(11)).toContain('player2 uses Dazzling Duelist to initiate a military duel : Dazzling Duelist vs. Agasha Swordsmith');
            expect(this.getChatLogs(4)).toContain('The duel ends in a draw');
            expect(this.getChatLogs(3)).toContain('The duel has no effect');
            this.duelist.bowed = true;
            this.noMoreActions();
            this.player1.clickPrompt('Gain 2 Honor');
            expect(this.player1).toHavePrompt('Action Window');
            expect(this.game.rings.air.claimed).toBe(true);
        });

        it('should do nothing on a tie - you claim', function() {
            this.player2.clickCard(this.duelist);
            this.player1.clickCard(this.agashaSwordsmith);
            this.player1.clickPrompt('2');
            this.player2.clickPrompt('1');
            this.noMoreActions();
            expect(this.player1).toHavePrompt('Action Window');
            expect(this.game.rings.air.claimed).toBe(true);
        });
    });
});
