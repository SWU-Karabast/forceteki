describe('Kinutanuki Yoite', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['matsu-berserker', 'master-tactician', 'akodo-toturi'],
                    hand: []
                },
                player2: {
                    inPlay: ['kinutanuki-yoite'],
                    hand: ['invocation-of-ash', 'unleash-the-djinn']
                }
            });

            this.matsuBerserker = this.player1.findCardByName('matsu-berserker');
            this.tactician = this.player1.findCardByName('master-tactician');
            this.toturi = this.player1.findCardByName('akodo-toturi');

            this.kinutanukiYoite = this.player2.findCardByName('kinutanuki-yoite');
            this.invocationOfAsh = this.player2.findCardByName('invocation-of-ash');
            this.unleashTheDjinn = this.player2.findCardByName('unleash-the-djinn');

            this.noMoreActions();
        });

        it('discards characters with event spells', function () {
            this.initiateConflict({
                type: 'military',
                attackers: [this.matsuBerserker, this.tactician, this.toturi],
                defenders: [this.kinutanukiYoite]
            });

            this.player2.clickCard(this.unleashTheDjinn);
            expect(this.player2).toHavePrompt('Triggered Abilities');
            expect(this.player2).toBeAbleToSelect(this.kinutanukiYoite);

            this.player2.clickCard(this.kinutanukiYoite);
            expect(this.player2).toHavePrompt('Choose a character');
            expect(this.player2).toBeAbleToSelect(this.matsuBerserker);
            expect(this.player2).toBeAbleToSelect(this.tactician);
            expect(this.player2).toBeAbleToSelect(this.toturi);

            this.player2.clickCard(this.toturi);
            expect(this.toturi.location).toBe('dynasty discard pile');
            expect(this.getChatLogs(5)).toContain('player2 uses Kinutanuki Yoite to discard Akodo Toturi');
        });

        it('discards characters with attachment spells', function () {
            this.initiateConflict({
                type: 'military',
                attackers: [this.matsuBerserker, this.tactician, this.toturi],
                defenders: [this.kinutanukiYoite]
            });

            this.player2.clickCard(this.invocationOfAsh);
            this.player2.clickCard(this.kinutanukiYoite);
            expect(this.player2).toHavePrompt('Triggered Abilities');
            expect(this.player2).toBeAbleToSelect(this.kinutanukiYoite);

            this.player2.clickCard(this.kinutanukiYoite);
            expect(this.player2).toHavePrompt('Choose a character');
            expect(this.player2).toBeAbleToSelect(this.matsuBerserker);
            expect(this.player2).toBeAbleToSelect(this.tactician);
            expect(this.player2).not.toBeAbleToSelect(this.toturi);

            this.player2.clickCard(this.tactician);
            expect(this.tactician.location).toBe('dynasty discard pile');
            expect(this.getChatLogs(5)).toContain('player2 uses Kinutanuki Yoite to discard Master Tactician');
        });
    });
});
