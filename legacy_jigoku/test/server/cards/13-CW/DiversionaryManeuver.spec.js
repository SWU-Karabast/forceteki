describe('Diversionary Maneuver', function() {
    integration(function() {
        describe('Diversionary Maneuver', function() {
            beforeEach(function() {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        provinces: ['upholding-authority'],
                        inPlay: ['shrine-maiden', 'matsu-agetoki', 'miya-mystic'],
                        hand: ['diversionary-maneuver']
                    },
                    player2: {
                        role: ['keeper-of-water'],
                        provinces: ['public-forum', 'sanpuku-seido', 'rally-to-the-cause'],
                        inPlay: ['serene-warrior', 'doji-challenger', 'borderlands-defender']
                    }
                });
                this.upholding = this.player1.findCardByName('upholding-authority');
                this.sanpukuSeido = this.player2.findCardByName('sanpuku-seido');
                this.publicForum = this.player2.findCardByName('public-forum');
                this.rally = this.player2.findCardByName('rally-to-the-cause');

                this.maiden = this.player1.findCardByName('shrine-maiden');
                this.agetoki = this.player1.findCardByName('matsu-agetoki');
                this.mystic = this.player1.findCardByName('miya-mystic');
                this.warrior = this.player2.findCardByName('serene-warrior');
                this.challenger = this.player2.findCardByName('doji-challenger');
                this.defender = this.player2.findCardByName('borderlands-defender');
                this.maneuver = this.player1.findCardByName('diversionary-maneuver');

                this.noMoreActions();
            });

            it('should move the conflict to a new province and send everyone home bowed', function() {
                this.initiateConflict({
                    ring: 'air',
                    province: this.publicForum,
                    attackers: [this.agetoki, this.mystic],
                    defenders: [this.warrior, this.challenger]
                });

                this.player2.pass();
                this.player1.clickCard(this.maneuver);
                expect(this.player1).toHavePrompt('Diversionary Maneuver');
                expect(this.player1).toBeAbleToSelect(this.sanpukuSeido);
                expect(this.player1).toBeAbleToSelect(this.rally);
                expect(this.player1).not.toBeAbleToSelect(this.publicForum);
                expect(this.player1).not.toBeAbleToSelect(this.upholding);
                this.player1.clickCard(this.sanpukuSeido);
                expect(this.getChatLogs(1)).toContain('player1 plays Diversionary Maneuver to move the conflict to Sanpuku Seidō and send all participating characters home bowed');

                expect(this.player1).toHavePromptButton('Done');
                this.player1.clickPrompt('Done');
                expect(this.player2).toHavePromptButton('Done');
                this.player2.clickPrompt('Done');

                expect(this.publicForum.inConflict).toBe(false);
                expect(this.sanpukuSeido.inConflict).toBe(true);
                expect(this.game.currentConflict.conflictProvince).toBe(this.sanpukuSeido);

                expect(this.agetoki.bowed).toBe(true);
                expect(this.agetoki.inConflict).toBe(false);
                expect(this.mystic.bowed).toBe(true);
                expect(this.mystic.inConflict).toBe(false);
                expect(this.warrior.bowed).toBe(true);
                expect(this.warrior.inConflict).toBe(false);
                expect(this.challenger.bowed).toBe(true);
                expect(this.challenger.inConflict).toBe(false);
            });

            it('should not move home or bow characters who cannot be affected', function() {
                this.initiateConflict({
                    ring: 'air',
                    province: this.publicForum,
                    attackers: [this.agetoki, this.mystic],
                    defenders: [this.warrior, this.defender]
                });

                this.player2.pass();
                this.player1.clickCard(this.maneuver);
                expect(this.player1).toHavePrompt('Diversionary Maneuver');
                expect(this.player1).toBeAbleToSelect(this.sanpukuSeido);
                expect(this.player1).toBeAbleToSelect(this.rally);
                expect(this.player1).not.toBeAbleToSelect(this.publicForum);
                expect(this.player1).not.toBeAbleToSelect(this.upholding);
                this.player1.clickCard(this.sanpukuSeido);
                expect(this.getChatLogs(1)).toContain('player1 plays Diversionary Maneuver to move the conflict to Sanpuku Seidō and send all participating characters home bowed');
                this.player1.clickPrompt('Done');
                this.player2.clickPrompt('Done');

                expect(this.publicForum.inConflict).toBe(false);
                expect(this.sanpukuSeido.inConflict).toBe(true);
                expect(this.game.currentConflict.conflictProvince).toBe(this.sanpukuSeido);

                expect(this.agetoki.bowed).toBe(true);
                expect(this.agetoki.inConflict).toBe(false);
                expect(this.mystic.bowed).toBe(true);
                expect(this.mystic.inConflict).toBe(false);
                expect(this.warrior.bowed).toBe(true);
                expect(this.warrior.inConflict).toBe(false);
                expect(this.defender.bowed).toBe(false);
                expect(this.defender.inConflict).toBe(true);
            });

            it('ordering test - should not bow/send home or move the conflict until after the playing character selects their characters', function() {
                this.initiateConflict({
                    ring: 'air',
                    province: this.publicForum,
                    attackers: [this.agetoki],
                    defenders: [this.warrior]
                });

                this.player2.pass();
                this.player1.clickCard(this.maneuver);
                expect(this.player1).toHavePrompt('Diversionary Maneuver');
                expect(this.player1).toBeAbleToSelect(this.sanpukuSeido);
                expect(this.player1).toBeAbleToSelect(this.rally);
                expect(this.player1).not.toBeAbleToSelect(this.publicForum);
                expect(this.player1).not.toBeAbleToSelect(this.upholding);
                this.player1.clickCard(this.sanpukuSeido);

                expect(this.getChatLogs(1)).toContain('player1 plays Diversionary Maneuver to move the conflict to Sanpuku Seidō and send all participating characters home bowed');

                expect(this.publicForum.inConflict).toBe(true);
                expect(this.sanpukuSeido.inConflict).toBe(false);
                expect(this.game.currentConflict.conflictProvince).toBe(this.publicForum);

                expect(this.agetoki.bowed).toBe(false);
                expect(this.agetoki.inConflict).toBe(true);
                expect(this.warrior.bowed).toBe(false);
                expect(this.warrior.inConflict).toBe(true);

                expect(this.player1).toHavePrompt('Choose cards');
                expect(this.player1).toBeAbleToSelect(this.mystic);
                expect(this.player1).not.toBeAbleToSelect(this.agetoki);
                expect(this.player1).toBeAbleToSelect(this.maiden);
                expect(this.player1).toHavePromptButton('Done');
            });

            it('ordering test - should bow/send home and move the conflict once the playing character selects their characters but before the opponent does', function() {
                this.initiateConflict({
                    ring: 'air',
                    province: this.publicForum,
                    attackers: [this.agetoki],
                    defenders: [this.warrior]
                });

                this.player2.pass();
                this.player1.clickCard(this.maneuver);
                expect(this.player1).toHavePrompt('Diversionary Maneuver');
                expect(this.player1).toBeAbleToSelect(this.sanpukuSeido);
                expect(this.player1).toBeAbleToSelect(this.rally);
                expect(this.player1).not.toBeAbleToSelect(this.publicForum);
                expect(this.player1).not.toBeAbleToSelect(this.upholding);
                this.player1.clickCard(this.sanpukuSeido);
                this.player1.clickCard(this.mystic);
                this.player1.clickCard(this.maiden);
                this.player1.clickPrompt('Done');

                expect(this.getChatLogs(1)).toContain('player1 moves Miya Mystic and Shrine Maiden to the conflict');

                expect(this.player2).toHavePrompt('Choose cards');

                expect(this.publicForum.inConflict).toBe(false);
                expect(this.sanpukuSeido.inConflict).toBe(true);
                expect(this.game.currentConflict.conflictProvince).toBe(this.sanpukuSeido);

                expect(this.agetoki.bowed).toBe(true);
                expect(this.agetoki.inConflict).toBe(false);
                expect(this.warrior.bowed).toBe(true);
                expect(this.warrior.inConflict).toBe(false);

                expect(this.mystic.inConflict).toBe(true);
                expect(this.maiden.inConflict).toBe(true);
            });

            it('should allow moving in as many ready characters as you want', function() {
                this.initiateConflict({
                    ring: 'air',
                    province: this.publicForum,
                    attackers: [this.agetoki],
                    defenders: [this.warrior]
                });

                this.player2.pass();
                this.player1.clickCard(this.maneuver);
                expect(this.player1).toHavePrompt('Diversionary Maneuver');
                expect(this.player1).toBeAbleToSelect(this.sanpukuSeido);
                expect(this.player1).toBeAbleToSelect(this.rally);
                expect(this.player1).not.toBeAbleToSelect(this.publicForum);
                expect(this.player1).not.toBeAbleToSelect(this.upholding);
                this.player1.clickCard(this.sanpukuSeido);

                expect(this.getChatLogs(1)).toContain('player1 plays Diversionary Maneuver to move the conflict to Sanpuku Seidō and send all participating characters home bowed');

                expect(this.player1).toHavePrompt('Choose cards');
                expect(this.player1).toBeAbleToSelect(this.mystic);
                expect(this.player1).not.toBeAbleToSelect(this.agetoki);
                expect(this.player1).toBeAbleToSelect(this.maiden);
                expect(this.player1).toHavePromptButton('Done');

                this.player1.clickCard(this.mystic);
                this.player1.clickCard(this.maiden);
                this.player1.clickPrompt('Done');

                expect(this.getChatLogs(1)).toContain('player1 moves Miya Mystic and Shrine Maiden to the conflict');

                expect(this.player2).toHavePrompt('Choose cards');
                expect(this.player2).toBeAbleToSelect(this.challenger);
                expect(this.player2).not.toBeAbleToSelect(this.warrior);
                expect(this.player2).toBeAbleToSelect(this.defender);
                expect(this.player2).toHavePromptButton('Done');

                this.player2.clickCard(this.challenger);
                this.player2.clickCard(this.defender);
                this.player2.clickPrompt('Done');
                expect(this.getChatLogs(3)).toContain('player2 moves Doji Challenger and Borderlands Defender to the conflict');

                expect(this.publicForum.inConflict).toBe(false);
                expect(this.sanpukuSeido.inConflict).toBe(true);
                expect(this.game.currentConflict.conflictProvince).toBe(this.sanpukuSeido);

                expect(this.agetoki.bowed).toBe(true);
                expect(this.agetoki.inConflict).toBe(false);
                expect(this.warrior.bowed).toBe(true);
                expect(this.warrior.inConflict).toBe(false);

                expect(this.mystic.inConflict).toBe(true);
                expect(this.maiden.inConflict).toBe(true);

                expect(this.challenger.inConflict).toBe(true);
                expect(this.defender.inConflict).toBe(true);
            });

            it('should allow moving in no characters', function() {
                this.initiateConflict({
                    ring: 'air',
                    province: this.publicForum,
                    attackers: [this.agetoki],
                    defenders: [this.warrior]
                });

                this.player2.pass();
                this.player1.clickCard(this.maneuver);
                expect(this.player1).toHavePrompt('Diversionary Maneuver');
                expect(this.player1).toBeAbleToSelect(this.sanpukuSeido);
                expect(this.player1).toBeAbleToSelect(this.rally);
                expect(this.player1).not.toBeAbleToSelect(this.publicForum);
                expect(this.player1).not.toBeAbleToSelect(this.upholding);
                this.player1.clickCard(this.sanpukuSeido);
                expect(this.getChatLogs(1)).toContain('player1 plays Diversionary Maneuver to move the conflict to Sanpuku Seidō and send all participating characters home bowed');

                expect(this.player1).toHavePrompt('Choose cards');
                expect(this.player1).toBeAbleToSelect(this.mystic);
                expect(this.player1).not.toBeAbleToSelect(this.agetoki);
                expect(this.player1).toBeAbleToSelect(this.maiden);
                expect(this.player1).toHavePromptButton('Done');

                this.player1.clickCard(this.mystic);
                this.player1.clickPrompt('Done');

                expect(this.getChatLogs(1)).toContain('player1 moves Miya Mystic to the conflict');

                expect(this.player2).toHavePrompt('Choose cards');
                expect(this.player2).toBeAbleToSelect(this.challenger);
                expect(this.player2).not.toBeAbleToSelect(this.warrior);
                expect(this.player2).toBeAbleToSelect(this.defender);
                expect(this.player2).toHavePromptButton('Done');

                this.player2.clickPrompt('Done');
                expect(this.getChatLogs(3)).toContain('player2 moves no one to the conflict');

                expect(this.publicForum.inConflict).toBe(false);
                expect(this.sanpukuSeido.inConflict).toBe(true);
                expect(this.game.currentConflict.conflictProvince).toBe(this.sanpukuSeido);

                expect(this.mystic.inConflict).toBe(true);

                expect(this.agetoki.bowed).toBe(true);
                expect(this.agetoki.inConflict).toBe(false);
                expect(this.warrior.bowed).toBe(true);
                expect(this.warrior.inConflict).toBe(false);
            });

            it('should allow reacting to the province being revealed once everything is done', function() {
                this.initiateConflict({
                    ring: 'air',
                    province: this.publicForum,
                    attackers: [this.agetoki],
                    defenders: [this.warrior]
                });

                this.player2.pass();
                this.player1.clickCard(this.maneuver);
                expect(this.player1).toHavePrompt('Diversionary Maneuver');
                expect(this.player1).toBeAbleToSelect(this.sanpukuSeido);
                expect(this.player1).toBeAbleToSelect(this.rally);
                expect(this.player1).not.toBeAbleToSelect(this.publicForum);
                expect(this.player1).not.toBeAbleToSelect(this.upholding);
                this.player1.clickCard(this.rally);

                expect(this.getChatLogs(1)).toContain('player1 plays Diversionary Maneuver to move the conflict to Rally to the Cause and send all participating characters home bowed');

                expect(this.player1).toHavePrompt('Choose cards');
                this.player1.clickCard(this.mystic);
                this.player1.clickCard(this.maiden);
                this.player1.clickPrompt('Done');

                expect(this.getChatLogs(1)).toContain('player1 moves Miya Mystic and Shrine Maiden to the conflict');

                expect(this.publicForum.inConflict).toBe(false);
                expect(this.rally.inConflict).toBe(true);
                expect(this.game.currentConflict.conflictProvince).toBe(this.rally);

                expect(this.player2).toHavePrompt('Choose cards');
                this.player2.clickCard(this.challenger);
                this.player2.clickCard(this.defender);
                this.player2.clickPrompt('Done');
                expect(this.getChatLogs(3)).toContain('player2 moves Doji Challenger and Borderlands Defender to the conflict');

                expect(this.player2).toHavePrompt('Triggered Abilities');
                expect(this.player2).toBeAbleToSelect(this.rally);
                this.player2.clickCard(this.rally);
                expect(this.getChatLogs(3)).toContain('player2 uses Rally to the Cause to switch the conflict type');
            });
        });
    });
});
