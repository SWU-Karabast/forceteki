describe('Smuggle keyword', function() {
    integration(function() {
        describe('When a card with a Smuggle cost is in resources', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: [],
                        deck: ['mercenary-gunship'],
                        resources: ['millennium-falcon#landos-pride',
                            'collections-starhopper',
                            'smugglers-aid',
                            'hotshot-dl44-blaster',
                            'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst',
                            'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst'
                        ],
                        leader: 'leia-organa#alliance-general',
                        base: 'administrators-tower'
                    },
                    player2: {
                    }
                });
            });

            it('a unit can be played for its smuggle cost', function () {
                expect(this.player1.countSpendableResources()).toBe(18);//Sanity check before we Smuggle
                this.player1.clickCard(this.collectionsStarhopper);
                expect(this.collectionsStarhopper).toBeInLocation('space arena');
                expect(this.player1.countExhaustedResources()).toBe(3);
                expect(this.player1.countSpendableResources()).toBe(15);
                expect(this.mercenaryGunship).toBeInLocation('resource');
            });

            it('an upgrade can be played for its smuggle cost', function () {
                this.player1.clickCard(this.hotshotDl44Blaster);
                expect(this.hotshotDl44Blaster).toBeInLocation('ground arena');
            });

            it('an event can be played for its smuggle cost', function () {
                this.p1Base.damage = 3;

                this.player1.clickCard(this.smugglersAid);
                expect(this.p1Base.damage).toBe(0);
            });

            // it('a card without Smuggle cannot be played from resources', function () {
            //     this.player1.clickCard(this.battlefieldMarine);
            //     expect(this.player1).toBeActivePlayer();
            // });

            // it('Aspect penalties on smuggled cards are accounted for', function () {
            //     this.player1.clickCard(this.lomPyke);
            //     expect(this.lomPyke).toBeInLocation('ground arena');
            // });

            // it('Cards with different smuggle aspects than play aspects only care about the smuggle aspects', function () {
            //     this.player1.clickCard(this.lomPyke);
            //     expect(this.lomPyke).toBeInLocation('ground arena');
            // });
        });
    });
});