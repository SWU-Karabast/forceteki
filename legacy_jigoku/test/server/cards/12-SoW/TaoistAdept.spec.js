describe('Taoist Adept', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['border-rider']
                },
                player2: {
                    inPlay: ['taoist-adept']
                }
            });

            this.borderRider = this.player1.findCardByName('border-rider');
            this.adept = this.player2.findCardByName('taoist-adept');
            this.player1.claimRing('fire');
        });

        it('should allow the winner to pick an unclaimed ring to receive a fate (opponent wins)', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.borderRider],
                defenders: [this.adept],
                type: 'military',
                ring: 'air'
            });

            let voidFate = this.game.rings.void.fate;
            let airFate = this.game.rings.air.fate;
            let earthFate = this.game.rings.earth.fate;
            let fireFate = this.game.rings.fire.fate;
            let waterFate = this.game.rings.water.fate;

            this.player2.clickCard(this.adept);
            this.player2.clickCard(this.borderRider);
            this.player2.clickPrompt('1');
            this.player1.clickPrompt('1');

            expect(this.getChatLogs(4)).toContain('Taoist Adept: 2 vs 3: Border Rider');
            expect(this.getChatLogs(3)).toContain('Duel Effect: choose whether to place a fate on a ring');
            expect(this.player1).toHavePrompt('Choose a ring to receive a fate');
            expect(this.player1).not.toBeAbleToSelectRing('air');
            expect(this.player1).toBeAbleToSelectRing('earth');
            expect(this.player1).not.toBeAbleToSelectRing('fire');
            expect(this.player1).toBeAbleToSelectRing('void');
            expect(this.player1).toBeAbleToSelectRing('water');
            expect(this.player1).toHavePromptButton('Done');

            this.player1.clickRing('void');
            expect(this.game.rings.void.fate).toBe(voidFate + 1);
            expect(this.game.rings.air.fate).toBe(airFate);
            expect(this.game.rings.earth.fate).toBe(earthFate);
            expect(this.game.rings.water.fate).toBe(waterFate);
            expect(this.game.rings.fire.fate).toBe(fireFate);

            expect(this.getChatLogs(3)).toContain('player1 places a fate on the Void Ring');
        });

        it('should allow the winner to pick an unclaimed ring to receive a fate (self wins)', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.borderRider],
                defenders: [this.adept],
                type: 'military',
                ring: 'air'
            });

            let voidFate = this.game.rings.void.fate;
            let airFate = this.game.rings.air.fate;
            let earthFate = this.game.rings.earth.fate;
            let fireFate = this.game.rings.fire.fate;
            let waterFate = this.game.rings.water.fate;

            this.player2.clickCard(this.adept);
            this.player2.clickCard(this.borderRider);
            this.player2.clickPrompt('5');
            this.player1.clickPrompt('1');

            expect(this.getChatLogs(4)).toContain('Taoist Adept: 6 vs 3: Border Rider');
            expect(this.getChatLogs(3)).toContain('Duel Effect: choose whether to place a fate on a ring');
            expect(this.player2).toHavePrompt('Choose a ring to receive a fate');
            expect(this.player2).not.toBeAbleToSelectRing('air');
            expect(this.player2).toBeAbleToSelectRing('earth');
            expect(this.player2).not.toBeAbleToSelectRing('fire');
            expect(this.player2).toBeAbleToSelectRing('void');
            expect(this.player2).toBeAbleToSelectRing('water');
            expect(this.player2).toHavePromptButton('Done');

            this.player2.clickRing('void');
            expect(this.game.rings.void.fate).toBe(voidFate + 1);
            expect(this.game.rings.air.fate).toBe(airFate);
            expect(this.game.rings.earth.fate).toBe(earthFate);
            expect(this.game.rings.water.fate).toBe(waterFate);
            expect(this.game.rings.fire.fate).toBe(fireFate);

            expect(this.getChatLogs(3)).toContain('player2 places a fate on the Void Ring');
        });

        it('should do nothing in a draw', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.borderRider],
                defenders: [this.adept],
                type: 'military',
                ring: 'air'
            });

            let voidFate = this.game.rings.void.fate;
            let airFate = this.game.rings.air.fate;
            let earthFate = this.game.rings.earth.fate;
            let fireFate = this.game.rings.fire.fate;
            let waterFate = this.game.rings.water.fate;

            this.player2.clickCard(this.adept);
            this.player2.clickCard(this.borderRider);
            this.player2.clickPrompt('2');
            this.player1.clickPrompt('1');

            expect(this.getChatLogs(4)).toContain('The duel ends in a draw');
            expect(this.getChatLogs(3)).toContain('The duel has no effect');
            expect(this.player1).toHavePrompt('Conflict Action Window');

            expect(this.game.rings.void.fate).toBe(voidFate);
            expect(this.game.rings.air.fate).toBe(airFate);
            expect(this.game.rings.earth.fate).toBe(earthFate);
            expect(this.game.rings.water.fate).toBe(waterFate);
            expect(this.game.rings.fire.fate).toBe(fireFate);
        });

        it('should allow the winner to decide not to put a fate on a ring (self wins)', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.borderRider],
                defenders: [this.adept],
                type: 'military',
                ring: 'air'
            });

            let voidFate = this.game.rings.void.fate;
            let airFate = this.game.rings.air.fate;
            let earthFate = this.game.rings.earth.fate;
            let fireFate = this.game.rings.fire.fate;
            let waterFate = this.game.rings.water.fate;

            this.player2.clickCard(this.adept);
            this.player2.clickCard(this.borderRider);
            this.player2.clickPrompt('5');
            this.player1.clickPrompt('1');

            expect(this.getChatLogs(4)).toContain('Taoist Adept: 6 vs 3: Border Rider');
            expect(this.getChatLogs(3)).toContain('Duel Effect: choose whether to place a fate on a ring');

            expect(this.player2).toHavePromptButton('Done');
            this.player2.clickPrompt('Done');

            expect(this.getChatLogs(3)).toContain('player2 chooses not to place a fate on a ring');
            expect(this.player1).toHavePrompt('Conflict Action Window');

            expect(this.game.rings.void.fate).toBe(voidFate);
            expect(this.game.rings.air.fate).toBe(airFate);
            expect(this.game.rings.earth.fate).toBe(earthFate);
            expect(this.game.rings.water.fate).toBe(waterFate);
            expect(this.game.rings.fire.fate).toBe(fireFate);
        });

        it('should allow the winner to decide not to put a fate on a ring (opponent wins)', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.borderRider],
                defenders: [this.adept],
                type: 'military',
                ring: 'air'
            });

            let voidFate = this.game.rings.void.fate;
            let airFate = this.game.rings.air.fate;
            let earthFate = this.game.rings.earth.fate;
            let fireFate = this.game.rings.fire.fate;
            let waterFate = this.game.rings.water.fate;

            this.player2.clickCard(this.adept);
            this.player2.clickCard(this.borderRider);
            this.player2.clickPrompt('1');
            this.player1.clickPrompt('1');

            expect(this.getChatLogs(4)).toContain('Taoist Adept: 2 vs 3: Border Rider');
            expect(this.getChatLogs(3)).toContain('Duel Effect: choose whether to place a fate on a ring');
            expect(this.player1).toHavePrompt('Choose a ring to receive a fate');
            expect(this.player1).toHavePromptButton('Done');
            this.player1.clickPrompt('Done');
            expect(this.getChatLogs(3)).toContain('player1 chooses not to place a fate on a ring');
            expect(this.player1).toHavePrompt('Conflict Action Window');

            expect(this.game.rings.void.fate).toBe(voidFate);
            expect(this.game.rings.air.fate).toBe(airFate);
            expect(this.game.rings.earth.fate).toBe(earthFate);
            expect(this.game.rings.water.fate).toBe(waterFate);
            expect(this.game.rings.fire.fate).toBe(fireFate);
        });
    });
});
