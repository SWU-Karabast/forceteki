describe('Conduit of Heroes', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['conduit-of-heroes', 'shosuro-sadako', 'beloved-advisor']
                },
                player2: {
                    inPlay: ['togashi-yokuni', 'togashi-initiate']
                }
            });
            this.conduit = this.player1.findCardByName('conduit-of-heroes');
            this.sadako = this.player1.findCardByName('shosuro-sadako');
            this.advisor = this.player1.findCardByName('beloved-advisor');

            this.togashiYokuni = this.player2.findCardByName('togashi-yokuni');
            this.togashiInitiate = this.player2.findCardByName('togashi-initiate');
        });

        it('should not work outside a conflict', function() {
            this.player1.clickCard(this.conduit);
            expect(this.player1).toHavePrompt('Action Window');
        });

        it('should be able to target any other character during a conflict', function() {
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.conduit, this.sadako],
                defenders: [this.togashiYokuni]
            });

            this.player2.pass();
            this.player1.clickCard(this.conduit);
            expect(this.player1).toHavePrompt('Choose a character');

            expect(this.player1).not.toBeAbleToSelect(this.conduit);
            expect(this.player1).toBeAbleToSelect(this.sadako);
            expect(this.player1).toBeAbleToSelect(this.advisor);
            expect(this.player1).toBeAbleToSelect(this.togashiYokuni);
            expect(this.player1).toBeAbleToSelect(this.togashiInitiate);
        });

        it('should bow and give the target +3/+1/+1', function() {
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.conduit, this.sadako],
                defenders: [this.togashiYokuni]
            });

            this.player2.pass();
            let mil = this.sadako.getMilitarySkill();
            let pol = this.sadako.getPoliticalSkill();
            let glory = this.sadako.getGlory();
            this.player1.clickCard(this.conduit);
            this.player1.clickCard(this.sadako);
            expect(this.sadako.getMilitarySkill()).toBe(mil + 3);
            expect(this.sadako.getPoliticalSkill()).toBe(pol + 1);
            expect(this.sadako.getGlory()).toBe(glory + 1);

            expect(this.conduit.bowed).toBe(true);
            expect(this.getChatLogs(5)).toContain('player1 uses Conduit of Heroes, bowing Conduit of Heroes to grant Shosuro Sadako +3military/+1political/+1glory until the end of the conflict');
        });

        it('should not bow if you have 5 more honor than opponent', function() {
            this.player1.honor = 20;
            this.player2.honor = 15;
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.conduit, this.sadako],
                defenders: [this.togashiYokuni]
            });

            this.player2.pass();
            let mil = this.sadako.getMilitarySkill();
            let pol = this.sadako.getPoliticalSkill();
            let glory = this.sadako.getGlory();
            this.player1.clickCard(this.conduit);
            this.player1.clickCard(this.sadako);
            expect(this.sadako.getMilitarySkill()).toBe(mil + 3);
            expect(this.sadako.getPoliticalSkill()).toBe(pol + 1);
            expect(this.sadako.getGlory()).toBe(glory + 1);

            expect(this.conduit.bowed).toBe(false);
            expect(this.getChatLogs(5)).toContain('player1 uses Conduit of Heroes to grant Shosuro Sadako +3military/+1political/+1glory until the end of the conflict');
        });
    });
});
