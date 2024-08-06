describe('Zealous Inspector', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['zealous-inspector', 'yogo-paramour'],
                    hand: ['way-of-the-scorpion', 'ornate-fan']
                },
                player2: {
                    inPlay: ['doji-challenger'],
                    hand: ['spies-at-court', 'calling-in-favors']
                }
            });

            this.inspector = this.player1.findCardByName('zealous-inspector');
            this.paramour = this.player1.findCardByName('yogo-paramour');
            this.ornateFan = this.player1.findCardByName('ornate-fan');
            this.wayOfTheScorpion = this.player1.findCardByName(
                'way-of-the-scorpion'
            );

            this.challenger = this.player2.findCardByName('doji-challenger');
            this.spies = this.player2.findCardByName('spies-at-court');
            this.cif = this.player2.findCardByName('calling-in-favors');

            // this.game.checkGameState(true);
        });

        it('triggers outside conflicts', function () {
            this.player1.clickCard(this.paramour);
            this.player1.clickCard(this.challenger);
            expect(this.player1).toBeAbleToSelect(this.inspector);

            this.player1.clickCard(this.inspector);
            expect(this.player1).toHavePrompt('Initiate an action');
            expect(this.getChatLogs(5)).toContain(
                'player1 uses Zealous Inspector to gain an additional action — time to deliver swift punishment for the wicked'
            );
        });

        it('triggers during conflicts', function () {
            this.noMoreActions();
            this.initiateConflict({
                ring: 'fire',
                type: 'military',
                attackers: [this.paramour, this.inspector],
                defenders: [this.challenger]
            });

            this.player2.pass();

            this.player1.clickCard(this.paramour);
            this.player1.clickCard(this.challenger);
            expect(this.player1).toBeAbleToSelect(this.inspector);

            this.player1.clickCard(this.inspector);
            expect(this.player1).toHavePrompt('Conflict Action Window');
            expect(this.player2).toHavePrompt(
                'Waiting for opponent to take an action or pass'
            );

            expect(this.getChatLogs(5)).toContain(
                'player1 uses Zealous Inspector to gain an additional action — time to deliver swift punishment for the wicked'
            );
        });

        it('Does not trigger during conflict resolutions due to ring effects', function () {
            this.player1.clickCard(this.ornateFan);
            this.player1.clickCard(this.inspector);

            this.noMoreActions();
            this.initiateConflict({
                ring: 'fire',
                type: 'political',
                attackers: [this.inspector],
                defenders: [this.challenger]
            });
            this.noMoreActions();

            this.player1.clickCard(this.challenger);
            this.player1.clickPrompt('Dishonor Doji Challenger');

            expect(this.player1).not.toBeAbleToSelect(this.inspector);
        });
    });
});
