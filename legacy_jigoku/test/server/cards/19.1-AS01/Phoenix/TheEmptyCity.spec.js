describe('The Empty City', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    provinces: ['the-empty-city'],
                    inPlay: ['adept-of-the-waves', 'fushicho'],
                    hand: [],
                    dynastyDiscard: ['crafty-tsukumogami', 'kami-of-ancient-wisdom', 'solemn-scholar'],
                    conflictDiscard: ['guardian-kami', 'ishiken-initiate']
                },
                player2: {
                    hand: ['assassination']
                }
            });

            this.theEmptyCity = this.player1.findCardByName('the-empty-city', 'province 1');

            this.fushicho = this.player1.findCardByName('fushicho');
            this.adeptOfTheWaves = this.player1.findCardByName('adept-of-the-waves');
            this.tsukumogami = this.player1.findCardByName('crafty-tsukumogami', 'dynasty discard pile');
            this.kamiAncient = this.player1.findCardByName('kami-of-ancient-wisdom', 'dynasty discard pile');
            this.solemnScholar = this.player1.findCardByName('solemn-scholar', 'dynasty discard pile');
            this.guardianKami = this.player1.findCardByName('guardian-kami', 'conflict discard pile');
            this.ishikenInitiate = this.player1.findCardByName('ishiken-initiate', 'conflict discard pile');

            this.assassination = this.player2.findCardByName('assassination');

            this.player1.claimRing('earth');
            this.player2.claimRing('water');
        });

        it('claims an unclaimed ring', function () {
            this.player1.clickCard(this.theEmptyCity);
            expect(this.player1).toHavePrompt('The Empty City');
            expect(this.player1).toHavePromptButton('Claim a ring');
            expect(this.player1).toHavePromptButton('Put a Spirit character into play');
            this.player1.clickPrompt('Claim a ring');

            expect(this.player1).toBeAbleToSelectRing('air');
            expect(this.player1).toBeAbleToSelectRing('void');
            expect(this.player1).toBeAbleToSelectRing('fire');
            expect(this.player1).not.toBeAbleToSelectRing('earth');
            expect(this.player1).not.toBeAbleToSelectRing('water');

            this.player1.clickRing('air');
            this.player1.clickCard(this.fushicho);
            expect(this.fushicho.bowed).toBe(true);
            expect(this.game.rings.air.conflictType).toBe('political');
            expect(this.game.rings.air.isClaimed()).toBe(true);
            expect(this.getChatLogs(5)).toContain(
                'player1 uses The Empty City, bowing Fushichō to claim Air Ring as a political ring'
            );
        });

        it('puts a spirit character into play', function () {
            this.player1.clickCard(this.theEmptyCity);
            expect(this.player1).toHavePrompt('The Empty City');
            expect(this.player1).toHavePromptButton('Claim a ring');
            expect(this.player1).toHavePromptButton('Put a Spirit character into play');
            this.player1.clickPrompt('Put a Spirit character into play');

            expect(this.player1).not.toBeAbleToSelect(this.fushicho);
            expect(this.player1).not.toBeAbleToSelect(this.adeptOfTheWaves);
            expect(this.player1).toBeAbleToSelect(this.tsukumogami);
            expect(this.player1).not.toBeAbleToSelect(this.kamiAncient);
            expect(this.player1).not.toBeAbleToSelect(this.solemnScholar);
            expect(this.player1).toBeAbleToSelect(this.guardianKami);
            expect(this.player1).not.toBeAbleToSelect(this.ishikenInitiate);

            this.player1.clickCard(this.guardianKami);
            expect(this.guardianKami.location).toBe('play area');
            expect(this.getChatLogs(5)).toContain('player1 uses The Empty City to put Guardian Kami into play');
        });

        it('after putting a spirit into play, remove it from the game the next time it leaves play in that round', function () {
            expect(this.guardianKami.location).toBe('conflict discard pile');
            this.player1.clickCard(this.theEmptyCity);
            this.player1.clickPrompt('Put a Spirit character into play');
            this.player1.clickCard(this.guardianKami);

            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.guardianKami],
                defenders: []
            });

            this.player2.clickCard(this.assassination);
            this.player2.clickCard(this.guardianKami);

            expect(this.guardianKami.location).toBe('removed from game');
            expect(this.getChatLogs(5)).toContain(
                'Guardian Kami is removed from the game, as it was invoked by the The Empty City this round'
            );
        });

        it('can only use one of ability per round - claim first', function () {
            this.player1.clickCard(this.theEmptyCity);
            this.player1.clickPrompt('Claim a ring');
            this.player1.clickRing('air');
            this.player1.clickCard(this.fushicho);
            expect(this.getChatLogs(5)).toContain(
                'player1 uses The Empty City, bowing Fushichō to claim Air Ring as a political ring'
            );

            this.player2.pass();
            this.player1.clickCard(this.theEmptyCity);
            expect(this.player1).not.toHavePrompt('The Empty City');
        });

        it('can only use one of ability per round - put in play first', function () {
            this.player1.clickCard(this.theEmptyCity);
            this.player1.clickPrompt('Put a Spirit character into play');
            this.player1.clickCard(this.tsukumogami);
            expect(this.getChatLogs(5)).toContain('player1 uses The Empty City to put Crafty Tsukumogami into play');

            this.player2.pass();
            this.player1.clickCard(this.theEmptyCity);
            expect(this.player1).not.toHavePrompt('The Empty City');
        });
    });
});