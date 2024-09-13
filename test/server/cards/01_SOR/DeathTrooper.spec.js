describe('Death Trooper', function() {
    integration(function() {
        describe('Death Trooper\'s When Played ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['death-trooper'],
                        groundArena: ['pyke-sentinel'],
                        spaceArena: ['cartel-spacer']
                    },
                    player2: {
                        groundArena: ['wampa', 'superlaser-technician'],
                        spaceArena: ['imperial-interceptor']
                    }
                });
            });

            // it('cannot be passed', function () {
            //     // Play Death Trooper
            //     this.player1.clickCard(this.deathTrooper);
            //     expect(this.player1).toBeAbleToSelectExactly([this.pykeSentinel, this.deathTrooper]);
            //     expect(this.player1).not.toHavePassAbilityPrompt();
            // });

            // it('can only target ground units & can damage itself', function () {
            //     // Play Death Trooper
            //     this.player1.clickCard(this.deathTrooper);

            //     // Choose Friendly
            //     expect(this.player1).toBeAbleToSelectExactly([this.pykeSentinel, this.deathTrooper]);
            //     expect(this.player1).not.toHavePassAbilityPrompt();
            //     this.player1.clickCard(this.deathTrooper);

            //     // Choose Enemy
            //     expect(this.player1).toBeAbleToSelectExactly([this.wampa, this.superlaserTechnician]);
            //     this.player1.clickCard(this.wampa);
            //     expect(this.deathTrooper.damage).toEqual(2);
            //     expect(this.wampa.damage).toEqual(2);
            // });

            it('works when no enemy ground units', function () {
                // Play Death Trooper
                this.player2.setGroundArenaUnits([]);
                this.player1.clickCard(this.deathTrooper);

                // Choose Friendly
                expect(this.player1).toBeAbleToSelectExactly([this.pykeSentinel, this.deathTrooper]);
                expect(this.player1).not.toHavePassAbilityPrompt();
                this.player1.clickCard(this.deathTrooper);
                expect(this.player1).toHavePrompt('asdfpokad');
                expect(this.deathTrooper.damage).toEqual(2);
            });
        });
    });
});
