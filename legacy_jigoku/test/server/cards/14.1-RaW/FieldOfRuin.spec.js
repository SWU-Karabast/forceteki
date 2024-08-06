describe('Field of Ruin', function() {
    integration(function() {
        describe('Field of Ruin\'s effect', function() {
            beforeEach(function() {
                this.setupTest({
                    phase: 'draw',
                    player1: {
                        dynastyDiscard: ['akodo-zentaro', 'matsu-berserker', 'doji-whisperer'],
                        hand: ['field-of-ruin'],
                        provinces: ['ancestral-lands', 'manicured-garden']
                    },
                    player2: {
                        dynastyDiscard: ['kakita-toshimoko', 'doji-challenger', 'kakita-yoshi'],
                        provinces: ['entrenched-position']
                    }
                });

                this.matsuBerseker = this.player1.placeCardInProvince('matsu-berserker', 'province 1');
                this.whisperer = this.player1.moveCard('doji-whisperer', 'province 1');
                this.zentaro = this.player1.moveCard('akodo-zentaro', 'province 1');
                this.fieldOfRuin = this.player1.findCardByName('field-of-ruin');
                this.ancestralLands = this.player1.findCardByName('ancestral-lands');

                this.toshimoko = this.player2.placeCardInProvince('kakita-toshimoko', 'province 1');
                this.challenger = this.player2.moveCard('doji-challenger', 'province 1');
                this.yoshi = this.player2.moveCard('kakita-yoshi', 'province 1');
                this.entrenched = this.player2.findCardByName('entrenched-position');

                this.player1.clickPrompt('1');
                this.player2.clickPrompt('1');
            });

            it('should trigger at the start of the conflict phase', function() {
                this.player1.playAttachment(this.fieldOfRuin, this.ancestralLands);
                this.noMoreActions();

                expect(this.matsuBerseker.location).toBe('province 1');
                expect(this.whisperer.location).toBe('province 1');
                expect(this.zentaro.location).toBe('province 1');

                expect(this.player1).toHavePrompt('Triggered Abilities');
                expect(this.player1).toBeAbleToSelect(this.fieldOfRuin);
            });

            it('should discard each card in the province - my province', function() {
                this.player1.playAttachment(this.fieldOfRuin, this.ancestralLands);
                this.noMoreActions();

                expect(this.matsuBerseker.location).toBe('province 1');
                expect(this.whisperer.location).toBe('province 1');
                expect(this.zentaro.location).toBe('province 1');

                expect(this.player1).toHavePrompt('Triggered Abilities');
                expect(this.player1).toBeAbleToSelect(this.fieldOfRuin);
                this.player1.clickCard(this.fieldOfRuin);

                expect(this.matsuBerseker.location).toBe('dynasty discard pile');
                expect(this.whisperer.location).toBe('dynasty discard pile');
                expect(this.zentaro.location).toBe('dynasty discard pile');
            });

            it('should discard each card in the province - opponent\'s province', function() {
                this.player1.playAttachment(this.fieldOfRuin, this.entrenched);
                this.noMoreActions();

                expect(this.toshimoko.location).toBe('province 1');
                expect(this.challenger.location).toBe('province 1');
                expect(this.yoshi.location).toBe('province 1');

                expect(this.player1).toHavePrompt('Triggered Abilities');
                expect(this.player1).toBeAbleToSelect(this.fieldOfRuin);
                this.player1.clickCard(this.fieldOfRuin);

                expect(this.toshimoko.location).toBe('dynasty discard pile');
                expect(this.challenger.location).toBe('dynasty discard pile');
                expect(this.yoshi.location).toBe('dynasty discard pile');
            });
        });

        describe('Field of Ruin as a province attachment', function() {
            beforeEach(function() {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['akodo-zentaro', 'matsu-berserker', 'doji-whisperer'],
                        hand: ['field-of-ruin','total-warfare']
                    },
                    player2: {
                        inPlay: ['akodo-toturi'],
                        provinces: ['ancestral-lands', 'manicured-garden'],
                        hand: ['let-go', 'calling-in-favors']
                    }
                });

                this.matsuBerseker = this.player1.placeCardInProvince('matsu-berserker', 'province 2');
                this.whisperer = this.player1.placeCardInProvince('doji-whisperer', 'province 1');
                this.zentaro = this.player1.findCardByName('akodo-zentaro');
                this.fieldOfRuin = this.player1.findCardByName('field-of-ruin');
                this.totalWarfare2 = this.player1.findCardByName('total-warfare');

                this.akodoToturi = this.player2.findCardByName('akodo-toturi');
                this.ancestralLands = this.player2.findCardByName('ancestral-lands');
                this.garden = this.player2.findCardByName('manicured-garden');
                this.letGo = this.player2.findCardByName('let-go');
                this.cif = this.player2.findCardByName('calling-in-favors');
            });

            it('should be able to played on a province', function() {
                this.player1.playAttachment(this.fieldOfRuin, this.ancestralLands);
                expect(this.fieldOfRuin.parent).toBe(this.ancestralLands);
            });

            it('should attach to a broken province', function() {
                this.ancestralLands.isBroken = true;
                this.game.checkGameState(true);
                this.player1.clickCard(this.fieldOfRuin);
                expect(this.player1).toBeAbleToSelect(this.ancestralLands);
                expect(this.player1).toBeAbleToSelect(this.garden);
            });

            it('should cost 0 when attached to a broken province', function() {
                this.ancestralLands.isBroken = true;
                this.game.checkGameState(true);

                this.ancestralLands.facedown = false;
                this.ancestralLands.broken = true;
                this.game.checkGameState(true);

                const playerFatePreFieldOfRuin = this.player1.fate;

                this.player1.clickCard(this.fieldOfRuin);
                expect(this.player1).toBeAbleToSelect(this.ancestralLands);
                expect(this.player1).toBeAbleToSelect(this.garden);
                this.player1.clickCard(this.ancestralLands);

                expect(this.player1.fate).toBe(playerFatePreFieldOfRuin);
            });

            it('should cost 1 when attached to a non-broken province', function() {
                const playerFatePreFieldOfRuin = this.player1.fate;

                this.player1.clickCard(this.fieldOfRuin);
                expect(this.player1).toBeAbleToSelect(this.ancestralLands);
                expect(this.player1).toBeAbleToSelect(this.garden);
                this.player1.clickCard(this.ancestralLands);

                expect(this.player1.fate).toBe(playerFatePreFieldOfRuin - 1);
            });

            it('should not discard when the attached province is broken', function() {
                this.player1.clickCard(this.fieldOfRuin);
                expect(this.player1).toBeAbleToSelect(this.ancestralLands);
                expect(this.player1).toBeAbleToSelect(this.garden);
                this.player1.clickCard(this.ancestralLands);

                this.player2.pass();
                this.player1.pass();

                this.initiateConflict({
                    attackers: [this.zentaro, this.chagatai],
                    defenders: [],
                    province: this.ancestralLands
                });

                this.noMoreActions();
                this.player1.clickPrompt('Don\'t Resolve');
                expect(this.fieldOfRuin.parent).toBe(this.ancestralLands);
            });

            it('shouldn\'t be able to have two battlefields at the same time', function() {
                this.player1.playAttachment(this.fieldOfRuin, this.ancestralLands);

                expect(this.fieldOfRuin.parent).toBe(this.ancestralLands);
                this.player2.pass();
                expect(this.totalWarfare2.location).toBe('hand');
                this.player1.playAttachment(this.totalWarfare2, this.ancestralLands);

                expect(this.fieldOfRuin.parent).toBe(null);
                expect(this.fieldOfRuin.location).toBe('conflict discard pile');
                expect(this.totalWarfare2.parent).toBe(this.ancestralLands);
                expect(this.totalWarfare2.location).toBe('play area');
            });

            it('should tell you the name of a faceup province', function() {
                this.noMoreActions();

                this.initiateConflict({
                    attackers: [this.zentaro, this.matsuBerseker],
                    defenders: [],
                    province: this.ancestralLands
                });

                this.player2.pass();
                this.player1.playAttachment(this.fieldOfRuin, this.ancestralLands);
                expect(this.fieldOfRuin.parent).toBe(this.ancestralLands);
                expect(this.getChatLogs(5)).toContain('player1 plays Field of Ruin, attaching it to Ancestral Lands');
            });

            it('shouldn\'t tell you the facedown province', function() {
                this.player1.playAttachment(this.fieldOfRuin, this.ancestralLands);

                expect(this.fieldOfRuin.parent).toBe(this.ancestralLands);
                expect(this.getChatLogs(2)).toContain('player1 plays Field of Ruin, attaching it to ' + this.ancestralLands.location);
            });

            it('should be able to be discarded by let go', function() {
                this.player1.playAttachment(this.fieldOfRuin, this.ancestralLands);
                expect(this.fieldOfRuin.parent).toBe(this.ancestralLands);
                this.player2.clickCard(this.letGo);
                expect(this.player2).toBeAbleToSelect(this.fieldOfRuin);
                this.player2.clickCard(this.fieldOfRuin);
                expect(this.fieldOfRuin.location).toBe('conflict discard pile');
            });

            it('should be able to be discarded by calling in favors', function() {
                this.player1.playAttachment(this.fieldOfRuin, this.ancestralLands);
                expect(this.fieldOfRuin.parent).toBe(this.ancestralLands);
                this.player2.clickCard(this.cif);
                expect(this.player2).toBeAbleToSelect(this.fieldOfRuin);
                this.player2.clickCard(this.fieldOfRuin);
                expect(this.player2).toBeAbleToSelect(this.akodoToturi);
                this.player2.clickCard(this.akodoToturi);
                expect(this.fieldOfRuin.location).toBe('conflict discard pile');
            });
        });
    });
});
