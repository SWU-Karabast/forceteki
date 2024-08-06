describe('Jealous Ancestor', function () {
    integration(function () {
        describe('Jealous Ancestor as an attachment', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['gifted-tactician', 'seppun-truthseeker', 'keeper-initiate', 'adept-of-shadows'],
                        hand: ['tactical-ingenuity', 'hurricane-punch', 'prepare-for-war'],
                        dynastyDiscard: ['ancestral-armory'],
                        conflictDiscard: ['fine-katana']
                    },
                    player2: {
                        inPlay: ['master-whisperer', 'miya-mystic', 'kitsu-spiritcaller'],
                        hand: ['backhanded-compliment', 'assassination', 'jealous-ancestor'],
                        dynastyDiscard: ['esteemed-tea-house']
                    }
                });

                this.giftedTactician = this.player1.findCardByName('gifted-tactician');
                this.truthseeker = this.player1.findCardByName('seppun-truthseeker');
                this.keeper = this.player1.findCardByName('keeper-initiate');
                this.ingenuity = this.player1.findCardByName('tactical-ingenuity');
                this.hurricane = this.player1.findCardByName('hurricane-punch');
                this.prepareForWar = this.player1.findCardByName('prepare-for-war');
                this.adeptOfShadows = this.player1.findCardByName('adept-of-shadows');
                this.ancestralArmory = this.player1.placeCardInProvince('ancestral-armory', 'province 1');

                this.jealousAncestor = this.player2.findCardByName('jealous-ancestor');
                this.spiritcaller = this.player2.findCardByName('kitsu-spiritcaller');
                this.mystic = this.player2.findCardByName('miya-mystic');
                this.whisperer = this.player2.findCardByName('master-whisperer');
                this.bhc = this.player2.findCardByName('backhanded-compliment');
                this.assassination = this.player2.findCardByName('assassination');
                this.teaHouse = this.player2.placeCardInProvince('esteemed-tea-house', 'province 1');
            });

            it('can be played as a character', function () {
                this.player1.pass();
                this.player2.clickCard(this.jealousAncestor);
                this.player2.clickPrompt('Play this character');
                this.player2.clickPrompt('0');
                expect(this.jealousAncestor.location).toBe('play area');
            });

            it('can be played as an attachment', function () {
                this.player1.pass();

                this.player2.clickCard(this.jealousAncestor);
                this.player2.clickPrompt('Play Jealous Ancestor as an attachment');
                this.player2.clickCard(this.giftedTactician);
                expect(this.giftedTactician.attachments.length).toBe(1);
            });

            it('should be treated as an attachment in play', function () {
                this.player1.pass();

                this.player2.clickCard(this.jealousAncestor);
                this.player2.clickPrompt('Play Jealous Ancestor as an attachment');
                this.player2.clickCard(this.giftedTactician);

                this.noMoreActions();
                this.initiateConflict({
                    type: 'political',
                    attackers: [this.giftedTactician, this.keeper],
                    defenders: []
                });

                this.player2.clickCard(this.assassination);
                expect(this.player2).toBeAbleToSelect(this.giftedTactician);
                expect(this.player2).not.toBeAbleToSelect(this.jealousAncestor);

                this.player2.clickPrompt('Cancel');

                this.player2.clickCard(this.mystic);
                expect(this.player2).toBeAbleToSelect(this.jealousAncestor);
            });

            it('should be treated as a character if it goes to the discard pile', function () {
                this.player1.pass();

                this.player2.clickCard(this.jealousAncestor);
                this.player2.clickPrompt('Play Jealous Ancestor as an attachment');
                this.player2.clickCard(this.giftedTactician);

                this.noMoreActions();
                this.initiateConflict({
                    type: 'political',
                    attackers: [this.giftedTactician, this.keeper],
                    defenders: []
                });

                this.player2.clickCard(this.mystic);
                this.player2.clickCard(this.jealousAncestor);
                expect(this.jealousAncestor.location).toBe('conflict discard pile');

                this.player1.pass();
                this.player2.clickCard(this.spiritcaller);
                expect(this.player2).toBeAbleToSelect(this.jealousAncestor);
                this.player2.clickCard(this.jealousAncestor);
                expect(this.jealousAncestor.location).toBe('play area');
            });

            it('immune to events', function () {
                this.player1.pass();

                this.player2.clickCard(this.jealousAncestor);
                this.player2.clickPrompt('Play Jealous Ancestor as an attachment');
                this.player2.clickCard(this.giftedTactician);

                this.player1.clickCard(this.prepareForWar);
                this.player1.clickCard(this.giftedTactician);

                expect(this.player1).not.toHavePrompt('Choose any amount of attachments');
                expect(this.giftedTactician.attachments.length).toBe(1);
            });

            it('adds Corrupt trait to parent', function () {
                this.player1.pass();

                this.player2.clickCard(this.jealousAncestor);
                this.player2.clickPrompt('Play Jealous Ancestor as an attachment');
                this.player2.clickCard(this.giftedTactician);

                expect(this.giftedTactician.hasTrait('shadowlands')).toBe(true);
            });

            describe('when parent is participating', function () {
                beforeEach(function () {
                    this.player1.clickCard(this.ingenuity);
                    this.player1.clickCard(this.giftedTactician);

                    this.player2.clickCard(this.jealousAncestor);
                    this.player2.clickPrompt('Play Jealous Ancestor as an attachment');
                    this.player2.clickCard(this.giftedTactician);

                    this.noMoreActions();
                    this.initiateConflict({
                        type: 'military',
                        attackers: [this.giftedTactician, this.keeper],
                        defenders: [this.whisperer],
                        ring: 'earth'
                    });
                });

                it('blocks parent player draw effects', function () {
                    this.noMoreActions();
                    expect(this.player1).not.toHavePrompt('Any reactions?');
                    expect(this.player1).not.toBeAbleToSelect(this.giftedTactician);
                });

                it('blocks parent player deck search', function () {
                    this.player2.pass();

                    this.player1.clickCard(this.giftedTactician);
                    expect(this.player1).toHavePrompt('Select a card to reveal');
                    expect(this.player1).not.toHavePromptButton('Supernatural Storm (4)');
                    expect(this.player1).toHavePromptButton('Take nothing');

                    this.player1.clickPrompt('Take nothing');
                    expect(this.getChatLogs(5)).toContain('player1 takes nothing');
                    expect(this.getChatLogs(5)).toContain('player1 is shuffling their conflict deck');
                });

                it('blocks parent return cards to hand', function () {
                    this.player2.pass();
                    this.player1.clickCard(this.ancestralArmory);
                    expect(this.player1).not.toHavePrompt('Ancestral Armory');
                });

                it('blocks parent return characters to hand', function () {
                    this.player2.pass();
                    expect(this.adeptOfShadows.location).toBe('play area');
                    this.player1.clickCard(this.adeptOfShadows);
                    expect(this.adeptOfShadows.location).toBe('play area');
                });

                it('does not block draw from opponent events', function () {
                    let initialHand = this.player1.hand.length;
                    this.player2.clickCard(this.bhc);
                    this.player2.clickPrompt('player1');
                    expect(this.getChatLogs(5)).toContain(
                        'player2 plays Backhanded Compliment to make player1 lose an honor and draw a card'
                    );
                    expect(this.player1.hand.length).toBe(initialHand + 1);
                });

                it('does not block draw from opponent characters', function () {
                    this.player2.clickCard(this.whisperer);
                    this.player2.clickPrompt('player1');
                    expect(this.getChatLogs(5)).toContain(
                        'player2 uses Master Whisperer to make player1 discard 2 cards and draw 3 cards'
                    );
                    expect(this.player1.hand.length).toBe(3);
                });

                it('does not block return to hand from opponent effects', function () {
                    this.player2.clickCard(this.teaHouse);
                    this.player2.clickCard(this.ingenuity);
                    expect(this.getChatLogs(5)).toContain(
                        "player2 uses Esteemed Tea House to return Tactical Ingenuity to player1's hand and prevent them from playing copies this phase"
                    );
                    expect(this.ingenuity.location).toBe('hand');
                });
            });

            describe('when parent is participating but void ring is claimed', function () {
                beforeEach(function () {
                    this.game.rings.void.claimRing(this.player1.player);

                    this.player1.clickCard(this.ingenuity);
                    this.player1.clickCard(this.giftedTactician);

                    this.player2.clickCard(this.jealousAncestor);
                    this.player2.clickPrompt('Play Jealous Ancestor as an attachment');
                    this.player2.clickCard(this.giftedTactician);

                    this.noMoreActions();
                    this.initiateConflict({
                        type: 'military',
                        attackers: [this.giftedTactician],
                        defenders: [this.whisperer],
                        ring: 'earth'
                    });
                });

                it('does not block parent player draw effects', function () {
                    this.noMoreActions();
                    expect(this.player1).toHavePrompt('Any reactions?');
                    expect(this.player1).toBeAbleToSelect(this.giftedTactician);
                });

                it('does not block parent player deck search', function () {
                    this.player2.pass();

                    this.player1.clickCard(this.giftedTactician);
                    expect(this.player1).toHavePrompt('Select a card to reveal');
                    expect(this.player1).toHavePromptButton('Supernatural Storm (4)');
                    expect(this.player1).toHavePromptButton('Take nothing');

                    this.player1.clickPrompt('Supernatural Storm (4)');
                    expect(this.getChatLogs(5)).toContain('player1 takes Supernatural Storm');
                    expect(this.getChatLogs(5)).toContain('player1 is shuffling their conflict deck');
                });

                it('does not block parent return cards to hand', function () {
                    this.player2.pass();
                    this.player1.clickCard(this.ancestralArmory);
                    expect(this.player1).toHavePrompt('Ancestral Armory');
                });

                it('does not block parent return characters to hand', function () {
                    this.player2.pass();
                    expect(this.adeptOfShadows.location).toBe('play area');
                    this.player1.clickCard(this.adeptOfShadows);
                    expect(this.adeptOfShadows.location).toBe('hand');
                });

                it('does not block draw from opponent events', function () {
                    let initialHand = this.player1.hand.length;
                    this.player2.clickCard(this.bhc);
                    this.player2.clickPrompt('player1');
                    expect(this.getChatLogs(5)).toContain(
                        'player2 plays Backhanded Compliment to make player1 lose an honor and draw a card'
                    );
                    expect(this.player1.hand.length).toBe(initialHand + 1);
                });

                it('does not block draw from opponent characters', function () {
                    this.player2.clickCard(this.whisperer);
                    this.player2.clickPrompt('player1');
                    expect(this.getChatLogs(5)).toContain(
                        'player2 uses Master Whisperer to make player1 discard 2 cards and draw 3 cards'
                    );
                    expect(this.player1.hand.length).toBe(3);
                });

                it('does not block return to hand from opponent effects', function () {
                    this.player2.clickCard(this.teaHouse);
                    this.player2.clickCard(this.ingenuity);
                    expect(this.getChatLogs(5)).toContain(
                        "player2 uses Esteemed Tea House to return Tactical Ingenuity to player1's hand and prevent them from playing copies this phase"
                    );
                    expect(this.ingenuity.location).toBe('hand');
                });
            });

            describe('when parent is not participating', function () {
                beforeEach(function () {
                    this.player1.clickCard(this.ingenuity);
                    this.player1.clickCard(this.giftedTactician);

                    this.player2.clickCard(this.jealousAncestor);
                    this.player2.clickPrompt('Play Jealous Ancestor as an attachment');
                    this.player2.clickCard(this.keeper);

                    this.noMoreActions();
                    this.initiateConflict({
                        type: 'military',
                        attackers: [this.giftedTactician],
                        defenders: [this.whisperer],
                        ring: 'earth'
                    });
                });

                it('does not block parent player draw effects', function () {
                    this.noMoreActions();
                    expect(this.player1).toHavePrompt('Any reactions?');
                    expect(this.player1).toBeAbleToSelect(this.giftedTactician);
                });

                it('does not block parent player deck search', function () {
                    this.player2.pass();

                    this.player1.clickCard(this.giftedTactician);
                    expect(this.player1).toHavePrompt('Select a card to reveal');
                    expect(this.player1).toHavePromptButton('Supernatural Storm (4)');
                    expect(this.player1).toHavePromptButton('Take nothing');

                    this.player1.clickPrompt('Supernatural Storm (4)');
                    expect(this.getChatLogs(5)).toContain('player1 takes Supernatural Storm');
                    expect(this.getChatLogs(5)).toContain('player1 is shuffling their conflict deck');
                });

                it('does not block parent return cards to hand', function () {
                    this.player2.pass();
                    this.player1.clickCard(this.ancestralArmory);
                    expect(this.player1).toHavePrompt('Ancestral Armory');
                });

                it('does not block parent return characters to hand', function () {
                    this.player2.pass();
                    expect(this.adeptOfShadows.location).toBe('play area');
                    this.player1.clickCard(this.adeptOfShadows);
                    expect(this.adeptOfShadows.location).toBe('hand');
                });

                it('does not block draw from opponent events', function () {
                    let initialHand = this.player1.hand.length;
                    this.player2.clickCard(this.bhc);
                    this.player2.clickPrompt('player1');
                    expect(this.getChatLogs(5)).toContain(
                        'player2 plays Backhanded Compliment to make player1 lose an honor and draw a card'
                    );
                    expect(this.player1.hand.length).toBe(initialHand + 1);
                });

                it('does not block draw from opponent characters', function () {
                    this.player2.clickCard(this.whisperer);
                    this.player2.clickPrompt('player1');
                    expect(this.getChatLogs(5)).toContain(
                        'player2 uses Master Whisperer to make player1 discard 2 cards and draw 3 cards'
                    );
                    expect(this.player1.hand.length).toBe(3);
                });

                it('does not block return to hand from opponent effects', function () {
                    this.player2.clickCard(this.teaHouse);
                    this.player2.clickCard(this.ingenuity);
                    expect(this.getChatLogs(5)).toContain(
                        "player2 uses Esteemed Tea House to return Tactical Ingenuity to player1's hand and prevent them from playing copies this phase"
                    );
                    expect(this.ingenuity.location).toBe('hand');
                });
            });
        });
    });
});
