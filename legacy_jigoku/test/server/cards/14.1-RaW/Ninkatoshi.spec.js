describe('Ninkatoshi', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    provinces: ['midnight-revels', 'manicured-garden', 'ninkatoshi']
                },
                player2: {
                    provinces: ['fertile-fields', 'pilgrimage']
                }
            });

            this.revels1 = this.player1.findCardByName('midnight-revels', 'province 1');
            this.manicured1 = this.player1.findCardByName('manicured-garden', 'province 2');
            this.ninkatoshi = this.player1.findCardByName('ninkatoshi', 'province 3');

            this.fertileFields = this.player2.findCardByName('fertile-fields', 'province 1');
            this.pilgrimage = this.player2.findCardByName('pilgrimage', 'province 2');

            this.revels1.facedown = false;
            this.fertileFields.facedown = false;
            this.ninkatoshi.facedown = false;

            this.manicured1.facedown = false;
            this.pilgrimage.facedown = false;
            this.game.checkGameState();
            this.player1.pass();
        });

        it('should lower the province strength of enemy province by 1', function() {
            const fertileEnemyBaseStr = this.fertileFields.baseStrength;
            const pilgrimageEnemyBaseStr = this.pilgrimage.baseStrength;


            expect(this.fertileFields.strength).toBe(fertileEnemyBaseStr - 1);
            expect(this.pilgrimage.strength).toBe(pilgrimageEnemyBaseStr - 1);
        });

        it('should raise the province strength of your province by 1', function() {
            const revelsFriendlyBaseStr = this.revels1.baseStrength;
            const manicuredFriendlyBaseStr = this.manicured1.baseStrength;

            expect(this.revels1.strength).toBe(revelsFriendlyBaseStr + 1);
            expect(this.manicured1.strength).toBe(manicuredFriendlyBaseStr + 1);
        });

        it('should not raise Ninkatoshi\'s strength by 1', function() {
            this.ninkatoshi.facedown = false;
            this.game.checkGameState();

            const ninkatoshiFriendlyBaseStr = this.ninkatoshi.baseStrength;

            expect(this.ninkatoshi.strength).toBe(ninkatoshiFriendlyBaseStr);
        });
    });
});
