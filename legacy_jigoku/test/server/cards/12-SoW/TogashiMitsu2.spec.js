describe('Togashi Mitsu', function() {
    integration(function() {
        describe('Togashi Mitsu\'s constant ability', function() {
            beforeEach(function() {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['iuchi-shahai']
                    },
                    player2: {
                        inPlay: ['togashi-mitsu-2', 'doji-whisperer', 'tengu-sensei', 'doji-challenger'],
                        provinces: ['manicured-garden']
                    }
                });
                this.shahai = this.player1.findCardByName('iuchi-shahai');

                this.mitsu = this.player2.findCardByName('togashi-mitsu-2');
                this.whisperer = this.player2.findCardByName('doji-whisperer');
                this.tengu = this.player2.findCardByName('tengu-sensei');
                this.challenger = this.player2.findCardByName('doji-challenger');
                this.garden = this.player2.findCardByName('manicured-garden');
            });

            it('should not allow being chosen by covert', function() {
                this.noMoreActions();
                this.player1.clickRing('air');
                this.player1.clickCard(this.garden);
                this.player1.clickCard(this.shahai);
                this.player1.clickPrompt('Initiate Conflict');
                expect(this.player1).toHavePrompt('Choose covert target for Iuchi Shahai');
                expect(this.player1).not.toBeAbleToSelect(this.mitsu);
                expect(this.player1).toBeAbleToSelect(this.whisperer);
                expect(this.player1).not.toBeAbleToSelect(this.tengu);
                expect(this.player1).toBeAbleToSelect(this.challenger);
            });
        });

        describe('Togashi Mitsu\'s triggered ability', function() {
            beforeEach(function() {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['doji-challenger', 'doji-hotaru']
                    },
                    player2: {
                        inPlay: ['togashi-mitsu-2', 'doji-whisperer', 'asako-azunami'],
                        hand: ['a-new-name', 'a-new-name', 'a-new-name', 'a-new-name', 'a-new-name', 'vine-tattoo']
                    }
                });
                this.challenger = this.player1.findCardByName('doji-challenger');
                this.mitsu = this.player2.findCardByName('togashi-mitsu-2');
                this.whisperer = this.player2.findCardByName('doji-whisperer');
                this.azunami = this.player2.findCardByName('asako-azunami');
                this.vine = this.player2.findCardByName('vine-tattoo');

                this.player1.claimRing('fire');
                this.player2.claimRing('water');
            });

            it('should not allow triggering unless you have played 5 cards', function() {
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.challenger],
                    defenders: [this.mitsu],
                    type: 'military'
                });

                let i = 0;

                for(i = 0; i < 5; i++) {
                    expect(this.player2).toHavePrompt('Conflict Action Window');
                    this.player2.clickCard(this.mitsu);
                    expect(this.player2).toHavePrompt('Conflict Action Window');
                    this.player2.playAttachment(this.player2.filterCardsByName('a-new-name')[i], this.mitsu);
                    this.player1.pass();
                }

                expect(this.player2).toHavePrompt('Conflict Action Window');
                this.player2.clickCard(this.mitsu);
                expect(this.player2).toHavePrompt('Togashi Mitsu');
            });

            it('should not allow triggering if not participating', function() {
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.challenger],
                    defenders: [this.whisperer],
                    type: 'military'
                });

                let i = 0;

                for(i = 0; i < 5; i++) {
                    this.player2.playAttachment(this.player2.filterCardsByName('a-new-name')[i], this.mitsu);
                    this.player1.pass();
                }

                expect(this.player2).toHavePrompt('Conflict Action Window');
                this.player2.clickCard(this.mitsu);
                expect(this.player2).toHavePrompt('Conflict Action Window');
            });

            it('should let you resolve a legal ring effect', function() {
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.challenger],
                    defenders: [this.mitsu],
                    type: 'military'
                });

                let i = 0;

                for(i = 0; i < 5; i++) {
                    this.player2.playAttachment(this.player2.filterCardsByName('a-new-name')[i], this.mitsu);
                    this.player1.pass();
                }

                expect(this.player2).toHavePrompt('Conflict Action Window');
                this.player2.clickCard(this.mitsu);
                expect(this.player2).toHavePrompt('Choose a ring effect to resolve');
                expect(this.player2).toBeAbleToSelectRing('air');
                expect(this.player2).toBeAbleToSelectRing('earth');
                expect(this.player2).toBeAbleToSelectRing('fire');
                expect(this.player2).not.toBeAbleToSelectRing('void');
                expect(this.player2).toBeAbleToSelectRing('water');

                this.player2.clickRing('fire');
                expect(this.player2).toHavePrompt('Fire Ring');
                this.player2.clickCard(this.mitsu);
                this.player2.clickPrompt('Honor Togashi Mitsu');

                expect(this.mitsu.isHonored).toBe(true);
                expect(this.getChatLogs(5)).toContain('player2 uses Togashi Mitsu to resolve the Fire Ring\'s effect');
            });

            it('should allow ring replacement effects', function() {
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.challenger],
                    defenders: [this.mitsu],
                    type: 'military'
                });

                let i = 0;

                for(i = 0; i < 5; i++) {
                    this.player2.playAttachment(this.player2.filterCardsByName('a-new-name')[i], this.mitsu);
                    this.player1.pass();
                }

                this.player2.clickCard(this.mitsu);
                this.player2.clickRing('water');
                expect(this.player2).toHavePrompt('Triggered Abilities');
                expect(this.player2).toBeAbleToSelect(this.azunami);
                this.player2.clickCard(this.azunami);
                expect(this.player2).toHavePrompt('Asako Azunami');
            });

            it('reported bug - vine tattoo & water ring', function() {
                this.player2.moveCard(this.azunami, 'dynasty discard pile');
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.challenger],
                    defenders: [this.mitsu],
                    type: 'military'
                });

                this.player2.playAttachment(this.vine, this.mitsu);
                this.player1.pass();
                this.mitsu.bowed = true;

                let i = 0;

                for(i = 0; i < 5; i++) {
                    this.player2.playAttachment(this.player2.filterCardsByName('a-new-name')[i], this.mitsu);
                    this.player1.pass();
                }

                this.player2.clickCard(this.mitsu);
                this.player2.clickRing('water');
                expect(this.player2).toBeAbleToSelect(this.mitsu);
                this.player2.clickCard(this.mitsu);
                expect(this.mitsu.bowed).toBe(false);
                expect(this.getChatLogs(10)).toContain('player2 resolves the water ring, readying Togashi Mitsu');
            });
        });
    });
});
