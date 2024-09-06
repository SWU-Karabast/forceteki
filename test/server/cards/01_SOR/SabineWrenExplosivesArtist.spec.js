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

                this.sabine = this.player1.findCardByName('sabine-wren#explosives-artist');
                this.marine = this.player1.findCardByName('battlefield-marine');
                this.wampa = this.player2.findCardByName('wampa');

                this.p1Base = this.player1.base;
                this.p2Base = this.player2.base;

                // sabine is only partially implemented, still need to handle:
                // - the effect override if she gains sentinel
            });

            it('should not be targetable when 3 friendly aspects are in play', function () {
                this.player2.setActivePlayer();
                this.player2.clickCard(this.wampa);

                expect(this.player2).toBeAbleToSelectExactly([this.marine, this.p1Base]);
            });

            it('should be targetable when less than 3 friendly aspects are in play', function () {
                this.player1.setSpaceArenaUnits([]);
                this.player2.setActivePlayer();
                this.player2.clickCard(this.wampa);

                expect(this.player2).toBeAbleToSelectExactly([this.marine, this.p1Base, this.sabine]);
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
                        groundArena: ['wampa', 'wookiee-warrior'],
                    }
                });

                this.sabine = this.player1.findCardByName('sabine-wren#explosives-artist');
                this.marine = this.player1.findCardByName('battlefield-marine');
                this.wookieeWarrior = this.player2.findCardByName('wookiee-warrior');

                this.p1Base = this.player1.base;
                this.p2Base = this.player2.base;
            });

            it('should deal 1 damage to the defender or a base', function () {
                this.player1.clickCard(this.sabine);
                this.player1.clickCard(this.wookieeWarrior);

                // case 1: deal damage to defender
                expect(this.player1).toBeAbleToSelectExactly([this.wookieeWarrior, this.p1Base, this.p2Base]);
                this.player1.clickCard(this.wookieeWarrior);
                expect(this.sabine.damage).toBe(2);
                expect(this.wookieeWarrior.damage).toBe(3);
                expect(this.p1Base.damage).toBe(0);
                expect(this.p2Base.damage).toBe(0);

                this.sabine.damage = 0;
                this.sabine.exhausted = false;
                this.wookieeWarrior.damage = 0;
                this.player2.passAction();

                // case 2: deal damage to base when attacking unit
                this.player1.clickCard(this.sabine);
                this.player1.clickCard(this.wookieeWarrior);
                this.player1.clickCard(this.p2Base);
                expect(this.sabine.damage).toBe(2);
                expect(this.wookieeWarrior.damage).toBe(2);
                expect(this.p1Base.damage).toBe(0);
                expect(this.p2Base.damage).toBe(1);

                this.sabine.exhausted = false;
                this.p2Base.damage = 0;
                this.player2.passAction();

                // case 3: deal damage to base when attacking base
                this.player1.clickCard(this.sabine);
                this.player1.clickCard(this.p2Base);
                expect(this.player1).toBeAbleToSelectExactly([this.p1Base, this.p2Base]);
                this.player1.clickCard(this.p2Base);
                expect(this.p1Base.damage).toBe(0);
                expect(this.p2Base.damage).toBe(3);
            });
        });
    });
});
