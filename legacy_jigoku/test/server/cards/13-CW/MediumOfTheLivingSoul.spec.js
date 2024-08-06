describe('Medium of the Living Soul', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['togashi-mitsu-2', 'medium-of-the-living-soul', 'maker-of-keepsakes', 'kami-unleashed', 'asako-azunami'],
                    hand: ['a-new-name', 'a-new-name', 'a-new-name', 'a-new-name', 'a-new-name']
                },
                player2: {
                }
            });

            this.mitsu = this.player1.findCardByName('togashi-mitsu-2');
            this.medium = this.player1.findCardByName('medium-of-the-living-soul');
            this.keepsakes = this.player1.findCardByName('maker-of-keepsakes');
            this.kami = this.player1.findCardByName('kami-unleashed');
            this.azunami = this.player1.findCardByName('asako-azunami');

            this.keepsakes.fate = 1;
        });

        it('should not work outside of conflicts', function() {
            expect(this.player1).toHavePrompt('Action Window');
            this.player1.clickCard(this.medium);
            expect(this.player1).toHavePrompt('Action Window');
        });

        it('should give a participating character an ability', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.keepsakes, this.mitsu],
                defenders: [],
                type: 'military'
            });

            this.player2.pass();
            this.player1.clickCard(this.medium);
            expect(this.player1).toHavePrompt('Choose a character');
            expect(this.player1).toBeAbleToSelect(this.mitsu);
            expect(this.player1).toBeAbleToSelect(this.keepsakes);
            expect(this.player1).not.toBeAbleToSelect(this.medium);
            expect(this.player1).not.toBeAbleToSelect(this.kami);
            expect(this.player1).not.toBeAbleToSelect(this.azunami);

            this.player1.clickCard(this.keepsakes);
            expect(this.getChatLogs(3)).toContain('player1 uses Medium of the Living Soul to give Maker of Keepsakes the ability to resolve a ring effect');
        });

        it('should allow resolving the ring effect again (Kami Unleashed)', function() {
            let honor = this.player1.honor;
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.keepsakes, this.kami],
                defenders: [],
                type: 'military',
                ring: 'air'
            });

            this.player2.pass();
            this.player1.clickCard(this.medium);
            this.player1.clickCard(this.keepsakes);
            this.player2.pass();
            this.player1.clickCard(this.kami);
            this.player1.clickPrompt('Gain 2 honor');
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.keepsakes);
            this.player1.clickCard(this.keepsakes);
            this.player1.clickPrompt('Gain 2 honor');
            expect(this.player1.honor).toBe(honor + 4);
            expect(this.keepsakes.fate).toBe(0);
            expect(this.getChatLogs(4)).toContain('player1 uses Maker of Keepsakes\'s gained ability from Medium of the Living Soul, removing 1 fate from Maker of Keepsakes to resolve Air Ring effect');
        });

        it('should allow resolving the ring effect again (Conflict Resolution)', function() {
            let honor = this.player1.honor;
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.keepsakes, this.kami],
                defenders: [],
                type: 'military',
                ring: 'air'
            });

            this.player2.pass();
            this.player1.clickCard(this.medium);
            this.player1.clickCard(this.keepsakes);
            this.noMoreActions();
            this.player1.clickPrompt('No');
            this.player1.clickPrompt('Gain 2 honor');
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.keepsakes);
            this.player1.clickCard(this.keepsakes);
            this.player1.clickPrompt('Gain 2 honor');
            expect(this.player1.honor).toBe(honor + 4);
            expect(this.getChatLogs(2)).toContain('player1 uses Maker of Keepsakes\'s gained ability from Medium of the Living Soul, removing 1 fate from Maker of Keepsakes to resolve Air Ring effect');
        });

        it('should allow resolving the ring effect again (Mitsu)', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.keepsakes, this.mitsu],
                defenders: [],
                type: 'military',
                ring: 'air'
            });

            this.player2.pass();
            this.player1.clickCard(this.medium);
            this.player1.clickCard(this.keepsakes);
            this.player2.pass();

            let i = 0;
            for(i = 0; i < 5; i++) {
                this.player1.playAttachment(this.player1.filterCardsByName('a-new-name')[i], this.mitsu);
                this.player2.pass();
            }

            let honor = this.player1.honor;
            let hand = this.player1.hand.length;

            this.player1.clickCard(this.mitsu);
            this.player1.clickRing('earth');
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.keepsakes);
            this.player1.clickCard(this.keepsakes);

            expect(this.player1.hand.length).toBe(hand + 2);
            expect(this.player1.honor).toBe(honor);
        });

        it('should allow replacement effects', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.keepsakes, this.mitsu],
                defenders: [],
                type: 'military',
                ring: 'air'
            });

            this.player2.pass();
            this.player1.clickCard(this.medium);
            this.player1.clickCard(this.keepsakes);
            this.player2.pass();

            let i = 0;
            for(i = 0; i < 5; i++) {
                this.player1.playAttachment(this.player1.filterCardsByName('a-new-name')[i], this.mitsu);
                this.player2.pass();
            }

            this.player1.clickCard(this.mitsu);
            this.player1.clickRing('water');
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.azunami);
            this.player1.pass();
            this.player1.clickCard(this.mitsu);
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.keepsakes);
            this.player1.clickCard(this.keepsakes);
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.azunami);
            this.player1.clickCard(this.azunami);
            expect(this.player1).toHavePrompt('Asako Azunami');
        });

        it('should not trigger if character has no fate', function() {
            this.keepsakes.fate = 0;
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.keepsakes, this.kami],
                defenders: [],
                type: 'military',
                ring: 'air'
            });

            this.player2.pass();
            this.player1.clickCard(this.medium);
            this.player1.clickCard(this.keepsakes);
            this.player2.pass();
            this.player1.clickCard(this.kami);
            this.player1.clickPrompt('Gain 2 honor');
            expect(this.player1).not.toHavePrompt('Triggered Abilities');
            expect(this.player2).toHavePrompt('Conflict Action Window');
        });
    });
});
