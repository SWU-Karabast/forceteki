describe('Sanctified Earth', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    hand: ['sanctified-earth', 'one-with-the-sea'],
                    inPlay: ['adept-of-the-waves', 'solemn-scholar', 'garanto-guardian']
                },
                player2: {
                    hand: ['outwit'],
                    inPlay: ['bayushi-shoju']
                }
            });

            this.sanctifiedEarth = this.player1.findCardByName('sanctified-earth');
            this.oneWithTheSea = this.player1.findCardByName('one-with-the-sea');
            this.adept = this.player1.findCardByName('adept-of-the-waves');
            this.solemn = this.player1.findCardByName('solemn-scholar');
            this.garantoGuardian = this.player1.findCardByName('garanto-guardian');

            this.shoju = this.player2.findCardByName('bayushi-shoju');
            this.outwit = this.player2.findCardByName('outwit');

            this.player1.playAttachment(this.sanctifiedEarth, this.adept);
            this.noMoreActions();
        });

        it('without affinity, it gives skill bonus to a character on commit', function () {
            this.player1.moveCard(this.solemn, 'dynasty discard pile');

            this.initiateConflict({
                attackers: [this.garantoGuardian]
            });

            expect(this.player1).toHavePrompt('Any reactions?');

            this.player1.clickCard(this.sanctifiedEarth);
            expect(this.player1).toHavePrompt('Choose a character');

            expect(this.player1).toBeAbleToSelect(this.garantoGuardian);
            expect(this.player1).not.toBeAbleToSelect(this.adept);
            expect(this.player1).not.toBeAbleToSelect(this.shoju);

            this.player1.clickCard(this.garantoGuardian);
            expect(this.garantoGuardian.getMilitarySkill()).toBe(6);
            expect(this.garantoGuardian.getPoliticalSkill()).toBe(5);
            expect(this.getChatLogs(5)).toContain(
                'player1 uses Sanctified Earth to give +2military and +2political to Garanto Guardian'
            );
        });

        it('without affinity, it gives skill bonus to a character on move', function () {
            this.player1.moveCard(this.solemn, 'dynasty discard pile');

            this.initiateConflict({
                attackers: [this.adept]
            });
            this.player1.clickPrompt('Pass');
            this.player2.clickCard(this.shoju);
            this.player2.clickPrompt('Done');

            this.player2.pass();
            this.player1.clickCard(this.oneWithTheSea);
            this.player1.clickCard(this.garantoGuardian);

            expect(this.player1).toHavePrompt('Triggered Abilities');
            this.player1.clickCard(this.sanctifiedEarth);
            expect(this.player1).toBeAbleToSelect(this.garantoGuardian);
            expect(this.player1).not.toBeAbleToSelect(this.adept);
            expect(this.player1).not.toBeAbleToSelect(this.shoju);

            this.player1.clickCard(this.garantoGuardian);
            expect(this.garantoGuardian.getMilitarySkill()).toBe(6);
            expect(this.garantoGuardian.getPoliticalSkill()).toBe(5);
            expect(this.getChatLogs(5)).toContain(
                'player1 uses Sanctified Earth to give +2military and +2political to Garanto Guardian'
            );

            this.player2.clickCard(this.outwit);
            this.player2.clickCard(this.garantoGuardian);
            expect(this.garantoGuardian.isParticipating()).toBe(false);
        });

        it('with affinity, it gives skill bonus to a character on move and block send home', function () {
            this.initiateConflict({
                attackers: [this.adept]
            });
            this.player1.clickPrompt('Pass');
            this.player2.clickCard(this.shoju);
            this.player2.clickPrompt('Done');

            this.player2.pass();
            this.player1.clickCard(this.oneWithTheSea);
            this.player1.clickCard(this.garantoGuardian);

            expect(this.player1).toHavePrompt('Triggered Abilities');
            this.player1.clickCard(this.sanctifiedEarth);
            expect(this.player1).toBeAbleToSelect(this.garantoGuardian);
            expect(this.player1).not.toBeAbleToSelect(this.adept);
            expect(this.player1).not.toBeAbleToSelect(this.shoju);

            this.player1.clickCard(this.garantoGuardian);
            expect(this.garantoGuardian.getMilitarySkill()).toBe(6);
            expect(this.garantoGuardian.getPoliticalSkill()).toBe(5);
            expect(this.getChatLogs(5)).toContain(
                'player1 uses Sanctified Earth to give +2military and +2political to Garanto Guardian'
            );
            expect(this.getChatLogs(5)).toContain(
                "player1 channels their earth affinity to make Garanto Guardian invulnerable to opponent's send home"
            );

            this.player2.clickCard(this.outwit);
            this.player2.clickCard(this.garantoGuardian);
            expect(this.garantoGuardian.isParticipating()).toBe(true);
        });
    });
});
