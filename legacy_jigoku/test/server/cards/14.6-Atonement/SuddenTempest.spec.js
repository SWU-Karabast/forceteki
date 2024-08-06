describe('Sudden Tempest', function() {
    integration(function() {
        describe('playing Sudden Tempest', function() {
            beforeEach(function() {
                this.setupTest({
                    phase: 'dynasty',
                    player1: {
                        dynastyDiscard: ['sudden-tempest']
                    },
                    player2: {
                    }
                });

                this.suddenTempest = this.player1.placeCardInProvince('sudden-tempest', 'province 2');
            });

            it('should be able to select any unclaimed ring', function() {
                this.game.rings.void.claimRing(this.player1.player);
                this.player1.clickCard(this.suddenTempest);

                expect(this.player1).toBeAbleToSelectRing('fire');
                expect(this.player1).not.toBeAbleToSelectRing('void');
                expect(this.player1).toBeAbleToSelectRing('water');
                expect(this.player1).toBeAbleToSelectRing('air');
                expect(this.player1).toBeAbleToSelectRing('earth');
            });

            it('should remove the ring from the game', function() {
                this.player1.clickCard(this.suddenTempest);
                this.player1.clickRing('void');

                expect(this.game.rings.void.removedFromGame).toBe(true);
            });
        });
        describe('effects that interact with a ring but don\'t care about state - Master of Gisei Toshi', function() {
            beforeEach(function() {
                this.setupTest({
                    phase: 'dynasty',
                    player1: {
                        inPlay: ['master-of-gisei-toshi'],
                        dynastyDiscard: ['sudden-tempest']
                    },
                    player2: {
                    }
                });

                this.giseiToshi = this.player1.findCardByName('master-of-gisei-toshi');
                this.suddenTempest = this.player1.placeCardInProvince('sudden-tempest', 'province 2');

                this.player1.clickCard(this.suddenTempest);
                this.player1.clickRing('void');

                this.noMoreActions();
                this.player1.clickPrompt('1');
                this.player2.clickPrompt('1');
            });

            it('should allow you to target rings when it doesn\'t specify the state of the ring - Master of Gisei Toshi', function() {
                expect(this.player1).toHavePrompt('Triggered Abilities');
                expect(this.player1).toBeAbleToSelect(this.giseiToshi);

                this.player1.clickCard(this.giseiToshi);
                expect(this.player1).toBeAbleToSelectRing('void');
                this.player1.clickRing('void');
                expect(this.player1).toHavePrompt('Action Window');
            });
        });

        describe('effects that interact with a removed ring - others', function() {
            beforeEach(function() {
                this.setupTest({
                    phase: 'dynasty',
                    player1: {
                        inPlay: ['master-alchemist'],
                        dynastyDiscard: ['sudden-tempest'],
                        hand: ['way-of-the-phoenix']
                    },
                    player2: {
                        provinces: ['fuchi-mura', 'pilgrimage']
                    }
                });

                this.masterAlchemist = this.player1.findCardByName('master-alchemist');
                this.wayOfThePhoenix = this.player1.findCardByName('way-of-the-phoenix');

                this.suddenTempest = this.player1.placeCardInProvince('sudden-tempest', 'province 2');

                this.fuchiMura = this.player2.findCardByName('fuchi-mura');
                this.pilg = this.player2.findCardByName('pilgrimage');

                this.player1.clickCard(this.suddenTempest);
                this.player1.clickRing('fire');

                this.noMoreActions();
                this.player1.clickPrompt('1');
                this.player2.clickPrompt('1');
            });

            it('should not place fate on Sudden Tempest ring with Fuchi Mura - mentions unclaimed', function() {
                this.noMoreActions();

                const fireRingFate = this.game.rings.fire.fate;

                this.initiateConflict({
                    province: this.fuchiMura,
                    attackers: [this.masterAlchemist],
                    type: 'military'
                });

                expect(this.player2).toBeAbleToSelect(this.fuchiMura);
                this.player2.clickCard(this.fuchiMura);

                expect(this.game.rings.fire.fate).toBe(fireRingFate);
                expect(this.player2).toHavePrompt('Choose Defenders');
            });

            it('should allow Master Alchemist to put fate on Sudden Tempest ring - doesn\'t mention state', function() {
                this.noMoreActions();

                const fireRingFate = this.game.rings.fire.fate;

                this.initiateConflict({
                    province: this.pilg,
                    attackers: [this.masterAlchemist],
                    defenders: [],
                    type: 'military'
                });

                this.player2.pass();

                this.player1.clickCard(this.masterAlchemist);
                expect(this.player1).toBeAbleToSelect(this.masterAlchemist);
                this.player1.clickCard(this.masterAlchemist);
                this.player1.clickRing('fire');
                this.player1.clickPrompt('Honor this character');

                expect(this.masterAlchemist.isHonored).toBe(true);
                expect(this.game.rings.fire.fate).toBe(fireRingFate + 1);
                expect(this.player2).toHavePrompt('Conflict Action Window');
            });

            it('should not allow starting a conflict with the ring', function() {
                this.noMoreActions();

                this.player1.clickRing('air');
                expect(this.player1).toHavePrompt('Military Air Conflict');
                this.player1.clickRing('fire');
                expect(this.player1).toHavePrompt('Military Air Conflict');
            });

            it('ring should not get fate during the fate phase', function() {
                this.masterAlchemist.fate = 5;
                this.noMoreActions();
                this.player1.passConflict();
                this.noMoreActions();
                this.noMoreActions();
                this.player1.passConflict();
                this.noMoreActions();
                this.noMoreActions();

                let airFate = this.game.rings.air.fate;
                let fireFate = this.game.rings.fire.fate;

                this.player1.clickPrompt('Military');

                expect(this.game.rings.air.fate).toBe(airFate + 1);
                expect(this.game.rings.fire.fate).toBe(fireFate);
            });

            it('should return to the game at the end of the round', function() {
                this.masterAlchemist.fate = 5;
                this.noMoreActions();
                this.player1.passConflict();
                this.noMoreActions();
                this.noMoreActions();
                this.player1.passConflict();
                this.noMoreActions();
                this.noMoreActions();

                this.player1.clickPrompt('Military');
                this.player1.clickPrompt('Done');
                this.player2.clickPrompt('Done');

                expect(this.game.rings.fire.isRemovedFromGame()).toBe(true);
                this.player2.clickPrompt('End Round');
                this.player1.clickPrompt('End Round');
                expect(this.game.rings.fire.isRemovedFromGame()).toBe(false);
            });
        });

        describe('effects that interact with unclaimed rings', function() {
            beforeEach(function() {
                this.setupTest({
                    phase: 'dynasty',
                    player1: {
                        inPlay: ['kitsuki-investigator'],
                        dynastyDiscard: ['sudden-tempest'],
                        hand: ['way-of-the-phoenix']
                    },
                    player2: {
                        provinces: ['fuchi-mura', 'pilgrimage'],
                        hand: ['let-go', 'fine-katana']
                    }
                });

                this.investigator = this.player1.findCardByName('kitsuki-investigator');
                this.wayOfThePhoenix = this.player1.findCardByName('way-of-the-phoenix');

                this.suddenTempest = this.player1.placeCardInProvince('sudden-tempest', 'province 2');

                this.fuchiMura = this.player2.findCardByName('fuchi-mura');
                this.pilg = this.player2.findCardByName('pilgrimage');

                this.player1.clickCard(this.suddenTempest);
                this.player1.clickRing('fire');

                this.noMoreActions();
                this.player1.clickPrompt('1');
                this.player2.clickPrompt('1');
            });

            it('should not allow targetting via Investigator', function() {
                this.noMoreActions();


                this.initiateConflict({
                    province: this.pilg,
                    attackers: [this.investigator],
                    defenders: [],
                    type: 'political',
                    ring: 'air'
                });

                this.player2.pass();

                this.player1.clickCard(this.investigator);
                expect(this.player1).not.toBeAbleToSelectRing('air');
                expect(this.player1).toBeAbleToSelectRing('earth');
                expect(this.player1).not.toBeAbleToSelectRing('fire');
                expect(this.player1).toBeAbleToSelectRing('void');
                expect(this.player1).toBeAbleToSelectRing('water');
            });
        });
    });
});

