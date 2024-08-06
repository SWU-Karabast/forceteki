describe('Kunshu', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['kakita-toshimoko', 'doji-challenger', 'bayushi-kachiko-2'],
                    hand: ['kunshu', 'daimyo-s-gunbai'],
                    conflictDeck: [
                        'a-new-name',
                        'a-new-name',
                        'a-new-name',
                        'a-new-name',
                        'a-new-name',
                        'a-new-name',
                        'a-new-name',
                        'a-new-name',
                        'a-new-name',
                        'a-new-name',
                        'a-new-name',
                        'a-new-name',
                        'a-new-name',
                        'a-new-name',
                        'a-new-name',
                        'a-new-name',
                        'a-new-name',
                        'a-new-name',
                        'a-new-name',
                        'a-new-name'
                    ],
                    conflictDiscard: ['way-of-the-crane']
                },
                player2: {
                    inPlay: ['bayushi-kachiko'],
                    conflictDiscard: [
                        'way-of-the-dragon',
                        'a-fate-worse-than-death',
                        'storied-defeat',
                        'ancient-master',
                        'display-of-power',
                        'favorable-alliance'
                    ]
                }
            });

            this.gunbai = this.player1.findCardByName('daimyo-s-gunbai');
            this.toshimoko = this.player1.findCardByName('kakita-toshimoko');
            this.challenger = this.player1.findCardByName('doji-challenger');
            this.kunshu = this.player1.findCardByName('kunshu');
            this.kachiko = this.player2.findCardByName('bayushi-kachiko');
            this.kachiko2 = this.player1.findCardByName('bayushi-kachiko-2');
            this.alliance = this.player2.findCardByName('favorable-alliance');

            this.crane = this.player1.findCardByName('way-of-the-crane');
            this.dragon = this.player2.findCardByName('way-of-the-dragon');
            this.defeat = this.player2.findCardByName('storied-defeat');
            this.afwtd = this.player2.findCardByName('a-fate-worse-than-death');
            this.ancientMaster = this.player2.findCardByName('ancient-master');
            this.dop = this.player2.findCardByName('display-of-power');
        });

        it('should allow you to attach to a unique character you control', function () {
            this.player1.clickCard(this.kunshu);
            expect(this.player1).toBeAbleToSelect(this.toshimoko);
            expect(this.player1).not.toBeAbleToSelect(this.challenger);
            expect(this.player1).not.toBeAbleToSelect(this.kachiko);
        });

        it('should allow you to choose an event in your opponent\'s discard pile', function () {
            this.player1.player.imperialFavor = 'political';
            this.player1.clickCard(this.kunshu);
            this.player1.clickCard(this.toshimoko);
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.toshimoko],
                defenders: [this.kachiko]
            });

            this.player2.pass();
            this.player1.clickCard(this.toshimoko);
            expect(this.player1).toHavePrompt('Choose a card');
            expect(this.player1).not.toBeAbleToSelect(this.crane);
            expect(this.player1).toBeAbleToSelect(this.dragon);
            expect(this.player1).not.toBeAbleToSelect(this.defeat);
            expect(this.player1).toBeAbleToSelect(this.afwtd);
            expect(this.player1).not.toBeAbleToSelect(this.ancientMaster);
            expect(this.player1).not.toBeAbleToSelect(this.dop);
        });

        it('ability should not be on the sword', function () {
            this.player1.player.imperialFavor = 'political';
            this.player1.clickCard(this.kunshu);
            this.player1.clickCard(this.toshimoko);
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.toshimoko],
                defenders: [this.kachiko]
            });

            this.player2.pass();
            this.player1.clickCard(this.kunshu);
            expect(this.player1).toHavePrompt('Conflict Action Window');
        });

        it('should play the card, ignoring fate cost - attachment', function () {
            this.player1.player.imperialFavor = 'political';
            this.player1.clickCard(this.kunshu);
            this.player1.clickCard(this.toshimoko);
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.toshimoko],
                defenders: [this.kachiko]
            });

            let fate = this.player1.fate;

            this.player2.pass();
            this.player1.clickCard(this.toshimoko);
            this.player1.clickCard(this.dragon);
            this.player1.clickCard(this.toshimoko);

            expect(this.toshimoko.attachments).toContain(this.dragon);
            expect(this.player1.fate).toBe(fate);
            expect(this.getChatLogs(10)).toContain(
                'player1 uses Kakita Toshimoko\'s gained ability from Kunshu, discarding the Imperial Favor to play Way of the Dragon'
            );
        });

        it('should play the card, ignoring fate cost - event', function () {
            this.player1.player.imperialFavor = 'political';
            this.player1.clickCard(this.kunshu);
            this.player1.clickCard(this.toshimoko);
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.toshimoko],
                defenders: [this.kachiko]
            });

            let fate = this.player1.fate;

            this.player2.pass();
            this.player1.clickCard(this.toshimoko);
            this.player1.clickCard(this.afwtd);
            this.player1.clickCard(this.kachiko);

            expect(this.kachiko.bowed).toBe(true);
            expect(this.kachiko.isDishonored).toBe(true);
            expect(this.player1.fate).toBe(fate);
            expect(this.getChatLogs(10)).toContain(
                'player1 uses Kakita Toshimoko\'s gained ability from Kunshu, discarding the Imperial Favor to play A Fate Worse Than Death'
            );
        });

        it('should discard the favor', function () {
            this.player1.player.imperialFavor = 'political';
            this.player1.clickCard(this.kunshu);
            this.player1.clickCard(this.toshimoko);
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.toshimoko],
                defenders: [this.kachiko]
            });

            let fate = this.player1.fate;

            this.player2.pass();
            this.player1.clickCard(this.toshimoko);
            this.player1.clickCard(this.afwtd);
            this.player1.clickCard(this.kachiko);

            expect(this.kachiko.bowed).toBe(true);
            expect(this.kachiko.isDishonored).toBe(true);
            expect(this.player1.fate).toBe(fate);
            expect(this.player1.player.imperialFavor).toBe('');
        });

        it('should pay fate costs in the text', function () {
            this.player1.player.imperialFavor = 'political';
            this.player1.clickCard(this.kunshu);
            this.player1.clickCard(this.toshimoko);
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.toshimoko],
                defenders: [this.kachiko]
            });

            let fate = this.player1.fate;

            this.player2.pass();
            this.player1.clickCard(this.gunbai);
            this.player1.clickCard(this.toshimoko);
            this.player2.clickCard(this.kachiko);
            this.player1.clickPrompt('1');
            this.player2.clickPrompt('1');

            this.player2.pass();
            this.player1.clickCard(this.toshimoko);
            this.player1.clickCard(this.defeat);
            this.player1.clickCard(this.kachiko);
            this.player1.clickPrompt('Yes');

            expect(this.kachiko.bowed).toBe(true);
            expect(this.kachiko.isDishonored).toBe(true);
            expect(this.player1.fate).toBe(fate - 1);
        });

        it('should play the card even if you can\'t afford it', function () {
            this.player1.player.imperialFavor = 'political';
            this.player1.clickCard(this.kunshu);
            this.player1.clickCard(this.toshimoko);
            this.noMoreActions();
            this.player1.fate = 0;
            this.initiateConflict({
                attackers: [this.toshimoko],
                defenders: [this.kachiko]
            });

            let fate = this.player1.fate;

            this.player2.pass();
            this.player1.clickCard(this.toshimoko);
            expect(this.player1).toHavePrompt('Choose a card');
            expect(this.player1).toBeAbleToSelect(this.afwtd);
            this.player1.clickCard(this.afwtd);
            this.player1.clickCard(this.kachiko);

            expect(this.kachiko.bowed).toBe(true);
            expect(this.kachiko.isDishonored).toBe(true);
            expect(this.player1.fate).toBe(fate);
        });

        it('should do nothing if you don\'t have the favor', function () {
            this.player1.player.imperialFavor = '';
            this.player1.clickCard(this.kunshu);
            this.player1.clickCard(this.toshimoko);
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.toshimoko],
                defenders: [this.kachiko]
            });

            this.player2.pass();
            expect(this.player1).toHavePrompt('Conflict Action Window');
            this.player1.clickCard(this.toshimoko);
            expect(this.player1).toHavePrompt('Conflict Action Window');
        });

        it('should do nothing if not participating', function () {
            this.player1.player.imperialFavor = 'political';
            this.player1.clickCard(this.kunshu);
            this.player1.clickCard(this.toshimoko);
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.challenger],
                defenders: [this.kachiko]
            });

            this.player2.pass();
            expect(this.player1).toHavePrompt('Conflict Action Window');
            this.player1.clickCard(this.toshimoko);
            expect(this.player1).toHavePrompt('Conflict Action Window');
        });

        it('should do nothing if not in a conflict', function () {
            this.player1.player.imperialFavor = 'political';
            this.player1.clickCard(this.kunshu);
            this.player1.clickCard(this.toshimoko);
            this.player2.pass();
            expect(this.player1).toHavePrompt('Action Window');
            this.player1.clickCard(this.toshimoko);
            expect(this.player1).toHavePrompt('Action Window');
        });

        it('favorable alliance', function () {
            this.player1.player.imperialFavor = 'political';
            this.player1.clickCard(this.kunshu);
            this.player1.clickCard(this.toshimoko);
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.toshimoko],
                defenders: [this.kachiko]
            });

            let fate = this.player1.fate;
            let deckSize = this.player1.conflictDeck.length;

            this.player2.pass();
            this.player1.clickCard(this.toshimoko);
            this.player1.clickCard(this.alliance);

            expect(this.player1).toHavePromptButton('1');
            expect(this.player1).toHavePromptButton('2');
            expect(this.player1).toHavePromptButton(deckSize.toString());
            expect(this.player1).not.toHavePromptButton((deckSize + 1).toString());

            this.player1.clickPrompt(deckSize.toString());
            expect(this.player1.fate).toBe(fate);
            expect(this.player1.conflictDeck.length).toBe(0);
        });

        it('Kachiko 2 - should not use up a Kachiko usage', function () {
            this.player1.player.imperialFavor = 'political';
            this.player1.clickCard(this.kunshu);
            this.player1.clickCard(this.kachiko2);
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.kachiko2],
                defenders: [this.kachiko],
                type: 'political'
            });

            this.player2.pass();
            this.player1.clickCard(this.kachiko2);
            this.player1.clickCard(this.afwtd);
            this.player1.clickCard(this.kachiko);

            expect(this.getChatLogs(5)).not.toContain(
                'player1 plays a card from their opponent\'s conflict discard pile due to the ability of Bayushi Kachiko (2 uses remaining)'
            );
        });
    });
});
