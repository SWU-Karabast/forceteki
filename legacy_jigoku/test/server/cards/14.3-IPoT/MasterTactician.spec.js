describe('Master Tactician', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['master-tactician', 'kitsu-motso'],
                    hand: ['prepared-ambush', 'fine-katana'],
                    conflictDiscard: ['voice-of-honor', 'soul-beyond-reproach', 'tactical-ingenuity', 'ornate-fan']
                },
                player2: {
                    inPlay: ['master-tactician'],
                    hand: ['mirumoto-s-fury', 'backhanded-compliment']
                }
            });

            this.motso = this.player1.findCardByName('kitsu-motso');
            this.tactician = this.player1.findCardByName('master-tactician');
            this.ambush = this.player1.findCardByName('prepared-ambush');
            this.voice = this.player1.findCardByName('voice-of-honor');
            this.soul = this.player1.findCardByName('soul-beyond-reproach');
            this.tactical = this.player1.findCardByName('tactical-ingenuity');
            this.katana = this.player1.findCardByName('fine-katana');
            this.fan = this.player1.findCardByName('ornate-fan');
            this.fury = this.player2.findCardByName('mirumoto-s-fury');
            this.province = this.player2.findCardByName('shameful-display', 'province 1');
            this.backhanded = this.player2.findCardByName('backhanded-compliment');

            this.tacticianp2 = this.player2.findCardByName('master-tactician');

            this.player1.moveCard(this.fan, 'conflict deck');
            this.player1.moveCard(this.voice, 'conflict deck');
            this.player1.moveCard(this.soul, 'conflict deck');
            this.player1.moveCard(this.tactical, 'conflict deck');
        });

        describe('Looking at the top card', function () {
            it('should let you look at the top card while a battlefield is in play and this is participating', function () {
                this.player1.clickCard(this.ambush);
                this.player1.clickCard(this.province);
                this.noMoreActions();
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.tactician],
                    defenders: []
                });
                expect(this.player1.player.isTopConflictCardShown(this.player1.player)).toBe(true);
                expect(this.player1.player.isTopConflictCardShown(this.player2.player)).toBe(false);
            });

            it('should not let you look at the top card while a battlefield is not in play and this is participating', function () {
                this.noMoreActions();
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.tactician],
                    defenders: []
                });
                expect(this.player1.player.isTopConflictCardShown(this.player1.player)).toBe(false);
                expect(this.player1.player.isTopConflictCardShown(this.player2.player)).toBe(false);
            });

            it('should not let you look at the top card while a battlefield is in play and this is not participating', function () {
                this.player1.clickCard(this.ambush);
                this.player1.clickCard(this.province);
                this.noMoreActions();
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.motso],
                    defenders: []
                });
                expect(this.player1.player.isTopConflictCardShown(this.player1.player)).toBe(false);
                expect(this.player1.player.isTopConflictCardShown(this.player2.player)).toBe(false);
            });

            it('should not let you look at the top card during declaration', function () {
                this.player1.clickCard(this.ambush);
                this.player1.clickCard(this.province);
                this.noMoreActions();
                this.player1.clickCard(this.tactician);
                this.player1.clickRing('air');
                this.player1.clickCard(this.province);
                expect(this.player1.player.isTopConflictCardShown(this.player1.player)).toBe(false);
                expect(this.player1.player.isTopConflictCardShown(this.player2.player)).toBe(false);
                this.player1.clickPrompt('Initiate Conflict');
                expect(this.player1.player.isTopConflictCardShown(this.player1.player)).toBe(true);
                expect(this.player1.player.isTopConflictCardShown(this.player2.player)).toBe(false);
                this.player2.clickCard(this.tacticianp2);
                expect(this.player2.player.isTopConflictCardShown(this.player1.player)).toBe(false);
                expect(this.player2.player.isTopConflictCardShown(this.player2.player)).toBe(false);
                this.player2.clickPrompt('Done');
                expect(this.player2.player.isTopConflictCardShown(this.player1.player)).toBe(false);
                expect(this.player2.player.isTopConflictCardShown(this.player2.player)).toBe(true);
            });
        });

        describe('Playing the top card', function () {
            it('should let you play the top card while a battlefield is in play and this is participating', function () {
                this.player1.clickCard(this.ambush);
                this.player1.clickCard(this.province);
                this.noMoreActions();
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.tactician],
                    defenders: []
                });
                this.player2.pass();
                expect(this.player1).toHavePrompt('Conflict Action Window');
                this.player1.clickCard(this.tactical);
                this.player1.clickCard(this.tactician);
                expect(this.tactician.attachments).toContain(this.tactical);
                expect(this.player2).toHavePrompt('Conflict Action Window');
            });

            it('should not let your opponent play the top card', function () {
                this.player1.clickCard(this.ambush);
                this.player1.clickCard(this.province);
                this.noMoreActions();
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.tactician],
                    defenders: []
                });
                this.player2.clickCard(this.tactical);
                this.player2.clickCard(this.tacticianp2);
                expect(this.tacticianp2.attachments).not.toContain(this.tactical);
                expect(this.player2).toHavePrompt('Conflict Action Window');
            });

            it('should not let you play the top card while a battlefield is not in play and this is participating', function () {
                this.noMoreActions();
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.tactician],
                    defenders: []
                });
                this.player2.pass();
                expect(this.player1).toHavePrompt('Conflict Action Window');
                this.player1.clickCard(this.tactical);
                this.player1.clickCard(this.tactician);
                expect(this.tactician.attachments).not.toContain(this.tactical);
                expect(this.player1).toHavePrompt('Conflict Action Window');
            });

            it('should not let you play the top card while a battlefield is in play and this is not participating', function () {
                this.player1.clickCard(this.ambush);
                this.player1.clickCard(this.province);
                this.noMoreActions();
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.motso],
                    defenders: []
                });
                this.player2.pass();
                expect(this.player1).toHavePrompt('Conflict Action Window');
                this.player1.clickCard(this.tactical);
                this.player1.clickCard(this.tactician);
                expect(this.tactician.attachments).not.toContain(this.tactical);
                expect(this.player1).toHavePrompt('Conflict Action Window');
            });
        });

        describe('Max 3 cards', function () {
            it('should let you play three cards, but look at the fourth', function () {
                this.player1.clickCard(this.ambush);
                this.player1.clickCard(this.province);
                this.noMoreActions();
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.tactician],
                    defenders: []
                });
                expect(this.player1.player.isTopConflictCardShown(this.player1.player)).toBe(true);
                expect(this.player1.player.isTopConflictCardShown(this.player2.player)).toBe(false);

                this.player2.pass();

                this.player1.clickCard(this.tactical);
                this.player1.clickCard(this.tactician);
                expect(this.tactician.attachments).toContain(this.tactical);

                expect(this.player1.player.isTopConflictCardShown(this.player1.player)).toBe(true);
                expect(this.player1.player.isTopConflictCardShown(this.player2.player)).toBe(false);

                this.player2.pass();

                this.player1.clickCard(this.soul);
                this.player1.clickCard(this.tactician);
                expect(this.tactician.isHonored).toBe(true);

                expect(this.player1.player.isTopConflictCardShown(this.player1.player)).toBe(true);
                expect(this.player1.player.isTopConflictCardShown(this.player2.player)).toBe(false);

                this.player2.clickCard(this.fury);
                this.player2.clickCard(this.tactician);

                expect(this.player1).toHavePrompt('Triggered Abilities');
                expect(this.player1).toBeAbleToSelect(this.voice);
                this.player1.clickCard(this.voice);

                expect(this.player1.player.isTopConflictCardShown(this.player1.player)).toBe(true);
                expect(this.player1.player.isTopConflictCardShown(this.player2.player)).toBe(false);

                expect(this.player1).toHavePrompt('Conflict Action Window');
                this.player1.clickCard(this.fan);
                expect(this.player1).toHavePrompt('Conflict Action Window');
            });
        });

        describe('easy edge cases', function () {
            it('should not let you play a card that was already played from the top of your deck', function () {
                this.player1.clickCard(this.ambush);
                this.player1.clickCard(this.province);
                this.noMoreActions();
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.tactician],
                    defenders: []
                });
                expect(this.player1.player.isTopConflictCardShown(this.player1.player)).toBe(true);
                expect(this.player1.player.isTopConflictCardShown(this.player2.player)).toBe(false);

                this.player2.pass();

                this.player1.clickCard(this.tactical);
                this.player1.clickCard(this.tactician);
                expect(this.tactician.attachments).toContain(this.tactical);

                expect(this.player1.player.isTopConflictCardShown(this.player1.player)).toBe(true);
                expect(this.player1.player.isTopConflictCardShown(this.player2.player)).toBe(false);

                this.player2.pass();

                this.player1.clickCard(this.soul);
                this.player1.clickCard(this.tactician);
                expect(this.tactician.isHonored).toBe(true);

                expect(this.player1.player.isTopConflictCardShown(this.player1.player)).toBe(true);
                expect(this.player1.player.isTopConflictCardShown(this.player2.player)).toBe(false);

                this.player2.pass();

                expect(this.player1).toHavePrompt('Conflict Action Window');
                this.player1.clickCard(this.soul);
                expect(this.player1).toHavePrompt('Conflict Action Window');
            });

            it('should not count cards that move from the top of your deck (due to drawing as an example)', function () {
                this.player1.clickCard(this.ambush);
                this.player1.clickCard(this.province);
                this.noMoreActions();
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.tactician],
                    defenders: []
                });
                expect(this.player1.player.isTopConflictCardShown(this.player1.player)).toBe(true);
                expect(this.player1.player.isTopConflictCardShown(this.player2.player)).toBe(false);

                this.player2.pass();

                this.player1.clickCard(this.tactical);
                this.player1.clickCard(this.tactician);
                expect(this.tactician.attachments).toContain(this.tactical);

                expect(this.player1.player.isTopConflictCardShown(this.player1.player)).toBe(true);
                expect(this.player1.player.isTopConflictCardShown(this.player2.player)).toBe(false);

                this.player2.clickCard(this.backhanded);
                this.player2.clickPrompt('player1');

                this.player1.clickCard(this.soul);
                this.player1.clickCard(this.tactician);
                expect(this.tactician.isHonored).toBe(true);

                expect(this.player1.player.isTopConflictCardShown(this.player1.player)).toBe(true);
                expect(this.player1.player.isTopConflictCardShown(this.player2.player)).toBe(false);

                this.player2.clickCard(this.fury);
                this.player2.clickCard(this.tactician);

                expect(this.player1).toHavePrompt('Triggered Abilities');
                expect(this.player1).toBeAbleToSelect(this.voice);
                this.player1.clickCard(this.voice);

                expect(this.player1.player.isTopConflictCardShown(this.player1.player)).toBe(true);
                expect(this.player1.player.isTopConflictCardShown(this.player2.player)).toBe(false);

                expect(this.player1).toHavePrompt('Conflict Action Window');
                this.player1.clickCard(this.fan);
                expect(this.player1).toHavePrompt('Ornate Fan');
            });

            it('effect should not persist if card moves from the top of the deck', function () {
                this.player1.clickCard(this.ambush);
                this.player1.clickCard(this.province);
                this.noMoreActions();
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.tactician],
                    defenders: []
                });
                expect(this.player1.player.isTopConflictCardShown(this.player1.player)).toBe(true);
                expect(this.player1.player.isTopConflictCardShown(this.player2.player)).toBe(false);

                this.player2.pass();

                this.player1.clickCard(this.tactical);
                this.player1.clickCard(this.tactician);
                expect(this.tactician.attachments).toContain(this.tactical);

                expect(this.player1.player.isTopConflictCardShown(this.player1.player)).toBe(true);
                expect(this.player1.player.isTopConflictCardShown(this.player2.player)).toBe(false);

                this.player1.moveCard(this.fan, 'hand');
                this.player1.moveCard(this.fan, 'conflict deck');

                this.player2.pass();
                expect(this.player1).toHavePrompt('Conflict Action Window');
                this.player1.clickCard(this.soul);
                expect(this.player1).toHavePrompt('Conflict Action Window');
            });

            it('should work if your conflict deck is empty', function () {
                this.player1.reduceDeckToNumber('conflict deck', 0);
                this.player1.clickCard(this.ambush);
                this.player1.clickCard(this.province);
                this.noMoreActions();
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.tactician],
                    defenders: []
                });
                expect(this.player1.player.isTopConflictCardShown(this.player1.player)).toBe(false);
                expect(this.player1.player.isTopConflictCardShown(this.player2.player)).toBe(false);
            });
        });

        it('chat messages', function () {
            this.player1.clickCard(this.ambush);
            this.player1.clickCard(this.province);
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.tactician],
                defenders: []
            });
            this.player2.pass();

            this.player1.clickCard(this.tactical);
            this.player1.clickCard(this.tactician);
            expect(this.getChatLogs(5)).not.toContain('player1 plays Tactical Ingenuity from their conflict deck');
            expect(this.getChatLogs(3)).toContain(
                'player1 plays a card from their conflict deck due to the ability of Master Tactician (2 uses remaining)'
            );

            this.player2.pass();

            this.player1.clickCard(this.soul);
            this.player1.clickCard(this.tactician);
            expect(this.getChatLogs(5)).toContain('player1 plays Soul Beyond Reproach from their conflict deck');
            expect(this.getChatLogs(3)).toContain(
                'player1 plays a card from their conflict deck due to the ability of Master Tactician (1 use remaining)'
            );

            this.player2.clickCard(this.fury);
            this.player2.clickCard(this.tactician);
            this.player1.clickCard(this.voice);
            expect(this.getChatLogs(5)).toContain('player1 plays Voice of Honor from their conflict deck');
            expect(this.getChatLogs(3)).toContain(
                'player1 plays a card from their conflict deck due to the ability of Master Tactician (0 uses remaining)'
            );
        });

        it('Should not let you see the card until after you commit to the conflict', function () {
            this.player1.clickCard(this.ambush);
            this.player1.clickCard(this.province);
            this.noMoreActions();
            this.player1.clickCard(this.tactician);
            expect(this.player1.player.isTopConflictCardShown(this.player1.player)).toBe(false);
            expect(this.player1.player.isTopConflictCardShown(this.player2.player)).toBe(false);
        });
    });
});

