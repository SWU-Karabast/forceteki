describe('Henshin Seeker', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['henshin-seeker', 'ancient-master', 'solemn-scholar', 'miya-mystic'],
                    hand: ['commune-with-the-spirits']
                },
                player2: {
                    inPlay: ['tattooed-wanderer'],
                    hand: ['commune-with-the-spirits']
                }
            });
            this.seeker = this.player1.findCardByName('henshin-seeker');
            this.ancientMaster = this.player1.findCardByName('ancient-master');
            this.solemnScholar = this.player1.findCardByName('solemn-scholar');
            this.miyaMystic = this.player1.findCardByName('miya-mystic');

            this.ancientMaster.bow();
            this.solemnScholar.bow();
            this.miyaMystic.bow();
            this.communeOwn = this.player1.findCardByName('commune-with-the-spirits');

            this.wanderer = this.player2.findCardByName('tattooed-wanderer');
            this.communeOpp = this.player2.findCardByName('commune-with-the-spirits');
        });

        it('triggers when you claim the Fire ring', function () {
            this.player1.clickCard(this.communeOwn);
            this.player1.clickRing('fire');
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.seeker);
        });

        it('triggers when the opponent claims the Fire ring', function () {
            this.player1.pass();
            this.player2.clickCard(this.communeOpp);
            this.player2.clickRing('fire');

            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.seeker);
        });

        it('readies a scholar or monk', function () {
            this.player1.clickCard(this.communeOwn);
            this.player1.clickRing('fire');
            this.player1.clickCard(this.seeker);
            expect(this.player1).toHavePrompt('Choose a character');
            expect(this.player1).not.toBeAbleToSelect(this.seeker);
            expect(this.player1).toBeAbleToSelect(this.ancientMaster);
            expect(this.player1).toBeAbleToSelect(this.solemnScholar);
            expect(this.player1).not.toBeAbleToSelect(this.miyaMystic);

            this.player1.clickCard(this.ancientMaster);
            expect(this.ancientMaster.bowed).toBe(false);
            expect(this.getChatLogs(5)).toContain('player1 uses Henshin Seeker to ready Ancient Master');
        });
    });
});