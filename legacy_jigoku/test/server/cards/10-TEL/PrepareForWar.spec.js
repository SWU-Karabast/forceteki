describe('Prepare for War', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['akodo-zentaro', 'matsu-berserker'],
                    hand: ['ornate-fan', 'fine-katana', 'cloud-the-mind', 'prepare-for-war']
                },
                player2: {
                    inPlay: ['mirumoto-raitsugu'],
                    hand: ['pacifism']
                }
            });

            this.akodoZentaro = this.player1.findCardByName('akodo-zentaro');
            this.matsuBerserker = this.player1.findCardByName('matsu-berserker');
            this.ornateFan = this.player1.findCardByName('ornate-fan');
            this.fineKatana = this.player1.findCardByName('fine-katana');
            this.cloudTheMind = this.player1.findCardByName('cloud-the-mind');
            this.prepareForWar = this.player1.findCardByName('prepare-for-war');

            this.mirumotoRaitsugu = this.player2.findCardByName('mirumoto-raitsugu');
            this.pacifism = this.player2.findCardByName('pacifism');
        });

        it('should not allow you to target a non-commander that is neutral and has no attachments', function() {
            this.player1.clickCard(this.prepareForWar);
            expect(this.player1).toBeAbleToSelect(this.akodoZentaro);
            expect(this.player1).not.toBeAbleToSelect(this.matsuBerserker);
        });

        it('should allow you to target a non-commander that has a status token and has no attachments', function() {
            this.matsuBerserker.honor();
            this.player1.clickCard(this.prepareForWar);
            expect(this.player1).toBeAbleToSelect(this.matsuBerserker);
        });

        it('should allow you to target a non-commander that has an attachment and has no status token', function() {
            this.player1.playAttachment(this.fineKatana, this.matsuBerserker);
            this.player2.pass();

            this.player1.clickCard(this.prepareForWar);
            expect(this.player1).toBeAbleToSelect(this.matsuBerserker);
        });

        it('should not allow you to target a enemy character', function() {
            this.player1.playAttachment(this.fineKatana, this.mirumotoRaitsugu);
            this.player2.pass();

            this.player1.clickCard(this.prepareForWar);
            expect(this.player1).not.toBeAbleToSelect(this.mirumotoRaitsugu);
        });

        it('should prompt to discard any number of attached attachments from the character', function() {
            this.player1.playAttachment(this.fineKatana, this.matsuBerserker);
            this.player2.playAttachment(this.pacifism, this.matsuBerserker);

            this.player1.playAttachment(this.ornateFan, this.matsuBerserker);
            this.player2.pass();

            this.player1.clickCard(this.prepareForWar);
            expect(this.player1).toBeAbleToSelect(this.matsuBerserker);
            this.player1.clickCard(this.matsuBerserker);

            expect(this.player1).toHavePrompt('Choose any amount of attachments');
            expect(this.player1).toBeAbleToSelect(this.fineKatana);
            expect(this.player1).toBeAbleToSelect(this.pacifism);
            expect(this.player1).toBeAbleToSelect(this.ornateFan);
            this.player1.clickCard(this.ornateFan);
            this.player1.clickCard(this.pacifism);
            this.player1.clickPrompt('Done');

            expect(this.ornateFan.location).toBe('conflict discard pile');
            expect(this.pacifism.location).toBe('conflict discard pile');
            expect(this.fineKatana.location).toBe('play area');

            expect(this.getChatLogs(2)).toContain('player1 plays Prepare for War to choose to discard any number of attachments from Matsu Berserker');
            expect(this.getChatLogs(1)).toContain('player1 chooses to discard Ornate Fan and Pacifism from Matsu Berserker');
        });

        it('should prompt to discard the status token from the character', function() {
            this.matsuBerserker.honor();
            this.player1.clickCard(this.prepareForWar);
            expect(this.player1).toBeAbleToSelect(this.matsuBerserker);
            this.player1.clickCard(this.matsuBerserker);

            expect(this.player1).toHavePrompt('Do you wish to discard Honored Token?');
            this.player1.clickPrompt('Yes');

            expect(this.getChatLogs(2)).toContain('player1 plays Prepare for War to choose to discard the status token from Matsu Berserker');
            expect(this.getChatLogs(1)).toContain('player1 chooses to discard Honored Token from Matsu Berserker');
            expect(this.matsuBerserker.isHonored).toBe(false);
        });

        it('should prompt to discard the status token from the character and honor it if it\'s a commander, going from dishonored to honored', function() {
            this.akodoZentaro.dishonor();
            this.player1.clickCard(this.prepareForWar);
            expect(this.player1).toBeAbleToSelect(this.akodoZentaro);
            this.player1.clickCard(this.akodoZentaro);

            expect(this.player1).toHavePrompt('Do you wish to discard Dishonored Token?');
            this.player1.clickPrompt('Yes');

            expect(this.getChatLogs(2)).toContain('player1 plays Prepare for War to honor and choose to discard the status token from Akodo Zentarō');
            expect(this.getChatLogs(1)).toContain('player1 chooses to discard Dishonored Token from Akodo Zentarō');
            expect(this.akodoZentaro.isHonored).toBe(true);
        });

        it('should prompt to discard the status token from the character and honor it if it\'s a commander, going from honored back to neutral', function() {
            this.akodoZentaro.honor();
            this.player1.clickCard(this.prepareForWar);
            expect(this.player1).toBeAbleToSelect(this.akodoZentaro);
            this.player1.clickCard(this.akodoZentaro);

            expect(this.player1).toHavePrompt('Do you wish to discard Honored Token?');
            this.player1.clickPrompt('Yes');

            expect(this.akodoZentaro.isHonored).toBe(true);
            expect(this.akodoZentaro.isDishonored).toBe(false);
        });

        it('chat message - neutral commander with no attachments', function() {
            this.player1.clickCard(this.prepareForWar);
            this.player1.clickCard(this.akodoZentaro);
            expect(this.getChatLogs(3)).toContain('player1 plays Prepare for War to honor Akodo Zentarō');
        });

        it('should prompt to discard each the status token from the character', function() {
            this.akodoZentaro.dishonor();
            this.akodoZentaro.taint();
            this.player1.clickCard(this.prepareForWar);
            expect(this.player1).toBeAbleToSelect(this.akodoZentaro);
            this.player1.clickCard(this.akodoZentaro);

            expect(this.player1).toHavePrompt('Do you wish to discard Dishonored Token?');
            this.player1.clickPrompt('Yes');
            expect(this.player1).toHavePrompt('Do you wish to discard Tainted Token?');
            this.player1.clickPrompt('Yes');

            expect(this.akodoZentaro.isDishonored).toBe(false);
            expect(this.akodoZentaro.isTainted).toBe(false);

            expect(this.getChatLogs(5)).toContain('player1 plays Prepare for War to honor and choose to discard the status token from Akodo Zentarō');
            expect(this.getChatLogs(4)).toContain('player1 chooses to discard Dishonored Token from Akodo Zentarō');
            expect(this.getChatLogs(3)).toContain('player1 chooses to discard Tainted Token from Akodo Zentarō');
            expect(this.akodoZentaro.isHonored).toBe(true);
        });

        it('should prompt to discard each the status token from the character', function() {
            this.akodoZentaro.dishonor();
            this.akodoZentaro.taint();
            this.player1.clickCard(this.prepareForWar);
            expect(this.player1).toBeAbleToSelect(this.akodoZentaro);
            this.player1.clickCard(this.akodoZentaro);

            expect(this.player1).toHavePrompt('Do you wish to discard Dishonored Token?');
            this.player1.clickPrompt('Yes');
            expect(this.player1).toHavePrompt('Do you wish to discard Tainted Token?');
            this.player1.clickPrompt('No');

            expect(this.akodoZentaro.isDishonored).toBe(false);
            expect(this.akodoZentaro.isTainted).toBe(true);

            expect(this.getChatLogs(5)).toContain('player1 plays Prepare for War to honor and choose to discard the status token from Akodo Zentarō');
            expect(this.getChatLogs(4)).toContain('player1 chooses to discard Dishonored Token from Akodo Zentarō');
            expect(this.getChatLogs(3)).not.toContain('player1 chooses to discard Tainted Token from Akodo Zentarō');
            expect(this.akodoZentaro.isHonored).toBe(true);
        });
    });
});
