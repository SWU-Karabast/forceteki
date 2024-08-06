describe('To Govern The Land', function () {
    integration(function () {
        describe('action ability', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['akodo-toturi', 'hantei-daisetsu', 'ikoma-prodigy'],
                        hand: ['to-govern-the-land']
                    },
                    player2: {
                        inPlay: ['doji-whisperer', 'daidoji-uji', 'kitsuki-shomon', 'solemn-scholar'],
                        hand: ['to-govern-the-land']
                    }
                });

                this.toturi = this.player1.findCardByName('akodo-toturi');
                this.daisetsu = this.player1.findCardByName('hantei-daisetsu');
                this.prodigy = this.player1.findCardByName('ikoma-prodigy');

                this.dojiWhisperer = this.player2.findCardByName('doji-whisperer');
                this.uji = this.player2.findCardByName('daidoji-uji');
                this.shomon = this.player2.findCardByName('kitsuki-shomon');
                this.solemn = this.player2.findCardByName('solemn-scholar');

                this.toGovernPlayer1 = this.player1.findCardByName('to-govern-the-land');
                this.toGovernPlayer2 = this.player2.findCardByName('to-govern-the-land');
            });

            it('during a military conflict, it should not trigger if you dont control a courtier', function () {
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.toturi],
                    defenders: [this.dojiWhisperer, this.shomon],
                    type: 'military'
                });

                this.player2.pass();
                this.player1.clickCard(this.toGovernPlayer1);

                expect(this.player1).toHavePrompt('Conflict Action Window');
            });

            it('during a political conflict, it should not trigger if you dont control a bushi', function () {
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.daisetsu, this.prodigy],
                    defenders: [this.dojiWhisperer, this.shomon, this.uji],
                    type: 'political'
                });

                this.player2.pass();
                this.player1.clickCard(this.toGovernPlayer1);

                expect(this.player1).toHavePrompt('Conflict Action Window');
            });

            it('during a political conflict, it allow you to target any character with lower military skill than your highest power Bushi', function () {
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.toturi, this.daisetsu, this.prodigy],
                    defenders: [this.dojiWhisperer, this.shomon, this.uji],
                    type: 'political'
                });

                this.player2.pass();
                this.player1.clickCard(this.toGovernPlayer1);

                expect(this.player1).toHavePrompt('Choose a character');
                expect(this.player1).toBeAbleToSelect(this.dojiWhisperer);
                expect(this.player1).toBeAbleToSelect(this.shomon);
                expect(this.player1).toBeAbleToSelect(this.prodigy); // your own character
                expect(this.player1).toBeAbleToSelect(this.daisetsu); // your own character
                expect(this.player1).not.toBeAbleToSelect(this.toturi); // equal military
                expect(this.player1).not.toBeAbleToSelect(this.uji); // equal military
                expect(this.player1).not.toBeAbleToSelect(this.solemn); // at home

                this.player1.clickCard(this.dojiWhisperer);

                expect(this.dojiWhisperer.isParticipating()).toBe(false);
                expect(this.dojiWhisperer.bowed).toBe(true);

                expect(this.getChatLogs(5)).toContain(
                    'player1 plays To Govern the Land to send Doji Whisperer home and bow Doji Whisperer'
                );
            });

            it('during a military conflict, it allow you to target any character with lower political skill than your highest power Courtier', function () {
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.toturi, this.daisetsu, this.prodigy],
                    defenders: [this.dojiWhisperer, this.shomon, this.uji],
                    type: 'military'
                });

                this.player2.clickCard(this.toGovernPlayer2);

                expect(this.player2).toHavePrompt('Choose a character');
                expect(this.player2).toBeAbleToSelect(this.prodigy);
                expect(this.player2).toBeAbleToSelect(this.uji); // your own character
                expect(this.player2).not.toBeAbleToSelect(this.shomon); // equal political
                expect(this.player2).not.toBeAbleToSelect(this.toturi); // equal political
                expect(this.player2).not.toBeAbleToSelect(this.daisetsu); // equal political
                expect(this.player1).not.toBeAbleToSelect(this.solemn); // at home

                this.player2.clickCard(this.prodigy);

                expect(this.prodigy.isParticipating()).toBe(false);
                expect(this.prodigy.bowed).toBe(true);

                expect(this.getChatLogs(5)).toContain(
                    'player2 plays To Govern the Land to send Ikoma Prodigy home and bow Ikoma Prodigy'
                );
            });
        });
    });
});
