const exp = require('constants');

describe('2-1B Surgical Droid', function() {
    integration(function() {
        describe('2-1B Surgical Droid\'s healing', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: [
                            { card: '21b-surgical-droid', exhausted: false },
                            { card: 'r2d2#ignoring-protocol', damage: 1 }],
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });

                this.surgicalDroid = this.player1.findCardByName('21b-surgical-droid');
                this.r2d2 = this.player1.findCardByName('r2d2#ignoring-protocol');
                this.wampa = this.player2.findCardByName('wampa');

                this.p1Base = this.player1.base;
                this.p2Base = this.player2.base;

                this.noMoreActions();
            });

            it('surgical droid should heal r2d2 to full', function () {
                expect(this.r2d2.damage).toBe(1);
                expect(this.surgicalDroid.exhausted).toBe(false);
                this.player1.clickCard(this.surgicalDroid);
                expect(this.surgicalDroid.location).toBe('ground arena');
                expect(this.player1).toBeAbleToSelectAllOf([this.p2Base, this.wampa]);
                this.player1.clickCard(this.p2Base);
                expect(this.player1).toBeAbleToSelectAllOf([this.r2d2]);
                expect(this.player1).toBeAbleToSelectNoneOf([this.surgicalDroid]);
                this.player1.clickCard(this.r2d2);
                expect(this.surgicalDroid.exhausted).toBe(true);
                expect(this.r2d2.damage).toBe(0);
            });

            it('surgical droid ability can be passed', function () {
                expect(this.r2d2.damage).toBe(1);
                this.player1.clickCard(this.surgicalDroid);
                expect(this.player1).toBeAbleToSelectAllOf([this.p2Base]);
                this.player1.clickCard(this.p2Base);
                this.player1.clickPrompt('Pass ability');
                expect(this.surgicalDroid.exhausted).toBe(true);
                expect(this.r2d2.damage).toBe(1);
            });
        });
    });
});
