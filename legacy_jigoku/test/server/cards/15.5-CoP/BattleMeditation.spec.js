describe('Battle Meditation', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['crisis-breaker', 'hida-kisada'],
                    dynastyDiscard: ['doji-whisperer', 'matsu-berserker', 'miya-mystic', 'imperial-storehouse'],
                    hand: ['battle-meditation', 'battle-meditation']
                },
                player2: {
                    inPlay: ['doji-challenger']
                }
            });

            this.crisisBreaker = this.player1.findCardByName('crisis-breaker');
            this.kisada = this.player1.findCardByName('hida-kisada');
            this.battleMeditation = this.player1.findAllCardsByName('battle-meditation')[0];
            this.battleMeditation2 = this.player1.findAllCardsByName('battle-meditation')[1];

            this.dojiChallenger = this.player2.findCardByName('doji-challenger');
        });

        it('should trigger on breaking an enemy province', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.crisisBreaker],
                defenders: [],
                type: 'military'
            });

            this.noMoreActions();

            this.player1.clickPrompt('no');
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.battleMeditation);
        });

        it('should have a limit one per conflict', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.crisisBreaker],
                defenders: [],
                type: 'military'
            });

            this.noMoreActions();

            this.player1.clickPrompt('no');
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.battleMeditation);
            expect(this.player1).toBeAbleToSelect(this.battleMeditation2);

            this.player1.clickCard(this.battleMeditation);

            expect(this.player1).not.toHavePrompt('Triggered Abilities');
            expect(this.player1).not.toBeAbleToSelect(this.battleMeditation);
            expect(this.player1).not.toBeAbleToSelect(this.battleMeditation2);
            expect(this.player1).toHavePrompt('air ring');
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
            expect(this.player1).toHavePrompt('air ring');
        });

        it('should not trigger on breaking an friendly province', function() {
            this.noMoreActions();
            this.player1.passConflict();
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.dojiChallenger],
                defenders: [this.crisisBreaker],
                type: 'military'
            });

            this.crisisBreaker.bowed = true;
            this.noMoreActions();

            this.player2.clickPrompt('no');
            expect(this.player1).not.toHavePrompt('Triggered Abilities');
            expect(this.player2).toHavePrompt('air ring');
        });

        it('should draw 3 cards', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.crisisBreaker],
                defenders: [],
                type: 'military'
            });

            this.noMoreActions();

            const handSize = this.player1.hand.length;

            this.player1.clickPrompt('no');
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.battleMeditation);

            this.player1.clickCard(this.battleMeditation);

            expect(this.player1.hand.length).toBe(handSize + 2); // -1 BM and +3 cards
            expect(this.getChatLogs(5)).toContain('player1 plays Battle Meditation to draw 3 cards');
        });
    });
});
