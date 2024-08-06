describe('Arrogant Kakita', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['arrogant-kakita', 'ancient-master']
                },
                player2: {
                    stronghold: ['seven-stings-keep'],
                    inPlay: ['tattooed-wanderer']
                }
            });

            this.kakita = this.player1.findCardByName('arrogant-kakita');
            this.master = this.player1.findCardByName('ancient-master');
            this.wanderer = this.player2.findCardByName('tattooed-wanderer');
            this.ssk = this.player2.findCardByName('seven-stings-keep');
            this.sd1 = this.player1.findCardByName('shameful-display', 'province 1');
            this.noMoreActions();
        });

        it('should trigger its reaction if you attack', function() {
            this.initiateConflict({
                attackers: [this.kakita]
            });
            expect(this.player2).toHavePrompt('Choose defenders');
            this.player2.clickCard(this.wanderer);
            this.player2.clickPrompt('Done');
            expect(this.player1).toHavePrompt('Choose a character');
        });

        it('should duel - nothing should happen if it wins', function() {
            this.initiateConflict({
                attackers: [this.kakita]
            });
            expect(this.player2).toHavePrompt('Choose defenders');
            this.player2.clickCard(this.wanderer);
            this.player2.clickPrompt('Done');
            this.player1.clickCard(this.wanderer);
            this.player1.clickPrompt('1');
            this.player2.clickPrompt('1');
            expect(this.kakita.isParticipating()).toBe(true);
            expect(this.getChatLogs(5)).toContain('Arrogant Kakita: 4 vs 3: Tattooed Wanderer');
            expect(this.getChatLogs(5)).toContain('The duel has no effect');
        });

        it('should duel - should move home if it loses', function() {
            this.initiateConflict({
                attackers: [this.kakita]
            });
            expect(this.player2).toHavePrompt('Choose defenders');
            this.player2.clickCard(this.wanderer);
            this.player2.clickPrompt('Done');
            this.player1.clickCard(this.wanderer);
            this.player1.clickPrompt('1');
            this.player2.clickPrompt('5');
            expect(this.kakita.isParticipating()).toBe(false);
            expect(this.getChatLogs(5)).toContain('Arrogant Kakita: 4 vs 7: Tattooed Wanderer');
            expect(this.getChatLogs(5)).toContain('Duel Effect: send Arrogant Kakita home');
        });

        it('should duel - unlimited times per round', function() {
            this.initiateConflict({
                attackers: [this.kakita]
            });
            expect(this.player2).toHavePrompt('Choose defenders');
            this.player2.clickCard(this.wanderer);
            this.player2.clickPrompt('Done');
            this.player1.clickCard(this.wanderer);
            this.player1.clickPrompt('1');
            this.player2.clickPrompt('5');
            expect(this.kakita.isParticipating()).toBe(false);
            expect(this.getChatLogs(5)).toContain('Arrogant Kakita: 4 vs 7: Tattooed Wanderer');
            expect(this.getChatLogs(5)).toContain('Duel Effect: send Arrogant Kakita home');

            this.noMoreActions();

            this.wanderer.bowed = false;
            expect(this.player1).toHavePrompt('Action Window');
            this.noMoreActions();
            this.player2.clickPrompt('Pass');
            this.player2.passConflict();
            this.noMoreActions();

            this.initiateConflict({
                attackers: [this.kakita],
                ring: 'earth'
            });
            expect(this.player2).toHavePrompt('Choose defenders');
            this.player2.clickCard(this.wanderer);
            this.player2.clickPrompt('Done');
            this.player1.clickCard(this.wanderer);
            this.player1.clickPrompt('1');
            this.player2.clickPrompt('5');
            expect(this.kakita.isParticipating()).toBe(false);
            expect(this.getChatLogs(5)).toContain('Arrogant Kakita: 4 vs 7: Tattooed Wanderer');
            expect(this.getChatLogs(5)).toContain('Duel Effect: send Arrogant Kakita home');
        });

        it('should trigger its reaction on defense', function() {
            this.player1.passConflict();
            this.noMoreActions();
            this.player2.clickPrompt('Pass');
            this.initiateConflict({
                attackers: [this.wanderer],
                defenders: [this.kakita]
            });
            expect(this.player1).toHavePrompt('Choose a character');
            expect(this.player1).toHavePrompt('Arrogant Kakita');
        });

        it('should not trigger its reaction when there\'s no defenders', function() {
            this.initiateConflict({
                attackers: [this.kakita],
                defenders: []
            });
            expect(this.player1).not.toHavePrompt('Choose a character');
            expect(this.player2).toHavePrompt('Conflict Action Window');
        });

        it('SSK - should not trigger its reaction on defense (defenders declared before attackers)', function() {
            this.player1.passConflict();
            this.noMoreActions();
            this.player2.clickCard(this.ssk);
            this.player1.clickCard(this.kakita);
            this.player1.clickPrompt('Done');
            this.player2.clickCard(this.wanderer);
            this.player2.clickRing('air');
            this.player2.clickCard(this.sd1);
            this.player2.clickPrompt('Initiate Conflict');
            expect(this.player1).toHavePrompt('Conflict Action Window');
        });
    });
});
