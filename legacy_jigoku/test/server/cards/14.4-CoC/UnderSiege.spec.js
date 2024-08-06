describe('Under Siege', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['tattooed-wanderer'],
                    hand: ['fine-katana', 'under-siege'],
                    conflictDiscard: ['for-shame', 'way-of-the-dragon', 'court-games', 'assassination', 'way-of-the-crane', 'backhanded-compliment']
                },
                player2: {
                    inPlay: ['shrine-maiden'],
                    hand: ['ornate-fan'],
                    conflictDiscard: ['for-shame', 'way-of-the-dragon', 'court-games', 'assassination', 'way-of-the-crane', 'backhanded-compliment'],
                    dynastyDiscard: ['chukan-nobue']
                }
            });

            this.wanderer = this.player1.findCardByName('tattooed-wanderer');
            this.siege = this.player1.findCardByName('under-siege');
            this.maiden = this.player2.findCardByName('shrine-maiden');

            this.katana = this.player1.findCardByName('fine-katana');
            this.nobue = this.player2.findCardByName('chukan-nobue');

            this.player2.reduceDeckToNumber('conflict deck', 0);
            this.fan = this.player2.findCardByName('ornate-fan');
            this.shame = this.player2.moveCard('for-shame', 'conflict deck');
            this.bhc = this.player2.moveCard('backhanded-compliment', 'conflict deck');
            this.dragon = this.player2.moveCard('way-of-the-dragon', 'conflict deck');
            this.courtGames = this.player2.moveCard('court-games', 'conflict deck');
            this.assassination = this.player2.moveCard('assassination', 'conflict deck');
            this.crane = this.player2.moveCard('way-of-the-crane', 'conflict deck');

            this.player1.reduceDeckToNumber('conflict deck', 0);
            this.katana = this.player1.findCardByName('fine-katana');
            this.shame2 = this.player1.moveCard('for-shame', 'conflict deck');
            this.bhc2 = this.player1.moveCard('backhanded-compliment', 'conflict deck');
            this.dragon2 = this.player1.moveCard('way-of-the-dragon', 'conflict deck');
            this.courtGames2 = this.player1.moveCard('court-games', 'conflict deck');
            this.assassination2 = this.player1.moveCard('assassination', 'conflict deck');
            this.crane2 = this.player1.moveCard('way-of-the-crane', 'conflict deck');

            this.noMoreActions();
        });

        it('should trigger when an attack is declared', function() {
            this.initiateConflict({
                attackers: [this.wanderer]
            });
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.siege);
        });

        it('should remove the defenders hand from the game and draw 5 cards', function() {
            this.initiateConflict({
                attackers: [this.wanderer]
            });
            this.player1.clickCard(this.siege);
            expect(this.fan.location).toBe('removed from game');
            expect(this.bhc.location).toBe('hand');
            expect(this.dragon.location).toBe('hand');
            expect(this.courtGames.location).toBe('hand');
            expect(this.assassination.location).toBe('hand');
            expect(this.crane.location).toBe('hand');
            expect(this.shame.location).toBe('conflict deck');
        });

        it('at the end of the conflict should discard the hand and put the removed from game cards back', function() {
            this.initiateConflict({
                attackers: [this.wanderer]
            });
            this.player1.clickCard(this.siege);
            this.player2.clickPrompt('Done');
            this.noMoreActions();
            this.player1.clickPrompt('Don\'t Resolve');
            expect(this.player1).toHavePrompt('Action Window');

            expect(this.fan.location).toBe('hand');
            expect(this.bhc.location).toBe('conflict discard pile');
            expect(this.dragon.location).toBe('conflict discard pile');
            expect(this.courtGames.location).toBe('conflict discard pile');
            expect(this.assassination.location).toBe('conflict discard pile');
            expect(this.crane.location).toBe('conflict discard pile');
            expect(this.shame.location).toBe('conflict deck');
            expect(this.player2.hand.length).toBe(1);
            expect(this.katana.location).toBe('hand');
        });

        it('should discard any cards drawn during the conflict', function() {
            this.initiateConflict({
                attackers: [this.wanderer]
            });
            this.player1.clickCard(this.siege);
            this.player2.clickPrompt('Done');

            this.player2.clickCard(this.bhc);
            this.player2.clickPrompt('player2');
            expect(this.shame.location).toBe('hand');
            this.noMoreActions();
            this.player1.clickPrompt('Don\'t Resolve');
            expect(this.player1).toHavePrompt('Action Window');

            expect(this.shame.location).toBe('conflict discard pile');
        });

        it('should not discard cards that were played during the conflict', function() {
            this.initiateConflict({
                attackers: [this.wanderer]
            });
            this.player1.clickCard(this.siege);
            this.player2.clickPrompt('Done');

            this.player2.playAttachment(this.dragon, this.maiden);
            this.noMoreActions();
            this.player1.clickPrompt('Don\'t Resolve');
            expect(this.player1).toHavePrompt('Action Window');
            expect(this.dragon.location).toBe('play area');
        });

        it('should not draw cards if the defending player is empty', function() {
            this.player2.moveCard(this.fan, 'conflict discard pile');

            this.initiateConflict({
                attackers: [this.wanderer]
            });
            this.player1.clickCard(this.siege);
            this.player2.clickPrompt('Done');

            expect(this.fan.location).toBe('conflict discard pile');
            expect(this.bhc.location).toBe('conflict deck');
            expect(this.dragon.location).toBe('conflict deck');
            expect(this.courtGames.location).toBe('conflict deck');
            expect(this.assassination.location).toBe('conflict deck');
            expect(this.crane.location).toBe('conflict deck');
            expect(this.shame.location).toBe('conflict deck');
        });

        it('should still discard the hand at the end of the conflict even if you didn\'t draw any cards', function() {
            this.player2.moveCard(this.fan, 'conflict discard pile');

            this.initiateConflict({
                attackers: [this.wanderer]
            });
            this.player1.clickCard(this.siege);
            this.player2.clickPrompt('Done');

            this.player2.moveCard(this.bhc, 'hand');
            this.player2.moveCard(this.dragon, 'hand');

            this.noMoreActions();
            this.player1.clickPrompt('Don\'t Resolve');
            expect(this.player1).toHavePrompt('Action Window');

            expect(this.fan.location).toBe('conflict discard pile');
            expect(this.bhc.location).toBe('conflict discard pile');
            expect(this.dragon.location).toBe('conflict discard pile');
            expect(this.courtGames.location).toBe('conflict deck');
            expect(this.assassination.location).toBe('conflict deck');
            expect(this.crane.location).toBe('conflict deck');
            expect(this.shame.location).toBe('conflict deck');
        });

        it('should remove the defenders hand from the game and draw 5 cards (Self defending)', function() {
            this.player1.passConflict();
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.maiden]
            });
            this.player1.clickCard(this.siege);
            expect(this.katana.location).toBe('removed from game');
            expect(this.bhc2.location).toBe('hand');
            expect(this.dragon2.location).toBe('hand');
            expect(this.courtGames2.location).toBe('hand');
            expect(this.assassination2.location).toBe('hand');
            expect(this.crane2.location).toBe('hand');
            expect(this.shame2.location).toBe('conflict deck');

            this.player1.clickPrompt('Done');
            this.noMoreActions();
            this.player2.clickPrompt('Don\'t Resolve');
            expect(this.player1).toHavePrompt('Action Window');

            expect(this.katana.location).toBe('hand');
            expect(this.bhc2.location).toBe('conflict discard pile');
            expect(this.dragon2.location).toBe('conflict discard pile');
            expect(this.courtGames2.location).toBe('conflict discard pile');
            expect(this.assassination2.location).toBe('conflict discard pile');
            expect(this.crane2.location).toBe('conflict discard pile');
            expect(this.shame2.location).toBe('conflict deck');
            expect(this.player1.hand.length).toBe(1);
            expect(this.fan.location).toBe('hand');
        });

        it('chat messages', function() {
            this.initiateConflict({
                attackers: [this.wanderer]
            });
            this.player1.clickCard(this.siege);
            this.player2.clickPrompt('Done');
            this.noMoreActions();
            this.player1.clickPrompt('Don\'t Resolve');
            expect(this.player1).toHavePrompt('Action Window');
            expect(this.getChatLogs(20)).toContain('player1 plays Under Siege to place player2 under siege!');
            expect(this.getChatLogs(20)).toContain('player2 sets their hand aside and draws 5 cards');
            expect(this.getChatLogs(20)).toContain('player2 discards Way of the Crane, Assassination, Court Games, Way of the Dragon and Backhanded Compliment');
            expect(this.getChatLogs(20)).toContain('player2 picks up their original hand');
        });

        it('simultaneous events - should not have multiple events when only 1 under siege is played', function() {
            this.player1.player.optionSettings.orderForcedAbilities = true;

            this.initiateConflict({
                attackers: [this.wanderer]
            });
            this.player1.clickCard(this.siege);
            this.player2.clickPrompt('Done');
            this.noMoreActions();
            this.player1.clickPrompt('Don\'t Resolve');
            expect(this.player1).not.toHavePrompt('Order Simultaneous effects');
            expect(this.player1).toHavePrompt('Action Window');
            expect(this.getChatLogs(20)).toContain('player1 plays Under Siege to place player2 under siege!');
            expect(this.getChatLogs(20)).toContain('player2 sets their hand aside and draws 5 cards');
            expect(this.getChatLogs(20)).toContain('player2 discards Way of the Crane, Assassination, Court Games, Way of the Dragon and Backhanded Compliment');
            expect(this.getChatLogs(20)).toContain('player2 picks up their original hand');
        });


        it('Chukan Nobu interaction - should not discard any cards post conflict', function() {
            this.player2.moveCard(this.nobue, 'play area');
            this.game.checkGameState(true);
            this.initiateConflict({
                attackers: [this.wanderer]
            });
            expect(this.fan.location).toBe('hand');
            this.player1.clickCard(this.siege);
            this.player2.clickPrompt('Done');
            expect(this.fan.location).toBe('removed from game');

            this.player2.clickCard(this.bhc);
            this.player2.clickPrompt('player2');
            expect(this.shame.location).toBe('hand');
            this.noMoreActions();
            this.player1.clickPrompt('Don\'t Resolve');
            expect(this.player1).toHavePrompt('Action Window');

            expect(this.shame.location).toBe('hand');
            expect(this.fan.location).toBe('hand');
        });
    });
});

