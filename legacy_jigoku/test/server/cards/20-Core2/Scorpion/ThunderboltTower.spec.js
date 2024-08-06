describe('Thunderbolt Tower', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    stronghold: 'thunderbolt-tower',
                    inPlay: ['bayushi-manipulator']
                },
                player2: {
                    inPlay: ['fushicho']
                }
            });
            this.scorpionBox = this.player1.findCardByName('thunderbolt-tower');
            this.bayushiManipulator = this.player1.findCardByName('bayushi-manipulator');
            this.fushicho = this.player2.findCardByName('fushicho');
        });

        it('gives penalty outside conflict', function () {
            this.player1.clickCard(this.scorpionBox);
            expect(this.player1).toHavePrompt('Choose a character');
            expect(this.player1).toBeAbleToSelect(this.fushicho);
            expect(this.player1).toBeAbleToSelect(this.bayushiManipulator);

            this.player1.clickCard(this.fushicho);
            expect(this.fushicho.militarySkill).toBe(4);
            expect(this.fushicho.politicalSkill).toBe(4);
            expect(this.getChatLogs(5)).toContain(
                'player1 uses Thunderbolt Tower, bowing Thunderbolt Tower to give Fushichō -2military/-2political for the phase'
            );
        });

        it('gives penalty during conflicts to characters at home', function () {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.bayushiManipulator],
                defenders: []
            });

            this.player2.pass();

            this.player1.clickCard(this.scorpionBox);
            expect(this.player1).toHavePrompt('Choose a character');
            expect(this.player1).toBeAbleToSelect(this.fushicho);
            expect(this.player1).not.toBeAbleToSelect(this.bayushiManipulator);

            this.player1.clickCard(this.fushicho);
            expect(this.fushicho.militarySkill).toBe(4);
            expect(this.fushicho.politicalSkill).toBe(4);
            expect(this.getChatLogs(5)).toContain(
                'player1 uses Thunderbolt Tower, bowing Thunderbolt Tower to give Fushichō -2military/-2political for the phase'
            );
        });

        it('does not give penalty during conflicts to characters in the conflict', function () {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.bayushiManipulator],
                defenders: [this.fushicho]
            });

            this.player2.pass();
            this.player1.clickCard(this.scorpionBox);
            expect(this.player1).not.toHavePrompt('Choose a character');
        });
    });
});
