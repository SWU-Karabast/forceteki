describe('Overlooked Community', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['young-harrier', 'doji-challenger', 'shiba-tsukune'],
                    hand: ['severed-from-the-stream']
                },
                player2: {
                    inPlay: ['keeper-initiate', 'crisis-breaker'],
                    dynastyDiscard: ['overlooked-community']
                }
            });
            this.tsukune = this.player1.findCardByName('shiba-tsukune');
            this.challenger = this.player1.findCardByName('doji-challenger');
            this.youngHarrier = this.player1.findCardByName('young-harrier');
            this.severed = this.player1.findCardByName('severed-from-the-stream');

            this.keeperInitiate = this.player2.findCardByName('keeper-initiate');
            this.crisisBreaker = this.player2.findCardByName('crisis-breaker');

            this.community = this.player2.moveCard('overlooked-community', 'province 1');
            this.community.facedown = false;
            this.sd1 = this.player1.findCardByName('shameful-display', 'province 1');

            this.challenger.honor();
            this.keeperInitiate.dishonor();

            this.player2.claimRing('air');
            this.player2.claimRing('earth');
            this.player2.claimRing('void');

        });

        it('should allow you to return a single ring', function () {
            this.player1.pass();
            this.player2.clickCard(this.community);
            expect(this.player2).toBeAbleToSelect(this.challenger);
            expect(this.player2).toBeAbleToSelect(this.keeperInitiate);
            expect(this.player2).not.toBeAbleToSelect(this.tsukune);
            expect(this.player2).not.toBeAbleToSelect(this.crisisBreaker);
            expect(this.player2).not.toBeAbleToSelect(this.youngHarrier);

            expect(this.challenger.isHonored).toBe(true);
            this.player2.clickCard(this.challenger);
            expect(this.player2).toBeAbleToSelectRing('air');
            expect(this.player2).toBeAbleToSelectRing('earth');
            expect(this.player2).toBeAbleToSelectRing('void');
            this.player2.clickRing('air');
            expect(this.getChatLogs(3)).toContain('player2 uses Overlooked Community, returning the Air Ring to discard Doji Challenger\'s status token');
            expect(this.game.rings.air.claimed).toBe(false);
            expect(this.challenger.isHonored).toBe(false);
        });

        it('should not work without any rings', function () {
            this.player1.clickCard(this.severed);
            expect(this.game.rings.air.claimed).toBe(false);
            expect(this.game.rings.earth.claimed).toBe(false);
            expect(this.game.rings.void.claimed).toBe(false);
            expect(this.player2).toHavePrompt('Action Window');
            this.player2.clickCard(this.community);
            expect(this.player2).toHavePrompt('Action Window');
        });

        it('should allow you to interact with cannot be dishonored', function () {
            this.player1.clickCard(this.youngHarrier);
            this.player2.clickCard(this.community);
            expect(this.player2).toBeAbleToSelect(this.challenger);
            expect(this.player2).toBeAbleToSelect(this.keeperInitiate);
            expect(this.player2).not.toBeAbleToSelect(this.tsukune);
            expect(this.player2).not.toBeAbleToSelect(this.crisisBreaker);
            expect(this.player2).toBeAbleToSelect(this.youngHarrier);

            expect(this.challenger.isHonored).toBe(true);
            this.player2.clickCard(this.challenger);
            expect(this.player2).toBeAbleToSelectRing('air');
            expect(this.player2).toBeAbleToSelectRing('earth');
            expect(this.player2).toBeAbleToSelectRing('void');
            this.player2.clickRing('air');
            expect(this.getChatLogs(3)).toContain('player2 uses Overlooked Community, returning the Air Ring to discard Doji Challenger\'s status token');
            expect(this.game.rings.air.claimed).toBe(false);
            expect(this.challenger.isHonored).toBe(false);
        });

        it('should not let you target a dishonored province', function() {
            this.sd1.dishonor();
            this.player1.pass();
            this.player2.clickCard(this.community);
            expect(this.player2).toBeAbleToSelect(this.challenger);
            expect(this.player2).not.toBeAbleToSelect(this.sd1);
        });
    });
});
