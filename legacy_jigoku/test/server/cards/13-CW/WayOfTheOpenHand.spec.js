describe('Way of the Open Hand', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['matsu-tsuko-2', 'akodo-toturi'],
                    hand: ['way-of-the-open-hand']
                },
                player2: {
                    inPlay: ['mirumoto-raitsugu']
                }
            });

            this.matsuTsuko = this.player1.findCardByName('matsu-tsuko-2');
            this.akodoToturi = this.player1.findCardByName('akodo-toturi');
            this.way = this.player1.findCardByName('way-of-the-open-hand');

            this.mirumotoRaitsugu = this.player2.findCardByName('mirumoto-raitsugu');
            this.p1 = this.player2.findCardByName('shameful-display', 'province 1');
            this.p2 = this.player2.findCardByName('shameful-display', 'province 2');
            this.p3 = this.player2.findCardByName('shameful-display', 'province 3');
            this.p4 = this.player2.findCardByName('shameful-display', 'province 4');
            this.pStronghold = this.player2.findCardByName('shameful-display', 'stronghold province');
        });

        it ('should do nothing outside of a conflict', function() {
            expect(this.player1).toHavePrompt('Action Window');
            this.player1.clickCard(this.way);
            expect(this.player1).toHavePrompt('Action Window');
        });

        it('should allow you to send home an opponents character and place a fate on it', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.matsuTsuko],
                defenders: [this.mirumotoRaitsugu],
                province: this.p1
            });

            let fate = this.mirumotoRaitsugu.fate;

            this.player2.pass();
            this.player1.clickCard(this.way);
            expect(this.player1).toBeAbleToSelect(this.mirumotoRaitsugu);
            expect(this.player1).not.toBeAbleToSelect(this.matsuTsuko);
            this.player1.clickCard(this.mirumotoRaitsugu);
            expect(this.mirumotoRaitsugu.inConflict).toBe(false);
            expect(this.mirumotoRaitsugu.fate).toBe(fate + 1);
            expect(this.getChatLogs(3)).toContain('player1 plays Way of the Open Hand to send home and place a fate on Mirumoto Raitsugu');
        });

        it('should not work at the stronghold', function() {
            this.p1.isBroken = true;
            this.p2.isBroken = true;
            this.p3.isBroken = true;
            this.game.checkGameState(true);

            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.matsuTsuko],
                defenders: [this.mirumotoRaitsugu],
                province: this.pStronghold
            });

            this.player2.pass();
            expect(this.player1).toHavePrompt('Conflict Action Window');
            this.player1.clickCard(this.way);
            expect(this.player1).toHavePrompt('Conflict Action Window');
        });

        it('should work on defense', function() {
            this.noMoreActions();
            this.player1.passConflict();
            this.noMoreActions();

            this.initiateConflict({
                attackers: [this.mirumotoRaitsugu],
                defenders: [this.matsuTsuko]
            });

            let fate = this.mirumotoRaitsugu.fate;

            this.player1.clickCard(this.way);
            expect(this.player1).toBeAbleToSelect(this.mirumotoRaitsugu);
            expect(this.player1).not.toBeAbleToSelect(this.matsuTsuko);
            this.player1.clickCard(this.mirumotoRaitsugu);
            expect(this.mirumotoRaitsugu.inConflict).toBe(false);
            expect(this.mirumotoRaitsugu.fate).toBe(fate + 1);
            expect(this.getChatLogs(3)).toContain('player1 plays Way of the Open Hand to send home and place a fate on Mirumoto Raitsugu');
        });
    });
});
