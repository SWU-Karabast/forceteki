describe('Red Three', function () {
    integration(function () {
        describe('Red Three\'s ability', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['death-trooper', 'bail-organa#rebel-councilor', 'battlefield-marine'],
                        spaceArena: ['red-three#unstoppable', 'green-squadron-awing']
                    },
                    player2: {
                        groundArena: ['rugged-survivors', 'cargo-juggernaut']
                    }
                });
            });

            it('should give Raid 1 to heroism unit', function () {
                this.player1.clickCard(this.battlefieldMarine);
                expect(this.player1).toBeAbleToSelectExactly([this.p2Base, this.ruggedSurvivors, this.cargoJuggernaut]);
                this.player1.clickCard(this.p2Base);
                expect(this.p2Base.damage).toBe(4);

                // should not give Raid 1 to non-heroism unit
                this.player2.passAction();
                this.p2Base.damage = 0;
                this.player1.clickCard(this.deathTrooper);
                expect(this.player1).toBeAbleToSelectExactly([this.p2Base, this.ruggedSurvivors, this.cargoJuggernaut]);
                this.player1.clickCard(this.p2Base);
                expect(this.p2Base.damage).toBe(3);

                // should give Raid 1 cumulative with other Raid values
                this.player2.passAction();
                this.p2Base.damage = 0;
                this.player1.clickCard(this.greenSquadronAwing);
                expect(this.p2Base.damage).toBe(4);
            });
        });
    });
});
