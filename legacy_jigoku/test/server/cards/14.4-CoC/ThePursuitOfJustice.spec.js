describe('The Pursuit of Justice', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['tattooed-wanderer', 'solemn-scholar'],
                    provinces: ['the-art-of-war'],
                    role: 'keeper-of-void'
                },
                player2: {
                    provinces: ['the-pursuit-of-justice', 'toshi-ranbo', 'seeking-the-truth', 'manicured-garden'],
                    inPlay: ['shrine-maiden', 'shika-matchmaker'],
                    role: 'keeper-of-void'
                }
            });

            this.justice = this.player2.findCardByName('the-pursuit-of-justice');
            this.toshiRanbo = this.player2.findCardByName('toshi-ranbo');
            this.truth = this.player2.findCardByName('seeking-the-truth');
            this.maiden = this.player2.findCardByName('shrine-maiden');
            this.matchmaker = this.player2.findCardByName('shika-matchmaker');
            this.garden = this.player2.findCardByName('manicured-garden');

            this.war = this.player1.findCardByName('the-art-of-war');
            this.scholar = this.player1.findCardByName('solemn-scholar');
            this.wanderer = this.player1.findCardByName('tattooed-wanderer');

            this.justice.facedown = false;
            this.noMoreActions();
        });

        it('should let you choose a bowed participating character during a conflict at itself', function() {
            this.initiateConflict({
                province: this.justice,
                ring: 'earth',
                type: 'military',
                attackers: [this.wanderer],
                defenders: [this.maiden, this.matchmaker]
            });
            this.wanderer.bowed = true;
            this.maiden.bowed = true;

            this.player2.clickCard(this.justice);
            expect(this.player2).toBeAbleToSelect(this.wanderer);
            expect(this.player2).not.toBeAbleToSelect(this.scholar);
            expect(this.player2).toBeAbleToSelect(this.maiden);
            expect(this.player2).not.toBeAbleToSelect(this.matchmaker);
        });

        it('should ready the chosen character', function() {
            this.initiateConflict({
                province: this.justice,
                ring: 'earth',
                type: 'military',
                attackers: [this.wanderer],
                defenders: [this.maiden, this.matchmaker]
            });
            this.wanderer.bowed = true;
            this.maiden.bowed = true;

            expect(this.maiden.bowed).toBe(true);
            this.player2.clickCard(this.justice);
            this.player2.clickCard(this.maiden);
            expect(this.maiden.bowed).toBe(false);
            expect(this.getChatLogs(3)).toContain('player2 uses The Pursuit of Justice to ready Shrine Maiden');
        });

        it('should work at your other water provinces', function() {
            this.initiateConflict({
                province: this.toshiRanbo,
                ring: 'earth',
                type: 'military',
                attackers: [this.wanderer],
                defenders: [this.maiden]
            });
            this.wanderer.bowed = true;
            this.maiden.bowed = true;

            expect(this.maiden.bowed).toBe(true);
            this.player2.clickCard(this.justice);
            this.player2.clickCard(this.maiden);
            expect(this.maiden.bowed).toBe(false);
        });

        it('should work at your opponents water provinces', function() {
            this.player1.passConflict();
            this.noMoreActions();
            this.initiateConflict({
                province: this.war,
                ring: 'earth',
                type: 'military',
                attackers: [this.maiden],
                defenders: [this.wanderer]
            });
            this.wanderer.bowed = true;
            this.maiden.bowed = true;
            this.player1.pass();

            expect(this.maiden.bowed).toBe(true);
            this.player2.clickCard(this.justice);
            this.player2.clickCard(this.maiden);
            expect(this.maiden.bowed).toBe(false);
        });

        it('should not work at non-water provinces', function() {
            this.initiateConflict({
                province: this.garden,
                ring: 'earth',
                type: 'military',
                attackers: [this.wanderer],
                defenders: [this.maiden]
            });
            this.wanderer.bowed = true;
            this.maiden.bowed = true;

            expect(this.player2).toHavePrompt('Conflict Action Window');
            this.player2.clickCard(this.justice);
            expect(this.player2).toHavePrompt('Conflict Action Window');
        });
    });
});
