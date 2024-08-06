describe('Province Card - Turning Provinces Facedown with Tokens Tests', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['traveling-philosopher'],
                    dynastyDiscard: ['togashi-ichi'],
                    provinces: ['manicured-garden', 'public-forum', 'rally-to-the-cause'],
                    role: ['keeper-of-water']
                },
                player2: {
                    inPlay: ['doji-kuwanan'],
                    conflictDiscard: ['return-from-shadows'],
                    provinces: ['fertile-fields']
                }
            });

            this.forum = this.player1.findCardByName('public-forum');
            this.manicured = this.player1.findCardByName('manicured-garden');
            this.travelingPhilosopher = this.player1.findCardByName('traveling-philosopher');
            this.ichi = this.player1.placeCardInProvince('togashi-ichi', 'province 1');

            this.kuwanan = this.player2.findCardByName('doji-kuwanan');
            this.shadows = this.player2.findCardByName('return-from-shadows');
            this.fertile = this.player2.findCardByName('fertile-fields');
            this.rally = this.player1.findCardByName('rally-to-the-cause');
        });

        it('provinces turned facedown should lose tokens', function() {
            this.noMoreActions();
            this.player1.passConflict();
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.kuwanan],
                defenders: [],
                province: this.forum,
                ring: 'air'
            });
            this.noMoreActions();
            this.player1.clickCard(this.forum);
            this.player2.clickPrompt('Don\'t Resolve');

            expect(this.forum.hasToken('honor')).toBe(true);
            expect(this.forum.getTokenCount('honor')).toBe(1);

            this.player1.clickCard(this.ichi);
            this.player1.clickCard(this.travelingPhilosopher);
            this.player1.clickCard(this.travelingPhilosopher);
            this.player1.clickCard(this.forum);

            expect(this.forum.hasToken('honor')).toBe(false);
            expect(this.forum.getTokenCount('honor')).toBe(0);
        });

        it('provinces turned facedown with reactions to being revealed should react immediately - conflict at province', function() {
            this.noMoreActions();
            this.player1.passConflict();
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.kuwanan],
                province: this.rally,
                type: 'military',
                ring: 'air'
            });
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.rally);
            expect(this.game.currentConflict.conflictType).toBe('military');
            this.player1.clickCard(this.rally);
            expect(this.game.currentConflict.conflictType).toBe('political');

            this.player1.clickPrompt('Done');

            this.player1.clickCard(this.ichi);
            this.player1.clickCard(this.travelingPhilosopher);
            this.player1.clickCard(this.travelingPhilosopher);
            this.player1.clickCard(this.rally);

            expect(this.getChatLogs(5)).toContain('Rally to the Cause is immediately revealed again!');
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.rally);
            expect(this.game.currentConflict.conflictType).toBe('political');
            this.player1.clickCard(this.rally);
            expect(this.game.currentConflict.conflictType).toBe('military');
        });

        it('provinces turned facedown should lose tokens - conflict at province', function() {
            this.noMoreActions();
            this.player1.passConflict();
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.kuwanan],
                defenders: [],
                province: this.forum,
                ring: 'air'
            });
            this.noMoreActions();
            this.player1.clickCard(this.forum);
            this.player2.clickPrompt('Don\'t Resolve');
            this.kuwanan.bowed = false;
            this.noMoreActions();
            this.player1.passConflict();
            this.noMoreActions();

            expect(this.forum.hasToken('honor')).toBe(true);
            expect(this.forum.getTokenCount('honor')).toBe(1);

            this.initiateConflict({
                attackers: [this.kuwanan],
                defenders: [],
                province: this.forum,
                type: 'political',
                ring: 'fire'
            });

            this.player1.clickCard(this.ichi);
            this.player1.clickCard(this.travelingPhilosopher);
            this.player1.clickCard(this.travelingPhilosopher);
            this.player1.clickCard(this.forum);

            expect(this.forum.hasToken('honor')).toBe(false);
            expect(this.forum.getTokenCount('honor')).toBe(0);

            expect(this.getChatLogs(5)).toContain('Public Forum is immediately revealed again!');
        });

        it('province should lose dishonor token', function() {
            this.noMoreActions();
            this.player2.moveCard(this.shadows, 'hand');
            this.player1.passConflict();
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.kuwanan],
                defenders: [],
                province: this.forum,
                ring: 'air'
            });
            this.noMoreActions();
            this.player2.clickCard(this.shadows);
            this.player2.clickCard(this.manicured);
            this.player1.clickCard(this.forum);
            this.player2.clickPrompt('Don\'t Resolve');

            expect(this.manicured.isDishonored).toBe(true);
            expect(this.manicured.facedown).toBe(false);

            this.player1.clickCard(this.ichi);
            this.player1.clickCard(this.travelingPhilosopher);
            this.player1.clickCard(this.travelingPhilosopher);
            this.player1.clickCard(this.manicured);

            expect(this.manicured.isDishonored).toBe(false);
            expect(this.manicured.facedown).toBe(true);
        });
    });
});