describe('Two Under Sieges', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['tattooed-wanderer'],
                    hand: ['fine-katana', 'under-siege'],
                    conflictDiscard: ['for-shame', 'way-of-the-dragon', 'court-games', 'assassination', 'way-of-the-crane', 'backhanded-compliment']
                },
                player2: {
                    inPlay: ['shrine-maiden'],
                    hand: ['ornate-fan', 'way-of-the-scorpion', 'under-siege'],
                    conflictDiscard: ['for-shame', 'way-of-the-dragon', 'court-games', 'assassination', 'way-of-the-crane', 'backhanded-compliment',
                        'ready-for-battle', 'let-go', 'common-cause', 'way-of-the-lion', 'way-of-the-phoenix']
                }
            });

            this.wanderer = this.player1.findCardByName('tattooed-wanderer');
            this.siege = this.player1.findCardByName('under-siege');
            this.siege2 = this.player2.findCardByName('under-siege');
            this.maiden = this.player2.findCardByName('shrine-maiden');

            this.katana = this.player1.findCardByName('fine-katana');

            this.player2.reduceDeckToNumber('conflict deck', 0);
            this.fan = this.player2.findCardByName('ornate-fan');
            this.scorpion = this.player2.findCardByName('way-of-the-scorpion');
            this.phoenix = this.player2.moveCard('way-of-the-phoenix', 'conflict deck');
            this.lion = this.player2.moveCard('way-of-the-lion', 'conflict deck');
            this.commonCause = this.player2.moveCard('common-cause', 'conflict deck');
            this.letGo = this.player2.moveCard('let-go', 'conflict deck');
            this.readyForBattle = this.player2.moveCard('ready-for-battle', 'conflict deck');
            this.shame = this.player2.moveCard('for-shame', 'conflict deck');
            this.bhc = this.player2.moveCard('backhanded-compliment', 'conflict deck');
            this.dragon = this.player2.moveCard('way-of-the-dragon', 'conflict deck');
            this.courtGames = this.player2.moveCard('court-games', 'conflict deck');
            this.assassination = this.player2.moveCard('assassination', 'conflict deck');
            this.crane = this.player2.moveCard('way-of-the-crane', 'conflict deck');

            this.player1.reduceDeckToNumber('conflict deck', 0);
            this.katana = this.player1.findCardByName('fine-katana');
            this.shame2 = this.player1.moveCard('for-shame', 'conflict deck');
            this.bhc2 = this.player1.moveCard('backhanded-compliment', 'conflict deck');
            this.dragon2 = this.player1.moveCard('way-of-the-dragon', 'conflict deck');
            this.courtGames2 = this.player1.moveCard('court-games', 'conflict deck');
            this.assassination2 = this.player1.moveCard('assassination', 'conflict deck');
            this.crane2 = this.player1.moveCard('way-of-the-crane', 'conflict deck');

            this.noMoreActions();
        });

        it('multiple under sieges, should discard the original hand, then discard the new hand', function() {
            this.initiateConflict({
                attackers: [this.wanderer]
            });
            this.player1.pass();
            this.player2.clickCard(this.siege2);
            expect(this.getChatLogs(2)).toContain('player2 plays Under Siege to place player2 under siege!');
            expect(this.getChatLogs(1)).toContain('player2 sets their hand aside and draws 5 cards');

            expect(this.fan.location).toBe('removed from game');
            expect(this.scorpion.location).toBe('removed from game');
            expect(this.crane.location).toBe('hand');
            expect(this.assassination.location).toBe('hand');
            expect(this.courtGames.location).toBe('hand');
            expect(this.dragon.location).toBe('hand');
            expect(this.bhc.location).toBe('hand');

            this.player1.clickCard(this.siege);
            expect(this.getChatLogs(3)).toContain('player1 plays Under Siege to place player2 under siege!');
            expect(this.getChatLogs(2)).toContain('player2 sets their hand aside and draws 5 cards');

            expect(this.fan.location).toBe('removed from game');
            expect(this.scorpion.location).toBe('removed from game');
            expect(this.crane.location).toBe('removed from game');
            expect(this.assassination.location).toBe('removed from game');
            expect(this.courtGames.location).toBe('removed from game');
            expect(this.dragon.location).toBe('removed from game');
            expect(this.bhc.location).toBe('removed from game');

            expect(this.shame.location).toBe('hand');
            expect(this.readyForBattle.location).toBe('hand');
            expect(this.letGo.location).toBe('hand');
            expect(this.commonCause.location).toBe('hand');
            expect(this.lion.location).toBe('hand');
        });

        it('simultaneous events - should let first player order - picking up original hand', function() {
            this.player1.player.optionSettings.orderForcedAbilities = true;

            this.initiateConflict({
                attackers: [this.wanderer]
            });
            this.player1.pass();
            this.player2.clickCard(this.siege2);
            this.player1.clickCard(this.siege);
            this.player2.clickPrompt('Done');
            this.noMoreActions();
            this.player1.clickPrompt('Don\'t Resolve');
            expect(this.player1).toHavePrompt('Order Simultaneous effects');
            this.player1.clickPromptButtonIndex(1);

            expect(this.fan.location).toBe('hand');
            expect(this.scorpion.location).toBe('hand');
            expect(this.crane.location).toBe('conflict discard pile');
            expect(this.assassination.location).toBe('conflict discard pile');
            expect(this.courtGames.location).toBe('conflict discard pile');
            expect(this.dragon.location).toBe('conflict discard pile');
            expect(this.bhc.location).toBe('conflict discard pile');

            expect(this.shame.location).toBe('conflict discard pile');
            expect(this.readyForBattle.location).toBe('conflict discard pile');
            expect(this.letGo.location).toBe('conflict discard pile');
            expect(this.commonCause.location).toBe('conflict discard pile');
            expect(this.lion.location).toBe('conflict discard pile');
        });

        it('simultaneous events - should let first player order - picking up new hand', function() {
            this.player1.player.optionSettings.orderForcedAbilities = true;

            this.initiateConflict({
                attackers: [this.wanderer]
            });
            this.player1.pass();
            this.player2.clickCard(this.siege2);
            this.player1.clickCard(this.siege);
            this.player2.clickPrompt('Done');
            this.noMoreActions();
            this.player1.clickPrompt('Don\'t Resolve');
            expect(this.player1).toHavePrompt('Order Simultaneous effects');
            this.player1.clickPromptButtonIndex(0);

            expect(this.fan.location).toBe('conflict discard pile');
            expect(this.scorpion.location).toBe('conflict discard pile');
            expect(this.crane.location).toBe('hand');
            expect(this.assassination.location).toBe('hand');
            expect(this.courtGames.location).toBe('hand');
            expect(this.dragon.location).toBe('hand');
            expect(this.bhc.location).toBe('hand');

            expect(this.shame.location).toBe('conflict discard pile');
            expect(this.readyForBattle.location).toBe('conflict discard pile');
            expect(this.letGo.location).toBe('conflict discard pile');
            expect(this.commonCause.location).toBe('conflict discard pile');
            expect(this.lion.location).toBe('conflict discard pile');
        });
    });
});


