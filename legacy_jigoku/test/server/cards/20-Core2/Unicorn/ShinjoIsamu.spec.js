describe('Shinjo Isamu', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    dynastyDiscard: ['favorable-ground'],
                    inPlay: ['shinjo-isamu', 'adept-of-the-waves']
                },
                player2: {
                    provinces: ['tsuma', 'lord-s-ascendancy']
                }
            });

            this.favorableGround = this.player1.placeCardInProvince('favorable-ground', 'province 1');
            this.adeptOfTheWaves = this.player1.findCardByName('adept-of-the-waves');
            this.shinjoIsamu = this.player1.findCardByName('shinjo-isamu');

            this.tsuma = this.player2.findCardByName('tsuma');
            this.lordsAscendancy = this.player2.findCardByName('lord-s-ascendancy');

            this.noMoreActions();
        });

        it('triggers when Isamu moves home through action', function () {
            this.initiateConflict({
                type: 'military',
                ring: 'void',
                province: this.tsuma,
                attackers: [this.shinjoIsamu],
                defenders: []
            });
            this.player2.pass();
            this.player1.clickCard(this.favorableGround);
            this.player1.clickCard(this.shinjoIsamu);
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.shinjoIsamu);
        });

        it('triggers when Isamu moves home at resolution', function () {
            this.initiateConflict({
                type: 'military',
                ring: 'void',
                province: this.tsuma,
                attackers: [this.shinjoIsamu],
                defenders: []
            });
            this.player2.pass();
            this.player1.pass();
            this.player1.clickPrompt('Yes');
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.shinjoIsamu);
        });

        it('does not trigger when another character moves home through action', function () {
            this.initiateConflict({
                type: 'military',
                ring: 'void',
                province: this.tsuma,
                attackers: [this.shinjoIsamu, this.adeptOfTheWaves],
                defenders: []
            });
            this.player2.pass();
            this.player1.clickCard(this.favorableGround);
            this.player1.clickCard(this.adeptOfTheWaves);
            expect(this.player1).not.toHavePrompt('Triggered Abilities');
            expect(this.player1).not.toBeAbleToSelect(this.shinjoIsamu);
        });

        it('resolves unclaimed ring matching province', function () {
            this.initiateConflict({
                type: 'military',
                ring: 'void',
                province: this.tsuma,
                attackers: [this.shinjoIsamu],
                defenders: []
            });
            this.player2.pass();
            this.player1.clickCard(this.favorableGround);
            this.player1.clickCard(this.shinjoIsamu);
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.shinjoIsamu);

            this.player1.clickCard(this.shinjoIsamu);
            expect(this.player1).toHavePrompt('Choose a ring');
            expect(this.player1).toBeAbleToSelectRing('fire');
            expect(this.player1).toBeAbleToSelectRing('air');
            expect(this.player1).not.toBeAbleToSelectRing('water');
            expect(this.player1).not.toBeAbleToSelectRing('earth');
            expect(this.player1).not.toBeAbleToSelectRing('void');

            this.player1.clickRing('fire');
            expect(this.getChatLogs(5)).toContain('player1 uses Shinjo Isamu to resolve the Fire Ring effect');
        });

        it('does not resolve ring of conflict', function () {
            this.initiateConflict({
                type: 'military',
                ring: 'void',
                province: this.lordsAscendancy,
                attackers: [this.shinjoIsamu],
                defenders: []
            });
            this.player2.pass();
            this.player1.clickCard(this.favorableGround);
            this.player1.clickCard(this.shinjoIsamu);
            expect(this.player1).not.toHavePrompt('Triggered Abilities');
            expect(this.player1).not.toBeAbleToSelect(this.shinjoIsamu);
        });
    });
});
