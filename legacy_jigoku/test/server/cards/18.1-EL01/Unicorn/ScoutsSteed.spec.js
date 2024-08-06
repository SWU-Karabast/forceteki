describe('Scouts Steed', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['moto-conqueror', 'shinjo-archer'],
                    hand: ['scout-s-steed']
                },
                player2: {
                    provinces: ['manicured-garden', 'fertile-fields']
                }
            });

            this.scoutsSteed = this.player1.findCardByName('scout-s-steed');
            this.motoConqueror = this.player1.findCardByName('moto-conqueror');
            this.shinjoArcher = this.player1.findCardByName('shinjo-archer');

            this.motoConqueror.bow();
            this.shinjoArcher.bow();

            this.manicuredFaceup = this.player2.findCardByName('manicured-garden');
            this.fertileFacedown = this.player2.findCardByName('fertile-fields');
            this.manicuredFaceup.facedown = false;
            this.fertileFacedown.facedown = true;
        });

        it('readies the character and declare an attack with them', function () {
            this.player1.clickCard(this.scoutsSteed);
            this.player1.clickCard(this.shinjoArcher);
            expect(this.player1).toHavePrompt('Triggered Abilities');

            this.player1.clickCard(this.scoutsSteed);
            expect(this.player1).toHavePrompt('Choose a province');
            expect(this.player1).not.toBeAbleToSelect(this.manicuredFaceup);
            expect(this.player1).toBeAbleToSelect(this.fertileFacedown);

            this.player1.clickCard(this.fertileFacedown);
            expect(this.getChatLogs(3)).toContain(
                "player1 uses Scout's Steed to ready Shinjo Archer and send them on a journey! province 2 cannot be broken during this conflict - it's just exploration for now'"
            );
            expect(this.player1).toHavePrompt('Military Air Conflict');
            expect(this.player1).not.toHavePromptButton('Pass Conflict');
            expect(this.game.currentConflict.attackers).toContain(this.shinjoArcher);
        });
    });
});