describe('Under Siege + Trading on the Sand Road', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'dynasty',
                player1: {
                    inPlay: ['wandering-ronin', 'otomo-courtier'],
                    hand: ['trading-on-the-sand-road', 'assassination'],
                    conflictDiscard: ['iuchi-wayfinder', 'forged-edict']
                },
                player2: {
                    inPlay: ['guardian-kami', 'otomo-courtier'],
                    hand: ['trading-on-the-sand-road', 'mono-no-aware'],
                    conflictDiscard: ['under-siege', 'fine-katana', 'waning-hostilities', 'feral-ningyo']
                }
            });

            this.tradingOnTheSandRoad = this.player1.findCardByName('trading-on-the-sand-road');
            this.wanderingRonin = this.player1.findCardByName('wandering-ronin');
            this.wanderingRonin.fate = 2;
            this.iuchiWayfinder = this.player1.findCardByName('iuchi-wayfinder');
            this.player1.moveCard(this.iuchiWayfinder, 'conflict deck');
            this.forgedEdict = this.player1.findCardByName('forged-edict');
            this.otomoCourtier = this.player1.findCardByName('otomo-courtier');

            this.tradingOnTheSandRoad2 = this.player2.findCardByName('trading-on-the-sand-road');
            this.guardianKami = this.player2.findCardByName('guardian-kami');
            this.monoNoAware = this.player2.findCardByName('mono-no-aware');
            this.fineKatana = this.player2.findCardByName('fine-katana');
            this.player2.moveCard(this.fineKatana, 'conflict deck');
            this.waningHostilities = this.player2.findCardByName('waning-hostilities');
            this.feralNingyo = this.player2.findCardByName('feral-ningyo');
            this.player2.moveCard(this.feralNingyo, 'conflict deck');
            this.siege = this.player2.moveCard('under-siege', 'conflict deck');
        });

        it('should work properly', function () {
            this.noMoreActions();
            this.player1.clickCard(this.tradingOnTheSandRoad);
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.wanderingRonin]
            });
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.siege);
            this.player1.clickCard(this.siege);
            this.player2.clickPrompt('Done');
            this.noMoreActions();
            this.player1.clickPrompt('Don\'t Resolve');
            expect(this.getChatLogs(10)).toContain('player2 discards Supernatural Storm, Supernatural Storm, Supernatural Storm, Supernatural Storm and Supernatural Storm');
        });
    });
});

