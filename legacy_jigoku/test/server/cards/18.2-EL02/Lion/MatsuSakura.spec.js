describe('Matsu Sakura', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['doji-kuwanan', 'matsu-sakura'],
                    hand: ['let-go', 'fine-katana', 'fine-katana', 'fine-katana', 'fine-katana']
                },
                player2: {
                    provinces: ['midnight-revels', 'restoration-of-balance', 'manicured-garden', 'magistrate-station'],
                    dynastyDiscard: ['iron-mine']
                }
            });

            this.kuwanan = this.player1.findCardByName('doji-kuwanan');
            this.sakura = this.player1.findCardByName('matsu-sakura');

            this.revels = this.player2.findCardByName('midnight-revels', 'province 1');
            this.restoration = this.player2.findCardByName('restoration-of-balance', 'province 2');
            this.manicuredGarden = this.player2.findCardByName('manicured-garden', 'province 3');
            this.station = this.player2.findCardByName('magistrate-station', 'province 4');
            this.sd = this.player2.findCardByName('shameful-display', 'stronghold province');

            this.mine = this.player2.findCardByName('iron-mine');
        });

        it('should trigger for reactions', function() {
            this.player2.placeCardInProvince(this.mine, this.revels.location);
            this.mine.facedown = false;

            this.noMoreActions();

            this.initiateConflict({
                attackers: [this.sakura],
                type: 'military',
                province: this.revels
            });

            expect(this.player2).toHavePrompt('Triggered Abilities');
            this.player2.clickCard(this.revels);
            this.player2.clickCard(this.kuwanan);
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.sakura);
            this.player1.clickCard(this.sakura);

            expect(this.getChatLogs(10)).toContain('player2 uses Midnight Revels to bow Doji Kuwanan');
            expect(this.getChatLogs(10)).toContain('player1 uses Matsu Sakura to cancel the effects of Midnight Revels\'s ability');
            expect(this.kuwanan.bowed).toBe(false);
        });

        it('should not trigger without a faceup card', function() {
            this.player2.placeCardInProvince(this.mine, this.revels.location);
            this.mine.facedown = true;

            this.noMoreActions();

            this.initiateConflict({
                attackers: [this.sakura],
                type: 'military',
                province: this.revels
            });

            expect(this.player2).toHavePrompt('Triggered Abilities');
            this.player2.clickCard(this.revels);
            this.player2.clickCard(this.kuwanan);
            expect(this.player1).not.toHavePrompt('Triggered Abilities');

            expect(this.getChatLogs(10)).toContain('player2 uses Midnight Revels to bow Doji Kuwanan');
            expect(this.kuwanan.bowed).toBe(true);
        });

        it('should not trigger if not attacking', function() {
            this.player2.placeCardInProvince(this.mine, this.revels.location);
            this.mine.facedown = false;

            this.noMoreActions();

            this.initiateConflict({
                attackers: [this.kuwanan],
                type: 'military',
                province: this.revels
            });

            expect(this.player2).toHavePrompt('Triggered Abilities');
            this.player2.clickCard(this.revels);
            this.player2.clickCard(this.kuwanan);
            expect(this.player1).not.toHavePrompt('Triggered Abilities');

            expect(this.getChatLogs(10)).toContain('player2 uses Midnight Revels to bow Doji Kuwanan');
            expect(this.kuwanan.bowed).toBe(true);
        });

        it('should not trigger if not attacked province', function() {
            this.player2.placeCardInProvince(this.mine, this.station.location);
            this.mine.facedown = false;
            this.station.facedown = false;

            this.kuwanan.bow();
            this.kuwanan.honor();

            this.noMoreActions();

            this.initiateConflict({
                attackers: [this.sakura],
                defenders: [],
                type: 'military',
                province: this.manicuredGarden
            });

            expect(this.kuwanan.bowed).toBe(true);
            this.player2.clickCard(this.station);
            this.player2.clickCard(this.kuwanan);
            expect(this.player1).not.toHavePrompt('Triggered Abilities');
            expect(this.kuwanan.bowed).toBe(false);
        });

        it('should work with interrupts', function() {
            this.player2.placeCardInProvince(this.mine, this.restoration.location);
            this.mine.facedown = false;

            this.noMoreActions();

            this.initiateConflict({
                attackers: [this.kuwanan, this.sakura],
                defenders: [],
                type: 'military',
                province: this.restoration
            });

            this.noMoreActions();
            expect(this.player2).toHavePrompt('Triggered Abilities');
            this.player2.clickCard(this.restoration);
            expect(this.player1).toHavePrompt('Triggered Abilities');
            this.player1.clickCard(this.sakura);
            expect(this.getChatLogs(10)).toContain('player1 uses Matsu Sakura to cancel the effects of Restoration of Balance\'s ability');
        });

        it('should work with actions', function() {
            this.player2.placeCardInProvince(this.mine, this.manicuredGarden.location);
            this.mine.facedown = false;

            this.noMoreActions();

            this.initiateConflict({
                attackers: [this.kuwanan, this.sakura],
                defenders: [],
                type: 'military',
                province: this.manicuredGarden
            });

            this.player2.clickCard(this.manicuredGarden);
            expect(this.player1).toHavePrompt('Triggered Abilities');
            this.player1.clickCard(this.sakura);
            expect(this.getChatLogs(10)).toContain('player1 uses Matsu Sakura to cancel the effects of Manicured Garden\'s ability');
        });

        it('should stop the Stronghold', function() {
            this.manicuredGarden.isBroken = true;
            this.revels.isBroken = true;
            this.restoration.isBroken = true;

            this.noMoreActions();

            this.initiateConflict({
                attackers: [this.kuwanan, this.sakura],
                defenders: [],
                type: 'military',
                province: this.sd
            });

            this.player2.clickCard(this.sd);
            this.player2.clickCard(this.kuwanan);
            this.player2.clickCard(this.sakura);
            this.player2.clickPrompt('Done');
            expect(this.player1).toHavePrompt('Triggered Abilities');
            this.player1.clickCard(this.sakura);
            expect(this.getChatLogs(10)).toContain('player1 uses Matsu Sakura to cancel the effects of Shameful Display\'s ability');
        });
    });
});
