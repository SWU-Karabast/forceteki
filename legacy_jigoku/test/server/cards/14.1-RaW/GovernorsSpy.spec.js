describe('Governors Spy', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['governor-s-spy'],
                    dynastyDiscard: ['doji-whisperer', 'doji-challenger', 'doji-kuwanan', 'daidoji-uji', 'kakita-toshimoko', 'kakita-yuri', 'city-of-lies'],
                    hand: ['desolation']
                },
                player2: {
                    inPlay: ['bayushi-liar', 'alibi-artist', 'blackmail-artist', 'bayushi-manipulator', 'bayushi-shoju', 'yogo-asami', 'akodo-zentaro'],
                    dynastyDiscard: ['hantei-xxxviii'],
                    hand: ['stoke-insurrection']
                }
            });

            this.spy = this.player1.findCardByName('governor-s-spy');
            this.hantei = this.player2.findCardByName('hantei-xxxviii');

            this.whisperer = this.player1.placeCardInProvince('doji-whisperer', 'province 1');
            this.challenger = this.player1.placeCardInProvince('doji-challenger', 'province 2');
            this.kuwanan = this.player1.placeCardInProvince('doji-kuwanan', 'province 3');
            this.uji = this.player1.placeCardInProvince('daidoji-uji', 'province 4');
            this.toshimoko = this.player1.findCardByName('kakita-toshimoko');
            this.yuri = this.player1.findCardByName('kakita-yuri');
            this.lies = this.player1.findCardByName('city-of-lies');
            this.desolation = this.player1.findCardByName('desolation');

            this.liar = this.player2.placeCardInProvince('bayushi-liar', 'province 1');
            this.alibi = this.player2.placeCardInProvince('alibi-artist', 'province 2');
            this.blackmail = this.player2.placeCardInProvince('blackmail-artist', 'province 3');
            this.manipulator = this.player2.placeCardInProvince('bayushi-manipulator', 'province 4');
            this.shoju = this.player2.findCardByName('bayushi-shoju');
            this.asami = this.player2.findCardByName('yogo-asami');
            this.stoke = this.player2.findCardByName('stoke-insurrection');
            this.zentaro = this.player2.findCardByName('akodo-zentaro');

            this.p1_1 = this.player1.findCardByName('shameful-display', 'province 1');
            this.p1_2 = this.player1.findCardByName('shameful-display', 'province 2');
            this.p1_3 = this.player1.findCardByName('shameful-display', 'province 3');
            this.p1_4 = this.player1.findCardByName('shameful-display', 'province 4');
            this.p1_4 = this.player1.findCardByName('shameful-display', 'province 4');
            this.p1_Stronghold = this.player1.findCardByName('shameful-display', 'stronghold province');

            this.p2_1 = this.player2.findCardByName('shameful-display', 'province 1');
            this.p2_2 = this.player2.findCardByName('shameful-display', 'province 2');
            this.p2_3 = this.player2.findCardByName('shameful-display', 'province 3');
            this.p2_4 = this.player2.findCardByName('shameful-display', 'province 4');
            this.p2_4 = this.player2.findCardByName('shameful-display', 'province 4');
            this.p2_Stronghold = this.player2.findCardByName('shameful-display', 'stronghold province');
        });

        it('should not work out of conflict', function() {
            expect(this.player1).toHavePrompt('Action Window');
            this.player1.clickCard(this.spy);
            expect(this.player1).toHavePrompt('Action Window');
        });

        it('should let you choose a player', function() {
            this.noMoreActions();

            this.initiateConflict({
                attackers: [this.spy],
                defenders: [],
                type: 'political'
            });

            this.player2.pass();
            expect(this.player1).toHavePrompt('Conflict Action Window');
            this.player1.clickCard(this.spy);
            expect(this.player1).toHavePrompt('Select one');
            expect(this.player1).toHavePromptButton('player1');
            expect(this.player1).toHavePromptButton('player2');
        });

        it('should immediately flip that players dynasty cards facedown', function() {
            this.noMoreActions();

            this.initiateConflict({
                attackers: [this.spy],
                defenders: [],
                type: 'political'
            });

            this.player2.pass();
            expect(this.player1).toHavePrompt('Conflict Action Window');
            this.player1.clickCard(this.spy);
            expect(this.player1).toHavePrompt('Select one');
            expect(this.player1).toHavePromptButton('player1');
            expect(this.player1).toHavePromptButton('player2');

            this.player1.clickPrompt('player2');
            expect(this.liar.facedown).toBe(true);
            expect(this.alibi.facedown).toBe(true);
            expect(this.blackmail.facedown).toBe(true);
            expect(this.manipulator.facedown).toBe(true);

            expect(this.getChatLogs(3)).toContain('player1 uses Governor\'s Spy to turn facedown and rearrange all of player2\'s dynasty cards');
        });

        it('should prompt you to put each card into a province, forcing you to give each province at least one card and then move the cards', function() {
            this.noMoreActions();

            this.initiateConflict({
                attackers: [this.spy],
                defenders: [],
                type: 'political'
            });

            this.player2.pass();
            expect(this.player1).toHavePrompt('Conflict Action Window');
            this.player1.clickCard(this.spy);
            expect(this.player1).toHavePrompt('Select one');
            expect(this.player1).toHavePromptButton('player1');
            expect(this.player1).toHavePromptButton('player2');
            this.player1.clickPrompt('player2');

            expect(this.player1).toHavePrompt('Select a card to place');
            expect(this.player1).toHavePromptButton('Alibi Artist');
            expect(this.player1).toHavePromptButton('Bayushi Liar');
            expect(this.player1).toHavePromptButton('Bayushi Manipulator');
            expect(this.player1).toHavePromptButton('Blackmail Artist');
            this.player1.clickPrompt('Alibi Artist');

            expect(this.player1).toHavePrompt('Choose a province for Alibi Artist');
            expect(this.player1).toBeAbleToSelect(this.p2_1);
            expect(this.player1).toBeAbleToSelect(this.p2_2);
            expect(this.player1).toBeAbleToSelect(this.p2_3);
            expect(this.player1).toBeAbleToSelect(this.p2_4);
            expect(this.player1).not.toBeAbleToSelect(this.p2_Stronghold);

            this.player1.clickCard(this.p2_4);
            expect(this.getChatLogs(1)).toContain('player1 places a card');

            expect(this.player1).toHavePrompt('Select a card to place');
            expect(this.player1).not.toHavePromptButton('Alibi Artist');
            expect(this.player1).toHavePromptButton('Bayushi Liar');
            expect(this.player1).toHavePromptButton('Bayushi Manipulator');
            expect(this.player1).toHavePromptButton('Blackmail Artist');
            this.player1.clickPrompt('Bayushi Liar');

            expect(this.player1).toHavePrompt('Choose a province for Bayushi Liar');
            expect(this.player1).toBeAbleToSelect(this.p2_1);
            expect(this.player1).toBeAbleToSelect(this.p2_2);
            expect(this.player1).toBeAbleToSelect(this.p2_3);
            expect(this.player1).not.toBeAbleToSelect(this.p2_4);
            expect(this.player1).not.toBeAbleToSelect(this.p2_Stronghold);

            this.player1.clickCard(this.p2_1);
            expect(this.getChatLogs(1)).toContain('player1 places a card');

            expect(this.player1).toHavePrompt('Select a card to place');
            expect(this.player1).not.toHavePromptButton('Alibi Artist');
            expect(this.player1).not.toHavePromptButton('Bayushi Liar');
            expect(this.player1).toHavePromptButton('Bayushi Manipulator');
            expect(this.player1).toHavePromptButton('Blackmail Artist');
            this.player1.clickPrompt('Bayushi Manipulator');

            expect(this.player1).toHavePrompt('Choose a province for Bayushi Manipulator');
            expect(this.player1).not.toBeAbleToSelect(this.p2_1);
            expect(this.player1).toBeAbleToSelect(this.p2_2);
            expect(this.player1).toBeAbleToSelect(this.p2_3);
            expect(this.player1).not.toBeAbleToSelect(this.p2_4);
            expect(this.player1).not.toBeAbleToSelect(this.p2_Stronghold);

            this.player1.clickCard(this.p2_3);
            expect(this.getChatLogs(1)).toContain('player1 places a card');

            expect(this.player1).toHavePrompt('Select a card to place');
            expect(this.player1).not.toHavePromptButton('Alibi Artist');
            expect(this.player1).not.toHavePromptButton('Bayushi Liar');
            expect(this.player1).not.toHavePromptButton('Bayushi Manipulator');
            expect(this.player1).toHavePromptButton('Blackmail Artist');
            this.player1.clickPrompt('Blackmail Artist');

            expect(this.player1).toHavePrompt('Choose a province for Blackmail Artist');
            expect(this.player1).not.toBeAbleToSelect(this.p2_1);
            expect(this.player1).toBeAbleToSelect(this.p2_2);
            expect(this.player1).not.toBeAbleToSelect(this.p2_3);
            expect(this.player1).not.toBeAbleToSelect(this.p2_4);
            expect(this.player1).not.toBeAbleToSelect(this.p2_Stronghold);

            this.player1.clickCard(this.p2_2);
            expect(this.getChatLogs(4)).toContain('player1 places a card');
            expect(this.getChatLogs(3)).toContain('player1 has finished placing cards');

            expect(this.alibi.location).toBe('province 4');
            expect(this.liar.location).toBe('province 1');
            expect(this.manipulator.location).toBe('province 3');
            expect(this.blackmail.location).toBe('province 2');
        });

        it('should prompt you to put each card into a province, letting you double up if possible', function() {
            this.noMoreActions();

            this.player2.moveCard(this.shoju, 'province 1');
            this.player2.moveCard(this.asami, 'province 1');

            this.initiateConflict({
                attackers: [this.spy],
                defenders: [],
                type: 'political'
            });

            this.player2.pass();
            expect(this.player1).toHavePrompt('Conflict Action Window');
            this.player1.clickCard(this.spy);
            expect(this.player1).toHavePrompt('Select one');
            expect(this.player1).toHavePromptButton('player1');
            expect(this.player1).toHavePromptButton('player2');
            this.player1.clickPrompt('player2');

            this.player1.clickPrompt('Alibi Artist');
            expect(this.player1).toHavePrompt('Choose a province for Alibi Artist');
            expect(this.player1).toBeAbleToSelect(this.p2_1);
            expect(this.player1).toBeAbleToSelect(this.p2_2);
            expect(this.player1).toBeAbleToSelect(this.p2_3);
            expect(this.player1).toBeAbleToSelect(this.p2_4);
            expect(this.player1).toBeAbleToSelect(this.p2_Stronghold);

            this.player1.clickCard(this.p2_4);
            expect(this.getChatLogs(1)).toContain('player1 places a card');

            this.player1.clickPrompt('Bayushi Liar');
            expect(this.player1).toHavePrompt('Choose a province for Bayushi Liar');
            expect(this.player1).toBeAbleToSelect(this.p2_1);
            expect(this.player1).toBeAbleToSelect(this.p2_2);
            expect(this.player1).toBeAbleToSelect(this.p2_3);
            expect(this.player1).toBeAbleToSelect(this.p2_4);
            expect(this.player1).toBeAbleToSelect(this.p2_Stronghold);

            this.player1.clickCard(this.p2_1);
            expect(this.getChatLogs(1)).toContain('player1 places a card');

            this.player1.clickPrompt('Bayushi Manipulator');
            expect(this.player1).toHavePrompt('Choose a province for Bayushi Manipulator');
            expect(this.player1).toBeAbleToSelect(this.p2_1);
            expect(this.player1).toBeAbleToSelect(this.p2_2);
            expect(this.player1).toBeAbleToSelect(this.p2_3);
            expect(this.player1).toBeAbleToSelect(this.p2_4);
            expect(this.player1).toBeAbleToSelect(this.p2_Stronghold);

            this.player1.clickCard(this.p2_3);
            expect(this.getChatLogs(1)).toContain('player1 places a card');

            this.player1.clickPrompt('Bayushi Shoju');
            expect(this.player1).toHavePrompt('Choose a province for Bayushi Shoju');
            expect(this.player1).toBeAbleToSelect(this.p2_1);
            expect(this.player1).toBeAbleToSelect(this.p2_2);
            expect(this.player1).toBeAbleToSelect(this.p2_3);
            expect(this.player1).toBeAbleToSelect(this.p2_4);
            expect(this.player1).toBeAbleToSelect(this.p2_Stronghold);

            this.player1.clickCard(this.p2_Stronghold);
            expect(this.getChatLogs(1)).toContain('player1 places a card');

            this.player1.clickPrompt('Blackmail Artist');
            expect(this.player1).toHavePrompt('Choose a province for Blackmail Artist');
            expect(this.player1).toBeAbleToSelect(this.p2_1);
            expect(this.player1).toBeAbleToSelect(this.p2_2);
            expect(this.player1).toBeAbleToSelect(this.p2_3);
            expect(this.player1).toBeAbleToSelect(this.p2_4);
            expect(this.player1).toBeAbleToSelect(this.p2_Stronghold);

            this.player1.clickCard(this.p2_1);
            expect(this.getChatLogs(1)).toContain('player1 places a card');

            this.player1.clickPrompt('Yogo Asami');
            expect(this.player1).toHavePrompt('Choose a province for Yogo Asami');
            expect(this.player1).not.toBeAbleToSelect(this.p2_1);
            expect(this.player1).toBeAbleToSelect(this.p2_2);
            expect(this.player1).not.toBeAbleToSelect(this.p2_3);
            expect(this.player1).not.toBeAbleToSelect(this.p2_4);
            expect(this.player1).not.toBeAbleToSelect(this.p2_Stronghold);

            this.player1.clickCard(this.p2_2);
            expect(this.getChatLogs(4)).toContain('player1 places a card');
            expect(this.getChatLogs(3)).toContain('player1 has finished placing cards');

            expect(this.alibi.location).toBe('province 4');
            expect(this.liar.location).toBe('province 1');
            expect(this.manipulator.location).toBe('province 3');
            expect(this.shoju.location).toBe('stronghold province');
            expect(this.blackmail.location).toBe('province 1');
            expect(this.asami.location).toBe('province 2');
        });

        it('should work with both players', function() {
            this.noMoreActions();

            this.initiateConflict({
                attackers: [this.spy],
                defenders: [],
                type: 'political'
            });

            this.player2.pass();
            expect(this.player1).toHavePrompt('Conflict Action Window');
            this.player1.clickCard(this.spy);
            expect(this.player1).toHavePrompt('Select one');
            expect(this.player1).toHavePromptButton('player1');
            expect(this.player1).toHavePromptButton('player2');
            this.player1.clickPrompt('player1');

            this.player1.clickPrompt('Daidoji Uji');
            expect(this.player1).toHavePrompt('Choose a province for Daidoji Uji');
            expect(this.player1).toBeAbleToSelect(this.p1_1);
            expect(this.player1).toBeAbleToSelect(this.p1_2);
            expect(this.player1).toBeAbleToSelect(this.p1_3);
            expect(this.player1).toBeAbleToSelect(this.p1_4);
            expect(this.player1).not.toBeAbleToSelect(this.p1_Stronghold);

            this.player1.clickCard(this.p1_4);
            expect(this.getChatLogs(1)).toContain('player1 places a card');

            this.player1.clickPrompt('Doji Challenger');
            expect(this.player1).toHavePrompt('Choose a province for Doji Challenger');
            expect(this.player1).toBeAbleToSelect(this.p1_1);
            expect(this.player1).toBeAbleToSelect(this.p1_2);
            expect(this.player1).toBeAbleToSelect(this.p1_3);
            expect(this.player1).not.toBeAbleToSelect(this.p1_4);
            expect(this.player1).not.toBeAbleToSelect(this.p1_Stronghold);

            this.player1.clickCard(this.p1_1);
            expect(this.getChatLogs(1)).toContain('player1 places a card');

            this.player1.clickPrompt('Doji Kuwanan');
            expect(this.player1).toHavePrompt('Choose a province for Doji Kuwanan');
            expect(this.player1).not.toBeAbleToSelect(this.p1_1);
            expect(this.player1).toBeAbleToSelect(this.p1_2);
            expect(this.player1).toBeAbleToSelect(this.p1_3);
            expect(this.player1).not.toBeAbleToSelect(this.p1_4);
            expect(this.player1).not.toBeAbleToSelect(this.p1_Stronghold);

            this.player1.clickCard(this.p1_3);
            expect(this.getChatLogs(1)).toContain('player1 places a card');

            this.player1.clickPrompt('Doji Whisperer');
            expect(this.player1).toHavePrompt('Choose a province for Doji Whisperer');
            expect(this.player1).not.toBeAbleToSelect(this.p1_1);
            expect(this.player1).toBeAbleToSelect(this.p1_2);
            expect(this.player1).not.toBeAbleToSelect(this.p1_3);
            expect(this.player1).not.toBeAbleToSelect(this.p1_4);
            expect(this.player1).not.toBeAbleToSelect(this.p1_Stronghold);

            this.player1.clickCard(this.p1_2);
            expect(this.getChatLogs(4)).toContain('player1 places a card');
            expect(this.getChatLogs(3)).toContain('player1 has finished placing cards');

            expect(this.uji.location).toBe('province 4');
            expect(this.challenger.location).toBe('province 1');
            expect(this.kuwanan.location).toBe('province 3');
            expect(this.whisperer.location).toBe('province 2');
        });

        it('should work with Hantei', function() {
            this.player2.moveCard(this.hantei, 'play area');
            this.noMoreActions();

            this.initiateConflict({
                attackers: [this.spy],
                defenders: [],
                type: 'political'
            });

            this.player2.pass();
            expect(this.player1).toHavePrompt('Conflict Action Window');
            this.player1.clickCard(this.spy);
            expect(this.player1).toHavePrompt('Select one');
            expect(this.player1).toHavePromptButton('player1');
            expect(this.player1).toHavePromptButton('player2');
            this.player1.clickPrompt('player2');
            expect(this.player2).toHavePrompt('Triggered Abilities');
            expect(this.player2).toBeAbleToSelect(this.hantei);
            this.player2.clickCard(this.hantei);
            expect(this.player2).toHavePrompt('Select one');
            expect(this.player2).toHavePromptButton('player1');
            expect(this.player2).toHavePromptButton('player2');
            this.player2.clickPrompt('player1');

            expect(this.whisperer.facedown).toBe(true);
            expect(this.challenger.facedown).toBe(true);
            expect(this.kuwanan.facedown).toBe(true);
            expect(this.uji.facedown).toBe(true);

            expect(this.player1).toHavePrompt('Select a card to place');
            expect(this.player1).toHavePromptButton('Daidoji Uji');
            expect(this.player1).toHavePromptButton('Doji Challenger');
            expect(this.player1).toHavePromptButton('Doji Kuwanan');
            expect(this.player1).toHavePromptButton('Doji Whisperer');
            this.player1.clickPrompt('Daidoji Uji');

            expect(this.player1).toHavePrompt('Choose a province for Daidoji Uji');
        });

        it('should reset ability usage on holdings', function() {
            this.noMoreActions();

            this.initiateConflict({
                attackers: [this.spy],
                defenders: [],
                type: 'political'
            });

            this.player1.placeCardInProvince(this.lies, 'province 1');

            this.player2.pass();
            this.player1.clickCard(this.lies);
            expect(this.player2).toHavePrompt('Conflict Action Window');
            this.player2.pass();

            this.player1.clickCard(this.spy);
            this.player1.clickPrompt('player1');
            this.player1.clickPrompt('Daidoji Uji');
            this.player1.clickCard(this.p1_4);
            this.player1.clickPrompt('Doji Challenger');
            this.player1.clickCard(this.p1_2);
            this.player1.clickPrompt('Doji Kuwanan');
            this.player1.clickCard(this.p1_3);
            this.player1.clickPrompt('City of Lies');
            this.player1.clickCard(this.p1_1);

            expect(this.lies.facedown).toBe(true);

            this.player2.clickCard(this.stoke);
            this.player2.clickPrompt('Done');

            expect(this.lies.facedown).toBe(false);
            this.player1.clickCard(this.lies);
            expect(this.player2).toHavePrompt('Conflict Action Window');
            this.player2.pass();
            let fate = this.player1.fate;
            this.player1.clickCard(this.desolation);
            expect(this.player1.fate).toBe(fate);
        });

        it('should return facedown dynasty cards to their owners', function() {
            this.noMoreActions();
            this.player1.passConflict();
            this.player1.placeCardInProvince(this.lies, 'province 1');
            this.noMoreActions();

            this.initiateConflict({
                attackers: [this.zentaro],
                defenders: [this.spy],
                province: this.p1_1,
                type: 'political'
            });

            this.player2.reduceDeckToNumber('dynasty deck', 0);
            this.player2.moveCard(this.asami, 'dynasty deck');

            this.player1.clickCard(this.lies);
            expect(this.player2).toHavePrompt('Conflict Action Window');
            this.player2.clickCard(this.zentaro);
            this.player2.clickCard(this.lies);
            this.player2.clickCard(this.p2_3);
            expect(this.lies.controller).toBe(this.player2.player);
            this.player1.pass();
            this.player2.clickCard(this.lies);
            expect(this.player1).toHavePrompt('Conflict Action Window');
            this.player1.clickCard(this.spy);
            expect(this.player1).toHavePrompt('Select one');
            expect(this.player1).toHavePromptButton('player1');
            expect(this.player1).toHavePromptButton('player2');
            this.player1.clickPrompt('player2');

            expect(this.lies.location).toBe('province 3');
            expect(this.lies.controller).toBe(this.player1.player);
            expect(this.lies.facedown).toBe(true);

            expect(this.player1).toHavePrompt('Select a card to place');
            expect(this.player1).toHavePromptButton('Alibi Artist');
            expect(this.player1).toHavePromptButton('Bayushi Liar');
            expect(this.player1).toHavePromptButton('Bayushi Manipulator');
            expect(this.player1).not.toHavePromptButton('City of Lies');
            expect(this.player1).not.toHavePromptButton('Yogo Asami');
            this.player1.clickPrompt('Alibi Artist');

            expect(this.player1).toHavePrompt('Choose a province for Alibi Artist');
            expect(this.player1).toBeAbleToSelect(this.p2_1);
            expect(this.player1).toBeAbleToSelect(this.p2_2);
            expect(this.player1).toBeAbleToSelect(this.p2_3);
            expect(this.player1).toBeAbleToSelect(this.p2_4);
            expect(this.player1).not.toBeAbleToSelect(this.p2_Stronghold);

            this.player1.clickCard(this.p2_4);
            this.player1.clickPrompt('Bayushi Liar');
            this.player1.clickCard(this.p2_1);
            this.player1.clickPrompt('Bayushi Manipulator');
            this.player1.clickCard(this.p2_3);

            expect(this.getChatLogs(3)).toContain('player1 has finished placing cards');

            expect(this.alibi.location).toBe('province 4');
            expect(this.liar.location).toBe('province 1');
            expect(this.manipulator.location).toBe('province 3');
            expect(this.asami.location).toBe('province 2');

            this.player2.clickCard(this.stoke);
            this.player2.clickPrompt('Done');

            expect(this.lies.facedown).toBe(false);
            this.player1.clickCard(this.lies);
            expect(this.player2).toHavePrompt('Conflict Action Window');
            this.player2.pass();
            let fate = this.player1.fate;
            this.player1.clickCard(this.desolation);
            expect(this.player1.fate).toBe(fate);
        });
    });
});
