describe('Ayubune Pilot', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['doji-hotaru', 'togashi-initiate'],
                    hand: ['ayubune-pilot']
                },
                player2: {
                    inPlay: ['akodo-toturi', 'doji-whisperer'],
                    hand: ['ayubune-pilot']
                }
            });

            this.hotaru = this.player1.findCardByName('doji-hotaru');
            this.initiate = this.player1.findCardByName('togashi-initiate');
            this.toturi = this.player2.findCardByName('akodo-toturi');
            this.whisperer = this.player2.findCardByName('doji-whisperer');

            this.scout = this.player1.findCardByName('ayubune-pilot');
            this.scout2 = this.player2.findCardByName('ayubune-pilot');

            this.player1.playAttachment(this.scout, this.hotaru);
        });

        it('should allow you to move into the conflict when ready', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.initiate],
                defenders: [this.toturi]
            });
            this.player2.pass();
            expect(this.hotaru.isParticipating()).toBe(false);
            this.player1.clickCard(this.scout);
            expect(this.hotaru.isParticipating()).toBe(true);
            expect(this.scout.location).toBe('conflict discard pile');
            expect(this.getChatLogs(5)).toContain('player1 uses Ayubune Pilot, sacrificing Ayubune Pilot to move Doji Hotaru into the conflict');
        });

        it('should not allow you to move into the conflict when bowed', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.initiate],
                defenders: [this.toturi]
            });
            this.hotaru.bow();
            this.player2.pass();
            expect(this.player1).toHavePrompt('Conflict Action Window');
            expect(this.hotaru.isParticipating()).toBe(false);
            this.player1.clickCard(this.scout);
            expect(this.hotaru.isParticipating()).toBe(false);
            expect(this.player1).toHavePrompt('Conflict Action Window');
            expect(this.scout.location).toBe('play area');
            expect(this.getChatLogs(5)).not.toContain('player1 uses Ayubune Pilot, sacrificing Ayubune Pilot to move Doji Hotaru into the conflict');
        });

        it('should not attach to opponent\'s characters', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.initiate],
                defenders: [this.toturi]
            });
            this.player2.clickCard(this.scout2);
            expect(this.player2).not.toBeAbleToSelect(this.hotaru);
            expect(this.player2).not.toBeAbleToSelect(this.initiate);
            expect(this.player2).toBeAbleToSelect(this.toturi);
            expect(this.player2).toBeAbleToSelect(this.whisperer);
        });
    });
});
