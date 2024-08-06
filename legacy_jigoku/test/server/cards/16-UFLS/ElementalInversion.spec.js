describe('Elemental Inversion', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['bayushi-manipulator', 'moto-youth', 'kakita-yoshi'],
                    hand: ['elemental-inversion']
                },
                player2: {
                    inPlay: ['moto-nergui']
                }
            });
            this.yoshi = this.player1.findCardByName('kakita-yoshi');
            this.manipulator = this.player1.findCardByName('bayushi-manipulator');
            this.youth = this.player1.findCardByName('moto-youth');
            this.nergui = this.player2.findCardByName('moto-nergui');
            this.inversion = this.player1.findCardByName('elemental-inversion');
            this.player1.claimRing('earth');
            this.player2.claimRing('void');
        });

        it('should not work outside of a conflict', function() {
            expect(this.player1).toHavePrompt('Action Window');
            this.player1.clickCard(this.inversion);
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
            this.player1.clickCard(this.inversion);
            expect(this.player1).toHavePrompt('Choose an uncontested ring');
        });

        it('should switch the contested ring, moving all fate from it instead of giving it to the attacking player', function() {
            this.game.rings.water.fate = 2;
            let fate = this.player1.fate;
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.youth],
                defenders: [],
                ring: 'air'
            });
            expect(this.game.currentConflict.ring.element).toBe('air');
            this.player2.pass();
            this.player1.clickCard(this.inversion);
            expect(this.player1).not.toBeAbleToSelectRing('air');
            expect(this.player1).toBeAbleToSelectRing('earth');
            expect(this.player1).toBeAbleToSelectRing('void');
            expect(this.player1).toBeAbleToSelectRing('fire');
            expect(this.player1).toBeAbleToSelectRing('water');
            this.player1.clickRing('water');
            expect(this.game.currentConflict.ring.element).toBe('water');
            expect(this.player1.fate).toBe(fate);
            expect(this.game.rings.air.fate).toBe(2);
            expect(this.game.rings.water.fate).toBe(0);
            expect(this.getChatLogs(4)).toContain('player1 plays Elemental Inversion to move all fate from the Water Ring and switch it with the contested ring');
        });

        it('should work if the target ring has no fate', function() {
            let fate = this.player1.fate;
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.youth],
                defenders: [],
                ring: 'air'
            });
            expect(this.game.currentConflict.ring.element).toBe('air');
            this.player2.pass();
            this.player1.clickCard(this.inversion);
            expect(this.player1).not.toBeAbleToSelectRing('air');
            expect(this.player1).toBeAbleToSelectRing('earth');
            expect(this.player1).toBeAbleToSelectRing('void');
            expect(this.player1).toBeAbleToSelectRing('fire');
            expect(this.player1).toBeAbleToSelectRing('water');
            this.player1.clickRing('water');
            expect(this.game.currentConflict.ring.element).toBe('water');
            expect(this.player1.fate).toBe(fate);
            expect(this.game.rings.air.fate).toBe(0);
            expect(this.game.rings.water.fate).toBe(0);
            expect(this.getChatLogs(4)).toContain('player1 plays Elemental Inversion to move all fate from the Water Ring and switch it with the contested ring');
        });

        it('should work on a claimed ring', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.youth],
                defenders: [],
                ring: 'air'
            });
            expect(this.game.currentConflict.ring.element).toBe('air');
            expect(this.game.rings.earth.claimedBy).toBe(this.player1.player.name);
            expect(this.game.rings.earth.isClaimed()).toBe(true);
            this.player2.pass();
            this.player1.clickCard(this.inversion);
            this.player1.clickRing('earth');
            expect(this.game.currentConflict.ring.element).toBe('earth');
            expect(this.game.rings.earth.isClaimed()).toBe(false);
            expect(this.game.rings.air.claimedBy).toBe(this.player1.player.name);
            expect(this.getChatLogs(4)).toContain('player1 plays Elemental Inversion to move all fate from the Earth Ring and switch it with the contested ring');
        });
    });
});
