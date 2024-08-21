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
                        groundArena: ['wampa', 'superlaser-technician'],
                        spaceArena: ['imperial-interceptor']
                    }
                });

                this.deathTrooper = this.player1.findCardByName('death-trooper');
                this.pykeSentinel = this.player1.findCardByName('pyke-sentinel');
                this.cartelSpacer = this.player1.findCardByName('cartel-spacer');

                this.wampa = this.player2.findCardByName('wampa');
                this.superlaserTech = this.player2.findCardByName('superlaser-technician');
                this.interceptor = this.player2.findCardByName('imperial-interceptor');

                this.p1Base = this.player1.base;
                this.p2Base = this.player2.base;

                this.noMoreActions();
            });

            it('cannot be passed', function () {
                // Play Death Trooper
                this.player1.clickCard(this.deathTrooper);
                expect(this.player1).toBeAbleToSelectAllOf([this.pykeSentinel, this.deathTrooper]);
                expect(this.player1).toBeAbleToSelectNoneOf([this.interceptor, this.cartelSpacer, this.wampa, this.superlaserTech]);
                expect(this.player1).not.toHavePassAbilityPrompt();
            });

            it('can only target ground units & can damage itself', function () {
                // Play Death Trooper
                this.player1.clickCard(this.deathTrooper);

                // Choose Friendly
                expect(this.player1).toBeAbleToSelectAllOf([this.pykeSentinel, this.deathTrooper]);
                expect(this.player1).toBeAbleToSelectNoneOf([this.interceptor, this.cartelSpacer, this.wampa, this.superlaserTech]);
                expect(this.player1).not.toHavePassAbilityPrompt();
                this.player1.clickCard(this.deathTrooper);

                // Choose Enemy
                expect(this.player1).toBeAbleToSelectAllOf([this.wampa, this.superlaserTech]);
                expect(this.player1).toBeAbleToSelectNoneOf([this.pykeSentinel, this.deathTrooper, this.interceptor, this.cartelSpacer]);
                this.player1.clickCard(this.wampa);
                expect(this.deathTrooper.damage).toEqual(2);
                expect(this.wampa.damage).toEqual(2);
            });

            // it('works when no enemy ground units', function () {
            //     // Play Death Trooper
            //     this.player2.setGroundArenaUnits([]);
            //     this.player1.clickCard(this.deathTrooper);

            //     // Choose Friendly
            //     expect(this.player1).toBeAbleToSelectAllOf([this.pykeSentinel, this.deathTrooper]);
            //     expect(this.player1).not.toHavePassAbilityPrompt();
            //     this.player1.clickCard(this.deathTrooper);
            //     expect(this.deathTrooper.damage).toEqual(2);
            // });
        });
    });
});
