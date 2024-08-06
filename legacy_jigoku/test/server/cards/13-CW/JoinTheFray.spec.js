describe('Join The Fray', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['adept-of-the-waves'],
                    dynastyDeck: ['shiba-tsukune', 'moto-chagatai', 'moto-youth'],
                    hand: ['join-the-fray', 'finger-of-jade']
                },
                player2: {
                    dynastyDiscard: ['hantei-xxxviii']
                }
            });
            this.adept = this.player1.findCardByName('adept-of-the-waves');
            this.shibaTsukune = this.player1.placeCardInProvince('shiba-tsukune', 'province 1');
            this.chagatai = this.player1.placeCardInProvince('moto-chagatai', 'province 2');
            this.youth = this.player1.placeCardInProvince('moto-youth', 'province 3');
            this.fray = this.player1.findCardByName('join-the-fray');
            this.jade = this.player1.findCardByName('finger-of-jade');
            this.youth.facedown = true;
            this.chagatai.facedown = false;
            this.shibaTsukune.facedown = false;
            this.emperor = this.player2.findCardByName('hantei-xxxviii');
        });

        it('should not be playable in a pre-conflict window', function() {
            expect(this.player1).toHavePrompt('Action Window');
            this.player1.clickCard(this.fray);
            expect(this.player1).toHavePrompt('Action Window');
        });

        it('should not be playable in a pol conflict', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.adept],
                defenders: [],
                type: 'political'
            });

            this.player2.pass();
            expect(this.player1).toHavePrompt('Conflict Action Window');
            this.player1.clickCard(this.fray);
            expect(this.player1).toHavePrompt('Conflict Action Window');
        });

        it('should not be playable when there are no legal targets', function() {
            this.chagatai.facedown = true;
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.adept],
                defenders: [],
                type: 'military'
            });

            this.player2.pass();
            expect(this.player1).toHavePrompt('Conflict Action Window');
            this.player1.clickCard(this.fray);
            expect(this.player1).toHavePrompt('Conflict Action Window');
        });

        it('should allow selecting a character with cavalry', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.adept],
                defenders: [],
                type: 'military'
            });

            this.player2.pass();
            this.player1.clickCard(this.fray);
            expect(this.player1).toHavePrompt('Choose a character');
            expect(this.player1).not.toBeAbleToSelect(this.shibaTsukune);
            expect(this.player1).toBeAbleToSelect(this.chagatai);
            expect(this.player1).not.toBeAbleToSelect(this.youth);
        });

        it('should allow selecting a side to join', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.adept],
                defenders: [],
                type: 'military'
            });

            this.player2.pass();
            this.player1.clickCard(this.fray);
            expect(this.player1).toHavePrompt('Choose a character');
            this.player1.clickCard(this.chagatai);
            expect(this.player1).toHavePrompt('Which side should this character be on?');
            expect(this.player1).toHavePromptButton('player1');
            expect(this.player1).toHavePromptButton('player2');
        });

        it('should move that character into the conflict', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.adept],
                defenders: [],
                type: 'military'
            });

            this.player2.pass();
            this.player1.clickCard(this.fray);
            expect(this.player1).toHavePrompt('Choose a character');
            this.player1.clickCard(this.chagatai);
            expect(this.player1).toHavePrompt('Which side should this character be on?');
            this.player1.clickPrompt('player1');

            expect(this.chagatai.inConflict).toBe(true);
            expect(this.game.currentConflict.attackers).toContain(this.chagatai);
        });

        it('should count skill for opponent', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.adept],
                defenders: [],
                type: 'military',
                ring: 'air'
            });

            this.player2.pass();
            this.player1.clickCard(this.fray);
            expect(this.player1).toHavePrompt('Choose a character');
            this.player1.clickCard(this.chagatai);
            expect(this.player1).toHavePrompt('Which side should this character be on?');
            this.player1.clickPrompt('player2');

            expect(this.game.currentConflict.attackers).not.toContain(this.chagatai);
            expect(this.game.currentConflict.defenders).toContain(this.chagatai);

            expect(this.getChatLogs(3)).toContain('player1 plays Join the Fray to have Moto Chagatai join the conflict for player2!');
            expect(this.getChatLogs(2)).toContain('Military Air conflict - Attacker: 2 Defender: 6');
            expect(this.getChatLogs(1)).toContain('Defender is winning the conflict');

            this.noMoreActions();
            expect(this.game.rings.air.claimedBy).toBe(this.player2.player.name);
        });

        it('should count skill for myself', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.adept],
                defenders: [],
                type: 'military',
                ring: 'air'
            });

            this.player2.pass();
            this.player1.clickCard(this.fray);
            expect(this.player1).toHavePrompt('Choose a character');
            this.player1.clickCard(this.chagatai);
            expect(this.player1).toHavePrompt('Which side should this character be on?');
            this.player1.clickPrompt('player1');

            expect(this.game.currentConflict.attackers).toContain(this.chagatai);
            expect(this.game.currentConflict.defenders).not.toContain(this.chagatai);

            expect(this.getChatLogs(3)).toContain('player1 plays Join the Fray to have Moto Chagatai join the conflict for player1!');
            expect(this.getChatLogs(2)).toContain('Military Air conflict - Attacker: 8 Defender: 0');
            expect(this.getChatLogs(1)).toContain('Attacker is winning the conflict - Shameful Display is breaking!');

            this.noMoreActions();
            this.player1.clickPrompt('No');
            this.player1.clickPrompt('Don\'t Resolve');
            expect(this.game.rings.air.claimedBy).toBe(this.player1.player.name);
        });

        it('should still be controlled by owner', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.adept],
                defenders: [],
                type: 'military',
                ring: 'air'
            });

            this.player2.pass();
            this.player1.clickCard(this.fray);
            expect(this.player1).toHavePrompt('Choose a character');
            this.player1.clickCard(this.chagatai);
            expect(this.player1).toHavePrompt('Which side should this character be on?');
            this.player1.clickPrompt('player2');

            this.player2.pass();
            this.player1.clickCard(this.jade);
            expect(this.player1).toBeAbleToSelect(this.chagatai);
            this.player1.clickCard(this.chagatai);
            expect(this.jade.location).toBe('play area');
        });

        describe('with emperor', function() {
            beforeEach(function() {
                this.youth.facedown = false;
                this.player2.moveCard(this.emperor, 'play area');
            });

            it('should count skill for opponent', function() {
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.adept],
                    defenders: [],
                    type: 'military',
                    ring: 'air'
                });

                this.player2.pass();
                this.player1.clickCard(this.fray);
                expect(this.player1).toHavePrompt('Choose a character');
                this.player1.clickCard(this.chagatai);
                expect(this.player1).toHavePrompt('Which side should this character be on?');
                this.player1.clickPrompt('player1');

                expect(this.player2).toHavePrompt('Triggered Abilities');
                expect(this.player2).toBeAbleToSelect(this.emperor);
                this.player2.clickCard(this.emperor);

                this.player2.clickCard(this.youth);
                this.player2.clickPrompt('player2');

                expect(this.game.currentConflict.attackers).not.toContain(this.youth);
                expect(this.game.currentConflict.defenders).toContain(this.youth);

                expect(this.getChatLogs(3)).toContain('player1 plays Join the Fray to have Moto Youth join the conflict for player2!');
                expect(this.getChatLogs(2)).toContain('Military Air conflict - Attacker: 2 Defender: 3');
                expect(this.getChatLogs(1)).toContain('Defender is winning the conflict');

                this.noMoreActions();
                expect(this.game.rings.air.claimedBy).toBe(this.player2.player.name);
            });

            it('should count skill for myself', function() {
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.adept],
                    defenders: [],
                    type: 'military',
                    ring: 'air'
                });

                this.player2.pass();
                this.player1.clickCard(this.fray);
                expect(this.player1).toHavePrompt('Choose a character');
                this.player1.clickCard(this.chagatai);
                expect(this.player1).toHavePrompt('Which side should this character be on?');
                this.player1.clickPrompt('player2');
                this.player2.clickCard(this.emperor);
                this.player2.clickCard(this.chagatai);
                this.player2.clickPrompt('player1');

                expect(this.game.currentConflict.attackers).toContain(this.chagatai);
                expect(this.game.currentConflict.defenders).not.toContain(this.chagatai);

                expect(this.getChatLogs(3)).toContain('player1 plays Join the Fray to have Moto Chagatai join the conflict for player1!');
                expect(this.getChatLogs(2)).toContain('Military Air conflict - Attacker: 8 Defender: 0');
                expect(this.getChatLogs(1)).toContain('Attacker is winning the conflict - Shameful Display is breaking!');

                this.noMoreActions();
                this.player1.clickPrompt('No');
                this.player1.clickPrompt('Don\'t Resolve');
                expect(this.game.rings.air.claimedBy).toBe(this.player1.player.name);
            });

            it('should still be controlled by owner', function() {
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.adept],
                    defenders: [],
                    type: 'military',
                    ring: 'air'
                });

                this.player2.pass();
                this.player1.clickCard(this.fray);
                expect(this.player1).toHavePrompt('Choose a character');
                this.player1.clickCard(this.chagatai);
                expect(this.player1).toHavePrompt('Which side should this character be on?');
                this.player1.clickPrompt('player2');
                this.player2.clickCard(this.emperor);
                this.player2.clickCard(this.chagatai);
                this.player2.clickPrompt('player2');
                this.player2.pass();
                this.player1.clickCard(this.jade);
                expect(this.player1).toBeAbleToSelect(this.chagatai);
                this.player1.clickCard(this.chagatai);
                expect(this.jade.location).toBe('play area');
            });
        });
    });
});