describe('Under Siege - Bug Report', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['tattooed-wanderer']
                },
                player2: {
                    inPlay: ['doji-whisperer'],
                    hand: ['ornate-fan', 'let-go', 'under-siege', 'way-of-the-scorpion', 'banzai', 'banzai', 'noble-sacrifice', 'mark-of-shame'],
                    dynastyDiscard: ['favorable-ground'],
                    conflictDiscard: ['logistics', 'logistics', 'logistics', 'for-shame', 'way-of-the-dragon', 'court-games', 'assassination', 'way-of-the-crane', 'backhanded-compliment']
                }
            });

            this.wanderer = this.player1.findCardByName('tattooed-wanderer');
            this.siege = this.player2.findCardByName('under-siege');
            this.whisperer = this.player2.findCardByName('doji-whisperer');

            this.fan = this.player2.findCardByName('ornate-fan');
            this.letGo = this.player2.findCardByName('ornate-fan');
            this.scorpion = this.player2.findCardByName('ornate-fan');
            this.banzai = this.player2.filterCardsByName('banzai')[0];
            this.banzai2 = this.player2.filterCardsByName('banzai')[1];
            this.sac = this.player2.findCardByName('noble-sacrifice');
            this.mos = this.player2.findCardByName('mark-of-shame');


            this.player2.reduceDeckToNumber('conflict deck', 0);
            this.shame = this.player2.moveCard('for-shame', 'conflict deck');
            this.bhc = this.player2.moveCard('backhanded-compliment', 'conflict deck');
            this.dragon = this.player2.moveCard('way-of-the-dragon', 'conflict deck');
            this.courtGames = this.player2.moveCard('court-games', 'conflict deck');
            this.assassination = this.player2.moveCard('assassination', 'conflict deck');
            this.crane = this.player2.moveCard('way-of-the-crane', 'conflict deck');

            this.logistics = this.player2.filterCardsByName('logistics')[0];
            this.logistics2 = this.player2.filterCardsByName('logistics')[1];
            this.logistics3 = this.player2.filterCardsByName('logistics')[2];

            this.player2.moveCard(this.logistics, 'conflict deck');
            this.player2.moveCard(this.logistics2, 'conflict deck');
            this.player2.moveCard(this.logistics3, 'conflict deck');

            this.fg = this.player2.placeCardInProvince('favorable-ground', 'province 1');
            this.sd1 = this.player2.findCardByName('shameful-display', 'province 1');
            this.sd2 = this.player2.findCardByName('shameful-display', 'province 2');

            this.noMoreActions();
        });

        it('at the end of the conflict should discard the hand and put the removed from game cards back', function() {
            this.initiateConflict({
                attackers: [this.wanderer],
                type: 'political'
            });
            this.player2.clickCard(this.siege);
            this.player2.clickCard(this.whisperer);
            this.player2.clickPrompt('Done');

            expect(this.logistics.location).toBe('hand');
            expect(this.logistics2.location).toBe('hand');
            expect(this.logistics3.location).toBe('hand');
            expect(this.crane.location).toBe('hand');
            expect(this.assassination.location).toBe('hand');
            expect(this.courtGames.location).toBe('conflict deck');
            expect(this.dragon.location).toBe('conflict deck');
            expect(this.bhc.location).toBe('conflict deck');

            this.player2.clickCard(this.logistics);
            this.player2.clickCard(this.fg);
            this.player2.clickCard(this.sd2);
            expect(this.courtGames.location).toBe('hand');

            this.player1.pass();
            this.player2.clickCard(this.logistics2);
            this.player2.clickCard(this.fg);
            this.player2.clickCard(this.sd1);
            expect(this.dragon.location).toBe('hand');

            this.player1.pass();
            this.player2.clickCard(this.logistics3);
            this.player2.clickCard(this.fg);
            this.player2.clickCard(this.sd2);
            expect(this.bhc.location).toBe('hand');

            this.player1.pass();
            this.player2.clickCard(this.dragon);
            this.player2.clickCard(this.whisperer);
            this.player1.pass();
            this.player2.clickCard(this.bhc);
            this.player2.clickPrompt('player1');
            this.player1.pass();
            this.player2.clickCard(this.courtGames);
            this.player2.clickPrompt('Honor a friendly character');
            this.player2.clickCard(this.whisperer);

            this.noMoreActions();
            expect(this.player1).toHavePrompt('Action Window');

            expect(this.bhc.location).toBe('conflict discard pile');
            expect(this.dragon.location).toBe('play area');
            expect(this.courtGames.location).toBe('conflict discard pile');
            expect(this.assassination.location).toBe('conflict discard pile');
            expect(this.crane.location).toBe('conflict discard pile');
            expect(this.shame.location).toBe('conflict deck');
            expect(this.player2.hand.length).toBe(7);
        });
    });
});