describe('Two Master Tacticians', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['master-tactician', 'master-tactician'],
                    hand: ['prepared-ambush', 'fine-katana'],
                    conflictDiscard: [
                        'voice-of-honor',
                        'soul-beyond-reproach',
                        'tactical-ingenuity',
                        'ornate-fan',
                        'seal-of-the-crane',
                        'seal-of-the-lion',
                        'seal-of-the-dragon'
                    ]
                },
                player2: {
                    hand: ['mirumoto-s-fury']
                }
            });

            this.tactician = this.player1.filterCardsByName('master-tactician')[0];
            this.tactician2 = this.player1.filterCardsByName('master-tactician')[1];
            this.ambush = this.player1.findCardByName('prepared-ambush');
            this.voice = this.player1.findCardByName('voice-of-honor');
            this.soul = this.player1.findCardByName('soul-beyond-reproach');
            this.tactical = this.player1.findCardByName('tactical-ingenuity');
            this.katana = this.player1.findCardByName('fine-katana');

            this.fan = this.player1.findCardByName('ornate-fan');
            this.crane = this.player1.findCardByName('seal-of-the-crane');
            this.lion = this.player1.findCardByName('seal-of-the-lion');
            this.dragon = this.player1.findCardByName('seal-of-the-dragon');

            this.fury = this.player2.findCardByName('mirumoto-s-fury');
            this.province = this.player2.findCardByName('shameful-display', 'province 1');

            this.player1.player.optionSettings.orderForcedAbilities = true;

            this.player1.moveCard(this.dragon, 'conflict deck');
            this.player1.moveCard(this.lion, 'conflict deck');
            this.player1.moveCard(this.crane, 'conflict deck');
            this.player1.moveCard(this.fan, 'conflict deck');
            this.player1.moveCard(this.voice, 'conflict deck');
            this.player1.moveCard(this.soul, 'conflict deck');
            this.player1.moveCard(this.tactical, 'conflict deck');

            this.player1.clickCard(this.ambush);
            this.player1.clickCard(this.province);
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.tactician, this.tactician2],
                defenders: []
            });
        });

        it('should let first player pick which tactician gets credited the card - all from first tactician, then all from second tactician', function () {
            this.player2.pass();

            this.player1.clickCard(this.tactical);
            this.player1.clickCard(this.tactician);

            expect(this.player1).toHavePrompt('Order Simultaneous effects');
            this.player1.clickPromptButtonIndex(0);

            expect(this.tactician.attachments).toContain(this.tactical);

            expect(this.player1.player.isTopConflictCardShown(this.player1.player)).toBe(true);
            expect(this.player1.player.isTopConflictCardShown(this.player2.player)).toBe(false);

            this.player2.pass();

            this.player1.clickCard(this.soul);
            this.player1.clickCard(this.tactician);
            expect(this.tactician.isHonored).toBe(true);
            this.player1.clickPromptButtonIndex(0);

            expect(this.player1.player.isTopConflictCardShown(this.player1.player)).toBe(true);
            expect(this.player1.player.isTopConflictCardShown(this.player2.player)).toBe(false);

            this.player2.clickCard(this.fury);
            this.player2.clickCard(this.tactician);

            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.voice);
            this.player1.clickCard(this.voice);
            this.player1.clickPromptButtonIndex(0);

            this.player1.clickCard(this.fan);
            this.player1.clickCard(this.tactician2);
            this.player2.pass();
            this.player1.clickCard(this.crane);
            this.player1.clickCard(this.tactician2);
            this.player2.pass();
            this.player1.clickCard(this.lion);
            this.player1.clickCard(this.tactician2);

            expect(this.tactician.attachments).toContain(this.tactical);
            expect(this.tactician2.attachments).toContain(this.fan);
            expect(this.tactician2.attachments).toContain(this.crane);
            expect(this.tactician2.attachments).toContain(this.lion);
        });

        it('should let first player pick which tactician gets credited the card - mixing it up', function () {
            this.player2.pass();

            this.player1.clickCard(this.tactical);
            this.player1.clickCard(this.tactician);
            expect(this.player1).toHavePrompt('Order Simultaneous effects');
            this.player1.clickPromptButtonIndex(0);

            expect(this.tactician.attachments).toContain(this.tactical);

            this.player2.pass();
            this.player1.clickCard(this.soul);
            this.player1.clickCard(this.tactician);
            expect(this.tactician.isHonored).toBe(true);
            this.player1.clickPromptButtonIndex(1);

            this.player2.clickCard(this.fury);
            this.player2.clickCard(this.tactician);

            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.voice);
            this.player1.clickCard(this.voice);
            this.player1.clickPromptButtonIndex(0);

            this.player1.clickCard(this.fan);
            this.player1.clickCard(this.tactician2);
            this.player1.clickPromptButtonIndex(1);
            this.player2.pass();
            this.player1.clickCard(this.crane);
            this.player1.clickCard(this.tactician2);
            this.player1.clickPromptButtonIndex(0);
            this.player2.pass();
            this.player1.clickCard(this.lion);
            this.player1.clickCard(this.tactician2);
        });

        it('should not let 7 cards be played', function () {
            this.player2.pass();

            this.player1.clickCard(this.tactical);
            this.player1.clickCard(this.tactician);
            expect(this.player1).toHavePrompt('Order Simultaneous effects');
            this.player1.clickPromptButtonIndex(0);

            expect(this.tactician.attachments).toContain(this.tactical);

            this.player2.pass();
            this.player1.clickCard(this.soul);
            this.player1.clickCard(this.tactician);
            expect(this.tactician.isHonored).toBe(true);
            this.player1.clickPromptButtonIndex(1);

            this.player2.clickCard(this.fury);
            this.player2.clickCard(this.tactician);

            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.voice);
            this.player1.clickCard(this.voice);
            this.player1.clickPromptButtonIndex(0);

            this.player1.clickCard(this.fan);
            this.player1.clickCard(this.tactician2);
            this.player1.clickPromptButtonIndex(1);
            this.player2.pass();
            this.player1.clickCard(this.crane);
            this.player1.clickCard(this.tactician2);
            this.player1.clickPromptButtonIndex(0);
            this.player2.pass();
            this.player1.clickCard(this.lion);
            this.player1.clickCard(this.tactician2);

            this.player2.pass();
            expect(this.player1).toHavePrompt('Conflict Action Window');
            this.player1.clickCard(this.dragon);
            expect(this.player1).toHavePrompt('Conflict Action Window');
        });

        it('with the prompt off - should still let 6 cards be played', function () {
            this.player1.player.optionSettings.orderForcedAbilities = false;
            this.player2.pass();

            this.player1.clickCard(this.tactical);
            this.player1.clickCard(this.tactician);
            expect(this.tactician.attachments).toContain(this.tactical);

            this.player2.pass();
            this.player1.clickCard(this.soul);
            this.player1.clickCard(this.tactician);
            expect(this.tactician.isHonored).toBe(true);

            this.player2.clickCard(this.fury);
            this.player2.clickCard(this.tactician);

            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.voice);
            this.player1.clickCard(this.voice);

            this.player1.clickCard(this.fan);
            this.player1.clickCard(this.tactician2);
            expect(this.tactician2.attachments).toContain(this.fan);
            this.player2.pass();
            this.player1.clickCard(this.crane);
            this.player1.clickCard(this.tactician2);
            expect(this.tactician2.attachments).toContain(this.crane);
            this.player2.pass();
            this.player1.clickCard(this.lion);
            this.player1.clickCard(this.tactician2);
            expect(this.tactician2.attachments).toContain(this.lion);

            this.player2.pass();
            expect(this.player1).toHavePrompt('Conflict Action Window');
            this.player1.clickCard(this.dragon);
            expect(this.player1).toHavePrompt('Conflict Action Window');
        });
    });
});

