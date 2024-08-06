describe("Earth's Stagnation", function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['master-tactician'],
                    hand: ['a-perfect-cut', 'icon-of-favor']
                },
                player2: {
                    inPlay: ['resourceful-maho-tsukai'],
                    dynastyDiscard: ['apprentice-earthcaller', 'kaiu-envoy'],
                    hand: ['earth-s-stagnation', 'ornate-fan', 'forebearer-s-echoes']
                }
            });

            this.tactician = this.player1.findCardByName('master-tactician');
            this.perfectCut = this.player1.findCardByName('a-perfect-cut');
            this.iconOfFavor = this.player1.findCardByName('icon-of-favor');

            this.stagnation = this.player2.findCardByName('earth-s-stagnation');
            this.earthcaller = this.player2.findCardByName('apprentice-earthcaller');
            this.envoy = this.player2.findCardByName('kaiu-envoy');
            this.fan = this.player2.findCardByName('ornate-fan');
            this.echoes = this.player2.findCardByName('forebearer-s-echoes');

            this.player1.pass();
            this.player2.playAttachment(this.stagnation, this.tactician);
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.tactician],
                defenders: []
            });
        });

        it('give skill penalties', function () {
            const tacticianInitialMil = this.tactician.getMilitarySkill();

            this.player2.clickCard(this.echoes);
            this.player2.clickCard(this.envoy);

            this.player2.clickCard(this.stagnation);
            expect(this.tactician.getMilitarySkill()).toBe(tacticianInitialMil - 1);
            expect(this.getChatLogs(3)).toContain(
                "player2 uses Earth's Stagnation to give -1military and -1political to Master Tactician"
            );

            this.player1.clickCard(this.iconOfFavor);
            this.player1.clickCard(this.tactician);
            this.player2.clickCard(this.stagnation);
            expect(this.tactician.getMilitarySkill()).toBe(tacticianInitialMil - 1);
            expect(this.getChatLogs(3)).not.toContain(
                "player2 uses Earth's Stagnation to give -1military and -1political to Master Tactician"
            );

            this.player2.pass();
            this.player1.clickCard(this.perfectCut);
            this.player1.clickCard(this.tactician);
            this.player2.clickCard(this.stagnation);
            expect(this.tactician.getMilitarySkill()).toBe(tacticianInitialMil + 2 - 2);
            expect(this.getChatLogs(3)).toContain(
                "player2 uses Earth's Stagnation to give -1military and -1political to Master Tactician"
            );
        });

        it('give double skill penalties on Earth Affinity', function () {
            const tacticianInitialMil = this.tactician.getMilitarySkill();

            this.player2.clickCard(this.echoes);
            this.player2.clickCard(this.earthcaller);

            this.player2.clickCard(this.stagnation);
            expect(this.tactician.getMilitarySkill()).toBe(tacticianInitialMil - 2);
            expect(this.getChatLogs(3)).toContain(
                "player2 uses Earth's Stagnation to give -2military and -2political to Master Tactician"
            );

            this.player1.clickCard(this.iconOfFavor);
            this.player1.clickCard(this.tactician);
            this.player2.clickCard(this.stagnation);
            expect(this.tactician.getMilitarySkill()).toBe(tacticianInitialMil - 2);
            expect(this.getChatLogs(3)).not.toContain(
                "player2 uses Earth's Stagnation to give -2military and -2political to Master Tactician"
            );

            this.player2.pass();
            this.player1.clickCard(this.perfectCut);
            this.player1.clickCard(this.tactician);
            this.player2.clickCard(this.stagnation);
            expect(this.tactician.getMilitarySkill()).toBe(tacticianInitialMil + 2 - 4);
            expect(this.getChatLogs(3)).toContain(
                "player2 uses Earth's Stagnation to give -2military and -2political to Master Tactician"
            );
        });
    });
});