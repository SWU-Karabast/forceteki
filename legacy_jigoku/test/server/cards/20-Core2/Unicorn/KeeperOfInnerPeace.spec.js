describe('Keeper of Inner Peace', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    hand: ['a-fate-worse-than-death'],
                    inPlay: ['matsu-berserker']
                },
                player2: {
                    inPlay: ['keeper-of-inner-peace']
                }
            });

            this.afwtd = this.player1.findCardByName('a-fate-worse-than-death');
            this.matsuBerserker = this.player1.findCardByName('matsu-berserker');
            this.matsuBerserker.modifyFate(1);

            this.keeperOfInnerPeace = this.player2.findCardByName('keeper-of-inner-peace');
            this.keeperOfInnerPeace.modifyFate(1);

            this.noMoreActions();
        });

        it('protects fate from rings', function () {
            this.initiateConflict({
                type: 'military',
                ring: 'void',
                attackers: [this.matsuBerserker],
                defenders: []
            });

            this.player2.pass();
            this.player1.pass();
            this.player1.clickPrompt('Yes');
            expect(this.player1).toHavePrompt('Choose character to remove fate from');
            this.player1.clickCard(this.keeperOfInnerPeace);

            expect(this.player2).toHavePrompt('Triggered Abilities');
            this.player2.clickCard(this.keeperOfInnerPeace);

            expect(this.keeperOfInnerPeace.fate).toBe(1);
            expect(this.getChatLogs(5)).toContain(
                "player2 uses Keeper of Inner Peace to protect Keeper of Inner Peace's fate from the Void Ring"
            );
        });

        it('protects fate from abilities', function () {
            this.initiateConflict({
                type: 'military',
                ring: 'void',
                attackers: [this.matsuBerserker],
                defenders: [this.keeperOfInnerPeace]
            });

            this.player2.pass();
            this.player1.clickCard(this.afwtd);
            this.player1.clickCard(this.keeperOfInnerPeace);

            expect(this.player2).toHavePrompt('Triggered Abilities');
            this.player2.clickCard(this.keeperOfInnerPeace);

            expect(this.keeperOfInnerPeace.fate).toBe(1);
            expect(this.keeperOfInnerPeace.bowed).toBe(true);
            expect(this.keeperOfInnerPeace.inConflict).toBe(false);
            expect(this.getChatLogs(5)).toContain(
                "player2 uses Keeper of Inner Peace to protect Keeper of Inner Peace's fate from A Fate Worse Than Death"
            );
        });

        it('does not protect fate from framework effects', function () {
            this.advancePhases('fate');
            expect(this.player2).not.toHavePrompt('Triggered Abilities');
            expect(this.keeperOfInnerPeace.fate).toBe(0);
        });
    });
});
