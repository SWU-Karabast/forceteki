describe('Open Field Skirmisher', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['open-field-skirmisher']
                },
                player2: {
                    inPlay: ['open-field-skirmisher'],
                    provinces: ['pilgrimage']
                }
            });

            this.skirmisher = this.player1.findCardByName('open-field-skirmisher');
            this.skirmisher2 = this.player2.findCardByName('open-field-skirmisher');
            this.pilgrimage = this.player2.findCardByName('pilgrimage');

            this.skirmisher.fate = 2;
            this.skirmisher2.fate = 3;
        });

        it('should not trigger outside of a conflict', function() {
            expect(this.player1).toHavePrompt('Action Window');
            this.player1.clickCard(this.skirmisher);
            expect(this.player1).toHavePrompt('Action Window');
        });

        it('should not trigger on defense', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.skirmisher],
                defenders: [this.skirmisher2],
                type: 'military',
                province: this.pilgrimage
            });

            expect(this.player2).toHavePrompt('Conflict Action Window');
            this.player2.clickCard(this.skirmisher2);
            expect(this.player2).toHavePrompt('Conflict Action Window');
        });

        it('should reduce the strength of the province by 3', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.skirmisher],
                defenders: [this.skirmisher2],
                type: 'military',
                province: this.pilgrimage
            });

            this.player2.pass();
            let fate = this.skirmisher.fate;
            let strength = this.pilgrimage.getStrength();
            this.player1.clickCard(this.skirmisher);

            expect(this.skirmisher.fate).toBe(fate - 1);
            expect(this.pilgrimage.getStrength()).toBe(strength - 3);

            expect(this.getChatLogs(5)).toContain('player1 uses Open Field Skirmisher, removing 1 fate from Open Field Skirmisher to reduce the strength of an attacked province by 3');
            expect(this.getChatLogs(5)).toContain('player1 reduces the strength of Pilgrimage by 3');
        });
    });
});
