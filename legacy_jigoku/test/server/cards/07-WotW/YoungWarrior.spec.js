describe('Young Warrior', function() {
    integration(function() {
        describe('Young Warrior\'s ability', function() {
            beforeEach(function() {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['young-warrior', 'utaku-yumino', 'young-warrior']
                    },
                    player2: {
                        inPlay: ['serene-warrior'],
                        hand: ['pacifism', 'stolen-breath']
                    }
                });
                this.youngWarrior = this.player1.filterCardsByName('young-warrior')[0];
                this.youngWarrior2 = this.player1.filterCardsByName('young-warrior')[1];
                this.yumino = this.player1.findCardByName('utaku-yumino');
                this.warrior = this.player2.findCardByName('serene-warrior');
                this.youngWarrior2.bowed = true;
            });

            it('should automatically add Young Warrior to attackers', function() {
                this.noMoreActions();
                expect(this.player1).toHavePrompt('Military Air Conflict');
                expect(this.game.currentConflict.attackers).toContain(this.youngWarrior);
            });

            it('should not allow removing Young Warrior from the conflict as an attacker', function() {
                this.noMoreActions();
                this.player1.clickCard(this.youngWarrior);
                expect(this.player1).toHavePrompt('Military Air Conflict');
                expect(this.game.currentConflict.attackers).toContain(this.youngWarrior);
            });

            it('should automatically add Young Warrior as a defender', function() {
                this.noMoreActions();
                this.player1.clickPrompt('Pass Conflict');
                this.player1.clickPrompt('Yes');
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.warrior]
                });
                expect(this.player1).toHavePrompt('Choose defenders');
                expect(this.game.currentConflict.defenders).toContain(this.youngWarrior);
            });

            it('should not allow removing Young Warrior from the conflict as a defender', function() {
                this.noMoreActions();
                this.player1.clickPrompt('Pass Conflict');
                this.player1.clickPrompt('Yes');
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.warrior]
                });
                expect(this.player1).toHavePrompt('Choose defenders');
                this.player1.clickCard(this.youngWarrior);
                expect(this.game.currentConflict.defenders).toContain(this.youngWarrior);
            });

            describe('when Young Warrior has Pacifism', function() {
                beforeEach(function() {
                    this.player1.pass();
                    this.player2.playAttachment('pacifism', this.youngWarrior);
                    this.noMoreActions();
                });

                it('should automatically add Young Warrior to attackers', function() {
                    expect(this.player1).toHavePrompt('Political Air Conflict');
                    expect(this.game.currentConflict.attackers).toContain(this.youngWarrior);
                });

                it('should automatically flip the ring to political', function() {
                    this.player1.clickRing('air');
                    expect(this.game.currentConflict.attackers).toContain(this.youngWarrior);
                    expect(this.game.rings.air.conflictType).toBe('political');
                });

                it('should not allow flipping the ring to military', function() {
                    this.player1.clickRing('air');
                    expect(this.youngWarrior.inConflict).toBe(true);
                    this.player1.clickRing('air');
                    expect(this.game.rings.air.conflictType).toBe('political');
                    expect(this.youngWarrior.inConflict).toBe(true);
                });

                it('should not add Young Warrior to a military conflict as a defender', function() {
                    this.player1.clickPrompt('Pass Conflict');
                    this.player1.clickPrompt('Yes');
                    this.noMoreActions();
                    this.initiateConflict({
                        type: 'military',
                        attackers: [this.warrior]
                    });
                    expect(this.player1).toHavePrompt('Choose defenders');
                    expect(this.game.currentConflict.defenders).not.toContain(this.youngWarrior);
                });

                it('should not add Young warrior to the conflict when it is not the first conflict', function() {
                    this.player1.clickPrompt('Pass Conflict');
                    this.player1.clickPrompt('Yes');
                    this.noMoreActions();
                    this.initiateConflict({
                        type: 'military',
                        ring: 'air',
                        attackers: [this.warrior],
                        defenders: []
                    });
                    this.noMoreActions();
                    expect(this.player2).toHavePrompt('Break Shameful Display');
                    this.player2.clickPrompt('Yes');
                    this.player2.clickPrompt('Gain 2 honor');
                    expect(this.player1).toHavePrompt('Action Window');
                    this.noMoreActions();
                    expect(this.player1).toHavePrompt('Initiate Conflict');
                    expect(this.game.currentConflict.attackers).not.toContain(this.youngWarrior);
                });
            });

            describe('when Young Warrior has Pacifism and another has Stolen Breath', function() {
                beforeEach(function() {
                    this.youngWarrior2.bowed = false;
                    this.player1.pass();
                    this.player2.playAttachment('pacifism', this.youngWarrior);
                    this.player1.pass();
                    this.player2.playAttachment('stolen-breath', this.youngWarrior2);
                    this.noMoreActions();
                });

                it('should automatically add Young Warrior to attackers', function() {
                    expect(this.player1).toHavePrompt('Military Air Conflict');
                    expect(this.game.currentConflict.attackers).toContain(this.youngWarrior2);
                });

                it('should allow flipping the ring and automatically add to attackers', function() {
                    this.player1.clickRing('air');
                    expect(this.game.rings.air.conflictType).toBe('political');
                    expect(this.game.currentConflict.attackers).toContain(this.youngWarrior);
                    expect(this.game.currentConflict.attackers).not.toContain(this.youngWarrior2);
                    this.player1.clickRing('air');
                    expect(this.game.rings.air.conflictType).toBe('military');
                    expect(this.game.currentConflict.attackers).not.toContain(this.youngWarrior);
                    expect(this.game.currentConflict.attackers).toContain(this.youngWarrior2);
                });
            });
        });
    });
});
