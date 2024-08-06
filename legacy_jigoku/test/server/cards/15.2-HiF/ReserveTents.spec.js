describe('Reserve Tents', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['chronicler-of-conquests', 'ikoma-prodigy', 'ikoma-orator', 'samurai-of-integrity'],
                    dynastyDiscard: ['reserve-tents']
                },
                player2: {
                    inPlay: ['steward-of-cryptic-lore']
                }
            });

            this.chronicler = this.player1.findCardByName('chronicler-of-conquests');
            this.prodigy = this.player1.findCardByName('ikoma-prodigy');
            this.orator = this.player1.findCardByName('ikoma-orator');
            this.samuraiOfIntegrity = this.player1.findCardByName('samurai-of-integrity');
            this.reserveTents = this.player1.placeCardInProvince('reserve-tents', 'province 1');

            this.steward = this.player2.findCardByName('steward-of-cryptic-lore');
        });

        it('it cannot move an oppponent character to a conflict', function () {
            this.noMoreActions();
            this.initiateConflict({
                type: 'political',
                attackers: [this.chronicler],
                defenders: []
            });

            this.player2.pass();

            this.player1.clickCard(this.reserveTents);
            expect(this.player1).toBeAbleToSelect(this.orator);
            expect(this.player1).toBeAbleToSelect(this.prodigy);
            expect(this.player1).toBeAbleToSelect(this.samuraiOfIntegrity);
            expect(this.player1).not.toBeAbleToSelect(this.steward);

        });

        it('it can move a character to a conflict twice', function () {
            this.noMoreActions();
            this.initiateConflict({
                type: 'political',
                attackers: [this.chronicler],
                defenders: []
            });

            this.player2.pass();

            this.player1.clickCard(this.reserveTents);
            expect(this.player1).toBeAbleToSelect(this.orator);
            expect(this.player1).toBeAbleToSelect(this.prodigy);
            expect(this.player1).toBeAbleToSelect(this.samuraiOfIntegrity);

            this.player1.clickCard(this.orator);
            expect(this.orator.isParticipating()).toBe(true);

            this.player2.pass();

            this.player1.clickCard(this.reserveTents);
            expect(this.player1).not.toBeAbleToSelect(this.orator);
            expect(this.player1).toBeAbleToSelect(this.prodigy);
            expect(this.player1).toBeAbleToSelect(this.samuraiOfIntegrity);
            this.player1.clickCard(this.prodigy);
            expect(this.prodigy.isParticipating()).toBe(true);

            this.player2.pass();

            this.player1.clickCard(this.reserveTents);
            expect(this.player1).not.toBeAbleToSelect(this.orator);
            expect(this.player1).toHavePrompt('Conflict Action Window');
        });
    });
});
