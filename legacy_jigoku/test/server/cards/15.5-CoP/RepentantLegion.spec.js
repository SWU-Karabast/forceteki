describe('Repentant Legion', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['repentant-legion', 'hida-kisada'],
                    dynastyDiscard: ['doji-whisperer', 'matsu-berserker', 'miya-mystic', 'imperial-storehouse']
                },
                player2: {
                    inPlay: ['doji-challenger']
                }
            });

            this.repentantLegion = this.player1.findCardByName('repentant-legion');
            this.kisada = this.player1.findCardByName('hida-kisada');

            this.dojiWhisperer = this.player1.moveCard('doji-whisperer', 'dynasty deck');
            this.matsuBerserker = this.player1.moveCard('matsu-berserker', 'dynasty deck');
            this.miyaMystic = this.player1.moveCard('miya-mystic', 'dynasty deck');
            this.storehouse = this.player1.moveCard('imperial-storehouse', 'dynasty deck');

            this.dojiChallenger = this.player2.findCardByName('doji-challenger');
        });

        it('should trigger on breaking an enemy province', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.repentantLegion],
                defenders: [],
                type: 'military'
            });

            this.noMoreActions();

            this.player1.clickPrompt('no');
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.repentantLegion);
        });

        it('should not trigger on breaking an enemy province while not participating', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.kisada],
                defenders: [],
                type: 'military'
            });

            this.noMoreActions();

            this.player1.clickPrompt('no');
            expect(this.player1).not.toHavePrompt('Triggered Abilities');
            expect(this.player1).not.toBeAbleToSelect(this.repentantLegion);
            expect(this.player1).toHavePrompt('air ring');
        });

        it('should not trigger on breaking an friendly province', function() {
            this.noMoreActions();
            this.player1.passConflict();
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.dojiChallenger],
                defenders: [this.repentantLegion],
                type: 'military'
            });

            this.repentantLegion.bowed = true;
            this.noMoreActions();

            this.player2.clickPrompt('no');
            expect(this.player1).not.toHavePrompt('Triggered Abilities');
            expect(this.player1).not.toBeAbleToSelect(this.repentantLegion);
            expect(this.player2).toHavePrompt('air ring');
        });

        it('should put a card in each non-stronghold rovince facedown', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.repentantLegion],
                defenders: [],
                type: 'military'
            });

            this.noMoreActions();

            this.player1.clickPrompt('no');
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.repentantLegion);

            this.player1.clickCard(this.repentantLegion);

            expect(this.dojiWhisperer.location).toBe('province 4');
            expect(this.matsuBerserker.location).toBe('province 3');
            expect(this.miyaMystic.location).toBe('province 2');
            expect(this.storehouse.location).toBe('province 1');

            expect(this.dojiWhisperer.facedown).toBe(true);
            expect(this.matsuBerserker.facedown).toBe(true);
            expect(this.miyaMystic.facedown).toBe(true);
            expect(this.storehouse.facedown).toBe(true);
        });
    });
});
