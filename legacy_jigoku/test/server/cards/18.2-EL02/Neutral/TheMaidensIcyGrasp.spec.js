describe('The Maidens Icy Grasp', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['miya-mystic'],
                    hand: ['the-maiden-s-icy-grasp']
                },
                player2: {
                    honor: 11,
                    inPlay: ['daidoji-uji', 'kitsu-spiritcaller'],
                    hand: ['tattooed-wanderer', 'shosuro-miyako-2'],
                    dynastyDiscard: ['doji-challenger']
                }
            });
            this.grasp = this.player1.findCardByName('the-maiden-s-icy-grasp');
            this.mystic = this.player1.findCardByName('miya-mystic');

            this.miyako = this.player2.findCardByName('shosuro-miyako-2');
            this.uji = this.player2.findCardByName('daidoji-uji');
            this.spiritcaller = this.player2.findCardByName('kitsu-spiritcaller');
            this.wanderer = this.player2.findCardByName('tattooed-wanderer');
            this.challenger = this.player2.findCardByName('doji-challenger');
            this.uji.honor();

            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.mystic],
                defenders: [this.uji, this.spiritcaller]
            });
        });

        it('character from hand', function () {
            this.player2.clickCard(this.wanderer);
            this.player2.clickPrompt('Play this character');
            this.player2.clickPrompt('0');
            this.player2.clickPrompt('Conflict');

            this.player1.clickCard(this.grasp);
            expect(this.player1).toHavePrompt('Choose a character');
            this.player1.clickCard(this.wanderer);
            expect(this.getChatLogs(5)).toContain(
                "player1 plays The Maiden's Icy Grasp to prevent Tattooed Wanderer from contributing to resolution of this conflict"
            );
            expect(this.getChatLogs(2)).toContain('Military Air conflict - Attacker: 1 Defender: 9');
        });

        it('disguised character from hand', function () {
            this.player2.clickCard(this.miyako);
            this.player2.clickCard(this.spiritcaller);
            this.player2.clickPrompt('Conflict');
            this.player2.clickPrompt('Pass');

            this.player1.clickCard(this.grasp);
            expect(this.player1).toHavePrompt('Choose a character');
            this.player1.clickCard(this.miyako);
            expect(this.getChatLogs(5)).toContain(
                "player1 plays The Maiden's Icy Grasp to prevent Shosuro Miyako from contributing to resolution of this conflict"
            );
            expect(this.getChatLogs(2)).toContain('Military Air conflict - Attacker: 1 Defender: 8');
        });

        it('spiritcaller', function () {
            this.player2.clickCard(this.spiritcaller);
            this.player2.clickCard(this.challenger);

            this.player1.clickCard(this.grasp);
            expect(this.player1).toHavePrompt('Choose a character');
            this.player1.clickCard(this.challenger);
            expect(this.getChatLogs(5)).toContain(
                "player1 plays The Maiden's Icy Grasp to prevent Doji Challenger from contributing to resolution of this conflict"
            );
            expect(this.getChatLogs(2)).toContain('Military Air conflict - Attacker: 1 Defender: 8');
        });
    });
});
