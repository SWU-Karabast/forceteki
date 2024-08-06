describe('Weight of Duty', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['tattooed-wanderer', 'togashi-yokuni'],
                    provinces: ['pilgrimage'],
                    role: 'keeper-of-void'
                },
                player2: {
                    inPlay: ['shrine-maiden', 'shiba-tsukune'],
                    provinces: ['pilgrimage', 'weight-of-duty', 'manicured-garden'],
                    role: 'seeker-of-void'
                }
            });

            this.pilgrimage = this.player2.findCardByName('pilgrimage');
            this.weightOfDuty = this.player2.findCardByName('weight-of-duty');
            this.garden = this.player2.findCardByName('manicured-garden');
            this.maiden = this.player2.findCardByName('shrine-maiden');
            this.tsukune = this.player2.findCardByName('shiba-tsukune');

            this.pilgrimageP1 = this.player1.findCardByName('pilgrimage');
            this.yokuni = this.player1.findCardByName('togashi-yokuni');
            this.wanderer = this.player1.findCardByName('tattooed-wanderer');

            this.weightOfDuty.facedown = false;
            this.pilgrimage.facedown = false;
            this.noMoreActions();
        });

        it('should trigger at another self controlled void province', function() {
            this.initiateConflict({
                province: this.pilgrimage,
                ring: 'earth',
                type: 'military',
                attackers: [this.wanderer],
                defenders: [this.maiden, this.tsukune]
            });

            this.player2.clickCard(this.weightOfDuty);
            expect(this.player2).toHavePrompt('Select card to sacrifice');
        });

        it('should trigger at another opponent controlled void province', function() {
            this.player1.passConflict();
            this.noMoreActions();

            this.initiateConflict({
                province: this.pilgrimageP1,
                ring: 'earth',
                type: 'military',
                defenders: [this.wanderer],
                attackers: [this.maiden, this.tsukune]
            });

            this.player1.pass();
            this.player2.clickCard(this.weightOfDuty);
            expect(this.player2).toHavePrompt('Select card to sacrifice');
        });

        it('should only allow to target participating characters controlled by you', function() {
            this.initiateConflict({
                province: this.pilgrimage,
                ring: 'earth',
                type: 'military',
                attackers: [this.wanderer],
                defenders: [this.maiden]
            });

            this.player2.clickCard(this.weightOfDuty);
            expect(this.player2).toHavePrompt('Select card to sacrifice');
            expect(this.player2).toBeAbleToSelect(this.maiden);
            expect(this.player2).not.toBeAbleToSelect(this.wanderer);
            expect(this.player2).not.toBeAbleToSelect(this.tsukune);
            expect(this.player2).not.toBeAbleToSelect(this.yokuni);
        });

        it('should only allow to target non-unique opponent characters when you sacrifice a non-unique', function() {
            this.initiateConflict({
                province: this.pilgrimage,
                ring: 'earth',
                type: 'military',
                attackers: [this.wanderer],
                defenders: [this.maiden]
            });

            this.player2.clickCard(this.weightOfDuty);
            expect(this.player2).toHavePrompt('Select card to sacrifice');
            this.player2.clickCard(this.maiden);

            expect(this.player2).toHavePrompt('Choose a character');
            expect(this.player2).not.toBeAbleToSelect(this.maiden);
            expect(this.player2).toBeAbleToSelect(this.wanderer);
            expect(this.player2).not.toBeAbleToSelect(this.tsukune);
            expect(this.player2).not.toBeAbleToSelect(this.yokuni);
        });

        it('should allow you to target unique opponent characters aswell when you sacrifice a unique', function() {
            this.initiateConflict({
                province: this.pilgrimage,
                ring: 'earth',
                type: 'military',
                attackers: [this.wanderer],
                defenders: [this.tsukune]
            });

            this.player2.clickCard(this.weightOfDuty);
            expect(this.player2).toHavePrompt('Select card to sacrifice');
            this.player2.clickCard(this.tsukune);

            expect(this.player2).toHavePrompt('Choose a character');
            expect(this.player2).not.toBeAbleToSelect(this.maiden);
            expect(this.player2).toBeAbleToSelect(this.wanderer);
            expect(this.player2).toBeAbleToSelect(this.yokuni);
        });

        it('should bow and dishonor the target', function() {
            this.initiateConflict({
                province: this.pilgrimage,
                ring: 'earth',
                type: 'military',
                attackers: [this.wanderer],
                defenders: [this.tsukune]
            });

            this.player2.clickCard(this.weightOfDuty);
            expect(this.player2).toHavePrompt('Select card to sacrifice');
            this.player2.clickCard(this.tsukune);

            expect(this.player2).toHavePrompt('Choose a character');
            expect(this.player2).not.toBeAbleToSelect(this.maiden);
            expect(this.player2).toBeAbleToSelect(this.wanderer);
            expect(this.player2).toBeAbleToSelect(this.yokuni);

            this.player2.clickCard(this.yokuni);
            expect(this.yokuni.bowed).toBe(true);
            expect(this.yokuni.isDishonored).toBe(true);
        });

        it('should not be able to sac a non-unique if the only valid targets are uniques', function() {
            this.initiateConflict({
                province: this.pilgrimage,
                ring: 'earth',
                type: 'military',
                attackers: [this.wanderer],
                defenders: [this.tsukune, this.maiden]
            });

            this.player2.clickCard(this.weightOfDuty);
            expect(this.player2).toHavePrompt('Select card to sacrifice');
            expect(this.player2).toBeAbleToSelect(this.tsukune);
            expect(this.player2).toBeAbleToSelect(this.maiden);
            this.player2.clickPrompt('Cancel');

            this.wanderer.bowed = true;
            this.wanderer.dishonor();
            this.game.checkGameState(true);

            this.player2.clickCard(this.weightOfDuty);
            expect(this.player2).toHavePrompt('Select card to sacrifice');
            expect(this.player2).toBeAbleToSelect(this.tsukune);
            expect(this.player2).not.toBeAbleToSelect(this.maiden);
            this.player2.clickCard(this.tsukune);

            expect(this.player2).toHavePrompt('Choose a character');
            expect(this.player2).not.toBeAbleToSelect(this.maiden);
            expect(this.player2).not.toBeAbleToSelect(this.wanderer);
            expect(this.player2).toBeAbleToSelect(this.yokuni);

            this.player2.clickCard(this.yokuni);
            expect(this.yokuni.bowed).toBe(true);
            expect(this.yokuni.isDishonored).toBe(true);
        });
    });
});
