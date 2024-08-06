describe('Whispers Of Power', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['kudaka', 'shosuro-sadako', 'beloved-advisor'],
                    hand: ['whispers-of-power']
                },
                player2: {
                    inPlay: ['togashi-yokuni', 'togashi-initiate']
                }
            });
            this.kudaka = this.player1.findCardByName('kudaka');
            this.sadako = this.player1.findCardByName('shosuro-sadako');
            this.advisor = this.player1.findCardByName('beloved-advisor');
            this.whispersOfPower = this.player1.findCardByName('whispers-of-power');

            this.togashiYokuni = this.player2.findCardByName('togashi-yokuni');
            this.togashiInitiate = this.player2.findCardByName('togashi-initiate');

            this.kudaka.fate = 1;
        });

        it('should not work outside a conflict', function() {
            this.player1.clickCard(this.whispersOfPower);

            expect(this.player1).toHavePrompt('Action Window');
        });

        it('should be able to target any character during a conflict', function() {
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.kudaka],
                defenders: [this.togashiYokuni]
            });

            this.player2.pass();
            this.player1.clickCard(this.whispersOfPower);
            expect(this.player1).toHavePrompt('Choose a character');

            expect(this.player1).toBeAbleToSelect(this.kudaka);
            expect(this.player1).toBeAbleToSelect(this.sadako);
            expect(this.player1).toBeAbleToSelect(this.advisor);
            expect(this.player1).toBeAbleToSelect(this.togashiYokuni);
            expect(this.player1).toBeAbleToSelect(this.togashiInitiate);
        });

        it('should cost 1 honor', function() {
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.kudaka],
                defenders: [this.togashiYokuni]
            });

            const initialhonor = this.player1.honor;

            this.player2.pass();
            this.player1.clickCard(this.whispersOfPower);
            this.player1.clickCard(this.kudaka);
            this.player1.clickCard(this.kudaka);
            this.player1.clickPrompt(1);

            expect(this.player1.honor).toBe(initialhonor - 1);
        });

        it('should grant 3 times the amount of fateless opponents character - +3 pol (1 character)', function() {
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.kudaka],
                defenders: [this.togashiYokuni]
            });

            this.togashiYokuni.fate = 1;
            const initialPoliticalPower = this.kudaka.getPoliticalSkill();

            this.player2.pass();
            this.player1.clickCard(this.whispersOfPower);
            this.player1.clickCard(this.kudaka);
            this.player1.clickCard(this.kudaka);
            this.player1.clickPrompt(1);

            expect(this.kudaka.getPoliticalSkill()).toBe(initialPoliticalPower + 3);
            expect(this.getChatLogs(5)).toContain('player1 plays Whispers of Power, losing 1 honor to grant Kudaka +3 political until the end of the conflict');
        });

        it('should grant 3 times the amount of fateless opponents character - +6 pol (2 characters)', function() {
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.kudaka],
                defenders: [this.togashiYokuni]
            });

            const initialPoliticalPower = this.kudaka.getPoliticalSkill();

            this.player2.pass();
            this.player1.clickCard(this.whispersOfPower);
            this.player1.clickCard(this.kudaka);
            this.player1.clickCard(this.kudaka);
            this.player1.clickPrompt(1);

            expect(this.kudaka.getPoliticalSkill()).toBe(initialPoliticalPower + 6);
            expect(this.getChatLogs(5)).toContain('player1 plays Whispers of Power, losing 1 honor to grant Kudaka +6 political until the end of the conflict');
        });
    });
});