describe('Master Tactician - Edge Cases', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['master-tactician'],
                    hand: ['prepared-ambush', 'fine-katana'],
                    conflictDiscard: ['voice-of-honor', 'soul-beyond-reproach', 'tactical-ingenuity', 'ornate-fan']
                },
                player2: {
                    inPlay: ['utaku-tetsuko'],
                    hand: ['mirumoto-s-fury', 'backhanded-compliment']
                }
            });

            this.tetsuko = this.player2.findCardByName('utaku-tetsuko');
            this.tactician = this.player1.findCardByName('master-tactician');
            this.ambush = this.player1.findCardByName('prepared-ambush');
            this.voice = this.player1.findCardByName('voice-of-honor');
            this.soul = this.player1.findCardByName('soul-beyond-reproach');
            this.tactical = this.player1.findCardByName('tactical-ingenuity');
            this.katana = this.player1.findCardByName('fine-katana');
            this.fan = this.player1.findCardByName('ornate-fan');
            this.fury = this.player2.findCardByName('mirumoto-s-fury');
            this.province = this.player2.findCardByName('shameful-display', 'province 1');
            this.backhanded = this.player2.findCardByName('backhanded-compliment');

            this.player1.moveCard(this.fan, 'conflict deck');
            this.player1.moveCard(this.voice, 'conflict deck');
            this.player1.moveCard(this.soul, 'conflict deck');
            this.player1.moveCard(this.tactical, 'conflict deck');
        });

        it('Tetsuko should increase cost to play cards', function () {
            this.player1.clickCard(this.ambush);
            this.player1.clickCard(this.province);
            this.noMoreActions();
            this.player1.passConflict();
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.tetsuko],
                defenders: [this.tactician]
            });
            expect(this.player1.player.isTopConflictCardShown(this.player1.player)).toBe(true);
            expect(this.player1.player.isTopConflictCardShown(this.player2.player)).toBe(false);

            let fate = this.player1.fate;

            this.player1.clickCard(this.tactical);
            this.player1.clickCard(this.tactician);
            expect(this.tactician.attachments).toContain(this.tactical);

            expect(this.player1.fate).toBe(fate - 1); //tetsuko tax
        });
    });
});

