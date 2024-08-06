describe('Lost Papers', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'dynasty',
                player1: {
                    inPlay: ['doji-challenger', 'doji-whisperer'],
                    dynastyDiscard: ['lost-papers', 'staging-ground', 'a-season-of-war']
                },
                player2: {
                    inPlay: ['yogo-hiroue', 'matsu-berserker']
                }
            });

            this.challenger = this.player1.findCardByName('doji-challenger');
            this.whisperer = this.player1.findCardByName('doji-whisperer');
            this.hiroue = this.player2.findCardByName('yogo-hiroue');
            this.berserker = this.player2.findCardByName('matsu-berserker');

            this.lostPapers = this.player1.findCardByName('lost-papers', 'dynasty discard pile');
            this.stagingGround = this.player1.findCardByName('staging-ground');
            this.sow = this.player1.findCardByName('a-season-of-war');

            this.player1.placeCardInProvince(this.lostPapers, 'province 1');
            this.player1.placeCardInProvince(this.stagingGround, 'province 2');
            this.player1.placeCardInProvince(this.sow, 'province 3');
            this.lostPapers.facedown = true;
        });

        it('should give the option to target the character with the most fate and bow that target', function() {
            this.challenger.fate = 3;
            this.whisperer.fate = 2;
            this.hiroue.fate = 3;
            this.berserker.fate = 1;

            expect(this.lostPapers.facedown).toBe(true);
            this.player1.clickCard(this.stagingGround);
            this.player1.clickCard(this.lostPapers);
            this.player1.clickPrompt('Done');
            expect(this.lostPapers.facedown).toBe(false);
            expect(this.player1).toHavePrompt('triggered abilities');
            expect(this.player1).toBeAbleToSelect(this.lostPapers);
            this.player1.clickCard(this.lostPapers);

            expect(this.player1).not.toBeAbleToSelect(this.whisperer);
            expect(this.player1).toBeAbleToSelect(this.challenger);
            expect(this.player1).toBeAbleToSelect(this.hiroue);
            expect(this.player1).not.toBeAbleToSelect(this.berserker);

            this.player1.clickCard(this.hiroue);
            expect(this.hiroue.bowed).toBe(true);
        });

        it('should not work when not revealed - put into play with sow', function() {
            this.challenger.fate = 3;
            this.whisperer.fate = 2;
            this.hiroue.fate = 3;
            this.berserker.fate = 1;

            this.player1.moveCard(this.lostPapers, 'dynasty deck');
            this.player1.reduceDeckToNumber('dynasty deck', 4);
            this.player1.clickCard(this.sow);
            expect(this.lostPapers.location).not.toBe('dynasty deck');
            expect(this.lostPapers.location).toBe('province 1');

            expect(this.player1).not.toHavePrompt('triggered abilities');
            expect(this.player1).not.toBeAbleToSelect(this.lostPapers);
            expect(this.player1).toHavePrompt('Play cards from provinces');
        });

        it('should not work when not revealed - revealed outside dynasty phase (draw phase)', function() {
            this.challenger.fate = 3;
            this.whisperer.fate = 2;
            this.hiroue.fate = 3;
            this.berserker.fate = 1;

            this.player1.pass();
            this.player2.pass();

            this.player1.clickPrompt('1');
            this.player2.clickPrompt('1');

            expect(this.lostPapers.facedown).toBe(true);
            this.player1.clickCard(this.stagingGround);
            this.player1.clickCard(this.lostPapers);
            this.player1.clickPrompt('Done');
            expect(this.lostPapers.facedown).toBe(false);
            expect(this.player1).not.toHavePrompt('triggered abilities');
            expect(this.player1).not.toBeAbleToSelect(this.lostPapers);

            this.player1.clickCard(this.lostPapers);
            this.player1.clickCard(this.hiroue);
            expect(this.hiroue.bowed).toBe(false);
            expect(this.player2).toHavePrompt('Action Window');
        });
    });
});
