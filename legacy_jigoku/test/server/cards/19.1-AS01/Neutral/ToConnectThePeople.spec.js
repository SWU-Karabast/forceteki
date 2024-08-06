describe('To Connect the People', function () {
    integration(function () {
        describe('action ability', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['ikoma-prodigy', 'forthright-ide', 'serene-warrior'],
                        hand: ['to-connect-the-people'],
                        dynastyDiscard: ['border-rider'],
                        conflictDiscard: ['shinjo-ambusher']
                    },
                    player2: {
                        dynastyDiscard: ['akodo-kaede', 'akodo-makoto', 'akodo-motivator', 'ashigaru-levy'],
                        conflictDiscard: ['shiksha-scout', 'ageless-crone', 'ikoma-anakazu', 'renowned-singer']
                    }
                });
                this.toConnectThePeople = this.player1.findCardByName('to-connect-the-people');

                this.ikomaProdigy = this.player1.findCardByName('ikoma-prodigy');
                this.forthrightIde = this.player1.findCardByName('forthright-ide');

                this.dynastyDiscardBorderRider = this.player1.findCardByName('border-rider');
                this.conflictDiscardAmbusher = this.player1.findCardByName('shinjo-ambusher');

                this.opponentDynastyDiscardAshigaruLevy = this.player2.findCardByName('ashigaru-levy');
                this.opponentDynastyDiscardAkodoKaede = this.player2.findCardByName('akodo-kaede');
                this.opponentDynastyDiscardAkodoMakoto = this.player2.findCardByName('akodo-makoto');
                this.opponentDynastyDiscardAkodoMotivator = this.player2.findCardByName('akodo-motivator');

                this.opponentConflictDiscardShikshaScout = this.player2.findCardByName('shiksha-scout');
                this.opponentConflictDiscardAgelessCrone = this.player2.findCardByName('ageless-crone');
                this.opponentConflictDiscardIkomaAnakazu = this.player2.findCardByName('ikoma-anakazu');
                this.opponentConflictDiscardRenownedSinger = this.player2.findCardByName('renowned-singer');
            });

            it('should not trigger during a conflict', function () {
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.ikomaProdigy],
                    defenders: [],
                    ring: 'air',
                    type: 'political'
                });

                this.player2.pass();
                this.player1.clickCard(this.toConnectThePeople);
                expect(this.player1).toHavePrompt('Conflict Action Window');
            });

            it('discards a few cards from the opponents dynasty deck', function () {
                let initialDiscardPile = this.player2.player.dynastyDiscardPile.size();

                this.player1.clickCard(this.toConnectThePeople);
                expect(this.player2.player.dynastyDiscardPile.size()).toBe(initialDiscardPile + 3);
                expect(this.getChatLogs(5)).toContain(
                    'player1 plays To Connect the People to discard Adept of the Waves, Adept of the Waves and Adept of the Waves'
                );
            });

            it('should allow you to purchase any character from your opponent discard piles that has glory equal or lower than a merchant you control', function () {
                this.player1.clickCard(this.toConnectThePeople);

                expect(this.player1).toHavePrompt('Choose a character');

                //opponent cards in discard pile with 1 or less glory (from Forthright Ide 1 glory)
                expect(this.player1).toBeAbleToSelect(this.opponentDynastyDiscardAshigaruLevy);
                expect(this.player1).toBeAbleToSelect(this.opponentConflictDiscardShikshaScout);
                expect(this.player1).toBeAbleToSelect(this.opponentConflictDiscardAgelessCrone);
                expect(this.player1).toBeAbleToSelect(this.opponentDynastyDiscardAkodoMotivator);

                //opponent card and glory not too high, but unique character
                expect(this.player1).not.toBeAbleToSelect(this.opponentDynastyDiscardAkodoMakoto);

                //opponent cards in discard pile with 2 or more glory
                expect(this.player1).not.toBeAbleToSelect(this.opponentConflictDiscardIkomaAnakazu);
                expect(this.player1).not.toBeAbleToSelect(this.opponentDynastyDiscardAkodoKaede);
                expect(this.player1).not.toBeAbleToSelect(this.opponentConflictDiscardRenownedSinger);

                //own discard pile cards
                expect(this.player1).not.toBeAbleToSelect(this.dynastyDiscardBorderRider);
                expect(this.player1).not.toBeAbleToSelect(this.conflictDiscardAmbusher);

                const initialPLayerFate = this.player1.fate;
                expect(this.player1).toHavePrompt('Choose a character');
                this.player1.clickCard(this.opponentDynastyDiscardAkodoMotivator);
                this.player1.clickPrompt('1');

                expect(this.player1.fate).toBe(initialPLayerFate - 5); // 4 fate base + 1 extra fate placed
                expect(this.opponentDynastyDiscardAkodoMotivator.location).toBe('play area');
            });
        });
    });
});
