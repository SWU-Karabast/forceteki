describe('Grand Moff Tarkin, Oversector Governor', function() {
    integration(function() {
        describe('Tarkin\'s undeployed ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['atst', 'battlefield-marine'],
                        spaceArena: ['tieln-fighter'],
                        leader: 'grand-moff-tarkin#oversector-governor'
                    },
                    player2: {
                        groundArena: ['tie-advanced', 'wampa'],
                    }
                });
            });

            it('should give a friendly imperial unit an experience token', function () {
                this.player1.clickCard(this.grandMoffTarkin);
                this.player1.clickPrompt('Give an experience token to an Imperial unit');
                expect(this.player1).toBeAbleToSelectExactly([this.atst, this.tielnFighter]);

                this.player1.clickCard(this.atst);
                expect(this.grandMoffTarkin.exhausted).toBe(true);
                expect(this.atst.upgrades.length).toBe(1);
                expect(this.atst.upgrades[0].internalName).toBe('experience');

                this.player2.passAction();

                expect(this.grandMoffTarkin).not.toHaveAvailableActionWhenClickedInActionPhaseBy(this.player1);
            });

            // it('should deploy and the persistent effect should work', function () {
            //     this.player1.clickCard(this.krennic);
            //     expect(this.krennic).toBeInLocation('ground arena');
            //     expect(this.krennic).not.toBeInLocation('base');

            //     expect(this.wampa.power).toBe(5);
            //     expect(this.wampa.hp).toBe(5);

            //     expect(this.marine.power).toBe(3);
            //     expect(this.marine.hp).toBe(3);

            //     expect(this.cartelSpacer.power).toBe(3);
            //     expect(this.cartelSpacer.hp).toBe(3);

            //     expect(this.securityForce.power).toBe(3);
            //     expect(this.securityForce.hp).toBe(7);

            //     // do an attack to ensure the ability is being applied correctly in combat
            //     this.player2.passAction();
            //     this.player1.clickCard(this.wampa);
            //     this.player1.clickCard(this.securityForce);

            //     expect(this.wampa.damage).toBe(4);
            //     expect(this.securityForce.damage).toBe(6);
            // });

            // it('should deploy and have restore 2', function () {
            //     this.p1Base.damage = 5;
            //     this.player1.clickCard(this.krennic);
            //     expect(this.krennic).toBeInLocation('ground arena');
            //     expect(this.krennic).not.toBeInLocation('base');

            //     // do an attack to ensure the ability is being applied correctly in combat
            //     this.player2.passAction();
            //     this.player1.clickCard(this.krennic);
            //     this.player1.clickCard(this.player2.base);

            //     expect(this.p1Base.damage).toBe(3);
            //     expect(this.p2Base.damage).toBe(2);
            // });
        });
    });
});
