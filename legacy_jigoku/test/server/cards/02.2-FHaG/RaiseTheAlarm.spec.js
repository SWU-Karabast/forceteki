describe('Raise The Alarm', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['doji-challenger']
                },
                player2: {
                    hand: ['raise-the-alarm'],
                    dynastyDiscard: ['doji-kuwanan', 'hida-kisada', 'imperial-storehouse', 'bayushi-liar'],
                    provinces: ['manicured-garden']
                }
            });

            this.challenger = this.player1.findCardByName('doji-challenger');

            this.garden = this.player2.findCardByName('manicured-garden');
            this.kuwanan = this.player2.findCardByName('doji-kuwanan');
            this.kisada = this.player2.findCardByName('hida-kisada');
            this.liar = this.player2.findCardByName('bayushi-liar');
            this.storehouse = this.player2.findCardByName('imperial-storehouse');
            this.alarm = this.player2.findCardByName('raise-the-alarm');

            this.player2.moveCard(this.kuwanan, this.garden.location);
            this.player2.moveCard(this.storehouse, this.garden.location);
            this.player2.moveCard(this.kisada, this.garden.location);
            this.player2.moveCard(this.liar, this.garden.location);

            this.kuwanan.facedown = false;
            this.kisada.facedown = true;
            this.storehouse.facedown = true;
            this.liar.facedown = true;

            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.challenger],
                defenders: [],
                type: 'military',
                province: this.garden
            });
        });

        it('should allow choosing a facedown card in the province', function() {
            this.player2.clickCard(this.alarm);
            expect(this.player2).not.toBeAbleToSelect(this.kuwanan);
            expect(this.player2).toBeAbleToSelect(this.kisada);
            expect(this.player2).toBeAbleToSelect(this.storehouse);
        });

        it('should put a character into play', function() {
            this.player2.clickCard(this.alarm);
            expect(this.player2).not.toBeAbleToSelect(this.kuwanan);
            expect(this.player2).toBeAbleToSelect(this.kisada);
            expect(this.player2).toBeAbleToSelect(this.storehouse);

            this.player2.clickCard(this.kisada);
            expect(this.game.currentConflict.defenders).toContain(this.kisada);

            expect(this.getChatLogs(5)).toContain('player2 plays Raise the Alarm to flip the card in the conflict province faceup');
            expect(this.getChatLogs(5)).toContain('Hida Kisada is revealed and brought into the conflict!');
        });

        it('should do nothing if you reveal a holding', function() {
            this.player2.clickCard(this.alarm);
            expect(this.player2).not.toBeAbleToSelect(this.kuwanan);
            expect(this.player2).toBeAbleToSelect(this.kisada);
            expect(this.player2).toBeAbleToSelect(this.storehouse);

            this.player2.clickCard(this.storehouse);

            expect(this.getChatLogs(5)).toContain('player2 plays Raise the Alarm to flip the card in the conflict province faceup');
            expect(this.getChatLogs(5)).toContain('Imperial Storehouse is revealed but cannot be brought into the conflict!');
        });

        it('should do nothing if you reveal a dash character', function() {
            this.player2.clickCard(this.alarm);
            expect(this.player2).not.toBeAbleToSelect(this.kuwanan);
            expect(this.player2).toBeAbleToSelect(this.kisada);
            expect(this.player2).toBeAbleToSelect(this.storehouse);
            expect(this.player2).toBeAbleToSelect(this.liar);

            this.player2.clickCard(this.liar);
            expect(this.game.currentConflict.defenders).not.toContain(this.liar);

            expect(this.getChatLogs(5)).toContain('player2 plays Raise the Alarm to flip the card in the conflict province faceup');
            expect(this.getChatLogs(5)).toContain('Bayushi Liar is revealed but cannot be brought into the conflict!');
        });
    });
});