describe('Master Tactician - Pillow Book', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['master-tactician'],
                    hand: ['prepared-ambush', 'pillow-book'],
                    conflictDiscard: ['voice-of-honor', 'soul-beyond-reproach', 'tactical-ingenuity', 'ornate-fan']
                },
                player2: {
                    hand: ['mirumoto-s-fury', 'backhanded-compliment']
                }
            });

            this.player1.player.optionSettings.orderForcedAbilities = true;

            this.tactician = this.player1.findCardByName('master-tactician');
            this.ambush = this.player1.findCardByName('prepared-ambush');
            this.voice = this.player1.findCardByName('voice-of-honor');
            this.soul = this.player1.findCardByName('soul-beyond-reproach');
            this.tactical = this.player1.findCardByName('tactical-ingenuity');
            this.book = this.player1.findCardByName('pillow-book');
            this.fan = this.player1.findCardByName('ornate-fan');
            this.fury = this.player2.findCardByName('mirumoto-s-fury');
            this.province = this.player2.findCardByName('shameful-display', 'province 1');
            this.backhanded = this.player2.findCardByName('backhanded-compliment');

            this.player1.moveCard(this.fan, 'conflict deck');
            this.player1.moveCard(this.voice, 'conflict deck');
            this.player1.moveCard(this.soul, 'conflict deck');
            this.player1.moveCard(this.tactical, 'conflict deck');
        });

        it('Pillow Book should override Master Tactician', function () {
            this.player1.clickCard(this.ambush);
            this.player1.clickCard(this.province);
            this.player2.pass();
            this.player1.playAttachment(this.book, this.tactician);
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.tactician],
                defenders: []
            });
            expect(this.player1.player.isTopConflictCardShown(this.player1.player)).toBe(true);
            expect(this.player1.player.isTopConflictCardShown(this.player2.player)).toBe(false);
            this.player2.pass();

            this.player1.clickCard(this.book);
            expect(this.player1.player.isTopConflictCardShown(this.player1.player)).toBe(true);
            expect(this.player1.player.isTopConflictCardShown(this.player2.player)).toBe(true);
        });

        it('Pillow Book should not use up a Master Tactician use', function () {
            this.player1.clickCard(this.ambush);
            this.player1.clickCard(this.province);
            this.player2.pass();
            this.player1.playAttachment(this.book, this.tactician);
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.tactician],
                defenders: []
            });
            this.player2.pass();

            this.player1.clickCard(this.book);

            this.player2.pass();

            this.player1.clickCard(this.tactical);
            this.player1.clickCard(this.tactician);
            expect(this.tactician.attachments).toContain(this.tactical);

            expect(this.getChatLogs(3)).not.toContain(
                'player1 plays a card from their conflict deck due to the ability of Master Tactician (2 uses remaining)'
            );
        });
    });
});

