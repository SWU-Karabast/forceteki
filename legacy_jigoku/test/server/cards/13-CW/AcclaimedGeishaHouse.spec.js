describe('Acclaimed Geisha House', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['bayushi-manipulator', 'moto-youth', 'kakita-yoshi'],
                    dynastyDiscard: ['acclaimed-geisha-house']
                },
                player2: {
                    inPlay: ['moto-nergui']
                }
            });
            this.yoshi = this.player1.findCardByName('kakita-yoshi');
            this.manipulator = this.player1.findCardByName('bayushi-manipulator');
            this.youth = this.player1.findCardByName('moto-youth');
            this.nergui = this.player2.findCardByName('moto-nergui');
            this.house = this.player1.placeCardInProvince('acclaimed-geisha-house', 'province 1');
            this.house.facedown = false;
            this.game.rings.fire.fate = 1;
            this.player1.claimRing('earth');
            this.player2.claimRing('void');
        });

        it('should not work outside of a conflict', function() {
            expect(this.player1).toHavePrompt('Action Window');
            this.player1.clickCard(this.house);
            expect(this.player1).toHavePrompt('Action Window');
        });

        it('should let you select a ring', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.manipulator, this.youth],
                defenders: [this.nergui],
                ring: 'air'
            });
            this.player2.pass();
            this.player1.clickCard(this.house);
            expect(this.player1).toHavePrompt('Choose an unclaimed ring');
        });

        it('should make you select to dishonor a participating character you control', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.manipulator, this.youth],
                defenders: [this.nergui],
                ring: 'air'
            });
            this.player2.pass();
            this.player1.clickCard(this.house);
            this.player1.clickRing('fire');
            expect(this.player1).toHavePrompt('Select character to dishonor');
            expect(this.player1).toBeAbleToSelect(this.manipulator);
            expect(this.player1).toBeAbleToSelect(this.youth);
            expect(this.player1).not.toBeAbleToSelect(this.yoshi);
            expect(this.player1).not.toBeAbleToSelect(this.nergui);
        });

        it('should not work if there is not a participating character that can be dishonored', function() {
            this.manipulator.dishonor();
            this.youth.dishonor();
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.manipulator, this.youth],
                defenders: [],
                ring: 'air'
            });
            this.player2.pass();
            expect(this.player1).toHavePrompt('Conflict Action Window');
            this.player1.clickCard(this.house);
            expect(this.player1).toHavePrompt('Conflict Action Window');
        });

        it('should switch the contested ring', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.youth],
                defenders: [],
                ring: 'air'
            });
            expect(this.game.currentConflict.ring.element).toBe('air');
            this.player2.pass();
            this.player1.clickCard(this.house);
            expect(this.player1).not.toBeAbleToSelectRing('air');
            expect(this.player1).not.toBeAbleToSelectRing('earth');
            expect(this.player1).not.toBeAbleToSelectRing('void');
            expect(this.player1).toBeAbleToSelectRing('fire');
            expect(this.player1).toBeAbleToSelectRing('water');
            this.player1.clickRing('water');
            this.player1.clickCard(this.youth);
            expect(this.youth.isDishonored).toBe(true);
            expect(this.game.currentConflict.ring.element).toBe('water');
            expect(this.getChatLogs(4)).toContain('player1 uses Acclaimed Geisha House, dishonoring Moto Youth to switch the contested ring with the Water Ring');
        });

        it('should give the fate from the chosen ring to the attacking player (user attacking)', function() {
            let fate = this.player1.fate;
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.youth],
                defenders: [],
                ring: 'air'
            });
            expect(this.game.currentConflict.ring.element).toBe('air');
            this.player2.pass();
            this.player1.clickCard(this.house);
            this.player1.clickRing('fire');
            this.player1.clickCard(this.youth);
            expect(this.game.currentConflict.ring.element).toBe('fire');
            expect(this.youth.isDishonored).toBe(true);
            expect(this.player1.fate).toBe(fate + 1);
            expect(this.getChatLogs(5)).toContain('player1 uses Acclaimed Geisha House, dishonoring Moto Youth to switch the contested ring with the Fire Ring');
            expect(this.getChatLogs(4)).toContain('player1 takes 1 fate from Fire Ring');
        });

        it('should give the fate from the chosen ring to the attacking player (user defending)', function() {
            let fate = this.player1.fate;
            let p2fate = this.player2.fate;
            this.noMoreActions();
            this.player1.passConflict();
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.nergui],
                defenders: [this.youth],
                ring: 'air'
            });
            expect(this.game.currentConflict.ring.element).toBe('air');
            this.player1.clickCard(this.house);
            this.player1.clickRing('fire');
            this.player1.clickCard(this.youth);
            expect(this.game.currentConflict.ring.element).toBe('fire');
            expect(this.youth.isDishonored).toBe(true);
            expect(this.player1.fate).toBe(fate);
            expect(this.player2.fate).toBe(p2fate + 1);
            expect(this.getChatLogs(5)).toContain('player1 uses Acclaimed Geisha House, dishonoring Moto Youth to switch the contested ring with the Fire Ring');
            expect(this.getChatLogs(4)).toContain('player2 takes 1 fate from Fire Ring');
        });
    });
});
