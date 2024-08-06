describe('Betrayal of Truth', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    fate: 6,
                    inPlay: ['hida-kisada', 'yoritomo', 'kaiu-siege-force', 'eager-scout', 'siege-captain', 'aranat'],
                    hand: ['betrayal-of-truth']
                },
                player2: {
                    inPlay: ['matsu-seventh-legion', 'matsu-berserker', 'akodo-toturi']
                }
            });

            this.aranat = this.player1.findCardByName('aranat');
            this.kisada = this.player1.findCardByName('hida-kisada');
            this.yoritomo = this.player1.findCardByName('yoritomo');
            this.kaiuSiegeForce = this.player1.findCardByName('kaiu-siege-force');
            this.eagerScout = this.player1.findCardByName('eager-scout');
            this.siegeCaptain = this.player1.findCardByName('siege-captain');
            this.kisada.fate = 2;

            this.betrayal = this.player1.findCardByName('betrayal-of-truth');

            this.seventhLegion = this.player2.findCardByName('matsu-seventh-legion');
            this.matsuBerserker = this.player2.findCardByName('matsu-berserker');
            this.toturi = this.player2.findCardByName('akodo-toturi');
        });

        it('should bow all participating honored or dishonored characters', function() {
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.kisada, this.yoritomo, this.kaiuSiegeForce, this.siegeCaptain],
                defenders: [this.seventhLegion, this.toturi]
            });

            this.yoritomo.honor();
            this.kaiuSiegeForce.dishonor();
            this.toturi.honor();
            this.eagerScout.dishonor();

            this.player2.pass();
            this.player1.clickCard(this.betrayal);

            expect(this.yoritomo.bowed).toBe(true);
            expect(this.kaiuSiegeForce.bowed).toBe(true);
            expect(this.seventhLegion.bowed).toBe(false);
            expect(this.matsuBerserker.bowed).toBe(false);
            expect(this.eagerScout.bowed).toBe(false);
            expect(this.kisada.bowed).toBe(false);
            expect(this.toturi.bowed).toBe(true);
            expect(this.siegeCaptain.bowed).toBe(false);

            expect(this.getChatLogs(5)).toContain('player1 plays Betrayal of Truth to bow Yoritomo, Kaiu Siege Force and Akodo Toturi');
        });

        it('should not be playable if there are no valid targets', function() {
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.kisada, this.yoritomo, this.kaiuSiegeForce, this.siegeCaptain],
                defenders: [this.seventhLegion, this.toturi]
            });

            this.eagerScout.dishonor();

            this.player2.pass();
            this.player1.clickCard(this.betrayal);
            expect(this.player1).toHavePrompt('Conflict Action Window');
        });
    });
});
