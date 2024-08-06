describe('Storm from Sakkaku', function () {
    integration(function () {
        describe('Storm from Sakkaku persistent ability', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        dynastyDeck: ['akodo-toturi'],
                        dynastyDiscard: [
                            'shintao-monastery',
                            'shintao-monastery',
                            'shintao-monastery',
                            'shintao-monastery'
                        ],
                        inPlay: ['tattooed-wanderer', 'togashi-mitsu-2'],
                        hand: ['seeker-of-knowledge', 'fine-katana', 'charge', 'restored-heirloom', 'chasing-the-sun']
                    },
                    player2: {
                        role: 'keeper-of-water',
                        provinces: ['manicured-garden', 'entrenched-position'],
                        dynastyDiscard: ['storm-from-sakkaku'],
                        inPlay: [],
                        hand: ['display-of-power'],
                        dynastyDeck: ['keeper-initiate']
                    }
                });
                this.storm = this.player2.findCardByName('storm-from-sakkaku');

                this.player1.placeCardInProvince(
                    this.player1.findCardByName('shintao-monastery', 'dynasty discard pile'),
                    'province 1'
                );
                this.player1.placeCardInProvince(
                    this.player1.findCardByName('shintao-monastery', 'dynasty discard pile'),
                    'province 2'
                );
                this.player1.placeCardInProvince(
                    this.player1.findCardByName('shintao-monastery', 'dynasty discard pile'),
                    'province 3'
                );
                this.player1.placeCardInProvince(
                    this.player1.findCardByName('shintao-monastery', 'dynasty discard pile'),
                    'province 4'
                );

                this.player2.placeCardInProvince(
                    this.player2.findCardByName('storm-from-sakkaku', 'dynasty discard pile'),
                    'province 1'
                );

                this.storm.facedown = false;

                this.mitsu = this.player1.findCardByName('togashi-mitsu-2');
                this.mitsu.dishonor();

                this.game.checkGameState(true);
                this.noMoreActions();
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.mitsu],
                    ring: 'earth',
                    defenders: [],
                    province: 'manicured-garden'
                });
                this.player2.pass();
                this.player1.clickCard('seeker-of-knowledge');
                this.player1.clickPrompt('0');
                this.player1.clickPrompt('Home');
                this.player2.pass();
            });

            describe('When the province is not broken', function () {
                it('should cancel the effects of the conflict ring', function () {
                    this.noMoreActions();
                    expect(this.player1).toHavePrompt('Action Window');
                    expect(this.getChatLogs(1)).toContain('Storm from Sakkaku cancels the ring effect');
                });

                it('when facedown should not cancel the effects of the conflict ring', function () {
                    this.storm.facedown = true;
                    this.noMoreActions();
                    expect(this.player1).toHavePrompt('Earth Ring');
                    expect(this.getChatLogs(5)).not.toContain('Storm from Sakkaku cancels the ring effect');
                });

                it('should cancel conflict ring resolution due to card effects', function () {
                    this.player1.pass();
                    this.player2.pass();
                    this.player2.clickCard('display-of-power');
                    expect(this.player1).toHavePrompt('Action Window');
                    expect(this.getChatLogs(1)).toContain('Storm from Sakkaku cancels the ring effect');
                });

                //Repro: Togashi Mitsu (2)
                it('should cancel other ring effects resolved by cards', function () {
                    this.player1.clickCard('togashi-mitsu-2');
                    this.player1.clickRing('fire');
                    expect(this.player2).toHavePrompt('Conflict Action Window');
                    expect(this.getChatLogs(3)).toContain('Storm from Sakkaku cancels the ring effect');
                });

                it('should take effect before interrupts can trigger', function () {
                    this.player1.clickCard('togashi-mitsu-2');
                    this.player1.clickRing('water');
                    expect(this.player2).toHavePrompt('Conflict Action Window');
                    expect(this.getChatLogs(3)).toContain('Storm from Sakkaku cancels the ring effect');
                });
            });

            describe('when the province is broken', function () {
                beforeEach(function () {
                    this.mitsu.honor();
                    this.player1.clickCard('fine-katana');
                    this.player1.clickCard('togashi-mitsu-2');
                    this.player2.pass();
                    this.player1.pass();
                });

                describe('when the attacker discards the holding from the province', function () {
                    it('should not cancel the effects of the conflict ring', function () {
                        this.player2.pass();
                        this.player1.clickPrompt('Yes');
                        expect(this.player1).toHavePrompt('Earth Ring');
                    });

                    it('should not cancel conflict ring resolution due to card effects', function () {
                        this.player2.clickCard('display-of-power');
                        this.player1.clickPrompt('Yes');
                        expect(this.player2).toHavePrompt('Earth Ring');
                    });
                });

                describe('when the attacker does not discard the holding from the province', function () {
                    it('should cancel the effects of the conflict ring', function () {
                        this.player2.pass();
                        this.player1.clickPrompt('No');
                        expect(this.player1).toHavePrompt('Action Window');
                        expect(this.getChatLogs(1)).toContain('Storm from Sakkaku cancels the ring effect');
                    });

                    it('should cancel conflict ring resolution due to card effects', function () {
                        this.player2.clickCard('display-of-power');
                        this.player1.clickPrompt('No');
                        expect(this.player1).toHavePrompt('Action Window');
                        expect(this.getChatLogs(1)).toContain('Storm from Sakkaku cancels the ring effect');
                    });
                });
            });

            describe('when the conflict is moved elsewhere', function () {
                beforeEach(function () {
                    this.player1.clickCard('chasing-the-sun');
                    this.player1.clickCard(this.player2.findCardByName('entrenched-position'));
                    this.player2.pass();
                });

                it('should not cancel the effects of the conflict ring', function () {
                    this.noMoreActions();
                    expect(this.player1).toHavePrompt('Earth Ring');
                });

                it('should not cancel conflict ring resolution due to card effects', function () {
                    this.player1.pass();
                    this.player2.clickCard('display-of-power');
                    expect(this.player2).toHavePrompt('Earth Ring');
                });

                it('should not cancel other ring effects resolved by cards', function () {
                    this.player1.clickCard('togashi-mitsu-2');
                    this.player1.clickRing('fire');
                    expect(this.player1).toHavePrompt('Fire Ring');
                });
            });
        });

        describe('Storm from Sakkaku movement ability', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        dynastyDiscard: [
                            'storm-from-sakkaku',
                            'imperial-storehouse',
                            'a-season-of-war',
                            'dispatch-to-nowhere',
                            'aranat'
                        ],
                        provinces: ['manicured-garden', 'endless-plains', 'fertile-fields', 'magistrate-station']
                    },
                    player2: {
                        dynastyDiscard: ['kakita-dojo']
                    }
                });

                this.stormFromSakkaku = this.player1.findCardByName('storm-from-sakkaku', 'dynasty discard pile');

                this.player1.placeCardInProvince(this.stormFromSakkaku, 'province 1');
                this.storehouse = this.player1.findCardByName('imperial-storehouse', 'dynasty discard pile');
                this.player1.placeCardInProvince(this.storehouse, 'province 2');
                this.season = this.player1.findCardByName('a-season-of-war', 'dynasty discard pile');
                this.player1.placeCardInProvince(this.season, 'province 3');
                this.aranat = this.player1.findCardByName('aranat', 'dynasty discard pile');
                this.player1.placeCardInProvince(this.aranat, 'province 4');

                this.p1 = this.player1.findCardByName('manicured-garden');
                this.p2 = this.player1.findCardByName('endless-plains');
                this.p3 = this.player1.findCardByName('fertile-fields');
                this.p4 = this.player1.findCardByName('magistrate-station');
                this.sh = this.player1.findCardByName('shameful-display', 'stronghold province');

                this.dojo = this.player2.findCardByName('kakita-dojo');
                this.player2.placeCardInProvince(this.dojo, 'province 2');
                this.dojo.facedown = false;
            });

            it('moves to another non-sh province', function () {
                expect(this.stormFromSakkaku.location).toBe('province 1');

                this.player1.clickCard(this.stormFromSakkaku);
                expect(this.player1).toHavePrompt('Choose a province');
                expect(this.player1).not.toBeAbleToSelect(this.sh);
                expect(this.player1).not.toBeAbleToSelect(this.p1);
                expect(this.player1).toBeAbleToSelect(this.p2);
                expect(this.player1).toBeAbleToSelect(this.p3);
                expect(this.player1).toBeAbleToSelect(this.p4);
                this.player1.clickCard(this.p4);
                expect(this.stormFromSakkaku.location).toBe('province 4');
                expect(this.aranat.location).toBe('province 4');
                expect(this.getChatLogs(5)).toContain('The Storm from Sakkaku calms down');
            });

            it('moves to another province, and discard other faceup holdings in there', function () {
                expect(this.stormFromSakkaku.location).toBe('province 1');
                expect(this.dojo.location).toBe('province 2');
                expect(this.storehouse.location).toBe('province 2');

                this.player1.clickCard(this.stormFromSakkaku);
                expect(this.player1).toHavePrompt('Choose a province');
                expect(this.player1).not.toBeAbleToSelect(this.sh);
                expect(this.player1).not.toBeAbleToSelect(this.p1);
                expect(this.player1).toBeAbleToSelect(this.p2);
                expect(this.player1).toBeAbleToSelect(this.p3);
                expect(this.player1).toBeAbleToSelect(this.p4);
                this.player1.clickCard(this.p2);
                expect(this.stormFromSakkaku.location).toBe('province 2');
                expect(this.storehouse.location).toBe('dynasty discard pile');
                expect(this.getChatLogs(5)).toContain(
                    'The Storm from Sakkaku is angry and discards the holdings that they find in the province'
                );
                expect(this.dojo.location).toBe('province 2');
            });
        });
    });
});
