describe('Sabine Wren, Explosives Artist', function() {
    integration(function() {
        describe('Sabine', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['sabine-wren#explosives-artist', 'battlefield-marine'],
                        spaceArena: ['cartel-spacer']
                    },
                    player2: {
                        groundArena: ['wampa'],
                    }
                });

                // sabine is only partially implemented, still need to handle:
                // - the effect override if she gains sentinel
            });

            it('should not be targetable when 3 friendly aspects are in play', function () {
                this.player2.setActivePlayer();
                this.player2.clickCard(this.wampa);

                expect(this.player2).toBeAbleToSelectExactly([this.battlefieldMarine, this.p1Base]);
            });

            it('should be targetable when less than 3 friendly aspects are in play', function () {
                this.player1.setSpaceArenaUnits([]);
                this.player2.setActivePlayer();
                this.player2.clickCard(this.wampa);

                expect(this.player2).toBeAbleToSelectExactly([this.battlefieldMarine, this.p1Base, this.sabineWren]);
            });
        });

        describe('Sabine\'s active ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['sabine-wren#explosives-artist', 'battlefield-marine'],
                        spaceArena: ['cartel-spacer']
                    },
                    player2: {
                        groundArena: ['wampa', 'modded-cohort'],
                    }
                });
            });

            it('should deal 1 damage to the defender or a base', function () {
                this.player1.clickCard(this.sabineWren);
                this.player1.clickCard(this.moddedCohort);

                // case 1: deal damage to defender
                expect(this.player1).toBeAbleToSelectExactly([this.moddedCohort, this.p1Base, this.p2Base]);
                this.player1.clickCard(this.moddedCohort);
                expect(this.sabineWren.damage).toBe(2);
                expect(this.moddedCohort.damage).toBe(3);
                expect(this.p1Base.damage).toBe(0);
                expect(this.p2Base.damage).toBe(0);

                this.sabineWren.damage = 0;
                this.sabineWren.exhausted = false;
                this.moddedCohort.damage = 0;
                this.player2.passAction();

                // case 2: deal damage to base when attacking unit
                this.player1.clickCard(this.sabineWren);
                this.player1.clickCard(this.moddedCohort);
                this.player1.clickCard(this.p2Base);
                expect(this.sabineWren.damage).toBe(2);
                expect(this.moddedCohort.damage).toBe(2);
                expect(this.p1Base.damage).toBe(0);
                expect(this.p2Base.damage).toBe(1);

                this.sabineWren.exhausted = false;
                this.p2Base.damage = 0;
                this.player2.passAction();

                // case 3: deal damage to base when attacking base
                this.player1.clickCard(this.sabineWren);
                this.player1.clickCard(this.p2Base);
                expect(this.player1).toBeAbleToSelectExactly([this.p1Base, this.p2Base]);
                this.player1.clickCard(this.p2Base);
                expect(this.p1Base.damage).toBe(0);
                expect(this.p2Base.damage).toBe(3);
            });
        });
    });
});
