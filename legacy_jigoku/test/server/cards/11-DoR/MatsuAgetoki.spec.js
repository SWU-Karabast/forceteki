describe('Matsu Agetoki', function() {
    integration(function() {
        describe('Matsu Agetoki\'s ability', function() {
            beforeEach(function() {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        provinces: ['upholding-authority'],
                        inPlay: ['shrine-maiden', 'matsu-agetoki']
                    },
                    player2: {
                        provinces: ['public-forum', 'sanpuku-seido', 'rally-to-the-cause'],
                        inPlay: ['serene-warrior'],
                        hand: ['backhanded-compliment']
                    }
                });
                this.player1.player.honor = 11;
                this.player2.player.honor = 10;

                this.upholding = this.player1.findCardByName('upholding-authority');
                this.sanpukuSeido = this.player2.findCardByName('sanpuku-seido');
                this.publicForum = this.player2.findCardByName('public-forum');
                this.rally = this.player2.findCardByName('rally-to-the-cause');

                this.maiden = this.player1.findCardByName('shrine-maiden');
                this.agetoki = this.player1.findCardByName('matsu-agetoki');
                this.warrior = this.player2.findCardByName('serene-warrior');

                this.backhanded = this.player2.findCardByName('backhanded-compliment');

                this.noMoreActions();
            });

            it('should move the conflict to a new province when attacking and more honorable', function() {
                this.initiateConflict({
                    ring: 'air',
                    province: this.publicForum,
                    attackers: [this.agetoki],
                    defenders: []
                });

                this.player2.pass();
                this.player1.clickCard(this.agetoki);
                expect(this.player1).toHavePrompt('Matsu Agetoki');
                expect(this.player1).toBeAbleToSelect(this.sanpukuSeido);
                expect(this.player1).toBeAbleToSelect(this.rally);
                expect(this.player1).not.toBeAbleToSelect(this.publicForum);
                expect(this.player1).not.toBeAbleToSelect(this.upholding);
                this.player1.clickCard(this.sanpukuSeido);
                expect(this.publicForum.inConflict).toBe(false);
                expect(this.sanpukuSeido.inConflict).toBe(true);
                expect(this.game.currentConflict.conflictProvince).toBe(this.sanpukuSeido);

                expect(this.getChatLogs(10)).toContain('player1 uses Matsu Agetoki to move the conflict to another eligible province');
                expect(this.getChatLogs(10)).toContain('player1 moves the conflict to Sanpuku Seidō');
            });

            it('should apply any constant abilities of the new province', function() {
                this.initiateConflict({
                    ring: 'air',
                    province: this.publicForum,
                    attackers: [this.agetoki],
                    defenders: [this.warrior]
                });

                this.player2.pass();
                this.player1.clickCard(this.agetoki);
                expect(this.player1).toHavePrompt('Matsu Agetoki');
                expect(this.player1).toBeAbleToSelect(this.sanpukuSeido);
                expect(this.player1).not.toBeAbleToSelect(this.publicForum);
                expect(this.player1).not.toBeAbleToSelect(this.upholding);
                this.player1.clickCard(this.sanpukuSeido);
                expect(this.publicForum.inConflict).toBe(false);
                expect(this.sanpukuSeido.inConflict).toBe(true);
                expect(this.game.currentConflict.conflictProvince).toBe(this.sanpukuSeido);
                expect(this.game.currentConflict.attackerSkill).toBe(2);
                expect(this.game.currentConflict.defenderSkill).toBe(4);
            });

            it('should trigger reactions on reveal', function() {
                this.initiateConflict({
                    ring: 'air',
                    province: this.publicForum,
                    attackers: [this.agetoki],
                    defenders: [this.warrior],
                    type: 'military'
                });

                this.player2.pass();
                this.player1.clickCard(this.agetoki);
                expect(this.player1).toHavePrompt('Matsu Agetoki');
                expect(this.player1).toBeAbleToSelect(this.rally);
                this.player1.clickCard(this.rally);
                expect(this.publicForum.inConflict).toBe(false);
                expect(this.rally.inConflict).toBe(true);
                expect(this.player2).toHavePrompt('Triggered Abilities');
                expect(this.player2).toBeAbleToSelect(this.rally);
                expect(this.game.currentConflict.conflictType).toBe('military');
                this.player2.clickCard(this.rally);
                expect(this.game.currentConflict.conflictType).toBe('political');
                expect(this.getChatLogs(3)).toContain('player2 uses Rally to the Cause to switch the conflict type');
            });

            it('should not work if not participating', function() {
                this.initiateConflict({
                    ring: 'air',
                    province: this.publicForum,
                    attackers: [this.maiden],
                    defenders: []
                });

                this.player2.pass();
                this.player1.clickCard(this.agetoki);
                expect(this.player1).toHavePrompt('Conflict Action Window');
                expect(this.player1).not.toBeAbleToSelect(this.sanpukuSeido);
                expect(this.player1).not.toBeAbleToSelect(this.publicForum);
                expect(this.player1).not.toBeAbleToSelect(this.upholding);
            });

            it('should not work if not more honorable', function() {
                this.initiateConflict({
                    ring: 'air',
                    province: this.publicForum,
                    attackers: [this.agetoki],
                    defenders: []
                });

                this.player2.clickCard(this.backhanded);
                this.player2.clickPrompt('player1');
                this.player1.clickCard(this.agetoki);
                expect(this.player1).toHavePrompt('Conflict Action Window');
                expect(this.player1).not.toBeAbleToSelect(this.sanpukuSeido);
                expect(this.player1).not.toBeAbleToSelect(this.publicForum);
                expect(this.player1).not.toBeAbleToSelect(this.upholding);
            });

            it('should not work on defense', function() {
                this.player1.passConflict();
                this.noMoreActions();

                this.initiateConflict({
                    ring: 'air',
                    attackers: [this.warrior],
                    defenders: [this.agetoki]
                });

                this.player1.clickCard(this.agetoki);
                expect(this.player1).toHavePrompt('Conflict Action Window');
                expect(this.player1).not.toBeAbleToSelect(this.sanpukuSeido);
                expect(this.player1).not.toBeAbleToSelect(this.publicForum);
                expect(this.player1).not.toBeAbleToSelect(this.upholding);
            });
        });
    });
});
