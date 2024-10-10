describe('Rey, More Than a Scavenger', function () {
    integration(function () {
        describe('Rey\'s undeployed ability', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        leader: 'rey#more-than-a-scavenger',
                        groundArena: ['battlefield-marine', 'partisan-insurgent'],
                        resources: 4,
                    },
                    player2: {
                        spaceArena: ['grey-squadron-ywing']
                    }
                });
            });

            it('should give an experience to a unit with 2 or less power', function () {
                this.player1.clickCard(this.rey);
                expect(this.player1).toBeAbleToSelectExactly([this.partisanInsurgent, this.greySquadronYwing]);
                expect(this.player1).not.toHavePassAbilityButton();
                this.player1.clickCard(this.partisanInsurgent);

                expect(this.rey.exhausted).toBeTrue();
                expect(this.partisanInsurgent).toHaveExactUpgradeNames(['experience']);
                expect(this.player1.countExhaustedResources()).toBe(1);
            });
        });

        describe('Rey\'s deployed ability', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        leader: { card: 'rey#more-than-a-scavenger', deployed: true },
                        groundArena: ['battlefield-marine', 'partisan-insurgent'],
                    },
                    player2: {
                        spaceArena: ['grey-squadron-ywing']
                    }
                });
            });

            it('should give an experience to a unit with 2 or less power', function () {
                this.player1.clickCard(this.rey);
                // need to order triggers between restore & on attack
                this.player1.clickPrompt('Give an Experience token to a unit with 2 or less power');
                expect(this.player1).toBeAbleToSelectExactly([this.rey, this.partisanInsurgent, this.greySquadronYwing]);
                this.player1.clickCard(this.partisanInsurgent);

                expect(this.rey.exhausted).toBeTrue();
                expect(this.p2Base.damage).toBe(2);
                expect(this.rey.isUpgraded()).toBeFalse();
                expect(this.partisanInsurgent).toHaveExactUpgradeNames(['experience']);
                expect(this.player1.countExhaustedResources()).toBe(0);

                // rey can give experience to herself
                this.rey.exhausted = false;
                this.p2Base.damage = 0;
                this.player2.passAction();
                this.player1.clickCard(this.rey);
                // need to order triggers between restore & on attack
                this.player1.clickPrompt('Give an Experience token to a unit with 2 or less power');
                expect(this.player1).toBeAbleToSelectExactly([this.rey, this.partisanInsurgent, this.greySquadronYwing]);
                this.player1.clickCard(this.rey);

                expect(this.rey.exhausted).toBeTrue();
                expect(this.p2Base.damage).toBe(3);
                expect(this.rey).toHaveExactUpgradeNames(['experience']);
                expect(this.player1.countExhaustedResources()).toBe(0);
            });
        });

        describe('Rey\'s deployed ability', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        leader: { card: 'rey#more-than-a-scavenger', deployed: true },
                        groundArena: ['battlefield-marine', 'partisan-insurgent'],
                        spaceArena: ['red-three#unstoppable']
                    },
                    player2: {
                        spaceArena: ['grey-squadron-ywing']
                    }
                });
            });

            it('should give an experience to a unit with 2 or less power (be careful Raid)', function () {
                this.player1.clickCard(this.rey);
                // need to order triggers between restore & on attack
                this.player1.clickPrompt('Give an Experience token to a unit with 2 or less power');
                // rey should not be selectable because Red Three give her Raid 1
                expect(this.player1).toBeAbleToSelectExactly([this.redThree, this.partisanInsurgent, this.greySquadronYwing]);
                this.player1.clickCard(this.partisanInsurgent);

                expect(this.rey.exhausted).toBeTrue();
                expect(this.p2Base.damage).toBe(3);
                expect(this.rey).toHaveExactUpgradeNames([]);
                expect(this.partisanInsurgent).toHaveExactUpgradeNames(['experience']);
                expect(this.player1.countExhaustedResources()).toBe(0);
            });
        });
    });
});
