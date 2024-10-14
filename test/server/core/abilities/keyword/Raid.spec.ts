describe('Raid keyword', function() {
    integration(function() {
        describe('When a unit with the Raid keyword', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['cantina-braggart'],
                    },
                    player2: {
                        groundArena: ['battlefield-marine'],
                    }
                });
            });

            it('attacks, power should be increased by raid amount', function () {
                this.player1.clickCard(this.cantinaBraggart);
                this.player1.clickCard(this.p2Base);
                expect(this.cantinaBraggart.exhausted).toBe(true);
                expect(this.cantinaBraggart.getPower()).toBe(0);
                expect(this.p2Base.damage).toBe(2);

                this.cantinaBraggart.exhausted = false;
                this.player2.passAction();

                this.player1.clickCard(this.cantinaBraggart);
                this.player1.clickCard(this.p2Base);
                expect(this.cantinaBraggart.getPower()).toBe(0);
                expect(this.p2Base.damage).toBe(4);
            });

            it('defends, power should not be increased by raid amount', function () {
                this.player2.setActivePlayer();
                this.player2.clickCard(this.battlefieldMarine);
                this.player2.clickCard(this.cantinaBraggart);

                expect(this.battlefieldMarine.damage).toBe(0);
                expect(this.cantinaBraggart).toBeInLocation('discard');
            });
        });

        // TODO Test that Red Three raid buff stacks and is then removed when Red Three is out of play
        // describe('When a unit with the Raid keyword and a gained Raid ability', function() {
        //     beforeEach(function () {
        //         this.setupTest({
        //             phase: 'action',
        //             player1: {
        //                 groundArena: ['cantina-braggart'],
        //             },
        //             player2: {
        //                 groundArena: ['battlefield-marine'],
        //             }
        //         });
        //         this.cantinaBraggart = this.player1.findCardByName('cantina-braggart');
        //         this.battlefieldMarine = this.player2.findCardByName('battlefield-marine');

        //         this.p1Base = this.player1.base;
        //         this.p2Base = this.player2.base;
        //     });

        //     it('attacks, base should have the cumulative raid amount', function () {
        //     });
        // });

        // TODO test that a card that attacked and then is bounced back to hand (i.e. Waylay) doesn't receive a second Raid buff
    });
});
