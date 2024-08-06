describe('Kitsuki Masanori', function () {
    integration(function () {
        describe('anti-covert', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['iuchi-shahai']
                    },
                    player2: {
                        inPlay: ['kitsuki-masanori', 'doji-whisperer', 'tengu-sensei', 'doji-challenger'],
                        provinces: ['manicured-garden']
                    }
                });
                this.shahai = this.player1.findCardByName('iuchi-shahai');

                this.masanori = this.player2.findCardByName('kitsuki-masanori');
                this.whisperer = this.player2.findCardByName('doji-whisperer');
                this.tengu = this.player2.findCardByName('tengu-sensei');
                this.challenger = this.player2.findCardByName('doji-challenger');
                this.garden = this.player2.findCardByName('manicured-garden');
            });

            it('should not allow being chosen by covert', function () {
                this.noMoreActions();
                this.player1.clickRing('air');
                this.player1.clickCard(this.garden);
                this.player1.clickCard(this.shahai);
                this.player1.clickPrompt('Initiate Conflict');
                expect(this.player1).toHavePrompt('Choose covert target for Iuchi Shahai');
                expect(this.player1).not.toBeAbleToSelect(this.masanori);
                expect(this.player1).toBeAbleToSelect(this.whisperer);
                expect(this.player1).not.toBeAbleToSelect(this.tengu);
                expect(this.player1).toBeAbleToSelect(this.challenger);
            });
        });

        describe('When played reaction', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['mirumoto-raitsugu'],
                        dynastyDiscard: ['kitsuki-masanori'],
                        conflictDiscard: [
                            'a-new-name',
                            'high-kick',
                            'duelist-training',
                            'writ-of-sanctification',
                            'shiba-s-oath',
                            'justicar-s-approach'
                        ],
                        hand: ['hidden-lineage', 'true-strike-kenjutsu', 'forebearer-s-echoes']
                    },
                    player2: {
                        inPlay: ['iuchi-rimei'],
                        hand: ['let-go', 'fine-katana']
                    }
                });

                this.masanori = this.player1.findCardByName('kitsuki-masanori');
                this.raitsugu = this.player1.findCardByName('mirumoto-raitsugu');
                this.echoes = this.player1.findCardByName('forebearer-s-echoes');
                this.trueStrike = this.player1.findCardByName('true-strike-kenjutsu');
                this.lineage = this.player1.findCardByName('hidden-lineage');

                this.ann = this.player1.findCardByName('a-new-name'); // not a technique or title
                this.highKick = this.player1.findCardByName('high-kick'); // technnique, but not an attachment
                this.duelistTraining = this.player1.findCardByName('duelist-training'); // technique
                this.writ = this.player1.findCardByName('writ-of-sanctification'); // title - cannot equip
                this.oath = this.player1.findCardByName('shiba-s-oath'); // title - can equip
                this.justicarsApproach = this.player1.findCardByName('justicar-s-approach'); // technique in discard - can equip

                this.player1.moveCard(this.ann, 'conflict deck');
                this.player1.moveCard(this.highKick, 'conflict deck');
                this.player1.moveCard(this.duelistTraining, 'conflict deck');
                this.player1.moveCard(this.writ, 'conflict deck');
                this.player1.moveCard(this.oath, 'conflict deck');

                this.katana = this.player2.findCardByName('fine-katana');
                this.rimei = this.player2.findCardByName('iuchi-rimei');
                this.letGo = this.player2.findCardByName('let-go');
            });

            it('should react to entering play', function () {
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.raitsugu],
                    defenders: []
                });
                this.player2.pass();
                this.player1.clickCard(this.echoes);
                this.player1.clickCard(this.masanori);
                expect(this.player1).toHavePrompt('Triggered Abilities');
                expect(this.player1).toBeAbleToSelect(this.masanori);
            });

            it('searches deck for a title or technique and equips it', function () {
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.raitsugu],
                    defenders: []
                });
                this.player2.pass();
                this.player1.clickCard(this.echoes);
                this.player1.clickCard(this.masanori);
                this.player1.clickCard(this.masanori);
                expect(this.player1).toHavePrompt('Select where to search');
                expect(this.player1).toHavePromptButton('Search discard pile');
                expect(this.player1).toHavePromptButton('Search conflict deck');

                this.player1.clickPrompt('Search conflict deck');
                expect(this.player1).toHavePrompt('Select an attachment');
                expect(this.player1).toHavePromptButton(this.oath.name);
                expect(this.player1).toHavePromptButton(this.duelistTraining.name);
                expect(this.player1).toHavePromptButton('Take nothing');

                this.player1.clickPrompt(this.duelistTraining.name);

                expect(this.duelistTraining.parent).toBe(this.masanori);
                expect(this.duelistTraining.location).toBe('play area');

                expect(this.getChatLogs(8)).toContain(
                    'player1 uses Kitsuki Masanori to search for a Technique or Title'
                );
                expect(this.getChatLogs(8)).toContain('player1 searches their conflict deck');
                expect(this.getChatLogs(8)).toContain(
                    'player1 takes Duelist Training and attaches it to Kitsuki Masanori'
                );
                expect(this.getChatLogs(8)).toContain('player1 is shuffling their conflict deck');
            });

            it('searches discard pile for a title or technique and equips it', function () {
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.raitsugu],
                    defenders: []
                });
                this.player2.pass();
                this.player1.clickCard(this.echoes);
                this.player1.clickCard(this.masanori);
                this.player1.clickCard(this.masanori);
                expect(this.player1).toHavePrompt('Select where to search');
                expect(this.player1).toHavePromptButton('Search discard pile');
                expect(this.player1).toHavePromptButton('Search conflict deck');

                this.player1.clickPrompt('Search discard pile');
                expect(this.player1).toHavePrompt('Select an attachment');
                expect(this.player1).toHavePromptButton(this.justicarsApproach.name);

                this.player1.clickPrompt(this.justicarsApproach.name);
                expect(this.justicarsApproach.parent).toBe(this.masanori);
                expect(this.justicarsApproach.location).toBe('play area');

                expect(this.getChatLogs(8)).toContain(
                    'player1 uses Kitsuki Masanori to search for a Technique or Title'
                );
                expect(this.getChatLogs(8)).toContain('player1 searches their discard pile');
                expect(this.getChatLogs(8)).toContain(
                    'player1 takes Justicar\'s Approach and attaches it to Kitsuki Masanori'
                );
                expect(this.getChatLogs(8)).not.toContain('player1 is shuffling their conflict deck');
            });

            it('attachment from deck should be unable to be targeted while its on the character, but others should be fine', function () {
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.raitsugu],
                    defenders: []
                });
                this.player2.pass();
                this.player1.clickCard(this.echoes);
                this.player1.clickCard(this.masanori);
                this.player1.clickCard(this.masanori);
                this.player1.clickPrompt('Search conflict deck');
                this.player1.clickPrompt('Duelist Training');

                this.player2.playAttachment(this.katana, this.masanori);
                this.player1.playAttachment(this.trueStrike, this.masanori);

                this.player2.clickCard(this.letGo);
                expect(this.player2).toBeAbleToSelect(this.katana);
                expect(this.player2).toBeAbleToSelect(this.trueStrike);
                expect(this.player2).not.toBeAbleToSelect(this.duelistTraining);
                this.player2.clickPrompt('Cancel');

                this.player2.clickCard(this.rimei);
                expect(this.player2).not.toBeAbleToSelect(this.katana);
                expect(this.player2).toBeAbleToSelect(this.trueStrike);
                expect(this.player2).not.toBeAbleToSelect(this.duelistTraining);
            });

            it('attachment from discard should be unable to be targeted while its on the character, but others should be fine', function () {
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.raitsugu],
                    defenders: []
                });
                this.player2.pass();
                this.player1.clickCard(this.echoes);
                this.player1.clickCard(this.masanori);

                this.player1.clickCard(this.masanori);
                this.player1.clickPrompt('Search discard pile');
                this.player1.clickPrompt(this.justicarsApproach.name);

                this.player2.playAttachment(this.katana, this.masanori);
                this.player1.playAttachment(this.trueStrike, this.masanori);

                this.player2.clickCard(this.letGo);
                expect(this.player2).toBeAbleToSelect(this.katana);
                expect(this.player2).toBeAbleToSelect(this.trueStrike);
                expect(this.player2).not.toBeAbleToSelect(this.justicarsApproach);
                this.player2.clickPrompt('Cancel');

                this.player2.clickCard(this.rimei);
                expect(this.player2).not.toBeAbleToSelect(this.katana);
                expect(this.player2).toBeAbleToSelect(this.trueStrike);
                expect(this.player2).not.toBeAbleToSelect(this.justicarsApproach);
            });

            it('attachment should be able to be targeted while its on a different character', function () {
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.raitsugu],
                    defenders: []
                });
                this.player2.pass();
                this.player1.clickCard(this.echoes);
                this.player1.clickCard(this.masanori);
                this.player1.clickCard(this.masanori);
                this.player1.clickPrompt('Search conflict deck');
                this.player1.clickPrompt('Duelist Training');

                this.player2.playAttachment(this.katana, this.masanori);
                this.player1.playAttachment(this.trueStrike, this.masanori);
                this.player2.pass();
                this.player1.clickCard(this.lineage);
                this.player1.clickCard(this.duelistTraining);
                this.player1.clickCard(this.raitsugu);

                this.player2.clickCard(this.letGo);
                expect(this.player2).toBeAbleToSelect(this.katana);
                expect(this.player2).toBeAbleToSelect(this.trueStrike);
                expect(this.player2).toBeAbleToSelect(this.duelistTraining);
            });
        });
    });
});
