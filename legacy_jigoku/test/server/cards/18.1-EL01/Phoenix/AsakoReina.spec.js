describe('Asako Reina', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['asako-reina', 'seeker-of-knowledge'],
                    hand: ['know-the-world']
                },
                player2: {
                    inPlay: ['togashi-yokuni']
                }
            });
            this.seeker = this.player1.findCardByName('seeker-of-knowledge');
            this.asakoReina = this.player1.findCardByName('asako-reina');
            this.yokuni = this.player2.findCardByName('togashi-yokuni');
            this.seeker.bow();
            this.asakoReina.bow();
        });

        it('when no rings are claimed', function () {
            expect(this.player1).toHavePrompt('Action Window');
            this.player1.clickCard(this.asakoReina);
            expect(this.player1).toHavePrompt('Action Window');
        });

        it('when the air ring is claimed', function () {
            this.game.rings.air.claimRing(this.player1.player);
            this.game.checkGameState(true);
            this.player1.honor = 10;
            this.player1.clickCard(this.asakoReina);
            expect(this.player1.honor).toBe(11);
            expect(this.getChatLogs(10)).toContain('player1 uses Asako Reina to gain 1 honor');
        });

        it('when the earth ring is claimed', function () {
            this.game.rings.earth.claimRing(this.player1.player);
            this.game.checkGameState(true);
            let hand = this.player1.hand.length;
            this.player1.clickCard(this.asakoReina);
            expect(this.player1.hand.length).toBe(hand + 1);
        });

        it('when the fire ring is claimed', function () {
            this.game.rings.fire.claimRing(this.player1.player);
            this.game.checkGameState(true);
            this.player1.clickCard(this.asakoReina);
            expect(this.player1).toBeAbleToSelect(this.asakoReina);
            this.player1.clickCard(this.asakoReina);
            expect(this.asakoReina.isHonored).toBe(true);
        });

        it('when the water ring is claimed', function () {
            this.game.rings.water.claimRing(this.player1.player);
            this.game.checkGameState(true);
            this.player1.clickCard(this.asakoReina);
            expect(this.player1).toBeAbleToSelect(this.seeker);
            this.player1.clickCard(this.seeker);
            expect(this.seeker.bowed).toBe(false);
        });

        it('when the water ring is claimed but not for a 3 coster or above', function () {
            this.game.rings.water.claimRing(this.player1.player);
            this.game.checkGameState(true);
            this.player1.clickCard(this.asakoReina);
            expect(this.player1).not.toBeAbleToSelect(this.asakoReina);
            this.player1.clickCard(this.asakoReina);
            this.player1.clickCard(this.seeker);
            expect(this.asakoReina.bowed).toBe(true);
            expect(this.seeker.bowed).toBe(false);
        });

        it('when the void ring is claimed', function () {
            this.game.rings.void.claimRing(this.player1.player);
            this.game.checkGameState(true);
            let fate = this.player1.fate;
            this.player1.clickCard(this.asakoReina);
            expect(this.player1.fate).toBe(fate + 1);
        });

        it('when all rings are claimed', function () {
            this.game.rings.void.claimRing(this.player1.player);
            this.game.rings.air.claimRing(this.player1.player);
            this.game.rings.earth.claimRing(this.player1.player);
            this.game.rings.water.claimRing(this.player1.player);
            this.game.rings.fire.claimRing(this.player1.player);
            this.game.checkGameState(true);

            let fate = this.player1.fate;
            let handsize = this.player1.hand.length;
            let honor = this.player1.honor;
            this.player1.clickCard(this.asakoReina);
            expect(this.player1).toBeAbleToSelect(this.seeker);
            this.player1.clickCard(this.seeker);
            expect(this.player1).toBeAbleToSelect(this.seeker);
            this.player1.clickCard(this.seeker);
            expect(this.player1.hand.length).toBe(handsize + 1);
            expect(this.player1.honor).toBe(honor + 1);
            expect(this.player1.fate).toBe(fate + 1);
            expect(this.seeker.isHonored).toBe(true);
            expect(this.seeker.bowed).toBe(false);

            expect(this.getChatLogs(10)).toContain('player1 uses Asako Reina to gain 1 honor, draw 1 card, gain 1 fate, honor a character and ready a character');
        });

        it('bug report - yokuni', function () {
            this.game.rings.void.claimRing(this.player2.player);
            this.game.rings.air.claimRing(this.player2.player);
            this.game.rings.earth.claimRing(this.player2.player);
            this.game.rings.water.claimRing(this.player2.player);
            this.game.rings.fire.claimRing(this.player2.player);
            this.game.checkGameState(true);

            this.player1.pass();
            this.player2.clickCard(this.yokuni);
            this.player2.clickCard(this.asakoReina);
            this.player1.pass();

            let fate = this.player2.fate;
            let handsize = this.player2.hand.length;
            let honor = this.player2.honor;
            this.player2.clickCard(this.yokuni);
            expect(this.player2).toBeAbleToSelect(this.seeker);
            this.player2.clickCard(this.seeker);
            expect(this.player2).toBeAbleToSelect(this.seeker);
            this.player2.clickCard(this.seeker);
            expect(this.player2.hand.length).toBe(handsize + 1);
            expect(this.player2.honor).toBe(honor + 1);
            expect(this.player2.fate).toBe(fate + 1);
            expect(this.seeker.isHonored).toBe(true);
            expect(this.seeker.bowed).toBe(false);

            expect(this.getChatLogs(10)).toContain('player2 uses Togashi Yokuni\'s gained ability from Asako Reina to gain 1 honor, draw 1 card, gain 1 fate, honor a character and ready a character');
        });
    });
});
