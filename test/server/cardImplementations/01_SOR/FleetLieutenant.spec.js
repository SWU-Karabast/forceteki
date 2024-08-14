describe('Fleet Lieutenant', function() {
    integration(function() {
        describe('Fleet lieutenant\'s ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['fleet-lieutenant'],
                        groundArena: ['wampa', 'mon-mothma#voice-of-the-rebellion'],
                        resources: ['atst', 'atst', 'atst'],
                        leader: ['leia-organa#alliance-general']
                    },
                    player2: {
                        groundArena: ['sundari-peacekeeper'],
                        spaceArena: ['cartel-spacer']
                    }
                });

                this.fleetLieutenant = this.player1.findCardByName('fleet-lieutenant');
                this.wampa = this.player1.findCardByName('wampa');
                this.monMothma = this.player1.findCardByName('mon-mothma#voice-of-the-rebellion');
                this.peacekeeper = this.player2.findCardByName('sundari-peacekeeper');
                this.cartelSpacer = this.player2.findCardByName('cartel-spacer');

                this.p1Base = this.player1.base;
                this.p2Base = this.player2.base;

                this.noMoreActions();
            });

            it('should allowing triggering an attack by a unit when played', function () {
                this.player1.clickCard(this.fleetLieutenant);
                expect(this.fleetLieutenant.location).toBe('ground arena');
                expect(this.player1).toBeAbleToSelectAllOf([this.wampa, this.monMothma]);
                expect(this.player1).toBeAbleToSelectNoneOf([this.p1Base, this.p2Base, this.peacekeeper, this.cartelSpacer]);

                this.player1.clickCard(this.wampa);

                expect(this.wampa.exhausted).toBe(true);
                expect(this.wampa.damage).toBe(1);
                expect(this.peacekeeper.damage).toBe(4);
            });

            it('if used with a rebel unit should give it +2 power', function () {
                this.player1.clickCard(this.fleetLieutenant);

                this.player1.clickCard(this.monMothma);
                expect(this.peacekeeper.damage).toBe(3);
                expect(this.monMothma.damage).toBe(1);

                // do a second attack to confirm that the +2 bonus has expired
                this.player2.passAction();
                this.monMothma.exhausted = false;
                this.player1.clickCard(this.monMothma);
                this.player1.clickCard(this.peacekeeper);

                expect(this.monMothma.damage).toBe(2);
                expect(this.peacekeeper.damage).toBe(4);
            });

            it('should allow the user to pass on the attack', function () {
                this.player1.clickCard(this.fleetLieutenant);
                expect(this.fleetLieutenant.location).toBe('ground arena');

                this.player1.clickPrompt('Pass ability');
                expect(this.player2).toBeActivePlayer();
            });
        });

        describe('Fleet lieutenant\'s ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['fleet-lieutenant'],
                        groundArena: ['wampa'],
                        spaceArena: ['inferno-four#unforgetting'],
                        resources: ['atst', 'atst', 'atst'],
                        leader: ['leia-organa#alliance-general']
                    },
                    player2: {
                        groundArena: ['sundari-peacekeeper'],
                    }
                });

                this.fleetLieutenant = this.player1.findCardByName('fleet-lieutenant');
                this.wampa = this.player1.findCardByName('wampa');
                this.infernoFour = this.player1.findCardByName('inferno-four#unforgetting');
                this.peacekeeper = this.player2.findCardByName('sundari-peacekeeper');

                this.p1Base = this.player1.base;
                this.p2Base = this.player2.base;

                this.noMoreActions();
            });

            // this test is mostly to confirm that a unit with no legal targets for attack (inferno four) is automatically excluded
            // from the list of possible attackers
            it('should automatically choose the only available unit as the attacker', function () {
                this.player1.clickCard(this.fleetLieutenant);
                expect(this.fleetLieutenant.location).toBe('ground arena');
                expect(this.player1).toHavePassAbilityPrompt();
                this.player1.clickPrompt('Trigger');

                expect(this.wampa.exhausted).toBe(true);
                expect(this.wampa.damage).toBe(1);
                expect(this.peacekeeper.damage).toBe(4);
            });
        });
    });
});