describe('Sudden Tempest and All Out Assault', function() {
    integration(function() {
        describe('Element Dependent Characters', function() {
            beforeEach(function() {
                this.setupTest({
                    phase: 'dynasty',
                    player1: {
                        inPlay: ['bayushi-liar', 'matsu-berserker', 'alibi-artist', 'fire-tensai-acolyte'],
                        hand: ['all-out-assault'],
                        dynastyDiscard: ['sudden-tempest']
                    },
                    player2: {
                    }
                });

                this.liar = this.player1.findCardByName('bayushi-liar');
                this.alibi = this.player1.findCardByName('alibi-artist');
                this.acolyte = this.player1.findCardByName('fire-tensai-acolyte');
                this.berserker = this.player1.findCardByName('matsu-berserker');
                this.assault = this.player1.findCardByName('all-out-assault');

                this.shamefulDisplay1 = this.player1.findCardByName('shameful-display', 'province 1');
                this.shamefulDisplay2 = this.player2.findCardByName('shameful-display', 'province 1');


                this.suddenTempest = this.player1.placeCardInProvince('sudden-tempest', 'province 2');
                this.player1.clickCard(this.suddenTempest);
                this.player1.clickRing('fire');
                this.noMoreActions();

                this.player1.clickPrompt('1');
                this.player2.clickPrompt('1');
                this.player1.clickCard(this.assault);
            });

            it('should not force you to pick an illegal element', function() {
                this.noMoreActions();
                expect(this.player1).toHavePrompt('Political Air Conflict');
                this.player1.clickRing('earth');
                expect(this.player1).toHavePrompt('Political Earth Conflict');
                this.player1.clickRing('fire');
                expect(this.player1).toHavePrompt('Political Earth Conflict');
                expect(this.game.currentConflict.attackers).not.toContain(this.acolyte);
            });
        });
    });
});
