describe('Twin Soul Temple', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['asako-azunami', 'isawa-kaede', 'master-alchemist', 'fire-tensai-acolyte', 'henshin-disciple', 'kakita-toshimoko', 'kuni-yori'],
                    provinces: ['pilgrimage', 'honor-s-reward', 'manicured-garden', 'tsuma'],
                    dynastyDiscard: ['alchemical-laboratory'],
                    stronghold: ['twin-soul-temple']
                },
                player2: {
                    inPlay: ['prodigy-of-the-waves', 'doji-challenger', 'sadane-student', 'togashi-yokuni'],
                    stronghold: ['twin-soul-temple']
                }
            });

            this.twinSoul1 = this.player1.findCardByName('twin-soul-temple');
            this.twinSoul2 = this.player2.findCardByName('twin-soul-temple');

            this.azunami = this.player1.findCardByName('asako-azunami');
            this.kaede = this.player1.findCardByName('isawa-kaede');
            this.alchemist = this.player1.findCardByName('master-alchemist');
            this.fireTensai = this.player1.findCardByName('fire-tensai-acolyte');
            this.henshin = this.player1.findCardByName('henshin-disciple');
            this.toshimoko = this.player1.findCardByName('kakita-toshimoko');
            this.yori = this.player1.findCardByName('kuni-yori');
            this.lab = this.player1.findCardByName('alchemical-laboratory');

            this.pilgrimage = this.player1.findCardByName('pilgrimage');
            this.reward = this.player1.findCardByName('honor-s-reward');
            this.garden = this.player1.findCardByName('manicured-garden');
            this.tsuma = this.player1.findCardByName('tsuma');

            this.prodigy = this.player2.findCardByName('prodigy-of-the-waves');
            this.challenger = this.player2.findCardByName('doji-challenger');
            this.student = this.player2.findCardByName('sadane-student');
            this.yokuni = this.player2.findCardByName('togashi-yokuni');

            this.garden.facedown = true;
            this.pilgrimage.facedown = false;
            this.reward.facedown = false;
            this.tsuma.facedown = false;
            this.player1.placeCardInProvince(this.yori, 'province 1');
            this.player1.placeCardInProvince(this.lab, 'province 2');
            this.lab.facedown = false;
            this.yori.facedown = false;
            this.game.checkGameState(true);
        });

        it('should prompt you to select a card with an element symbol', function() {
            this.player1.clickCard(this.twinSoul1);
            expect(this.player1).toHavePrompt('Choose an element to replace');
            expect(this.player1).toBeAbleToSelect(this.azunami);
            expect(this.player1).toBeAbleToSelect(this.kaede);
            expect(this.player1).toBeAbleToSelect(this.alchemist);
            expect(this.player1).toBeAbleToSelect(this.fireTensai);
            expect(this.player1).toBeAbleToSelect(this.henshin);
            expect(this.player1).not.toBeAbleToSelect(this.toshimoko);
            expect(this.player1).not.toBeAbleToSelect(this.yori);
            expect(this.player1).toBeAbleToSelect(this.lab);
            expect(this.player1).toBeAbleToSelect(this.pilgrimage);
            expect(this.player1).not.toBeAbleToSelect(this.garden);
            expect(this.player1).toBeAbleToSelect(this.tsuma);
            expect(this.player1).toBeAbleToSelect(this.reward);

            expect(this.player1).toBeAbleToSelect(this.prodigy);
            expect(this.player1).not.toBeAbleToSelect(this.challenger);
            expect(this.player1).toBeAbleToSelect(this.student);
        });

        it('should prompt you to pick a new element', function() {
            this.player1.clickCard(this.twinSoul1);
            expect(this.player1).toHavePrompt('Choose an element to replace');
            this.player1.clickCard(this.prodigy);
            expect(this.player1).toHavePrompt('Choose the new element');
            expect(this.player1).toHavePromptButton('Air');
            expect(this.player1).toHavePromptButton('Earth');
            expect(this.player1).toHavePromptButton('Fire');
            expect(this.player1).toHavePromptButton('Void');
            expect(this.player1).not.toHavePromptButton('Water');
        });

        it('should change the element', function() {
            this.prodigy.bow();
            this.player1.clickCard(this.twinSoul1);
            expect(this.player1).toHavePrompt('Choose an element to replace');
            this.player1.clickCard(this.prodigy);
            this.player1.clickPrompt('Air');

            expect(this.getChatLogs(10)).toContain('player1 uses Twin Soul Temple, bowing Twin Soul Temple to replace a printed element symbol with a different one');
            expect(this.getChatLogs(10)).toContain('player1 replaces Prodigy of the Waves\'s Claimed Ring (Water) symbol with Air');

            this.player1.claimRing('water');
            this.game.checkGameState(true);
            this.player2.clickCard(this.prodigy);
            expect(this.player2).toHavePrompt('Action Window');
            expect(this.prodigy.bowed).toBe(true);
            this.player1.claimRing('air');
            this.game.checkGameState(true);
            this.player2.clickCard(this.prodigy);
            expect(this.player1).toHavePrompt('Action Window');
            expect(this.prodigy.bowed).toBe(false);
        });

        it('Kaede', function() {
            this.prodigy.fate = 4;
            this.player1.player.optionSettings.orderForcedAbilities = true;
            this.player1.clickCard(this.twinSoul1);
            this.player1.clickCard(this.kaede);
            this.player1.clickPrompt('Earth');

            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                ring: 'fire',
                attackers: [this.kaede],
                defenders: [this.challenger]
            });

            this.noMoreActions();
            expect(this.player1).toHavePrompt('Resolve Ring Effect');
            this.player1.clickPrompt('Resolve All Elements');
            expect(this.player1).toHavePrompt('Choose an effect to be resolved');
            expect(this.player1.currentButtons).toContain('Fire Ring Effect');
            expect(this.player1.currentButtons).toContain('Earth Ring Effect');
            expect(this.player1.currentButtons).not.toContain('Void Ring Effect');
        });

        describe('Fire Tensai Acolyte', function() {
            beforeEach(function() {
                this.player1.clickCard(this.twinSoul1);
                this.player1.clickCard(this.fireTensai);
                this.player1.clickPrompt('Void');
                this.noMoreActions();
            });

            it('should not be able to attack during non-void conflicts', function() {
                this.initiateConflict({
                    type: 'military',
                    ring: 'fire',
                    attackers: [this.fireTensai, this.azunami],
                    defenders: []
                });
                expect(this.game.currentConflict.attackers).toContain(this.azunami);
                expect(this.game.currentConflict.attackers).not.toContain(this.fireTensai);
            });

            it('should be able to attack during void conflicts', function() {
                this.initiateConflict({
                    type: 'military',
                    ring: 'void',
                    attackers: [this.fireTensai, this.azunami],
                    defenders: []
                });
                expect(this.game.currentConflict.attackers).toContain(this.azunami);
                expect(this.game.currentConflict.attackers).toContain(this.fireTensai);
            });
        });

        it('Master Alchemist', function() {
            this.player1.clickCard(this.twinSoul1);
            this.player1.clickCard(this.alchemist);
            this.player1.clickPrompt('Void');

            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                ring: 'air',
                attackers: [this.alchemist],
                defenders: [this.challenger]
            });

            this.player2.pass();
            let fireFate = this.game.rings.fire.fate;
            let voidFate = this.game.rings.void.fate;
            this.player1.clickCard(this.alchemist);
            this.player1.clickPrompt('Pay costs first');
            expect(this.player1).not.toBeAbleToSelectRing('fire');
            expect(this.player1).toBeAbleToSelectRing('void');
            this.player1.clickRing('void');
            this.player1.clickCard(this.challenger);
            this.player1.clickPrompt('Honor this character');
            expect(this.game.rings.fire.fate).toBe(fireFate);
            expect(this.game.rings.void.fate).toBe(voidFate + 1);
            expect(this.challenger.isHonored).toBe(true);
        });

        it('Yokuni (copying Master Alchemist)', function() {
            this.player1.clickCard(this.twinSoul1);
            this.player1.clickCard(this.alchemist);
            this.player1.clickPrompt('Void');

            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                ring: 'air',
                attackers: [this.alchemist],
                defenders: [this.challenger]
            });

            this.player2.clickCard(this.yokuni);
            this.player2.clickCard(this.alchemist);
            let fireFate = this.game.rings.fire.fate;
            let voidFate = this.game.rings.void.fate;
            this.player1.clickCard(this.alchemist);
            this.player1.clickPrompt('Pay costs first');
            expect(this.player1).not.toBeAbleToSelectRing('fire');
            expect(this.player1).toBeAbleToSelectRing('void');
            this.player1.clickRing('void');
            this.player1.clickCard(this.challenger);
            this.player1.clickPrompt('Honor this character');
            expect(this.game.rings.fire.fate).toBe(fireFate);
            expect(this.game.rings.void.fate).toBe(voidFate + 1);
            expect(this.challenger.isHonored).toBe(true);

            this.player2.clickCard(this.yokuni);
            this.player2.clickPrompt('Pay costs first');
            expect(this.player2).not.toBeAbleToSelectRing('fire');
            expect(this.player2).toBeAbleToSelectRing('void');
            this.player2.clickRing('void');
            this.player2.clickCard(this.yokuni);
            this.player2.clickPrompt('Honor this character');
            expect(this.game.rings.fire.fate).toBe(fireFate);
            expect(this.game.rings.void.fate).toBe(voidFate + 2);
            expect(this.yokuni.isHonored).toBe(true);
        });

        it('should prompt you to pick which element if there are two - province and effect', function() {
            this.player1.clickCard(this.twinSoul1);
            expect(this.player1).toHavePrompt('Choose an element to replace');
            this.player1.clickCard(this.reward);
            expect(this.player1).toHavePrompt('Which element do you wish to select?');
            expect(this.player1).toHavePromptButton('The Province\'s Element (fire)');
            expect(this.player1).toHavePromptButton('Ability - Province Element (fire)');
            this.player1.clickPrompt('The Province\'s Element (fire)');
            expect(this.reward.isElement('fire')).toBe(true);
            expect(this.player1).toHavePrompt('Choose the new element');
            expect(this.player1).toHavePromptButton('Air');
            expect(this.player1).toHavePromptButton('Earth');
            expect(this.player1).not.toHavePromptButton('Fire');
            expect(this.player1).toHavePromptButton('Void');
            expect(this.player1).toHavePromptButton('Water');
            this.player1.clickPrompt('Void');
            expect(this.reward.isElement('fire')).toBe(false);
            expect(this.reward.isElement('void')).toBe(true);
        });

        it('should prompt you to pick which element if there are two - multiple province elements', function() {
            this.player1.clickCard(this.twinSoul1);
            expect(this.player1).toHavePrompt('Choose an element to replace');
            this.player1.clickCard(this.tsuma);
            expect(this.player1).toHavePrompt('Which element do you wish to select?');
            expect(this.player1).toHavePromptButton('The Province\'s Element (air)');
            expect(this.player1).toHavePromptButton('The Province\'s Element (fire)');
            this.player1.clickPrompt('The Province\'s Element (fire)');
            expect(this.tsuma.isElement('fire')).toBe(true);
            expect(this.player1).toHavePrompt('Choose the new element');
            expect(this.player1).toHavePromptButton('Air');
            expect(this.player1).toHavePromptButton('Earth');
            expect(this.player1).not.toHavePromptButton('Fire');
            expect(this.player1).toHavePromptButton('Void');
            expect(this.player1).toHavePromptButton('Water');
            this.player1.clickPrompt('Air');
            expect(this.tsuma.isElement('fire')).toBe(false);
            expect(this.tsuma.isElement('air')).toBe(true);
        });

        it('triggered abilities that care about province elements', function() {
            this.noMoreActions();
            this.player1.passConflict();
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                ring: 'air',
                province: this.tsuma,
                attackers: [this.challenger],
                defenders: [this.alchemist]
            });

            this.player1.clickCard(this.reward);
            expect(this.player1).toHavePrompt('Honor\'s Reward');
            this.player1.clickPrompt('Cancel');
            this.player1.clickCard(this.twinSoul1);
            this.player1.clickCard(this.tsuma);
            this.player1.clickPrompt('The Province\'s Element (fire)');
            this.player1.clickPrompt('Void');

            this.player2.pass();
            this.player1.clickCard(this.reward);
            expect(this.player1).not.toHavePrompt('Honor\'s Reward');
            expect(this.player1).toHavePrompt('Conflict Action Window');
        });

        it('Constant Abilities', function() {
            this.player2.claimRing('void');
            expect(this.student.getPoliticalSkill()).toBe(2);
            this.player1.clickCard(this.twinSoul1);
            this.player1.clickCard(this.student);
            this.player1.clickPrompt('Claimed Ring (air)');
            this.player1.clickPrompt('Void');
            expect(this.student.getPoliticalSkill()).toBe(4);
        });

        it('Two Twin Soul Temples', function() {
            this.player2.claimRing('void');
            expect(this.student.getPoliticalSkill()).toBe(2);
            this.player1.clickCard(this.twinSoul1);
            this.player1.clickCard(this.student);
            this.player1.clickPrompt('Claimed Ring (air)');
            this.player1.clickPrompt('Void');
            expect(this.twinSoul1.bowed).toBe(true);
            expect(this.student.getPoliticalSkill()).toBe(4);
            this.player2.clickCard(this.twinSoul2);
            this.player2.clickCard(this.student);
            this.player2.clickPrompt('Claimed Ring (void)');
            this.player2.clickPrompt('Earth');
            expect(this.student.getPoliticalSkill()).toBe(2);
        });
    });
});
