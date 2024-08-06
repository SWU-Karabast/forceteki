describe('Tainted Tokens', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['brash-samurai', 'doji-whisperer', 'bayushi-yojiro'],
                    hand: ['favored-mount']
                },
                player2: {
                    inPlay: ['hantei-sotorii', 'doomed-shugenja'],
                    hand: ['assassination']
                }
            });

            this.shameful = this.player2.findCardByName('shameful-display', 'province 1');
            this.shameful2 = this.player2.findCardByName('shameful-display', 'province 2');
            this.brash = this.player1.findCardByName('brash-samurai');
            this.whisperer = this.player1.findCardByName('doji-whisperer');
            this.mount = this.player1.findCardByName('favored-mount');
            this.yojiro = this.player1.findCardByName('bayushi-yojiro');

            this.sotorii = this.player2.findCardByName('hantei-sotorii');
            this.shugenja = this.player2.findCardByName('doomed-shugenja');
            this.assassination = this.player2.findCardByName('assassination');
        });

        it('should give tainted characters +2/+2', function() {
            let mil = this.brash.getMilitarySkill();
            let pol = this.brash.getPoliticalSkill();
            this.brash.taint();
            this.game.checkGameState(true);

            expect(this.brash.getMilitarySkill()).toBe(mil + 2);
            expect(this.brash.getPoliticalSkill()).toBe(pol + 2);
        });

        it('should stack with honored status tokens', function() {
            let mil = this.brash.getMilitarySkill();
            let pol = this.brash.getPoliticalSkill();
            this.brash.taint();
            this.brash.honor();
            this.game.checkGameState(true);

            expect(this.brash.getMilitarySkill()).toBe(mil + 4);
            expect(this.brash.getPoliticalSkill()).toBe(pol + 4);
        });

        it('should stack with dishonored status tokens', function() {
            let mil = this.whisperer.getMilitarySkill();
            let pol = this.whisperer.getPoliticalSkill();
            this.whisperer.taint();
            this.whisperer.dishonor();
            this.game.checkGameState(true);

            expect(this.whisperer.getMilitarySkill()).toBe(mil + 1);
            expect(this.whisperer.getPoliticalSkill()).toBe(pol + 1);
        });

        it('should give tainted provinces +2 strength', function() {
            let str = this.shameful.getStrength();
            this.shameful.taint();
            this.game.checkGameState(true);

            expect(this.shameful.getStrength()).toBe(str + 2);
        });

        it('should make you lose an honor if you defend on tainted province', function () {
            this.shameful.taint();
            let honor = this.player2.honor;

            this.noMoreActions();
            this.initiateConflict({
                type: 'political',
                attackers: [this.brash],
                defenders: [this.sotorii, this.shugenja],
                province: this.shameful
            });
            expect(this.getChatLogs(10)).toContain('player2 loses 1 honor in order to declare defending characters');
            expect(this.player2.honor).toBe(honor - 1);
        });

        it('should NOT make you lose an honor if you defend on non-tainted province', function () {
            this.shameful.taint();
            let honor = this.player2.honor;

            this.noMoreActions();
            this.initiateConflict({
                type: 'political',
                attackers: [this.brash],
                defenders: [this.sotorii, this.shugenja],
                province: this.shameful2
            });
            expect(this.player2.honor).toBe(honor);
        });

        it('should remove the token when the card leaves play (but not when a province flips faceup)', function () {
            this.shameful.taint();
            this.brash.taint();
            expect(this.shameful.isTainted).toBe(true);
            expect(this.shameful.facedown).toBe(true);
            this.noMoreActions();
            this.initiateConflict({
                type: 'political',
                attackers: [this.brash],
                defenders: [this.sotorii, this.shugenja],
                province: this.shameful
            });
            this.player2.clickCard(this.assassination);
            this.player2.clickCard(this.brash);
            expect(this.brash.isTainted).toBe(false);
            expect(this.shameful.isTainted).toBe(true);
            expect(this.shameful.facedown).toBe(false);
        });

        it('should make you lose an honor to assign a tainted character as an attacker or defender', function () {
            this.brash.taint();
            this.sotorii.taint();
            this.shugenja.taint();
            let honor1 = this.player1.honor;
            let honor2 = this.player2.honor;

            this.noMoreActions();
            this.initiateConflict({
                type: 'political',
                attackers: [this.brash, this.whisperer],
                defenders: [this.sotorii, this.shugenja],
                province: this.shameful
            });
            expect(this.getChatLogs(10)).toContain('player1 pays 1 honor to declare their attackers');
            expect(this.getChatLogs(10)).toContain('player2 pays 2 honor to declare their defenders');
            expect(this.player1.honor).toBe(honor1 - 1);
            expect(this.player2.honor).toBe(honor2 - 2);
        });

        it('should not make you lose an honor to move in a tainted character', function () {
            this.brash.taint();
            this.sotorii.taint();
            this.shugenja.taint();
            let honor1 = this.player1.honor;
            let honor2 = this.player2.honor;

            this.player1.playAttachment(this.mount, this.brash);

            this.noMoreActions();
            this.initiateConflict({
                type: 'political',
                attackers: [this.whisperer],
                defenders: [this.sotorii, this.shugenja],
                province: this.shameful
            });
            expect(this.getChatLogs(10)).not.toContain('player1 pays 1 honor to declare their attackers');
            expect(this.getChatLogs(10)).toContain('player2 pays 2 honor to declare their defenders');
            expect(this.player1.honor).toBe(honor1);
            expect(this.player2.honor).toBe(honor2 - 2);

            this.player2.pass();
            this.player1.clickCard(this.mount);
            expect(this.brash.isParticipating()).toBe(true);
            expect(this.player1.honor).toBe(honor1);
        });

        it('yojiro should prevent the honor loss to declare if he\'s participating (after attackers are declared)', function () {
            this.brash.taint();
            this.sotorii.taint();
            this.shugenja.taint();
            let honor1 = this.player1.honor;
            let honor2 = this.player2.honor;

            this.player1.playAttachment(this.mount, this.brash);

            this.noMoreActions();
            this.initiateConflict({
                type: 'political',
                attackers: [this.brash, this.yojiro],
                defenders: [this.sotorii, this.shugenja],
                province: this.shameful
            });
            expect(this.getChatLogs(10)).toContain('player1 pays 1 honor to declare their attackers');
            expect(this.getChatLogs(10)).not.toContain('player2 pays 2 honor to declare their defenders');
            expect(this.player1.honor).toBe(honor1 - 1);
            expect(this.player2.honor).toBe(honor2);
        });

        it('yojiro should not prevent the honor loss from the province', function () {
            this.shameful.taint();
            let honor = this.player2.honor;

            this.noMoreActions();
            this.initiateConflict({
                type: 'political',
                attackers: [this.brash, this.yojiro],
                defenders: [this.sotorii, this.shugenja],
                province: this.shameful
            });
            expect(this.getChatLogs(10)).toContain('player2 loses 1 honor in order to declare defending characters');
            expect(this.player2.honor).toBe(honor - 1);
        });
    });
});
