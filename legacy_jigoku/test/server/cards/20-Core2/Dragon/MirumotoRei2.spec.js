describe('Mirumoto Rei 2', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    fate: 20,
                    inPlay: ['mirumoto-rei-2', 'daidoji-uji'],
                    hand: ['fine-katana', 'pathfinder-s-blade'],
                    conflictDiscard: ['two-hands']
                },
                player2: {
                    inPlay: ['kakita-toshimoko', 'shiba-tsukune', 'doji-diplomat'],
                    hand: ['embrace-the-void', 'policy-debate']
                },
                gameMode: 'emerald'
            });

            this.uji = this.player1.findCardByName('daidoji-uji');
            this.rei = this.player1.findCardByName('mirumoto-rei-2');
            this.katana = this.player1.findCardByName('fine-katana');
            this.blade = this.player1.findCardByName('pathfinder-s-blade');

            this.hands = this.player1.findCardByName('two-hands');
            this.toshimoko = this.player2.findCardByName('kakita-toshimoko');
            this.tsukune = this.player2.findCardByName('shiba-tsukune');
            this.diplomat = this.player2.findCardByName('doji-diplomat');

            this.toshimoko.fate = 2;
        });

        it('should discard the loser if they have no fate', function () {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.rei, this.yoshi],
                defenders: [this.tsukune, this.toshimoko]
            });

            this.player2.pass();

            this.player1.clickCard(this.rei);
            this.player1.clickCard(this.tsukune);

            this.player1.clickPrompt('5');
            this.player2.clickPrompt('1');

            expect(this.tsukune.location).toBe('dynasty discard pile');
            expect(this.getChatLogs(10)).toContain('player1 uses Mirumoto Rei to initiate a military duel : Mirumoto Rei vs. Shiba Tsukune');
            expect(this.getChatLogs(10)).toContain('Mirumoto Rei: 8 vs 5: Shiba Tsukune');
            expect(this.getChatLogs(10)).toContain('Duel Effect: injure Shiba Tsukune');
        });

        it('should remove a fate if the loser has a fate', function () {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.rei, this.yoshi],
                defenders: [this.tsukune, this.toshimoko]
            });

            this.player2.pass();

            let fate = this.toshimoko.fate;

            this.player1.clickCard(this.rei);
            this.player1.clickCard(this.toshimoko);

            this.player1.clickPrompt('5');
            this.player2.clickPrompt('1');

            expect(this.toshimoko.location).toBe('play area');
            expect(this.toshimoko.fate).toBe(fate - 1);
            expect(this.getChatLogs(10)).toContain('player1 uses Mirumoto Rei to initiate a military duel : Mirumoto Rei vs. Kakita Toshimoko');
            expect(this.getChatLogs(10)).toContain('Duel Effect: injure Kakita Toshimoko');
        });

        it('duel effect - multiple targets', function () {
            this.player1.moveCard(this.hands, 'hand');

            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.rei, this.yoshi],
                defenders: [this.diplomat, this.toshimoko]
            });

            this.player2.pass();

            let fate = this.toshimoko.fate;

            this.player1.clickCard(this.rei);
            this.player1.clickCard(this.toshimoko);
            this.player1.clickCard(this.hands);
            this.player1.clickCard(this.diplomat);

            this.player1.clickPrompt('5');
            this.player2.clickPrompt('1');

            expect(this.toshimoko.location).toBe('play area');
            expect(this.toshimoko.fate).toBe(fate - 1);
            expect(this.diplomat.location).toBe('dynasty discard pile');
            expect(this.getChatLogs(10)).toContain('Mirumoto Rei: 8 vs 5: Kakita Toshimoko and Doji Diplomat');
            expect(this.getChatLogs(10)).toContain('Duel Effect: injure Kakita Toshimoko and Doji Diplomat');
        });

        it('should not work in pol conflicts', function () {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.rei, this.yoshi],
                defenders: [this.tsukune, this.toshimoko],
                type: 'political'
            });

            this.player2.pass();

            expect(this.player1).toHavePrompt('Conflict Action Window');
            this.player1.clickCard(this.rei);
            expect(this.player1).toHavePrompt('Conflict Action Window');
        });

        it('duel challenge', function () {
            this.player1.playAttachment(this.katana, this.rei);
            this.player2.pass();
            this.player1.playAttachment(this.blade, this.rei);

            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.rei, this.yoshi],
                defenders: [this.tsukune, this.toshimoko]
            });

            this.player2.pass();

            this.player1.clickCard(this.rei);
            this.player1.clickCard(this.tsukune);
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.rei);
            this.player1.clickCard(this.rei);

            expect(this.getChatLogs(10)).toContain('player1 uses Mirumoto Rei to initiate a military duel : Mirumoto Rei vs. Shiba Tsukune');
            expect(this.getChatLogs(10)).toContain('player1 uses Mirumoto Rei to add 2 to their duel total');

            this.player1.clickPrompt('5');
            this.player2.clickPrompt('1');

            expect(this.tsukune.location).toBe('dynasty discard pile');
            expect(this.getChatLogs(10)).toContain('Mirumoto Rei: 10 vs 5: Shiba Tsukune');
            expect(this.getChatLogs(10)).toContain('Duel Effect: injure Shiba Tsukune');
        });
    });
});
