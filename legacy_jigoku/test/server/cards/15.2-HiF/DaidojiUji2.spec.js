describe('Daidoji Uji 2', function () {
    integration(function () {
        describe('Daidoji Uji 2\'s reaction', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'dynasty',
                    player1: {
                        dynastyDiscard: ['daidoji-uji-2'],
                        conflictDiscard: [
                            'assassination',
                            'let-go',
                            'a-new-name',
                            'voice-of-honor',
                            'ornate-fan',
                            'fine-katana',
                            'seal-of-the-crane',
                            'fine-katana',
                            'ready-for-battle'
                        ],
                        hand: ['way-of-the-crane']
                    }
                });

                this.uji = this.player1.placeCardInProvince('daidoji-uji-2', 'province 1');

                this.assassination = this.player1.moveCard('assassination', 'conflict deck');
                this.letGo = this.player1.moveCard('let-go', 'conflict deck');
                this.ann = this.player1.moveCard('a-new-name', 'conflict deck');
                this.voice = this.player1.moveCard('voice-of-honor', 'conflict deck');
                this.fan = this.player1.moveCard('ornate-fan', 'conflict deck');
                this.katana = this.player1.filterCardsByName('fine-katana')[0];
                this.katana2 = this.player1.filterCardsByName('fine-katana')[1];
                this.player1.moveCard(this.katana, 'conflict deck');
                this.player1.moveCard(this.katana2, 'conflict deck');
                this.seal = this.player1.moveCard('seal-of-the-crane', 'conflict deck');
                this.readyForBattle = this.player1.moveCard('ready-for-battle', 'conflict deck');
                this.way = this.player1.findCardByName('way-of-the-crane');
            });

            it('should trigger when played in dynasty', function () {
                this.player1.clickCard(this.uji);
                this.player1.clickPrompt('0');
                expect(this.player1).toBeAbleToSelect(this.uji);
            });

            it('should allow you to select cards from your conflict deck when triggered', function () {
                this.player1.clickCard(this.uji);
                this.player1.clickPrompt('0');
                expect(this.player1).toBeAbleToSelect(this.uji);
                this.player1.clickCard(this.uji);
                expect(this.player1).toHavePrompt('Select up to 4 cards');

                expect(this.player1).toHavePromptButton('Assassination');
                expect(this.player1).toHavePromptButton('Let Go');
                expect(this.player1).toHavePromptButton('A New Name');
                expect(this.player1).toHavePromptButton('Voice of Honor');
                expect(this.player1).toHavePromptButton('Ornate Fan');
                expect(this.player1).toHavePromptButton('Fine Katana (2)');
                expect(this.player1).toHavePromptButton('Seal of the Crane');
                expect(this.player1).toHavePromptButton('Ready for Battle');
                expect(this.player1).toHavePromptButton('Take nothing');
            });

            it('should let you select up to 4 cards', function () {
                this.player1.clickCard(this.uji);
                this.player1.clickPrompt('0');
                this.player1.clickCard(this.uji);
                this.player1.clickPrompt('Fine Katana (2)');
                expect(this.player1).toHavePromptButton('Fine Katana');
                expect(this.player1).not.toHavePromptButton('Take nothing');
                expect(this.player1).toHavePromptButton('Done');
                this.player1.clickPrompt('Fine Katana');
                expect(this.player1).not.toHavePromptButton('Fine Katana');
                expect(this.player1).toHavePromptButton('Done');
                this.player1.clickPrompt('Voice of Honor');
                expect(this.player1).toHavePromptButton('Done');
                this.player1.clickPrompt('Ready for Battle');

                expect(this.katana.location).toBe(this.uji.uuid);
                expect(this.katana2.location).toBe(this.uji.uuid);
                expect(this.voice.location).toBe(this.uji.uuid);
                expect(this.readyForBattle.location).toBe(this.uji.uuid);

                expect(this.getChatLogs(5)).toContain('player1 uses Daidoji Uji to search their deck');
                expect(this.getChatLogs(5)).toContain('player1 selects 4 cards');
                expect(this.getChatLogs(5)).toContain('player1 is shuffling their conflict deck');
            });

            it('cards should be hidden to player2 and not player1', function () {
                this.player1.clickCard(this.uji);
                this.player1.clickPrompt('0');
                this.player1.clickCard(this.uji);
                this.player1.clickPrompt('Fine Katana (2)');
                this.player1.clickPrompt('Fine Katana');
                this.player1.clickPrompt('Voice of Honor');
                this.player1.clickPrompt('Ready for Battle');

                expect(this.katana.anyEffect('hideWhenFaceUp')).toBe(true);
                expect(this.katana2.anyEffect('hideWhenFaceUp')).toBe(true);
                expect(this.voice.anyEffect('hideWhenFaceUp')).toBe(true);
                expect(this.readyForBattle.anyEffect('hideWhenFaceUp')).toBe(true);
            });
        });

        describe('Daidoji Uji 2\'s constant ability', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['brash-samurai'],
                        dynastyDiscard: ['daidoji-uji-2'],
                        conflictDiscard: [
                            'assassination',
                            'let-go',
                            'a-new-name',
                            'voice-of-honor',
                            'ornate-fan',
                            'fine-katana',
                            'seal-of-the-crane',
                            'fine-katana',
                            'ready-for-battle',
                            'defend-your-honor'
                        ],
                        hand: ['way-of-the-crane', 'charge']
                    },
                    player2: {
                        inPlay: ['solemn-scholar'],
                        hand: ['mirumoto-s-fury', 'cloud-the-mind', 'mark-of-shame', 'i-can-swim']
                    }
                });

                this.player1.player.showBid = 1;
                this.player2.player.showBid = 5;

                this.uji = this.player1.placeCardInProvince('daidoji-uji-2', 'province 1');

                this.assassination = this.player1.moveCard('assassination', 'conflict deck');
                this.letGo = this.player1.moveCard('let-go', 'conflict deck');
                this.ann = this.player1.moveCard('a-new-name', 'conflict deck');
                this.voice = this.player1.moveCard('voice-of-honor', 'conflict deck');
                this.fan = this.player1.moveCard('ornate-fan', 'conflict deck');
                this.katana = this.player1.filterCardsByName('fine-katana')[0];
                this.katana2 = this.player1.filterCardsByName('fine-katana')[1];
                this.player1.moveCard(this.katana, 'conflict deck');
                this.player1.moveCard(this.katana2, 'conflict deck');
                this.seal = this.player1.moveCard('seal-of-the-crane', 'conflict deck');
                this.readyForBattle = this.player1.moveCard('ready-for-battle', 'conflict deck');
                this.way = this.player1.findCardByName('way-of-the-crane');
                this.dyh = this.player1.moveCard('defend-your-honor', 'conflict deck');

                this.charge = this.player1.findCardByName('charge');
                this.brash = this.player1.findCardByName('brash-samurai');
                this.scholar = this.player2.findCardByName('solemn-scholar');
                this.cloud = this.player2.findCardByName('cloud-the-mind');
                this.fury = this.player2.findCardByName('mirumoto-s-fury');

                this.swim = this.player2.findCardByName('i-can-swim');
                this.mos = this.player2.findCardByName('mark-of-shame');

                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.brash],
                    defenders: [this.scholar],
                    type: 'military'
                });
            });

            it('should trigger when put into play', function () {
                this.player2.pass();
                this.player1.clickCard(this.charge);
                this.player1.clickCard(this.uji);
                expect(this.player1).toBeAbleToSelect(this.uji);
            });

            it('should not allow you to play cards from under Uji if he\'s not honored', function () {
                this.player2.pass();
                this.player1.clickCard(this.charge);
                this.player1.clickCard(this.uji);
                this.player1.clickCard(this.uji);

                this.player1.clickPrompt('Fine Katana (2)');
                this.player1.clickPrompt('Fine Katana');
                this.player1.clickPrompt('Voice of Honor');
                this.player1.clickPrompt('Ready for Battle');

                this.player2.pass();
                expect(this.player1).toHavePrompt('Conflict Action Window');
                this.player1.clickCard(this.katana);
                expect(this.player1).toHavePrompt('Conflict Action Window');
            });

            it('should allow you to play cards from under Uji if he\'s honored', function () {
                this.player2.pass();
                this.player1.clickCard(this.charge);
                this.player1.clickCard(this.uji);
                this.player1.clickCard(this.uji);

                this.player1.clickPrompt('Fine Katana (2)');
                this.player1.clickPrompt('Fine Katana');
                this.player1.clickPrompt('Voice of Honor');
                this.player1.clickPrompt('Ready for Battle');

                this.player2.pass();
                this.player1.clickCard(this.way);
                this.player1.clickCard(this.uji);
                this.player2.pass();
                expect(this.player1.player.additionalPiles[this.uji.uuid].cards).toContain(this.katana);
                expect(this.player1).toHavePrompt('Conflict Action Window');
                this.player1.clickCard(this.katana);
                expect(this.player1).toHavePrompt('Fine Katana');
                this.player1.clickCard(this.uji);
                expect(this.uji.attachments).toContain(this.katana);
                expect(this.player1.player.additionalPiles[this.uji.uuid].cards).not.toContain(this.katana);
            });

            it('should allow you to play cards from under Uji if he\'s honored - reactions', function () {
                this.game.rings.earth.claimRing(this.player2);
                this.player2.pass();
                this.player1.clickCard(this.charge);
                this.player1.clickCard(this.uji);
                this.player1.clickCard(this.uji);

                this.player1.clickPrompt('Fine Katana (2)');
                this.player1.clickPrompt('Fine Katana');
                this.player1.clickPrompt('Voice of Honor');
                this.player1.clickPrompt('Ready for Battle');

                this.player2.pass();
                this.player1.clickCard(this.way);
                this.player1.clickCard(this.uji);
                this.player2.clickCard(this.scholar);
                this.player2.clickCard(this.uji);
                expect(this.uji.bowed).toBe(true);
                expect(this.player1).toHavePrompt('Triggered Abilities');
                expect(this.player1).toBeAbleToSelect(this.readyForBattle);
                this.player1.clickCard(this.readyForBattle);
                expect(this.uji.bowed).toBe(false);
                expect(this.getChatLogs(10)).toContain(
                    'player1 plays Ready for Battle from their cards set aside by Daidoji Uji'
                );
            });

            it('should allow you to play cards from under Uji if he\'s honored - interrupts', function () {
                this.game.rings.earth.claimRing(this.player2);
                this.player2.pass();
                this.player1.clickCard(this.charge);
                this.player1.clickCard(this.uji);
                this.player1.clickCard(this.uji);

                this.player1.clickPrompt('Fine Katana (2)');
                this.player1.clickPrompt('Fine Katana');
                this.player1.clickPrompt('Voice of Honor');
                this.player1.clickPrompt('Ready for Battle');

                this.player2.pass();
                this.player1.clickCard(this.way);
                this.player1.clickCard(this.uji);
                this.player2.clickCard(this.fury);
                this.player2.clickCard(this.uji);
                expect(this.uji.bowed).toBe(false);
                expect(this.player1).toHavePrompt('Triggered Abilities');
                expect(this.player1).toBeAbleToSelect(this.voice);
                this.player1.clickCard(this.voice);
                expect(this.uji.bowed).toBe(false);
                expect(this.getChatLogs(10)).toContain(
                    'player1 plays Voice of Honor from their cards set aside by Daidoji Uji'
                );
            });

            it('should not allow you to play cards from under Uji if he\'s blanked', function () {
                this.game.rings.earth.claimRing(this.player2);
                this.player2.pass();
                this.player1.clickCard(this.charge);
                this.player1.clickCard(this.uji);
                this.player1.clickCard(this.uji);

                this.player1.clickPrompt('Fine Katana (2)');
                this.player1.clickPrompt('Fine Katana');
                this.player1.clickPrompt('Voice of Honor');
                this.player1.clickPrompt('Ready for Battle');

                this.player2.pass();
                this.player1.clickCard(this.way);
                this.player1.clickCard(this.uji);
                this.player2.playAttachment(this.cloud, this.uji);
                this.player1.pass();
                this.player2.clickCard(this.fury);
                this.player2.clickCard(this.uji);
                expect(this.uji.bowed).toBe(true);
                expect(this.player1).not.toHavePrompt('Triggered Abilities');
                expect(this.player1).not.toBeAbleToSelect(this.voice);
            });

            it('should remove cards under Uji from the game if he leaves play', function () {
                this.player2.pass();
                this.player1.clickCard(this.charge);
                this.player1.clickCard(this.uji);
                this.player1.clickCard(this.uji);

                this.player1.clickPrompt('Fine Katana (2)');
                this.player1.clickPrompt('Fine Katana');
                this.player1.clickPrompt('Voice of Honor');
                this.player1.clickPrompt('Ready for Battle');

                this.player2.pass();
                this.player1.clickCard(this.way);
                this.player1.clickCard(this.uji);
                this.player2.pass();

                this.player1.clickCard(this.katana);
                this.player1.clickCard(this.brash);

                this.player2.clickCard(this.mos);
                this.player2.clickCard(this.uji);
                this.player2.clickCard(this.mos);

                this.player1.pass();

                this.player2.clickCard(this.swim);
                this.player2.clickCard(this.uji);

                expect(this.katana.location).toBe('play area');
                expect(this.katana2.location).toBe('removed from game');
                expect(this.voice.location).toBe('removed from game');
                expect(this.readyForBattle.location).toBe('removed from game');

                expect(this.katana.anyEffect('hideWhenFaceUp')).toBe(false);
                expect(this.katana2.anyEffect('hideWhenFaceUp')).toBe(false);
                expect(this.voice.anyEffect('hideWhenFaceUp')).toBe(false);
                expect(this.readyForBattle.anyEffect('hideWhenFaceUp')).toBe(false);

                expect(this.getChatLogs(10)).toContain(
                    'Fine Katana, Voice of Honor and Ready for Battle are removed from the game due to Daidoji Uji leaving play'
                );
            });

            it('should not allow opponent to play cards', function () {
                this.player2.pass();
                this.player1.clickCard(this.charge);
                this.player1.clickCard(this.uji);
                this.player1.clickCard(this.uji);

                this.player1.clickPrompt('Fine Katana (2)');
                this.player1.clickPrompt('Fine Katana');
                this.player1.clickPrompt('Defend Your Honor');
                this.player1.clickPrompt('Voice of Honor');

                this.player2.pass();
                this.player1.clickCard(this.way);
                this.player1.clickCard(this.uji);
                expect(this.player1.player.additionalPiles[this.uji.uuid].cards).toContain(this.katana);
                expect(this.player2).toHavePrompt('Conflict Action Window');
                this.player2.clickCard(this.katana);
                expect(this.player2).not.toHavePrompt('Fine Katana');
            });
        });
    });
});
