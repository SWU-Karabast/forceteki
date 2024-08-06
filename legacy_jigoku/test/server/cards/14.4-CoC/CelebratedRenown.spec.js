describe('Celebrated Renown', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'dynasty',
                player1: {
                    inPlay: ['doji-challenger', 'doji-whisperer'],
                    dynastyDiscard: ['celebrated-renown', 'staging-ground', 'a-season-of-war']
                },
                player2: {
                    inPlay: ['yogo-hiroue', 'matsu-berserker']
                }
            });

            this.challenger = this.player1.findCardByName('doji-challenger');
            this.whisperer = this.player1.findCardByName('doji-whisperer');
            this.hiroue = this.player2.findCardByName('yogo-hiroue');
            this.berserker = this.player2.findCardByName('matsu-berserker');

            this.renown = this.player1.findCardByName('celebrated-renown', 'dynasty discard pile');
            this.stagingGround = this.player1.findCardByName('staging-ground');
            this.sow = this.player1.findCardByName('a-season-of-war');

            this.player1.placeCardInProvince(this.renown, 'province 1');
            this.player1.placeCardInProvince(this.stagingGround, 'province 2');
            this.player1.placeCardInProvince(this.sow, 'province 3');
            this.renown.facedown = false;
        });

        it('should give the option to target the character with the most fate and honor that target', function() {
            this.challenger.fate = 3;
            this.whisperer.fate = 2;
            this.hiroue.fate = 3;
            this.berserker.fate = 1;

            this.player1.clickCard(this.renown);

            expect(this.player1).not.toBeAbleToSelect(this.whisperer);
            expect(this.player1).toBeAbleToSelect(this.challenger);
            expect(this.player1).toBeAbleToSelect(this.hiroue);
            expect(this.player1).not.toBeAbleToSelect(this.berserker);

            expect(this.hiroue.isHonored).toBe(false);
            this.player1.clickCard(this.hiroue);
            expect(this.hiroue.isHonored).toBe(true);
            expect(this.getChatLogs(1)).toContain('player1 plays Celebrated Renown to honor Yogo Hiroue');
        });

        it('should not be playable if the character with the most fate is already honored', function() {
            this.challenger.fate = 4;
            this.whisperer.fate = 2;
            this.hiroue.fate = 3;
            this.berserker.fate = 1;

            this.challenger.honor();
            expect(this.player1).toHavePrompt('Play cards from provinces');
            this.player1.clickCard(this.renown);
            expect(this.player1).toHavePrompt('Play cards from provinces');
        });
    });
});
