describe('Daikyu', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['doji-hotaru', 'togashi-initiate'],
                    hand: ['daikyu']
                },
                player2: {
                    inPlay: ['akodo-toturi', 'doji-whisperer'],
                    hand: ['daikyu', 'favored-mount']
                }
            });

            this.hotaru = this.player1.findCardByName('doji-hotaru');
            this.initiate = this.player1.findCardByName('togashi-initiate');
            this.toturi = this.player2.findCardByName('akodo-toturi');
            this.whisperer = this.player2.findCardByName('doji-whisperer');

            this.daikyu1 = this.player1.findCardByName('daikyu');
            this.daikyu2 = this.player2.findCardByName('daikyu');
            this.mount = this.player2.findCardByName('favored-mount');

            this.player1.playAttachment(this.daikyu1, this.hotaru);
            this.player2.playAttachment(this.daikyu2, this.toturi);
            this.player1.pass();
            this.player2.playAttachment(this.mount, this.whisperer);
        });

        it('should give +2 mil when first player', function() {
            expect(this.hotaru.getMilitarySkill()).toBe(3 + 2);
            expect(this.toturi.getMilitarySkill()).toBe(6 + 0);
        });

        it('should react when attackers are assigned', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.hotaru, this.initiate]
            });
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.hotaru);
            this.player1.clickCard(this.hotaru);
            expect(this.player1).toBeAbleToSelect(this.initiate);
            this.player1.clickCard(this.initiate);
            expect(this.initiate.bowed).toBe(true);
            expect(this.getChatLogs(5)).toContain('player1 uses Doji Hotaru\'s gained ability from Daikyū to bow Togashi Initiate');
        });

        it('should react when defenders are assigned', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.hotaru, this.initiate]
            });
            expect(this.player1).toHavePrompt('Triggered Abilities');
            this.player1.pass();
            this.player2.clickCard(this.toturi);
            this.player2.clickPrompt('Done');
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.hotaru);
            this.player1.clickCard(this.hotaru);
            expect(this.player1).not.toBeAbleToSelect(this.hotaru);
            expect(this.player1).not.toBeAbleToSelect(this.toturi);
            expect(this.player1).toBeAbleToSelect(this.initiate);
            expect(this.player1).not.toBeAbleToSelect(this.whisperer);
            this.player1.clickCard(this.initiate);
            expect(this.initiate.bowed).toBe(true);
            expect(this.getChatLogs(5)).toContain('player1 uses Doji Hotaru\'s gained ability from Daikyū to bow Togashi Initiate');
            expect(this.player2).toHavePrompt('Triggered Abilities');
            expect(this.player2).toBeAbleToSelect(this.toturi);
            this.player2.clickCard(this.toturi);
            expect(this.player2).toBeAbleToSelect(this.hotaru);
            expect(this.player2).not.toBeAbleToSelect(this.toturi);
            expect(this.player2).not.toBeAbleToSelect(this.initiate);
            expect(this.player2).not.toBeAbleToSelect(this.whisperer);
            this.player2.clickCard(this.hotaru);
            expect(this.hotaru.bowed).toBe(true);
            expect(this.getChatLogs(5)).toContain('player2 uses Akodo Toturi\'s gained ability from Daikyū to bow Doji Hotaru');
        });

        it('should react when characters move in', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.hotaru, this.initiate]
            });
            expect(this.player1).toHavePrompt('Triggered Abilities');
            this.player1.pass();
            this.player2.clickCard(this.toturi);
            this.player2.clickPrompt('Done');
            expect(this.player1).toHavePrompt('Triggered Abilities');
            this.player1.pass();
            expect(this.player2).toHavePrompt('Triggered Abilities');
            this.player2.pass();

            expect(this.player2).toHavePrompt('Conflict Action Window');
            this.player2.clickCard(this.mount);

            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.hotaru);
            this.player1.clickCard(this.hotaru);
            expect(this.player1).not.toBeAbleToSelect(this.hotaru);
            expect(this.player1).not.toBeAbleToSelect(this.toturi);
            expect(this.player1).toBeAbleToSelect(this.initiate);
            expect(this.player1).toBeAbleToSelect(this.whisperer);
            this.player1.clickCard(this.whisperer);
            expect(this.whisperer.bowed).toBe(true);

            expect(this.player2).toHavePrompt('Triggered Abilities');
            expect(this.player2).toBeAbleToSelect(this.toturi);
            this.player2.clickCard(this.toturi);
            expect(this.player2).toBeAbleToSelect(this.hotaru);
            expect(this.player2).not.toBeAbleToSelect(this.toturi);
            expect(this.player2).toBeAbleToSelect(this.initiate);
            expect(this.player2).not.toBeAbleToSelect(this.whisperer);
            this.player2.clickCard(this.hotaru);
            expect(this.hotaru.bowed).toBe(true);
        });
    });
});
