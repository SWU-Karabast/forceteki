describe('Moto Oktai', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['moto-oktai', 'mirumoto-raitsugu'],
                    hand: ['assassination']
                },
                player2: {
                    hand: ['fine-katana'],
                    inPlay: ['keeper-initiate']
                }
            });
            this.motoOktai = this.player1.findCardByName('moto-oktai');
            this.mirumotoRaitsugu = this.player1.findCardByName('mirumoto-raitsugu');
            this.mirumotoRaitsugu.honor();
            this.assassination = this.player1.findCardByName('assassination');

            this.keeperInitiate = this.player2.findCardByName('keeper-initiate');
            this.katana = this.player2.findCardByName('fine-katana');
            this.player1.pass();
            this.player2.clickCard(this.katana);
            this.player2.clickCard(this.keeperInitiate);
            this.noMoreActions();
        });

        it('gains MIL when opponent leaves play', function () {
            const initialOktaiMil = this.motoOktai.getMilitarySkill();
            const keeperMil = this.keeperInitiate.getMilitarySkill();
            this.initiateConflict({
                attackers: [this.motoOktai],
                defenders: []
            });

            this.player2.pass();
            this.player1.clickCard(this.assassination);
            this.player1.clickCard(this.keeperInitiate);
            expect(this.player1).toHavePrompt('Triggered Abilities');

            this.player1.clickCard(this.motoOktai);
            expect(this.motoOktai.getMilitarySkill()).toBe(initialOktaiMil + keeperMil);
            expect(this.getChatLogs(5)).toContain(
                'player1 uses Moto Oktai to get +3 military for this phase - he is emboldened by justice, but unburdened by mercy!'
            );
        });

        it('gains MIL when own character leaves play, and can kill own character', function () {
            const initialOktaiMil = this.motoOktai.getMilitarySkill();
            const raitsuguMil = this.mirumotoRaitsugu.getMilitarySkill();
            this.initiateConflict({
                attackers: [this.motoOktai],
                defenders: []
            });

            this.player2.pass();
            this.player1.clickCard(this.motoOktai);
            expect(this.player1).toHavePrompt('Choose a character');
            expect(this.player1).toBeAbleToSelect(this.motoOktai);
            expect(this.player1).toBeAbleToSelect(this.mirumotoRaitsugu);
            expect(this.player1).not.toBeAbleToSelect(this.keeperInitiate);

            this.player1.clickCard(this.mirumotoRaitsugu);
            expect(this.getChatLogs(5)).toContain(
                'player1 uses Moto Oktai to discard Mirumoto Raitsugu - purge the weak!'
            );
            expect(this.player1).toHavePrompt('Triggered Abilities');

            this.player1.clickCard(this.motoOktai);
            expect(this.motoOktai.getMilitarySkill()).toBe(initialOktaiMil + raitsuguMil);
            expect(this.getChatLogs(5)).toContain(
                'player1 uses Moto Oktai to get +4 military for this phase - he is emboldened by justice, but unburdened by mercy!'
            );
        });
    });
});
