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

                this.cantinaBraggart = this.player1.findCardByName('cantina-braggart');
                this.battlefieldMarine = this.player2.findCardByName('battlefield-marine');

                this.p1Base = this.player1.base;
                this.p2Base = this.player2.base;
            });

            it('attacks, power should be increased by raid amount', function () {
                this.player1.clickCard(this.cantinaBraggart);
                this.player1.clickCard(this.p2Base);
                expect(this.cantinaBraggart.exhausted).toBe(true);
                expect(this.p2Base.damage).toBe(2);
            });
        });

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
    });
});
