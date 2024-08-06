describe('Makeshift War Camp', function() {
    integration(function() {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['ikoma-prodigy', 'akodo-toturi', 'doji-kuwanan'],
                    hand: ['makeshift-war-camp','total-warfare']
                },
                player2: {
                    inPlay: ['matsu-tsuko-2'],
                    hand: ['let-go'],
                    provinces: ['ancestral-lands', 'manicured-garden']
                }
            });

            this.warCamp = this.player1.findCardByName('makeshift-war-camp');
            this.totalWarfare = this.player1.findCardByName('total-warfare');

            this.kuwanan = this.player1.findCardByName('doji-kuwanan');
            this.prodigy = this.player1.findCardByName('ikoma-prodigy');
            this.toturi = this.player1.findCardByName('akodo-toturi');
            this.letGo = this.player2.findCardByName('let-go');
            this.tsuko = this.player2.findCardByName('matsu-tsuko-2');
            this.ancestralLands = this.player2.findCardByName('ancestral-lands');
            this.garden = this.player2.findCardByName('manicured-garden');
        });

        it('should be able to played on a province', function() {
            this.player1.playAttachment(this.warCamp, this.ancestralLands);
            expect(this.warCamp.parent).toBe(this.ancestralLands);
        });

        it('should be discarded if another battlefield is played', function() {
            this.player1.playAttachment(this.warCamp, this.ancestralLands);
            expect(this.warCamp.parent).toBe(this.ancestralLands);
            this.player2.pass();
            this.player1.playAttachment(this.totalWarfare, this.ancestralLands);
            expect(this.warCamp.location).toBe('conflict discard pile');
        });

        it('should not attach to a broken province', function() {
            this.ancestralLands.isBroken = true;
            this.game.checkGameState(true);
            this.player1.clickCard(this.warCamp);
            expect(this.player1).not.toBeAbleToSelect(this.ancestralLands);
            expect(this.player1).toBeAbleToSelect(this.garden);
        });

        it('should discard when the attached province is broken', function() {
            this.player1.clickCard(this.warCamp);
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
            expect(this.warCamp.location).toBe('conflict discard pile');
            expect(this.getChatLogs(10)).toContain('Makeshift War Camp is discarded from Ancestral Lands as it is no longer legally attached');
        });

        it('should give your characters +2 mil', function () {
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.kuwanan, this.prodigy, this.toturi],
                defenders: [this.tsuko],
                province: this.ancestralLands
            });
            expect(this.kuwanan.getMilitarySkill()).toBe(this.kuwanan.getBaseMilitarySkill());
            expect(this.prodigy.getMilitarySkill()).toBe(this.prodigy.getBaseMilitarySkill());
            expect(this.toturi.getMilitarySkill()).toBe(this.toturi.getBaseMilitarySkill());
            expect(this.tsuko.getMilitarySkill()).toBe(this.tsuko.getBaseMilitarySkill());

            this.player2.pass();
            this.player1.playAttachment(this.warCamp, this.ancestralLands);

            expect(this.kuwanan.getMilitarySkill()).toBe(this.kuwanan.getBaseMilitarySkill() + 2);
            expect(this.prodigy.getMilitarySkill()).toBe(this.prodigy.getBaseMilitarySkill() + 2);
            expect(this.toturi.getMilitarySkill()).toBe(this.toturi.getBaseMilitarySkill() + 2);
            expect(this.tsuko.getMilitarySkill()).toBe(this.tsuko.getBaseMilitarySkill());
        });

        it('should only work if the conflict is at the current province', function () {
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.kuwanan, this.prodigy, this.toturi],
                defenders: [this.tsuko],
                province: this.ancestralLands
            });
            expect(this.kuwanan.getMilitarySkill()).toBe(this.kuwanan.getBaseMilitarySkill());
            expect(this.prodigy.getMilitarySkill()).toBe(this.prodigy.getBaseMilitarySkill());
            expect(this.toturi.getMilitarySkill()).toBe(this.toturi.getBaseMilitarySkill());
            expect(this.tsuko.getMilitarySkill()).toBe(this.tsuko.getBaseMilitarySkill());

            this.player2.pass();
            this.player1.playAttachment(this.warCamp, this.garden);

            expect(this.kuwanan.getMilitarySkill()).toBe(this.kuwanan.getBaseMilitarySkill());
            expect(this.prodigy.getMilitarySkill()).toBe(this.prodigy.getBaseMilitarySkill());
            expect(this.toturi.getMilitarySkill()).toBe(this.toturi.getBaseMilitarySkill());
            expect(this.tsuko.getMilitarySkill()).toBe(this.tsuko.getBaseMilitarySkill());
        });
    });
});
