describe('Darbuka of Banishment', function () {
    integration(function () {
        describe('Anti affinity', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['miya-mystic', 'adept-of-the-waves'],
                        hand: ['rejuvenating-vapors', 'grasp-of-earth-2']
                    },
                    player2: {
                        inPlay: ['moto-youth'],
                        hand: ['darbuka-of-banishment'],
                        dynastyDiscard: ['favorable-ground']
                    }
                });

                this.suitengu = this.player1.findCardByName('rejuvenating-vapors');
                this.graspOfEarth = this.player1.findCardByName('grasp-of-earth-2');
                this.mystic = this.player1.findCardByName('miya-mystic');
                this.mystic.bow();

                this.motoYouth = this.player2.findCardByName('moto-youth');
                this.darbuka = this.player2.findCardByName('darbuka-of-banishment');

                this.shamefulDisplay = this.player2.findCardByName('shameful-display', 'province 1');
                this.favorableGround = this.player2.placeCardInProvince('favorable-ground', 'province 1');

                this.player1.pass();
                this.player2.playAttachment(this.darbuka, this.motoYouth);
            });

            it('removes affinity from spell events', function () {
                this.player1.clickCard(this.suitengu);
                this.player1.clickCard(this.mystic);
                expect(this.getChatLogs(5)).toContain('player1 plays Rejuvenating Vapors to ready Miya Mystic');
                expect(this.player1).not.toHavePrompt('Discard all cards from a province?');
            });

            it('removes affinity from spell attachments', function () {
                const initFate = this.player1.fate;

                this.player1.clickCard(this.graspOfEarth);
                this.player1.clickCard(this.mystic);
                expect(this.player1.fate).toBe(initFate - 1);
            });
        });
    });
});