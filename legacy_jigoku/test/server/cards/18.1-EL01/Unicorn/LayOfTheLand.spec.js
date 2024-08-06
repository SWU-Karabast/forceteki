describe('Lay of the Land', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['student-of-war'],
                    hand: ['lay-of-the-land'],
                    provinces: ['elemental-fury', 'temple-of-the-dragons']
                },
                player2: {
                    inPlay: ['shinjo-outrider'],
                    provinces: ['brushfires', 'khan-s-ordu', 'market-of-kaze-no-kami', 'manicured-garden']
                }
            });

            this.studentOfWar = this.player1.findCardByName('student-of-war');
            this.land = this.player1.findCardByName('lay-of-the-land');

            this.outrider = this.player2.findCardByName('shinjo-outrider');

            this.fury = this.player1.findCardByName('elemental-fury');
            this.temple = this.player1.findCardByName('temple-of-the-dragons');

            this.brushfires = this.player2.findCardByName('brushfires');
            this.khans = this.player2.findCardByName('khan-s-ordu');
            this.market = this.player2.findCardByName('market-of-kaze-no-kami');
            this.garden = this.player2.findCardByName('manicured-garden');
            this.sd = this.player2.findCardByName('shameful-display', 'stronghold province');

            this.brushfires.facedown = true;
            this.garden.facedown = false;
            this.fury.facedown = false;
            this.garden.isBroken = true;
            this.game.checkGameState(true);

            this.studentOfWar.fate = 5;
        });

        it('should prompt to choose an unbroken non-sh province', function () {
            this.player1.clickCard(this.land);
            expect(this.player1).toHavePrompt('Choose an unbroken province');
            expect(this.player1).toBeAbleToSelect(this.fury);
            expect(this.player1).toBeAbleToSelect(this.temple);

            expect(this.player1).toBeAbleToSelect(this.brushfires);
            expect(this.player1).toBeAbleToSelect(this.khans);
            expect(this.player1).toBeAbleToSelect(this.market);
            expect(this.player1).not.toBeAbleToSelect(this.garden); // broken
            expect(this.player1).not.toBeAbleToSelect(this.sd); // sh

            this.player1.clickCard(this.brushfires);
            expect(this.brushfires.facedown).toBe(false);
            expect(this.getChatLogs(5)).toContain('player1 plays Lay of the Land to reveal province 1');
        });

        it('turns facedown a revealed province', function () {
            this.player1.clickCard(this.land);
            this.player1.clickCard(this.fury);
            expect(this.fury.facedown).toBe(true);
            expect(this.getChatLogs(5)).toContain('player1 plays Lay of the Land to flip facedown Elemental Fury');
        });

        it('reveals a facedown province', function () {
            this.player1.clickCard(this.land);
            this.player1.clickCard(this.brushfires);
            expect(this.brushfires.facedown).toBe(false);
            expect(this.getChatLogs(5)).toContain('player1 plays Lay of the Land to reveal province 1');
        });

        it('should not work in a conflict', function () {
            this.garden.isBroken = false;

            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.studentOfWar],
                defenders: [],
                province: this.garden
            });

            this.player2.pass();
            expect(this.player1).toHavePrompt('Conflict Action Window');
            this.player1.clickCard(this.land);
            expect(this.player1).toHavePrompt('Conflict Action Window');
        });
    });
});