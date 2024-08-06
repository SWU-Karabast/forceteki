describe('Under Amaterasu\'s Gaze', function() {
    integration(function() {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['ikoma-prodigy', 'akodo-toturi', 'doji-kuwanan'],
                    hand: ['under-amaterasu-s-gaze','total-warfare', 'fine-katana']
                },
                player2: {
                    inPlay: ['matsu-tsuko-2'],
                    hand: ['let-go', 'ornate-fan'],
                    provinces: ['ancestral-lands', 'manicured-garden']
                }
            });

            this.gaze = this.player1.findCardByName('under-amaterasu-s-gaze');
            this.totalWarfare = this.player1.findCardByName('total-warfare');

            this.katana = this.player1.findCardByName('fine-katana');
            this.fan = this.player2.findCardByName('ornate-fan');

            this.kuwanan = this.player1.findCardByName('doji-kuwanan');
            this.prodigy = this.player1.findCardByName('ikoma-prodigy');
            this.toturi = this.player1.findCardByName('akodo-toturi');
            this.letGo = this.player2.findCardByName('let-go');
            this.tsuko = this.player2.findCardByName('matsu-tsuko-2');
            this.ancestralLands = this.player2.findCardByName('ancestral-lands');
            this.garden = this.player2.findCardByName('manicured-garden');
        });

        it('should be able to played on a province', function() {
            this.player1.playAttachment(this.gaze, this.ancestralLands);
            expect(this.gaze.parent).toBe(this.ancestralLands);
        });

        it('should be discarded if another battlefield is played', function() {
            this.player1.playAttachment(this.gaze, this.ancestralLands);
            expect(this.gaze.parent).toBe(this.ancestralLands);
            this.player2.pass();
            this.player1.playAttachment(this.totalWarfare, this.ancestralLands);
            expect(this.gaze.location).toBe('conflict discard pile');
        });

        it('should not attach to a broken province', function() {
            this.ancestralLands.isBroken = true;
            this.game.checkGameState(true);
            this.player1.clickCard(this.gaze);
            expect(this.player1).not.toBeAbleToSelect(this.ancestralLands);
            expect(this.player1).toBeAbleToSelect(this.garden);
        });

        it('should discard when the attached province is broken', function() {
            this.player1.clickCard(this.gaze);
            expect(this.player1).toBeAbleToSelect(this.ancestralLands);
            expect(this.player1).toBeAbleToSelect(this.garden);
            this.player1.clickCard(this.ancestralLands);

            this.noMoreActions();

            this.initiateConflict({
                attackers: [this.kuwanan],
                defenders: [],
                province: this.ancestralLands
            });

            this.noMoreActions();
            this.player1.clickPrompt('No');
            this.player1.clickPrompt('Don\'t Resolve');
            expect(this.gaze.location).toBe('conflict discard pile');
            expect(this.getChatLogs(10)).toContain('Under Amaterasu\'s Gaze is discarded from Ancestral Lands as it is no longer legally attached');
        });

        it('should make cards cost 1 more', function () {
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.kuwanan, this.prodigy, this.toturi],
                defenders: [this.tsuko],
                province: this.ancestralLands
            });

            this.player2.pass();
            this.player1.playAttachment(this.gaze, this.ancestralLands);

            this.player1.honor = 10;
            this.player2.honor = 10;
            this.game.checkGameState(true);

            let p1Fate = this.player1.fate;
            let p2Fate = this.player2.fate;

            this.player2.playAttachment(this.fan, this.tsuko);
            expect(this.player1.fate).toBe(p1Fate);
            expect(this.player2.fate).toBe(p2Fate - 1);

            this.player1.playAttachment(this.katana, this.kuwanan);
            expect(this.player1.fate).toBe(p1Fate - 1);
            expect(this.player2.fate).toBe(p2Fate - 1);
        });

        it('should not make cards cost 1 more if you have 5 more honor than opponent (self)', function () {
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.kuwanan, this.prodigy, this.toturi],
                defenders: [this.tsuko],
                province: this.ancestralLands
            });

            this.player2.pass();
            this.player1.playAttachment(this.gaze, this.ancestralLands);

            this.player1.honor = 15;
            this.player2.honor = 10;
            this.game.checkGameState(true);

            let p1Fate = this.player1.fate;
            let p2Fate = this.player2.fate;

            this.player2.playAttachment(this.fan, this.tsuko);
            expect(this.player1.fate).toBe(p1Fate);
            expect(this.player2.fate).toBe(p2Fate - 1);

            this.player1.playAttachment(this.katana, this.kuwanan);
            expect(this.player1.fate).toBe(p1Fate);
            expect(this.player2.fate).toBe(p2Fate - 1);
        });

        it('should not make cards cost 1 more if you have 5 more honor than opponent (opponent)', function () {
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.kuwanan, this.prodigy, this.toturi],
                defenders: [this.tsuko],
                province: this.ancestralLands
            });

            this.player2.pass();
            this.player1.playAttachment(this.gaze, this.ancestralLands);

            this.player1.honor = 10;
            this.player2.honor = 15;
            this.game.checkGameState(true);

            let p1Fate = this.player1.fate;
            let p2Fate = this.player2.fate;

            this.player2.playAttachment(this.fan, this.tsuko);
            expect(this.player1.fate).toBe(p1Fate);
            expect(this.player2.fate).toBe(p2Fate);

            this.player1.playAttachment(this.katana, this.kuwanan);
            expect(this.player1.fate).toBe(p1Fate - 1);
            expect(this.player2.fate).toBe(p2Fate);
        });

        it('should only work if the conflict is at the current province', function () {
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.kuwanan, this.prodigy, this.toturi],
                defenders: [this.tsuko],
                province: this.ancestralLands
            });

            this.player2.pass();
            this.player1.playAttachment(this.gaze, this.garden);

            this.player1.honor = 10;
            this.player2.honor = 10;
            this.game.checkGameState(true);

            let p1Fate = this.player1.fate;
            let p2Fate = this.player2.fate;

            this.player2.playAttachment(this.fan, this.tsuko);
            expect(this.player1.fate).toBe(p1Fate);
            expect(this.player2.fate).toBe(p2Fate);

            this.player1.playAttachment(this.katana, this.kuwanan);
            expect(this.player1.fate).toBe(p1Fate);
            expect(this.player2.fate).toBe(p2Fate);
        });
    });
});
