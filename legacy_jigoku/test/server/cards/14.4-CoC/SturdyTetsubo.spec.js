describe('Sturdy Tetsubo', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['bayushi-liar', 'bayushi-manipulator'],
                    hand: ['sturdy-tetsubo', 'ornate-fan', 'fine-katana']
                },
                player2: {
                    inPlay: ['yogo-hiroue'],
                    hand: ['assassination', 'let-go']
                }
            });

            this.liar = this.player1.findCardByName('bayushi-liar');
            this.manipulator = this.player1.findCardByName('bayushi-manipulator');
            this.yogoHiroue = this.player2.findCardByName('yogo-hiroue');
            this.tetsubo = this.player1.findCardByName('sturdy-tetsubo');

            this.fan = this.player1.findCardByName('ornate-fan');
            this.katana = this.player1.findCardByName('fine-katana');

            this.assassination = this.player2.findCardByName('assassination');
            this.letGo = this.player2.findCardByName('let-go');
        });

        it('should make opponent discard a card when parent wins a conflict', function () {
            this.player1.playAttachment(this.tetsubo, this.manipulator);
            this.noMoreActions();
            let hand = this.player2.hand.length;

            this.initiateConflict({
                type: 'political',
                attackers: [this.liar, this.manipulator],
                defenders: [this.yogoHiroue]
            });
            this.noMoreActions();
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.manipulator);
            expect(this.player1).not.toBeAbleToSelect(this.tetsubo);
            this.player1.clickCard(this.manipulator);
            expect(this.player2).toHavePrompt('Choose a card to discard');
            expect(this.player2).toBeAbleToSelect(this.assassination);
            expect(this.player2).toBeAbleToSelect(this.letGo);
            expect(this.assassination.location).toBe('hand');
            this.player2.clickCard(this.assassination);
            expect(this.assassination.location).toBe('conflict discard pile');
            expect(this.player2.hand.length).toBe(hand - 1);
            expect(this.getChatLogs(10)).toContain('player1 uses Bayushi Manipulator\'s gained ability from Sturdy Tetsubō to make player2 discard 1 cards');
            expect(this.getChatLogs(10)).toContain('player2 discards Assassination');
        });

        it('can\'t trigger at home', function () {
            this.player1.playAttachment(this.tetsubo, this.manipulator);
            this.noMoreActions();
            this.initiateConflict({
                type: 'political',
                attackers: [this.liar],
                defenders: []
            });
            this.noMoreActions();
            expect(this.player1).not.toHavePrompt('Triggered Abilites');
        });

        it('can\'t trigger after losing the conflict', function () {
            this.player1.playAttachment(this.tetsubo, this.manipulator);
            this.noMoreActions();
            this.initiateConflict({
                type: 'political',
                attackers: [this.manipulator],
                defenders: [this.yogoHiroue]
            });
            this.noMoreActions();
            expect(this.player1).not.toHavePrompt('Triggered Abilites');
        });

        it('attaching to an opponents character', function () {
            this.player1.playAttachment(this.tetsubo, this.yogoHiroue);
            this.noMoreActions();
            let hand = this.player1.hand.length;

            this.initiateConflict({
                type: 'political',
                attackers: [this.manipulator],
                defenders: [this.yogoHiroue]
            });
            this.noMoreActions();
            expect(this.player2).toHavePrompt('Triggered Abilities');
            expect(this.player2).toBeAbleToSelect(this.yogoHiroue);
            expect(this.player2).not.toBeAbleToSelect(this.tetsubo);
            this.player2.clickCard(this.yogoHiroue);
            expect(this.player1).toHavePrompt('Choose a card to discard');
            expect(this.player1).toBeAbleToSelect(this.fan);
            expect(this.player1).toBeAbleToSelect(this.katana);
            expect(this.fan.location).toBe('hand');
            this.player1.clickCard(this.fan);
            expect(this.fan.location).toBe('conflict discard pile');
            expect(this.player1.hand.length).toBe(hand - 1);
            expect(this.getChatLogs(10)).toContain('player2 uses Yogo Hiroue\'s gained ability from Sturdy Tetsubō to make player1 discard 1 cards');
            expect(this.getChatLogs(10)).toContain('player1 discards Ornate Fan');
        });
    });
});

