describe('Smuggle keyword', function() {
    integration(function() {
        describe('When a card with a Smuggle cost is in resources', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['wampa'],
                        hand: [],
                        deck: ['mercenary-gunship'],
                        resources: ['armed-to-the-teeth',
                            'collections-starhopper',
                            'smugglers-aid',
                            'chewbacca#pykesbane',
                            'battlefield-marine', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst',
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
                expect(this.player1.countSpendableResources()).toBe(18);//Sanity check before we Smuggle
                this.player1.clickCard(this.armedToTheTeeth);
                expect(this.armedToTheTeeth).toBeInLocation('ground arena');
                expect(this.wampa.upgrades).toContain(this.armedToTheTeeth);

                // This costs 6 due to the lack of a red aspect on base or leader
                expect(this.player1.countExhaustedResources()).toBe(6);
                expect(this.player1.countSpendableResources()).toBe(12);
                expect(this.mercenaryGunship).toBeInLocation('resource');
            });

            it('an event can be played for its smuggle cost', function () {
                expect(this.player1.countSpendableResources()).toBe(18);//Sanity check before we Smuggle
                this.p1Base.damage = 3;

                this.player1.clickCard(this.smugglersAid);
                expect(this.p1Base.damage).toBe(0);
                expect(this.player1.countExhaustedResources()).toBe(3);
                expect(this.player1.countSpendableResources()).toBe(15);
                expect(this.mercenaryGunship).toBeInLocation('resource');
            });

            it('a card without Smuggle cannot be played from resources', function () {
                expect(this.battlefieldMarine).not.toHaveAvailableActionWhenClickedBy(this.player1);
                expect(this.player1).toBeActivePlayer();
            });

            it('Cards with different smuggle aspects than play aspects only care about the smuggle aspects', function () {
                expect(this.player1.countSpendableResources()).toBe(18);//Sanity check before we Smuggle
                this.player1.clickCard(this.chewbacca);//This card has a 9+RedHero cost, so it should cost us 11 here
                expect(this.chewbacca).toBeInLocation('ground arena');
                expect(this.player1.countExhaustedResources()).toBe(11);
                expect(this.player1.countSpendableResources()).toBe(7);
            });
        });
    });
});