describe('Isawa Hifumi', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['isawa-hifumi', 'adept-of-the-waves'],
                    hand: ['soshi-s-memory', 'fine-katana', 'ornate-fan'],
                    conflictDiscard: ['hiruma-skirmisher', 'against-the-waves', 'let-go']
                },
                player2: {
                    inPlay: ['matsu-berserker']
                }
            });

            this.isawaHifumi = this.player1.findCardByName('isawa-hifumi');
            this.isawaHifumi.fate = 2;
            this.adeptOfTheWaves = this.player1.findCardByName('adept-of-the-waves');
            this.adeptOfTheWaves.fate = 1;
            this.adeptOfTheWaves.bow();

            this.letGo = this.player1.findCardByName('let-go');
            this.fineKatana = this.player1.findCardByName('fine-katana');
            this.skirmisher = this.player1.findCardByName('hiruma-skirmisher');
            this.soshisMemory = this.player1.findCardByName('soshi-s-memory');
            this.ornateFan = this.player1.findCardByName('soshi-s-memory');
            this.againstTheWaves = this.player1.findCardByName('against-the-waves');

            this.matsuBerserker = this.player2.findCardByName('matsu-berserker');
            this.matsuBerserker.fate = 2;

            this.player1.playAttachment(this.fineKatana, this.isawaHifumi);
            this.player2.pass();
            this.player1.playAttachment(this.ornateFan, this.isawaHifumi);
        });

        it('replays an event for free the first time', function () {
            this.player1.clickCard(this.soshisMemory);
            this.player1.clickPrompt('player1');
            this.player1.clickPrompt('Supernatural Storm (2)');

            this.player2.pass();
            this.player1.clickCard(this.isawaHifumi);
            expect(this.player1).toHavePrompt('Choose an event');

            this.player1.clickCard(this.soshisMemory);
            this.player1.clickPrompt('player1');
            this.player1.clickPrompt('Supernatural Storm (2)');

            expect(this.isawaHifumi.fate).toBe(2);
            expect(this.soshisMemory.location).toBe('removed from game');
            expect(this.getChatLogs(6)).toContain(
                'player1 uses Isawa Hifumi to play an event from their discard pile (the next time it is used this round will cost 1 fate from player1 characters)'
            );
            expect(this.getChatLogs(6)).toContain("player1 plays Soshi's Memory from their conflict discard pile");
            expect(this.getChatLogs(6)).toContain("Soshi's Memory is removed from the game by Isawa Hifumi's ability");
        });

        it('pays increasing fate costs for following triggers', function () {
            this.player1.clickCard(this.soshisMemory);
            this.player1.clickPrompt('player1');
            this.player1.clickPrompt('Supernatural Storm (2)');
            expect(this.soshisMemory.location).toBe('conflict discard pile');

            /**
             * FIRST HIFUMI
             */
            this.player2.pass();
            this.player1.clickCard(this.isawaHifumi);
            expect(this.player1).toHavePrompt('Choose an event');
            this.player1.clickCard(this.soshisMemory);
            this.player1.clickPrompt('player1');
            this.player1.clickPrompt('Supernatural Storm (2)');

            expect(this.isawaHifumi.fate).toBe(2);
            expect(this.soshisMemory.location).toBe('removed from game');
            expect(this.getChatLogs(6)).toContain(
                'player1 uses Isawa Hifumi to play an event from their discard pile (the next time it is used this round will cost 1 fate from player1 characters)'
            );
            expect(this.getChatLogs(6)).toContain("player1 plays Soshi's Memory from their conflict discard pile");
            expect(this.getChatLogs(6)).toContain("Soshi's Memory is removed from the game by Isawa Hifumi's ability");

            /**
             * SECOND HIFUMI
             */
            this.player2.pass();
            this.player1.clickCard(this.isawaHifumi);
            expect(this.player1).toHavePrompt('Choose a card to help pay the fate cost of Isawa Hifumi');
            expect(this.player1).toBeAbleToSelect(this.isawaHifumi);
            expect(this.player1).toBeAbleToSelect(this.adeptOfTheWaves);
            expect(this.player1).not.toBeAbleToSelect(this.matsuBerserker);

            this.player1.clickCard(this.adeptOfTheWaves);
            expect(this.player1).toHavePrompt('Choose amount of fate to spend from Adept of the Waves');

            this.player1.clickPrompt('1');
            expect(this.adeptOfTheWaves.fate).toBe(0);
            expect(this.player1).toHavePrompt('Choose an event');

            this.player1.clickCard(this.againstTheWaves);
            expect(this.player1).toHavePrompt('Against the Waves');

            this.player1.clickCard(this.adeptOfTheWaves);
            expect(this.isawaHifumi.fate).toBe(2);
            expect(this.againstTheWaves.location).toBe('removed from game');
            expect(this.getChatLogs(6)).toContain(
                'player1 uses Isawa Hifumi to play an event from their discard pile (the next time it is used this round will cost 2 fate from player1 characters)'
            );
            expect(this.getChatLogs(6)).toContain('player1 plays Against the Waves from their conflict discard pile');
            expect(this.getChatLogs(6)).toContain(
                "Against the Waves is removed from the game by Isawa Hifumi's ability"
            );

            /**
             * THIRD HIFUMI
             */
            this.player2.pass();
            this.player1.clickCard(this.isawaHifumi);
            expect(this.player1).toHavePrompt('Choose a card to help pay the fate cost of Isawa Hifumi');
            expect(this.player1).toBeAbleToSelect(this.isawaHifumi);
            expect(this.player1).not.toBeAbleToSelect(this.adeptOfTheWaves);
            expect(this.player1).not.toBeAbleToSelect(this.matsuBerserker);

            this.player1.clickCard(this.isawaHifumi);
            expect(this.player1).toHavePrompt('Choose amount of fate to spend from Isawa Hifumi');

            this.player1.clickPrompt('2');
            expect(this.isawaHifumi.fate).toBe(0);
            expect(this.player1).toHavePrompt('Choose an event');

            this.player1.clickCard(this.letGo);
            expect(this.player1).toHavePrompt('Let Go');

            this.player1.clickCard(this.fineKatana);
            expect(this.letGo.location).toBe('removed from game');
            expect(this.getChatLogs(6)).toContain(
                'player1 uses Isawa Hifumi to play an event from their discard pile (the next time it is used this round will cost 3 fate from player1 characters)'
            );
            expect(this.getChatLogs(6)).toContain('player1 plays Let Go from their conflict discard pile');
            expect(this.getChatLogs(6)).toContain("Let Go is removed from the game by Isawa Hifumi's ability");
        });
    });
});