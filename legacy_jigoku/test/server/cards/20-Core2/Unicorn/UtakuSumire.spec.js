describe('Utaku Sumire', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['utaku-sumire', 'worldly-shiotome', 'utaku-infantry'],
                    hand: ['a-perfect-cut', 'fine-katana', 'steward-of-law', 'spoils-of-war']
                },
                player2: {
                    inPlay: ['repentant-legion', 'kaiu-siege-force']
                }
            });
            this.utakuSumire = this.player1.findCardByName('utaku-sumire');
            this.worldlyShiotome = this.player1.findCardByName('worldly-shiotome');
            this.utakuInfantry = this.player1.findCardByName('utaku-infantry');
            this.aPerfectCut = this.player1.findCardByName('a-perfect-cut');
            this.fineKatana = this.player1.findCardByName('fine-katana');
            this.stewardOfLaw = this.player1.findCardByName('steward-of-law');
            this.spoilsOfWar = this.player1.findCardByName('spoils-of-war');

            this.repentantLegion = this.player2.findCardByName('repentant-legion');
            this.kaiuSiegeForce = this.player2.findCardByName('kaiu-siege-force');
            this.noMoreActions();
        });

        it('triggers when conflict begins', function () {
            this.initiateConflict({
                type: 'military',
                attackers: [this.utakuSumire, this.worldlyShiotome, this.utakuInfantry],
                defenders: []
            });

            expect(this.player1).toHavePrompt('Any interrupts?');
            this.player1.clickCard(this.utakuSumire);
            expect(this.getChatLogs(5)).toContain(
                'player1 uses Utaku Sumire to charge into battle under the devout silence of the Utaku - during this conflict, player1 refuses to play Action events. If they win the conflict, their warrior will have their confidence renewed!'
            );
        });

        it('block you from playing Action events', function () {
            this.initiateConflict({
                type: 'military',
                attackers: [this.utakuSumire, this.worldlyShiotome, this.utakuInfantry],
                defenders: []
            });

            this.player1.clickCard(this.utakuSumire);
            this.player2.pass();
            this.player1.clickCard(this.aPerfectCut);
            expect(this.player1).toHavePrompt('Conflict Action Window');
        });

        it('does not block you from playing attachments', function () {
            this.initiateConflict({
                type: 'military',
                attackers: [this.utakuSumire, this.worldlyShiotome, this.utakuInfantry],
                defenders: []
            });

            this.player1.clickCard(this.utakuSumire);
            this.player2.pass();
            this.player1.clickCard(this.fineKatana);
            this.player1.clickCard(this.utakuSumire);
            expect(this.fineKatana.location).toBe('play area');
        });

        it('does not block you from playing characters', function () {
            this.initiateConflict({
                type: 'military',
                attackers: [this.utakuSumire, this.worldlyShiotome, this.utakuInfantry],
                defenders: []
            });

            this.player1.clickCard(this.utakuSumire);
            this.player2.pass();
            this.player1.clickCard(this.stewardOfLaw);
            expect(this.player1).toHavePrompt('Steward of Law');
            this.player1.clickPrompt('0');
            this.player1.clickPrompt('Conflict');
            expect(this.stewardOfLaw.location).toBe('play area');
        });

        it('does not stop reactions', function () {
            this.initiateConflict({
                type: 'military',
                attackers: [this.utakuSumire, this.worldlyShiotome, this.utakuInfantry],
                defenders: []
            });

            this.player1.clickCard(this.utakuSumire);
            this.player2.pass();
            this.player1.pass();

            this.player1.clickCard(this.utakuSumire);
            this.player1.clickCard(this.worldlyShiotome);
            this.player1.clickPrompt('Done');
            expect(this.player1).toHavePrompt('Triggered Abilities');

            this.player1.clickCard(this.spoilsOfWar);
            expect(this.player1).toHavePrompt('Spoils of War');
            this.player1.clickCard(this.fineKatana);
            expect(this.getChatLogs(5)).toContain('player1 plays Spoils of War to draw 3 cards, then discard 1');
        });

        it('puts fate on character on victory', function () {
            this.initiateConflict({
                type: 'military',
                attackers: [this.utakuSumire, this.worldlyShiotome, this.utakuInfantry],
                defenders: []
            });

            this.player1.clickCard(this.utakuSumire);
            this.player2.pass();
            this.player1.pass();

            expect(this.player1).toHavePrompt('Utaku Sumire');
            this.player1.clickCard(this.utakuSumire);
            this.player1.clickCard(this.worldlyShiotome);
            this.player1.clickPrompt('Done');

            expect(this.utakuSumire.fate).toBe(1);
            expect(this.worldlyShiotome.fate).toBe(1);
        });

        it('does nothing on losses', function () {
            this.initiateConflict({
                type: 'military',
                attackers: [this.utakuSumire, this.worldlyShiotome, this.utakuInfantry],
                defenders: [this.repentantLegion, this.kaiuSiegeForce]
            });

            this.player1.clickCard(this.utakuSumire);
            this.player2.pass();
            this.player1.pass();
            expect(this.getChatLogs(5)).toContain('player2 won a military conflict 16 vs 9');

            expect(this.player1).not.toHavePrompt('Utaku Sumire');
        });
    });
});
