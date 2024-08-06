describe('Togashi Naname', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    fate: 20,
                    inPlay: ['doji-challenger', 'kakita-yoshi', 'daidoji-uji']
                },
                player2: {
                    inPlay: ['togashi-naname', 'shiba-tsukune']
                }
            });

            this.uji = this.player1.findCardByName('daidoji-uji');
            this.yoshi = this.player1.findCardByName('kakita-yoshi');
            this.challenger = this.player1.findCardByName('doji-challenger');

            this.tsukune = this.player2.findCardByName('shiba-tsukune');
            this.naname = this.player2.findCardByName('togashi-naname');

            this.yoshi.fate = 2;
        });

        it('should target a participating character with fate and a ring and give opponent a choice', function () {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.yoshi, this.uji],
                defenders: [this.naname, this.tsukune],
                ring: 'fire'
            });

            let cfate = this.yoshi.fate;
            let rFate = this.game.rings.air.fate;

            this.player2.clickCard(this.naname);
            expect(this.player2).toBeAbleToSelect(this.yoshi);
            expect(this.player2).not.toBeAbleToSelect(this.uji); // no fate
            expect(this.player2).not.toBeAbleToSelect(this.challenger);
            expect(this.player2).not.toBeAbleToSelect(this.naname);
            expect(this.player2).not.toBeAbleToSelect(this.tsukune);

            this.player2.clickCard(this.yoshi);

            expect(this.player2).toBeAbleToSelectRing('air');
            expect(this.player2).toBeAbleToSelectRing('earth');
            expect(this.player2).toBeAbleToSelectRing('water');
            expect(this.player2).toBeAbleToSelectRing('void');
            expect(this.player2).not.toBeAbleToSelectRing('fire');

            this.player2.clickRing('air');

            expect(this.player1).toHavePrompt('Select one');
            expect(this.player1).toHavePromptButton('Move a fate from Kakita Yoshi to the Air Ring');
            expect(this.player1).toHavePromptButton('Let Opponent Resolve the Air Ring');

            this.player1.clickPrompt('Move a fate from Kakita Yoshi to the Air Ring');

            expect(this.yoshi.fate).toBe(cfate - 1);
            expect(this.game.rings.air.fate).toBe(rFate + 1);

            expect(this.getChatLogs(10)).toContain(
                'player2 uses Togashi Naname to move 1 fate from Kakita Yoshi to Air Ring'
            );
        });

        it('resolving ring', function () {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.yoshi, this.uji],
                defenders: [this.naname, this.tsukune],
                ring: 'fire'
            });

            let cfate = this.yoshi.fate;
            let rFate = this.game.rings.air.fate;

            this.player2.clickCard(this.naname);
            this.player2.clickCard(this.yoshi);
            this.player2.clickRing('air');
            this.player1.clickPrompt('Let Opponent Resolve the Air Ring');

            let honor = this.player2.honor;
            expect(this.player2).toHavePrompt('Air Ring');
            this.player2.clickPrompt('Gain 2 honor');

            expect(this.player2.honor).toBe(honor + 2);
            expect(this.yoshi.fate).toBe(cfate);
            expect(this.game.rings.air.fate).toBe(rFate);

            expect(this.getChatLogs(10)).toContain('player2 uses Togashi Naname to resolve Air Ring effect');
            expect(this.getChatLogs(10)).toContain('player2 resolves the air ring, gaining 2 honor');
        });
    });
});