describe('Master Tactician - Copying', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['shosuro-actor'],
                    hand: ['prepared-ambush', 'fine-katana'],
                    conflictDiscard: ['voice-of-honor', 'soul-beyond-reproach', 'tactical-ingenuity', 'ornate-fan']
                },
                player2: {
                    inPlay: ['master-tactician'],
                    hand: ['mirumoto-s-fury', 'backhanded-compliment']
                }
            });

            this.actor = this.player1.findCardByName('shosuro-actor');
            this.tactician = this.player2.findCardByName('master-tactician');
            this.ambush = this.player1.findCardByName('prepared-ambush');
            this.voice = this.player1.findCardByName('voice-of-honor');
            this.soul = this.player1.findCardByName('soul-beyond-reproach');
            this.tactical = this.player1.findCardByName('tactical-ingenuity');
            this.katana = this.player1.findCardByName('fine-katana');
            this.fan = this.player1.findCardByName('ornate-fan');
            this.fury = this.player2.findCardByName('mirumoto-s-fury');
            this.province = this.player2.findCardByName('shameful-display', 'province 1');
            this.backhanded = this.player2.findCardByName('backhanded-compliment');

            this.player1.moveCard(this.fan, 'conflict deck');
            this.player1.moveCard(this.voice, 'conflict deck');
            this.player1.moveCard(this.soul, 'conflict deck');
            this.player1.moveCard(this.tactical, 'conflict deck');
        });

        describe('Max 3 cards', function () {
            it('should let you play three cards, but look at the fourth', function () {
                this.player1.clickCard(this.ambush);
                this.player1.clickCard(this.province);
                this.noMoreActions();
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.actor],
                    defenders: []
                });
                expect(this.player1.player.isTopConflictCardShown(this.player1.player)).toBe(false);
                expect(this.player1.player.isTopConflictCardShown(this.player2.player)).toBe(false);

                this.player2.pass();

                this.player1.clickCard(this.actor);
                this.player1.clickCard(this.tactician);

                expect(this.player1.player.isTopConflictCardShown(this.player1.player)).toBe(true);
                expect(this.player1.player.isTopConflictCardShown(this.player2.player)).toBe(false);
                this.player2.pass();

                this.player1.clickCard(this.tactical);
                this.player1.clickCard(this.actor);
                expect(this.actor.attachments).toContain(this.tactical);

                expect(this.player1.player.isTopConflictCardShown(this.player1.player)).toBe(true);
                expect(this.player1.player.isTopConflictCardShown(this.player2.player)).toBe(false);

                this.player2.pass();

                this.player1.clickCard(this.soul);
                this.player1.clickCard(this.actor);
                expect(this.actor.isHonored).toBe(true);

                expect(this.player1.player.isTopConflictCardShown(this.player1.player)).toBe(true);
                expect(this.player1.player.isTopConflictCardShown(this.player2.player)).toBe(false);

                this.player2.clickCard(this.fury);
                this.player2.clickCard(this.actor);

                expect(this.player1).toHavePrompt('Triggered Abilities');
                expect(this.player1).toBeAbleToSelect(this.voice);
                this.player1.clickCard(this.voice);

                expect(this.player1.player.isTopConflictCardShown(this.player1.player)).toBe(true);
                expect(this.player1.player.isTopConflictCardShown(this.player2.player)).toBe(false);

                expect(this.player1).toHavePrompt('Conflict Action Window');
                this.player1.clickCard(this.fan);
                expect(this.player1).toHavePrompt('Conflict Action Window');
            });
        });

        it('chat messages', function () {
            this.player1.clickCard(this.ambush);
            this.player1.clickCard(this.province);
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.actor],
                defenders: []
            });
            this.player2.pass();
            this.player1.clickCard(this.actor);
            this.player1.clickCard(this.tactician);
            this.player2.pass();

            this.player1.clickCard(this.tactical);
            this.player1.clickCard(this.actor);
            expect(this.getChatLogs(3)).toContain(
                'player1 plays a card from their conflict deck due to the ability of Master Tactician (2 uses remaining)'
            );

            this.player2.pass();

            this.player1.clickCard(this.soul);
            this.player1.clickCard(this.actor);
            expect(this.getChatLogs(3)).toContain(
                'player1 plays a card from their conflict deck due to the ability of Master Tactician (1 use remaining)'
            );

            this.player2.clickCard(this.fury);
            this.player2.clickCard(this.actor);
            this.player1.clickCard(this.voice);
            expect(this.getChatLogs(3)).toContain(
                'player1 plays a card from their conflict deck due to the ability of Master Tactician (0 uses remaining)'
            );
        });
    });
});
