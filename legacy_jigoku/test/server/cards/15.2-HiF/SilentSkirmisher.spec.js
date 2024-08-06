describe('Silent Skirmisher', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['silent-skirmisher', 'eager-scout']
                },
                player2: {
                    inPlay: ['steward-of-cryptic-lore']
                }
            });

            this.silentSkirmisher = this.player1.findCardByName('silent-skirmisher');
            this.scout = this.player1.findCardByName('eager-scout');

            this.steward = this.player2.findCardByName('steward-of-cryptic-lore');
        });

        it('should not be usable out of conflict', function () {
            this.player1.clickCard(this.silentSkirmisher);

            expect(this.player1).toHavePrompt('Action Window');
        });

        it('should only be able to sacrifice other (controlled) characters', function () {
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.silentSkirmisher],
                defenders: []
            });
            this.player2.pass();

            this.player1.clickCard(this.silentSkirmisher);
            expect(this.player1).toHavePrompt('Select card to sacrifice');
            expect(this.player1).toBeAbleToSelect(this.scout);
            expect(this.player1).not.toBeAbleToSelect(this.silentSkirmisher);
            expect(this.player1).not.toBeAbleToSelect(this.steward);
        });

        it('should give +2 military', function () {
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.silentSkirmisher],
                defenders: []
            });
            this.player2.pass();

            const skirmisherMilitarySkill = this.silentSkirmisher.militarySkill;

            this.player1.clickCard(this.silentSkirmisher);
            this.player1.clickCard(this.scout);

            expect(this.silentSkirmisher.militarySkill).toBe(skirmisherMilitarySkill + 2);
            expect(this.getChatLogs(5)).toContain('player1 uses Silent Skirmisher, sacrificing Eager Scout to give itself +2military');
        });
    });
});
