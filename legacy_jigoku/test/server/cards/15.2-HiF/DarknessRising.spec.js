describe('Darkness Rising', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    fate: 6,
                    inPlay: ['hida-kisada', 'yoritomo', 'kaiu-siege-force', 'eager-scout', 'siege-captain', 'aranat'],
                    hand: ['darkness-rising']
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

            this.darknessRising = this.player1.findCardByName('darkness-rising');

            this.seventhLegion = this.player2.findCardByName('matsu-seventh-legion');
            this.matsuBerserker = this.player2.findCardByName('matsu-berserker');
            this.toturi = this.player2.findCardByName('akodo-toturi');
        });

        it('should let you select a participating character to dishonor that has more military than at least one other character', function() {
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.kisada, this.yoritomo, this.kaiuSiegeForce, this.siegeCaptain],
                defenders: [this.seventhLegion, this.toturi]
            });

            this.player2.pass();

            this.player1.clickCard(this.darknessRising);
            expect(this.player1).toHavePrompt('Select character to dishonor');
            expect(this.player1).toBeAbleToSelect(this.kisada);
            expect(this.player1).toBeAbleToSelect(this.yoritomo);
            expect(this.player1).toBeAbleToSelect(this.kaiuSiegeForce);
            expect(this.player1).not.toBeAbleToSelect(this.siegeCaptain);
            expect(this.player1).not.toBeAbleToSelect(this.aranat);
        });

        it('should dishonor a character of player\'s choice and bow all weaker participating characters', function() {
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.kisada, this.yoritomo, this.kaiuSiegeForce, this.siegeCaptain],
                defenders: [this.seventhLegion, this.toturi]
            });

            this.player2.pass();

            this.player1.clickCard(this.darknessRising);
            expect(this.player1).toHavePrompt('Select character to dishonor');
            this.player1.clickCard(this.kisada);
            this.player1.clickCard(this.kisada);
            this.player1.clickPrompt('2');

            expect(this.kisada.isDishonored).toBe(true);
            expect(this.kisada.fate).toBe(0);

            expect(this.yoritomo.militarySkill).toBe(9);
            expect(this.yoritomo.bowed).toBe(false); // 9 vs 7
            expect(this.kaiuSiegeForce.bowed).toBe(false); // 7v7
            expect(this.seventhLegion.bowed).toBe(false); // 7v7
            expect(this.matsuBerserker.bowed).toBe(false); // non-participating
            expect(this.eagerScout.bowed).toBe(false); // non-participating
            expect(this.kisada.bowed).toBe(false); // source and same skill

            expect(this.toturi.bowed).toBe(true); //6v7
            expect(this.siegeCaptain.bowed).toBe(true); // 5v7

            expect(this.getChatLogs(5)).toContain('player1 plays Darkness Rising, dishonoring Hida Kisada to bow Siege Captain and Akodo Toturi');
        });

        it('should fizzle gracefully if after dishonoring there are no more valid targets', function() {
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.kisada, this.yoritomo, this.kaiuSiegeForce, this.siegeCaptain],
                defenders: [this.seventhLegion, this.toturi]
            });

            this.siegeCaptain.honor();
            this.player2.pass();

            this.player1.clickCard(this.darknessRising);
            expect(this.player1).toHavePrompt('Select character to dishonor');
            expect(this.player1).toBeAbleToSelect(this.siegeCaptain);

            this.player1.clickCard(this.siegeCaptain);
            this.player1.clickCard(this.kisada);
            this.player1.clickPrompt('2');

            expect(this.siegeCaptain.isHonored).toBe(false);
            expect(this.siegeCaptain.isDishonored).toBe(false);
            expect(this.kisada.fate).toBe(0);

            expect(this.yoritomo.militarySkill).toBe(9);
            expect(this.yoritomo.bowed).toBe(false);
            expect(this.kaiuSiegeForce.bowed).toBe(false);
            expect(this.seventhLegion.bowed).toBe(false);
            expect(this.matsuBerserker.bowed).toBe(false);
            expect(this.eagerScout.bowed).toBe(false);
            expect(this.kisada.bowed).toBe(false);

            expect(this.toturi.bowed).toBe(false);
            expect(this.siegeCaptain.bowed).toBe(false);

            expect(this.getChatLogs(5)).toContain('player1 plays Darkness Rising, dishonoring Siege Captain');
        });
    });
});
