describe('Prepared Ambush', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['akodo-zentaro', 'matsu-berserker', 'doji-whisperer', 'moto-chagatai'],
                    hand: ['prepared-ambush','total-warfare']
                },
                player2: {
                    inPlay: ['samurai-of-integrity', 'akodo-toturi'],
                    hand: ['let-go', 'calling-in-favors'],
                    provinces: ['ancestral-lands', 'manicured-garden']
                }
            });

            this.matsuBerseker = this.player1.placeCardInProvince('matsu-berserker', 'province 2');
            this.whisperer = this.player1.placeCardInProvince('doji-whisperer', 'province 1');
            this.zentaro = this.player1.findCardByName('akodo-zentaro');
            this.preparedAmbush = this.player1.findCardByName('prepared-ambush');
            this.totalWarfare2 = this.player1.findCardByName('total-warfare');
            this.chagatai = this.player1.findCardByName('moto-chagatai');

            this.samuraiOfIntegrity = this.player2.placeCardInProvince('samurai-of-integrity', 'province 1');
            this.akodoToturi = this.player2.findCardByName('akodo-toturi');
            this.ancestralLands = this.player2.findCardByName('ancestral-lands');
            this.garden = this.player2.findCardByName('manicured-garden');
            this.letGo = this.player2.findCardByName('let-go');
            this.cif = this.player2.findCardByName('calling-in-favors');

            this.matsuBerseker.facedown = false;
            this.whisperer.facedown = false;
            this.samuraiOfIntegrity.facedown = false;
        });

        it('should be able to played on a province', function() {
            this.player1.playAttachment(this.preparedAmbush, this.ancestralLands);
            expect(this.preparedAmbush.parent).toBe(this.ancestralLands);
        });

        it('should allow you to play characters during conflicts at the attached province', function() {
            this.noMoreActions();

            this.initiateConflict({
                attackers: [this.zentaro, this.matsuBerseker],
                defenders: [this.akodoToturi],
                province: this.ancestralLands
            });

            this.player2.pass();
            expect(this.player1).toHavePrompt('Conflict Action Window');
            this.player1.clickCard(this.matsuBerseker);
            expect(this.player1).toHavePrompt('Conflict Action Window');
            this.player1.playAttachment(this.preparedAmbush, this.ancestralLands);
            this.player2.pass();
            this.player1.clickCard(this.matsuBerseker);
            expect(this.player1).toHavePrompt('Choose additional fate');
            this.player1.clickPrompt('0');
            expect(this.matsuBerseker.location).toBe('play area');
            expect(this.game.currentConflict.attackers).toContain(this.matsuBerseker);

            expect(this.getChatLogs(3)).toContain('player1 plays Matsu Berserker into the conflict with 0 additional fate');
        });

        it('should not allow you to play characters during conflicts at the non-attached province', function() {
            this.noMoreActions();

            this.initiateConflict({
                attackers: [this.zentaro, this.matsuBerseker],
                defenders: [this.akodoToturi],
                province: this.garden
            });

            this.player2.pass();
            expect(this.player1).toHavePrompt('Conflict Action Window');
            this.player1.clickCard(this.matsuBerseker);
            expect(this.player1).toHavePrompt('Conflict Action Window');
            this.player1.playAttachment(this.preparedAmbush, this.ancestralLands);
            this.player2.pass();
            this.player1.clickCard(this.matsuBerseker);
            expect(this.player1).toHavePrompt('Conflict Action Window');
        });

        it('should not allow opponent to play characters', function() {
            this.noMoreActions();

            this.initiateConflict({
                attackers: [this.zentaro, this.matsuBerseker],
                defenders: [this.akodoToturi],
                province: this.garden
            });

            this.player2.pass();
            expect(this.player1).toHavePrompt('Conflict Action Window');
            this.player1.playAttachment(this.preparedAmbush, this.ancestralLands);
            expect(this.player2).toHavePrompt('Conflict Action Window');
            this.player2.clickCard(this.samuraiOfIntegrity);
            expect(this.player2).toHavePrompt('Conflict Action Window');
        });

        it('should not attach to a broken province', function() {
            this.ancestralLands.isBroken = true;
            this.game.checkGameState(true);
            this.player1.clickCard(this.preparedAmbush);
            expect(this.player1).not.toBeAbleToSelect(this.ancestralLands);
            expect(this.player1).toBeAbleToSelect(this.garden);
        });

        it('should discard when the attached province is broken', function() {
            this.player1.clickCard(this.preparedAmbush);
            expect(this.player1).toBeAbleToSelect(this.ancestralLands);
            expect(this.player1).toBeAbleToSelect(this.garden);
            this.player1.clickCard(this.ancestralLands);

            this.noMoreActions();

            this.initiateConflict({
                attackers: [this.zentaro, this.chagatai],
                defenders: [],
                province: this.ancestralLands
            });

            this.noMoreActions();
            this.player1.clickPrompt('No');
            this.player1.clickPrompt('Don\'t Resolve');
            expect(this.preparedAmbush.location).toBe('conflict discard pile');
            expect(this.getChatLogs(10)).toContain('Prepared Ambush is discarded from Ancestral Lands as it is no longer legally attached');
        });

        it('shouldn\'t be able to have two battlefields at the same time', function() {
            this.player1.playAttachment(this.preparedAmbush, this.ancestralLands);

            expect(this.preparedAmbush.parent).toBe(this.ancestralLands);
            this.player2.pass();
            expect(this.totalWarfare2.location).toBe('hand');
            this.player1.playAttachment(this.totalWarfare2, this.ancestralLands);

            expect(this.preparedAmbush.parent).toBe(null);
            expect(this.preparedAmbush.location).toBe('conflict discard pile');
            expect(this.totalWarfare2.parent).toBe(this.ancestralLands);
            expect(this.totalWarfare2.location).toBe('play area');
        });

        it('should tell you the name of a faceup province', function() {
            this.noMoreActions();

            this.initiateConflict({
                attackers: [this.zentaro, this.matsuBerseker],
                defenders: [this.akodoToturi],
                province: this.ancestralLands
            });

            this.player2.pass();
            this.player1.playAttachment(this.preparedAmbush, this.ancestralLands);
            expect(this.preparedAmbush.parent).toBe(this.ancestralLands);
            expect(this.getChatLogs(5)).toContain('player1 plays Prepared Ambush, attaching it to Ancestral Lands');
        });

        it('shouldn\'t tell you the facedown province', function() {
            this.player1.playAttachment(this.preparedAmbush, this.ancestralLands);

            expect(this.preparedAmbush.parent).toBe(this.ancestralLands);
            expect(this.getChatLogs(2)).toContain('player1 plays Prepared Ambush, attaching it to ' + this.ancestralLands.location);
        });

        it('should be able to be discarded by let go', function() {
            this.player1.playAttachment(this.preparedAmbush, this.ancestralLands);
            expect(this.preparedAmbush.parent).toBe(this.ancestralLands);
            this.player2.clickCard(this.letGo);
            expect(this.player2).toBeAbleToSelect(this.preparedAmbush);
            this.player2.clickCard(this.preparedAmbush);
            expect(this.preparedAmbush.location).toBe('conflict discard pile');
        });

        it('should be able to be discarded by calling in favors', function() {
            this.player1.playAttachment(this.preparedAmbush, this.ancestralLands);
            expect(this.preparedAmbush.parent).toBe(this.ancestralLands);
            this.player2.clickCard(this.cif);
            expect(this.player2).toBeAbleToSelect(this.preparedAmbush);
            this.player2.clickCard(this.preparedAmbush);
            expect(this.player2).toBeAbleToSelect(this.akodoToturi);
            this.player2.clickCard(this.akodoToturi);
            expect(this.preparedAmbush.location).toBe('conflict discard pile');
        });
    });
});
