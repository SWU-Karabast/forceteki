describe('Way Station Trader', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    fate: 5,
                    inPlay: ['way-station-trader', 'shinjo-outrider'],
                    provinces: ['pilgrimage', 'kuroi-mori'],
                    hand: ['talisman-of-the-sun']
                },
                player2: {
                    fate: 5,
                    inPlay: ['akodo-toturi']
                }
            });

            this.trader = this.player1.findCardByName('way-station-trader');
            this.outrider = this.player1.findCardByName('shinjo-outrider');
            this.pilgrimage = this.player1.findCardByName('pilgrimage');
            this.kuroiMori = this.player1.findCardByName('kuroi-mori');
            this.talisman = this.player1.findCardByName('talisman-of-the-sun');

            this.toturi = this.player2.findCardByName('akodo-toturi');

            this.player1.playAttachment(this.talisman, this.trader);
        });

        it('should activate when this character reveals a province when attacking', function () {
            let p1Fate = this.player1.fate;
            let p2Fate = this.player2.fate;

            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.trader]
            });
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.trader);
            this.player1.clickCard(this.trader);

            expect(this.player1.fate).toBe(p1Fate + 1);
            expect(this.player2.fate).toBe(p2Fate - 1);

            expect(this.getChatLogs(2)).toContain('player1 uses Way Station Trader to take 1 fate from player2');
        });

        it('should not activate when opponent has no fate', function () {
            this.player2.fate = 0;

            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.trader]
            });
            expect(this.player1).not.toHavePrompt('Triggered Abilities');
        });

        it('should not activate when this character is not participating', function () {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.outrider]
            });
            expect(this.player1).not.toHavePrompt('Triggered Abilities');
        });

        it('should activate when a province is revealed mid-conflict', function () {
            let p1Fate = this.player1.fate;
            let p2Fate = this.player2.fate;

            this.noMoreActions();
            this.player1.passConflict();
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.toturi],
                defenders: [this.trader],
                province: this.kuroiMori
            });

            this.player1.clickCard(this.talisman);
            this.player1.clickCard(this.pilgrimage);

            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.trader);
            this.player1.clickCard(this.trader);

            expect(this.player1.fate).toBe(p1Fate + 1);
            expect(this.player2.fate).toBe(p2Fate - 1);

            expect(this.getChatLogs(3)).toContain('player1 uses Way Station Trader to take 1 fate from player2');
        });
    });
});
