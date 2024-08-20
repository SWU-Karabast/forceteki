const exp = require('constants');

describe('Death Trooper', function() {
    integration(function() {
        describe('Death Trooper\'s When Played ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['death-trooper'],
                        groundArena: ['pyke-sentinel'],
                        spaceArena: ['cartel-spacer'],
                        resources: ['atst', 'atst', 'atst'],
                        leader: ['director-krennic#aspiring-to-authority']
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['imperial-interceptor']
                    }
                });

                this.deathTrooper = this.player1.findCardByName('death-trooper');
                this.pykeSentinel = this.player1.findCardByName('pyke-sentinel');
                this.cartepSpacer = this.player1.findCardByName('cartel-spacer');

                this.wampa = this.player2.findCardByName('wampa');
                this.interceptor = this.player2.findCardByName('imperial-interceptor');

                this.p1Base = this.player1.base;
                this.p2Base = this.player2.base;

                this.noMoreActions();
            });

            it('death trooper when played cannot be passed', function () {
                // Play Death Trooper
                this.player1.clickCard(this.deathTrooper);
                expect(this.deathTrooper.location).toBe('ground arena');
                expect(this.player1).toBeAbleToSelectAllOf([this.pykeSentinel, this.deathTrooper]);
                expect(this.player1).toBeAbleToSelectNoneOf([this.interceptor, this.cartepSpacer, this.wampa]);
                expect(this.player1).toNotHavePassAbilityPrompt();
            });

            it('death trooper can deal damage to itself', function () {
                // Play Death Trooper
                this.player1.clickCard(this.deathTrooper);
                expect(this.deathTrooper.location).toBe('ground arena');

                // Choose Friendly
                expect(this.player1).toBeAbleToSelectAllOf([this.pykeSentinel, this.deathTrooper]);
                expect(this.player1).toBeAbleToSelectNoneOf([this.interceptor, this.cartepSpacer, this.wampa]);
                expect(this.player1).toNotHavePassAbilityPrompt();
                this.player1.clickCard(this.deathTrooper);

                // Choose Enemy
                expect(this.deathTrooper.damage).toEqual(2);
                expect(this.player1).toBeAbleToSelectAllOf([this.wampa]);
                expect(this.player1).toBeAbleToSelectNoneOf([this.pykeSentinel, this.deathTrooper, this.interceptor, this.cartepSpacer]);
                this.player1.clickCard(this.wampa);
                expect(this.wampa.damage).toEqual(2);
            });
        });
    });
});
