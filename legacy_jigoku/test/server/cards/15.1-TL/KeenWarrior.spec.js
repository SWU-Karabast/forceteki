describe('Keen Warrior', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['eager-scout', 'doji-kuwanan', 'shrewd-investigator'],
                    hand: ['assassination'],
                    conflictDiscard: ['daimyo-s-gunbai']
                },
                player2: {
                    inPlay: ['keen-warrior', 'isawa-tadaka-2', 'shrewd-investigator'],
                    hand: ['let-go', 'policy-debate', 'offer-testimony', 'overhear', 'the-perfect-gift'],
                    dynastyDiscard: ['miya-mystic'],
                    conflictDiscard: ['way-of-the-dragon', 'charge', 'banzai'],
                    provinces: ['upholding-authority']
                }
            });

            this.gunbai = this.player1.findCardByName('daimyo-s-gunbai');
            this.assassination = this.player1.findCardByName('assassination');
            this.scout = this.player1.findCardByName('eager-scout');
            this.kuwanan = this.player1.findCardByName('doji-kuwanan');
            this.shrewdP1 = this.player1.findCardByName('shrewd-investigator');

            this.gift = this.player2.findCardByName('the-perfect-gift');
            this.warrior = this.player2.findCardByName('keen-warrior');
            this.tadaka = this.player2.findCardByName('isawa-tadaka-2');
            this.mystic = this.player2.findCardByName('miya-mystic');
            this.shrewd = this.player2.findCardByName('shrewd-investigator');
            this.overhear = this.player2.findCardByName('overhear');

            this.letGo = this.player2.findCardByName('let-go');
            this.pd = this.player2.findCardByName('policy-debate');
            this.testimony = this.player2.findCardByName('offer-testimony');

            this.dragon = this.player2.moveCard('way-of-the-dragon', 'conflict deck');
            this.charge = this.player2.moveCard('charge', 'conflict deck');
            this.banzai = this.player2.moveCard('banzai', 'conflict deck');

            this.ua = this.player2.findCardByName('upholding-authority');
        });

        it('should trigger when you look at a card', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.scout],
                defenders: [this.shrewd],
                type: 'political',
                province: this.ua
            });

            this.player2.clickCard(this.shrewd);
            expect(this.player2).toHavePrompt('Triggered Abilities');
            expect(this.player2).toBeAbleToSelect(this.warrior);
        });

        it('should draw 2 cards', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.scout],
                defenders: [this.shrewd],
                type: 'political',
                province: this.ua
            });

            let hand = this.player2.hand.length;

            this.player2.clickCard(this.shrewd);
            this.player2.clickCard(this.warrior);
            expect(this.player2.hand.length).toBe(hand + 2);
        });

        it('should get you to put a card on the bottom of your deck', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.scout],
                defenders: [this.shrewd],
                type: 'political',
                province: this.ua
            });

            this.player2.clickCard(this.shrewd);
            this.player2.clickCard(this.warrior);
            expect(this.player2).toHavePrompt('Choose a card to return to your deck');

            expect(this.player2).toBeAbleToSelect(this.letGo);
            expect(this.player2).toBeAbleToSelect(this.pd);
            expect(this.player2).toBeAbleToSelect(this.testimony);
            expect(this.player2).toBeAbleToSelect(this.charge);
            expect(this.player2).toBeAbleToSelect(this.banzai);

            this.player2.clickCard(this.testimony);
            expect(this.testimony.location).toBe('conflict deck');
            expect(this.player2.player.conflictDeck.last()).toBe(this.testimony);
        });

        it('specific reveals - Tadaka', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.scout],
                defenders: [this.shrewd],
                type: 'political',
                province: this.ua
            });

            this.player2.clickCard(this.tadaka);
            this.player2.clickCard(this.mystic);
            this.player2.clickPrompt('Done');
            this.player2.clickPrompt('Assassination');
            expect(this.player2).toHavePrompt('Triggered Abilities');
            expect(this.player2).toBeAbleToSelect(this.warrior);
        });

        it('specific reveals - compelling testimony', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.scout],
                defenders: [this.shrewd],
                type: 'political',
                province: this.ua
            });

            this.player2.clickCard(this.testimony);
            this.player2.clickCard(this.shrewd);
            this.player1.clickCard(this.scout);
            this.player2.clickCard(this.pd);
            this.player1.clickCard(this.assassination);
            expect(this.player2).toHavePrompt('Triggered Abilities');
            expect(this.player2).toBeAbleToSelect(this.warrior);
        });

        it('specific reveals - overhear', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.scout],
                defenders: [this.shrewd],
                type: 'political',
                province: this.ua
            });

            this.player2.clickCard(this.overhear);
            this.player2.clickPrompt('Done');
            expect(this.player2).toHavePrompt('Triggered Abilities');
            expect(this.player2).toBeAbleToSelect(this.warrior);
        });

        it('specific reveals - gunbai', function() {
            this.player1.moveCard(this.gunbai, 'hand');
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.scout],
                defenders: [this.shrewd],
                type: 'political',
                province: this.ua
            });

            this.player2.pass();
            this.player1.clickCard(this.gunbai);
            this.player1.clickCard(this.scout);
            this.player2.clickCard(this.shrewd);

            expect(this.player2).toHavePrompt('Triggered Abilities');
            expect(this.player2).toBeAbleToSelect(this.warrior);
        });

        it('specific reveals - perfect gift', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.scout],
                defenders: [this.shrewd],
                type: 'political',
                province: this.ua
            });

            this.player2.clickCard(this.gift);
            this.player2.clickPrompt('Supernatural Storm');
            this.player2.clickPrompt('Supernatural Storm (4)');
            expect(this.player2).not.toHavePrompt('Triggered Abilities');
            expect(this.player1).toHavePrompt('Conflict Action Window');
        });

        it('specific reveals - Upholding Authority', function() {
            this.player1.moveCard(this.gunbai, 'hand');
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.scout, this.kuwanan],
                defenders: [this.shrewd],
                type: 'military',
                province: this.ua
            });

            this.noMoreActions();
            this.player2.clickCard(this.ua);
            this.player2.clickPrompt('Assassination');
            expect(this.player2).toHavePrompt('Triggered Abilities');
            expect(this.player2).toBeAbleToSelect(this.warrior);
        });

        it('specific reveals - Policy Debate', function() {
            this.player1.moveCard(this.gunbai, 'hand');
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.scout],
                defenders: [this.shrewd],
                type: 'military',
                province: this.ua
            });

            this.player2.clickCard(this.pd);
            this.player2.clickCard(this.shrewd);
            this.player2.clickCard(this.scout);

            this.player2.clickPrompt('1');
            this.player1.clickPrompt('1');
            this.player2.clickPrompt('Assassination');
            expect(this.player2).toHavePrompt('Triggered Abilities');
            expect(this.player2).toBeAbleToSelect(this.warrior);
        });

        it('should not trigger if you reveal your cards', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.shrewdP1],
                defenders: [this.shrewd],
                type: 'military',
                province: this.ua
            });

            this.player2.pass();
            this.player1.clickCard(this.shrewdP1);
            expect(this.player2).not.toHavePrompt('Triggered Abilities');
            expect(this.player2).toHavePrompt('Conflict Action Window');
        });
    });
});
