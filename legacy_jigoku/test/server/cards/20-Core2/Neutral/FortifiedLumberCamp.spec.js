describe('Fortified Lumber Camp', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    dynastyDiscard: [
                        'aranat',
                        'daidoji-uji',
                        'imperial-storehouse',
                        'heavy-ballista',
                        'fortified-lumber-camp'
                    ]
                },
                player2: {
                    dynastyDiscard: ['aranat', 'daidoji-uji', 'imperial-storehouse', 'heavy-ballista'],
                    hand: ['educated-heimin', 'prepared-ambush']
                }
            });
            this.fortifiedLumbeCamp = this.player1.findCardByName('fortified-lumber-camp');
            this.aranat = this.player1.findCardByName('aranat');
            this.uji = this.player1.findCardByName('daidoji-uji');
            this.storehouse = this.player1.findCardByName('imperial-storehouse');
            this.ballista = this.player1.findCardByName('heavy-ballista');

            this.aranat2 = this.player2.findCardByName('aranat');
            this.uji2 = this.player2.findCardByName('daidoji-uji');
            this.storehouse2 = this.player2.findCardByName('imperial-storehouse');
            this.ballista2 = this.player2.findCardByName('heavy-ballista');
            this.heimin = this.player2.findCardByName('educated-heimin');
            this.ambush = this.player2.findCardByName('prepared-ambush');

            this.shamefulDisplayP1 = this.player1.findCardByName('shameful-display', 'province 1');
            this.shamefulDisplayP2 = this.player2.findCardByName('shameful-display', 'province 1');

            this.player1.reduceDeckToNumber('dynasty deck', 0);
            this.player1.moveCard(this.aranat, 'province 1');
            this.player1.moveCard(this.uji, 'province 1');
            this.player1.moveCard(this.storehouse, 'province 1');
            this.player1.moveCard(this.ballista, 'dynasty deck');
            this.player1.moveCard(this.fortifiedLumbeCamp, 'province 2');

            this.player2.reduceDeckToNumber('dynasty deck', 0);
            this.player2.moveCard(this.aranat2, 'province 1');
            this.player2.moveCard(this.ballista2, 'province 1');
            this.player2.moveCard(this.storehouse2, 'province 1');
            this.player2.moveCard(this.uji2, 'dynasty deck');

            this.player1.pass();
            this.player2.clickCard(this.ambush);
            this.player2.clickCard(this.shamefulDisplayP1);

            this.player1.pass();
            this.player2.clickCard(this.heimin);
            this.player2.clickCard(this.shamefulDisplayP2);
        });

        it('should be usable on your own provinces', function () {
            this.player1.clickCard(this.fortifiedLumbeCamp);
            expect(this.player1).toBeAbleToSelect(this.shamefulDisplayP1);
            expect(this.player1).toBeAbleToSelect(this.shamefulDisplayP2);
            expect(this.aranat.location).toBe('province 1');
            expect(this.uji.location).toBe('province 1');
            expect(this.storehouse.location).toBe('province 1');
            expect(this.ballista.location).toBe('dynasty deck');

            this.player1.clickCard(this.shamefulDisplayP1);

            expect(this.aranat.location).toBe('dynasty discard pile');
            expect(this.uji.location).toBe('dynasty discard pile');
            expect(this.storehouse.location).toBe('dynasty discard pile');
            expect(this.ambush.location).toBe('conflict discard pile');
            expect(this.ballista.location).toBe('province 1');
            expect(this.ballista.facedown).toBe(true);

            expect(this.getChatLogs(3)).toContain(
                'player1 uses Fortified Lumber Camp, sacrificing Fortified Lumber Camp to discard Adept of the Waves, Aranat, Daidoji Uji, Imperial Storehouse and Prepared Ambush'
            );
        });

        it('should be usable on your opponent provinces', function () {
            this.player1.clickCard(this.fortifiedLumbeCamp);
            expect(this.player1).toBeAbleToSelect(this.shamefulDisplayP1);
            expect(this.player1).toBeAbleToSelect(this.shamefulDisplayP2);
            expect(this.aranat2.location).toBe('province 1');
            expect(this.ballista2.location).toBe('province 1');
            expect(this.storehouse2.location).toBe('province 1');
            expect(this.uji2.location).toBe('dynasty deck');

            this.player1.clickCard(this.shamefulDisplayP2);

            expect(this.aranat2.location).toBe('dynasty discard pile');
            expect(this.ballista2.location).toBe('dynasty discard pile');
            expect(this.storehouse2.location).toBe('dynasty discard pile');
            expect(this.heimin.location).toBe('conflict discard pile');
            expect(this.uji2.location).toBe('province 1');
            expect(this.uji2.facedown).toBe(true);

            expect(this.getChatLogs(3)).toContain(
                'player1 uses Fortified Lumber Camp, sacrificing Fortified Lumber Camp to discard Adept of the Waves, Aranat, Heavy Ballista, Imperial Storehouse and Educated Heimin'
            );
        });
    });
});
