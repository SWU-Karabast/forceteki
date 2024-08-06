describe('Basic attack', function() {
    integration(function() {
        describe('When a unit attacks', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['wampa'],
                        spaceArena: ['cartel-spacer'],
                        resources: ['atst', 'atst'],
                        base: ['kestro-city']
                    },
                    player2: {
                        groundArena: ['frontier-atrt', 'enfys-nest#marauder'],
                        spaceArena: ['alliance-xwing'],
                        resources: ['atst', 'atst'],     // TODO: allow resources to be optionally be specified as a number instead of naming specific cards (i.e., 2 resources)
                        base: ['jabbas-palace']
                    }
                });
                this.wampa = this.player1.findCardByName('wampa');
                this.cartelSpacer = this.player1.findCardByName('cartel-spacer');
                this.atrt = this.player2.findCardByName('frontier-atrt');
                this.enfysNest = this.player2.findCardByName('enfys-nest#marauder');
                this.allianceXWing = this.player2.findCardByName('alliance-xwing');
                this.p1Base = this.player1.base;
                this.p2Base = this.player2.base;

                this.noMoreActions();
            });

            it(', should only be able to select opponent\'s units in the same arena and base', function () {
                this.player1.clickCard(this.wampa);
                expect(this.player1).toHavePrompt('Choose a target for attack');
                
                // can target opponent's ground units and base but not space units
                expect(this.player1).toBeAbleToSelect(this.atrt);
                expect(this.player1).toBeAbleToSelect(this.enfysNest);
                expect(this.player1).toBeAbleToSelect(this.p2Base);
                expect(this.player1).not.toBeAbleToSelect(this.allianceXWing);
                
                expect(this.player1).not.toBeAbleToSelect(this.wampa);
                expect(this.player1).not.toBeAbleToSelect(this.cartelSpacer);
                expect(this.player1).not.toBeAbleToSelect(this.p1Base);
            });

            it('from space arena to another unit in the space arena, attack should resolve correctly', function () {
                this.player1.clickCard(this.cartelSpacer);
                this.player1.clickCard(this.allianceXWing);

                // attack against base should immediately resolve
                expect(this.cartelSpacer.damage).toBe(2);
                expect(this.cartelSpacer.exhausted).toBe(true);
                expect(this.allianceXWing.damage).toBe(2);
                expect(this.allianceXWing.exhausted).toBe(false);
            });

            it(', should only be able to select opponent\'s units in the same arena and base', function () {
                this.player1.clickCard(this.wampa);
                expect(this.player1).toHavePrompt('Choose a target for attack');
                
                // can target opponent's ground units and base but not space units
                expect(this.player1).toBeAbleToSelect(this.atrt);
                expect(this.player1).toBeAbleToSelect(this.enfysNest);
                expect(this.player1).toBeAbleToSelect(this.p2Base);
                expect(this.player1).not.toBeAbleToSelect(this.allianceXWing);
                
                expect(this.player1).not.toBeAbleToSelect(this.wampa);
                expect(this.player1).not.toBeAbleToSelect(this.cartelSpacer);
                expect(this.player1).not.toBeAbleToSelect(this.p1Base);
            });

            it('another unit and neither is defeated, both should receive damage and attacker should be exhausted', function () {
                this.player1.clickCard(this.wampa);
                this.player1.clickCard(this.atrt);

                expect(this.wampa.damage).toBe(3);
                expect(this.atrt.damage).toBe(4);
                expect(this.wampa.exhausted).toBe(true);
                expect(this.atrt.exhausted).toBe(false);
            });

            it('another unit and both are defeated, both should be in discard', function () {
                this.player1.clickCard(this.wampa);
                this.player1.clickCard(this.enfysNest);

                expect(this.wampa.damage).toBe(null);
                expect(this.wampa.exhausted).toBe(null);
                expect(this.wampa.location).toBe('discard');

                expect(this.enfysNest.damage).toBe(null);
                expect(this.enfysNest.exhausted).toBe(null);
                expect(this.enfysNest.location).toBe('discard');
            });

            it('another unit and both are defeated, both should be in discard', function () {
                this.player1.clickCard(this.wampa);
                this.player1.clickCard(this.enfysNest);

                expect(this.wampa.damage).toBe(null);
                expect(this.wampa.exhausted).toBe(null);
                expect(this.wampa.location).toBe('discard');

                expect(this.enfysNest.damage).toBe(null);
                expect(this.enfysNest.exhausted).toBe(null);
                expect(this.enfysNest.location).toBe('discard');
            });

            it('base with non-lethal damage, base should be damaged and attacker should be exhausted', function () {
                this.player1.clickCard(this.wampa);
                this.player1.clickCard(this.p2Base);

                expect(this.wampa.damage).toBe(0);
                expect(this.wampa.exhausted).toBe(true);
                expect(this.p2Base.damage).toBe(4);
            });

            it('base with lethal damage, game should end immediately', function () {
                this.p2Base.damage = 28;
                this.player1.clickCard(this.wampa);
                this.player1.clickCard(this.p2Base);

                // we still expect this since it should've been done before the attack
                expect(this.wampa.exhausted).toBe(true);

                expect(this.p2Base.damage).toBe(32);
                expect(this.player1).toHavePrompt('player1 has won the game!');
                expect(this.player2).toHavePrompt('player1 has won the game!');
            });
        });
    });
});