describe('Sturdy Tetsubo - moving it around', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['giver-of-gifts', 'bayushi-manipulator', 'giver-of-gifts'],
                    hand: ['sturdy-tetsubo']
                },
                player2: {
                    inPlay: ['akodo-zentaro'],
                    hand: ['assassination', 'let-go', 'ornate-fan', 'fine-katana']
                }
            });

            this.giver = this.player1.filterCardsByName('giver-of-gifts')[0];
            this.giver2 = this.player1.filterCardsByName('giver-of-gifts')[1];
            this.manipulator = this.player1.findCardByName('bayushi-manipulator');
            this.zentaro = this.player2.findCardByName('akodo-zentaro');
            this.tetsubo = this.player1.findCardByName('sturdy-tetsubo');

            this.fan = this.player2.findCardByName('ornate-fan');
            this.katana = this.player2.findCardByName('fine-katana');
            this.assassination = this.player2.findCardByName('assassination');
            this.letGo = this.player2.findCardByName('let-go');
        });

        it('should work 4x per turn if you move it', function () {
            this.player1.playAttachment(this.tetsubo, this.manipulator);
            this.noMoreActions();
            let hand = this.player2.hand.length;

            this.initiateConflict({
                type: 'military',
                attackers: [this.manipulator],
                defenders: [this.zentaro],
                ring: 'air'
            });
            this.noMoreActions();
            expect(this.player1).toHavePrompt('Triggered Abilities');
            this.player1.clickCard(this.manipulator);
            expect(this.player2).toHavePrompt('Choose a card to discard');
            this.player2.clickCard(this.assassination);
            expect(this.assassination.location).toBe('conflict discard pile');
            expect(this.player2.hand.length).toBe(hand - 1);

            this.player1.clickPrompt('Don\'t resolve');

            this.manipulator.bowed = false;
            this.zentaro.bowed = false;

            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.zentaro],
                defenders: [this.manipulator],
                ring: 'earth'
            });

            this.noMoreActions();
            expect(this.player1).toHavePrompt('Triggered Abilities');
            this.player1.clickCard(this.manipulator);
            expect(this.player2).toHavePrompt('Choose a card to discard');
            this.player2.clickCard(this.letGo);
            expect(this.letGo.location).toBe('conflict discard pile');
            expect(this.player2.hand.length).toBe(hand - 2);

            this.zentaro.bowed = false;
            this.player1.clickCard(this.giver);
            this.player1.clickCard(this.tetsubo);
            this.player1.clickCard(this.giver);

            this.noMoreActions();
            this.initiateConflict({
                type: 'political',
                attackers: [this.giver],
                defenders: [this.zentaro],
                ring: 'fire'
            });

            this.noMoreActions();
            expect(this.player1).toHavePrompt('Triggered Abilities');
            this.player1.clickCard(this.giver);
            expect(this.player2).toHavePrompt('Choose a card to discard');
            this.player2.clickCard(this.fan);
            expect(this.fan.location).toBe('conflict discard pile');
            expect(this.player2.hand.length).toBe(hand - 3);

            this.player1.clickPrompt('Don\'t resolve');

            this.giver.bowed = false;
            this.zentaro.bowed = false;

            this.noMoreActions();
            this.initiateConflict({
                type: 'political',
                attackers: [this.zentaro],
                defenders: [this.giver],
                ring: 'void'
            });

            this.noMoreActions();
            expect(this.player1).toHavePrompt('Triggered Abilities');
            this.player1.clickCard(this.giver);
            expect(this.katana.location).toBe('conflict discard pile');
            expect(this.player2.hand.length).toBe(hand - 4);
        });

        it('if you move it, then move it back should only work 3x per turn', function () {
            this.player1.playAttachment(this.tetsubo, this.manipulator);
            this.noMoreActions();
            let hand = this.player2.hand.length;

            this.initiateConflict({
                type: 'military',
                attackers: [this.manipulator],
                defenders: [this.zentaro],
                ring: 'air'
            });
            this.noMoreActions();
            expect(this.player1).toHavePrompt('Triggered Abilities');
            this.player1.clickCard(this.manipulator);
            expect(this.player2).toHavePrompt('Choose a card to discard');
            this.player2.clickCard(this.assassination);
            expect(this.assassination.location).toBe('conflict discard pile');
            expect(this.player2.hand.length).toBe(hand - 1);

            this.player1.clickPrompt('Don\'t resolve');

            this.manipulator.bowed = false;
            this.zentaro.bowed = false;

            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.zentaro],
                defenders: [this.manipulator],
                ring: 'earth'
            });

            this.noMoreActions();
            expect(this.player1).toHavePrompt('Triggered Abilities');
            this.player1.clickCard(this.manipulator);
            expect(this.player2).toHavePrompt('Choose a card to discard');
            this.player2.clickCard(this.letGo);
            expect(this.letGo.location).toBe('conflict discard pile');
            expect(this.player2.hand.length).toBe(hand - 2);

            this.zentaro.bowed = false;
            this.player1.clickCard(this.giver);
            this.player1.clickCard(this.tetsubo);
            this.player1.clickCard(this.giver);

            this.noMoreActions();
            this.initiateConflict({
                type: 'political',
                attackers: [this.giver],
                defenders: [this.zentaro],
                ring: 'fire'
            });

            this.noMoreActions();
            expect(this.player1).toHavePrompt('Triggered Abilities');
            this.player1.clickCard(this.giver);
            expect(this.player2).toHavePrompt('Choose a card to discard');
            this.player2.clickCard(this.fan);
            expect(this.fan.location).toBe('conflict discard pile');
            expect(this.player2.hand.length).toBe(hand - 3);

            this.player1.clickPrompt('Don\'t resolve');

            this.giver.bowed = false;
            this.manipulator.bowed = false;
            this.zentaro.bowed = false;

            this.player1.clickCard(this.giver2);
            this.player1.clickCard(this.tetsubo);
            this.player1.clickCard(this.manipulator);

            this.noMoreActions();
            this.initiateConflict({
                type: 'political',
                attackers: [this.zentaro],
                defenders: [this.giver, this.manipulator],
                ring: 'void'
            });

            this.noMoreActions();
            expect(this.player1).not.toHavePrompt('Triggered Abilities');
            expect(this.katana.location).toBe('hand');
            expect(this.player2.hand.length).toBe(hand - 3);
        });
    });
});
