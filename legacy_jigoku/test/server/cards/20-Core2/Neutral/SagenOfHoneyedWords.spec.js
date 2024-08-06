describe('Sagen of Honeyed Words', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['sagen-of-honeyed-words', 'bayushi-manipulator', 'asahina-diviner']
                },
                player2: {}
            });

            this.sagenOfHoneyedWords = this.player1.findCardByName('sagen-of-honeyed-words');
            this.bayushiManipulator = this.player1.findCardByName('bayushi-manipulator');
            this.asahinaDiviner = this.player1.findCardByName('asahina-diviner');

            this.noMoreActions();
        });

        it('gets buffed by companion glory', function () {
            let baseMil = this.sagenOfHoneyedWords.getMilitarySkill();
            let basePol = this.sagenOfHoneyedWords.getPoliticalSkill();

            this.initiateConflict({
                attackers: [this.sagenOfHoneyedWords, this.bayushiManipulator],
                defenders: []
            });

            this.player2.pass();
            this.player1.clickCard(this.sagenOfHoneyedWords);
            expect(this.player1).toHavePrompt('Choose a character');
            expect(this.player1).toBeAbleToSelect(this.bayushiManipulator);
            expect(this.player1).not.toBeAbleToSelect(this.sagenOfHoneyedWords);
            expect(this.player1).not.toBeAbleToSelect(this.asahinaDiviner);

            this.player1.clickCard(this.bayushiManipulator);
            expect(this.sagenOfHoneyedWords.getMilitarySkill()).toBe(baseMil + 1);
            expect(this.sagenOfHoneyedWords.getPoliticalSkill()).toBe(basePol + 1);
            expect(this.getChatLogs(5)).toContain(
                'player1 uses Sagen of Honeyed Words to get +1military and +1political'
            );
        });

        it('gets buffed by companion glory including glory bonuses', function () {
            let baseMil = this.sagenOfHoneyedWords.getMilitarySkill();
            let basePol = this.sagenOfHoneyedWords.getPoliticalSkill();

            this.initiateConflict({
                attackers: [this.sagenOfHoneyedWords, this.bayushiManipulator],
                defenders: []
            });

            this.player2.pass();
            this.player1.clickCard(this.asahinaDiviner);
            this.player1.clickCard(this.bayushiManipulator);
            this.player2.pass();

            this.player1.clickCard(this.sagenOfHoneyedWords);
            expect(this.player1).toHavePrompt('Choose a character');
            expect(this.player1).toBeAbleToSelect(this.bayushiManipulator);
            expect(this.player1).not.toBeAbleToSelect(this.sagenOfHoneyedWords);
            expect(this.player1).not.toBeAbleToSelect(this.asahinaDiviner);

            this.player1.clickCard(this.bayushiManipulator);
            expect(this.sagenOfHoneyedWords.getMilitarySkill()).toBe(baseMil + 4);
            expect(this.sagenOfHoneyedWords.getPoliticalSkill()).toBe(basePol + 4);
            expect(this.getChatLogs(5)).toContain(
                'player1 uses Sagen of Honeyed Words to get +4military and +4political'
            );
        });
    });
});