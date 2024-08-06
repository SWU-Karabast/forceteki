describe('Retribution', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['doji-diplomat', 'shosuro-sadako', 'daidoji-kageyu'],
                    hand: ['peacemaker-s-blade', 'pacifism']
                },
                player2: {
                    inPlay: ['daidoji-uji', 'doji-challenger', 'adept-of-shadows', 'bayushi-liar', 'battle-maiden-recruit'],
                    hand: ['retribution-']
                }
            });

            this.sadako = this.player1.findCardByName('shosuro-sadako');
            this.diplomat = this.player1.findCardByName('doji-diplomat');
            this.kageyu = this.player1.findCardByName('daidoji-kageyu');
            this.blade = this.player1.findCardByName('peacemaker-s-blade');
            this.pacifism = this.player1.findCardByName('pacifism');

            this.sd = this.player1.findCardByName('shameful-display', 'province 1');
            this.sd2 = this.player1.findCardByName('shameful-display', 'province 2');

            this.uji = this.player2.findCardByName('daidoji-uji');
            this.challenger = this.player2.findCardByName('doji-challenger');
            this.adept = this.player2.findCardByName('adept-of-shadows');
            this.retribution = this.player2.findCardByName('retribution-');
            this.liar = this.player2.findCardByName('bayushi-liar');
            this.recruit = this.player2.findCardByName('battle-maiden-recruit');

            this.uji.fate = 2;
            this.uji.honor();
            this.kageyu.honor();
        });

        it('should react if you lose a conflict, after resolution and let you pick an honored character or a battle maiden eligible to attack', function () {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.diplomat],
                defenders: [],
                type: 'political',
                ring: 'void'
            });

            this.noMoreActions();
            expect(this.player1).toHavePrompt('Void ring');
            this.player1.clickCard(this.uji);
            expect(this.uji.fate).toBe(1);

            expect(this.diplomat.bowed).toBe(true);
            expect(this.player2).toHavePrompt('Triggered Abilities');
            expect(this.player2).toBeAbleToSelect(this.retribution);

            this.player2.clickCard(this.retribution);
            expect(this.player2).toBeAbleToSelect(this.uji);
            expect(this.player2).toBeAbleToSelect(this.recruit);
            expect(this.player2).not.toBeAbleToSelect(this.challenger);
            expect(this.player2).not.toBeAbleToSelect(this.adept);
            expect(this.player2).not.toBeAbleToSelect(this.diplomat);
            expect(this.player2).not.toBeAbleToSelect(this.sadako);
            expect(this.player2).not.toBeAbleToSelect(this.kageyu);
        });

        it('should let you pick an honored character eligible to attack (not eligible - bowed)', function () {
            this.challenger.honor();
            this.challenger.bow();
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.diplomat],
                defenders: [],
                type: 'political',
                ring: 'void'
            });

            this.noMoreActions();
            this.player1.clickCard(this.uji);
            expect(this.player2).toBeAbleToSelect(this.retribution);

            this.player2.clickCard(this.retribution);
            expect(this.player2).toBeAbleToSelect(this.uji);
            expect(this.player2).not.toBeAbleToSelect(this.challenger);
        });

        it('should let you pick an honored character eligible to attack (not eligible - cannot attack)', function () {
            this.player1.playAttachment(this.blade, this.challenger);
            this.challenger.honor();
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.diplomat],
                defenders: [],
                type: 'political',
                ring: 'void'
            });

            this.noMoreActions();
            this.player1.clickCard(this.uji);
            expect(this.player2).toBeAbleToSelect(this.retribution);

            this.player2.clickCard(this.retribution);
            expect(this.player2).toBeAbleToSelect(this.uji);
            expect(this.player2).not.toBeAbleToSelect(this.challenger);
        });

        it('should let you pick an honored character eligible to attack (not eligible - cannot participate)', function () {
            this.player1.playAttachment(this.pacifism, this.challenger);
            this.challenger.honor();
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.diplomat],
                defenders: [],
                type: 'political',
                ring: 'void'
            });

            this.noMoreActions();
            this.player1.clickCard(this.uji);
            expect(this.player2).toBeAbleToSelect(this.retribution);

            this.player2.clickCard(this.retribution);
            expect(this.player2).toBeAbleToSelect(this.uji);
            expect(this.player2).not.toBeAbleToSelect(this.challenger);
        });

        it('should let you pick an honored character eligible to attack (not eligible - dash mil)', function () {
            this.liar.honor();
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.diplomat],
                defenders: [],
                type: 'political',
                ring: 'void'
            });

            this.noMoreActions();
            this.player1.clickCard(this.uji);
            expect(this.player2).toBeAbleToSelect(this.retribution);

            this.player2.clickCard(this.retribution);
            expect(this.player2).toBeAbleToSelect(this.uji);
            expect(this.player2).not.toBeAbleToSelect(this.liar);
        });

        it('should not react if you have no eligible characters', function () {
            this.recruit.bow();
            this.player1.playAttachment(this.pacifism, this.challenger);
            this.player2.pass();
            this.player1.playAttachment(this.blade, this.uji);
            this.challenger.honor();
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.diplomat],
                defenders: [],
                type: 'political',
                ring: 'void'
            });

            this.noMoreActions();
            this.player1.clickCard(this.uji);
            expect(this.player1).toHavePrompt('Action Window');
        });

        it('should not react if you have fewer broken provinces', function () {
            this.sd.isBroken = true;
            this.sd2.isBroken = true;

            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.diplomat],
                defenders: [],
                type: 'political',
                ring: 'void'
            });

            this.noMoreActions();
            this.player1.clickCard(this.uji);

            expect(this.player2).not.toHavePrompt('Triggered Abilities');
            expect(this.player2).not.toBeAbleToSelect(this.retribution);
        });

        it('should immediately declare a conflict and force you to attack alone', function () {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.diplomat],
                defenders: [],
                type: 'political',
                ring: 'void'
            });

            this.noMoreActions();
            this.player1.clickCard(this.uji);
            this.player2.clickCard(this.retribution);
            this.player2.clickCard(this.uji);

            expect(this.getChatLogs(10)).toContain('player2 plays Retribution! to declare a military conflict, attacking with Daidoji Uji');
            expect(this.player2).toHavePrompt('Choose province to attack');
            expect(this.player2).not.toHavePromptButton('Pass Conflict');

            expect(this.player2.player.getConflictOpportunities()).toBe(3);
            expect(this.player2.player.getRemainingConflictOpportunitiesForType('military')).toBe(2);

            this.player2.clickRing('earth');
            expect(this.game.rings['earth'].conflictType).toBe('military');
            this.player2.clickRing('earth');
            expect(this.game.rings['earth'].conflictType).toBe('military');

            expect(this.game.currentConflict.attackers).toContain(this.uji);
            this.player2.clickCard(this.uji);
            expect(this.game.currentConflict.attackers).toContain(this.uji);
            this.player2.clickCard(this.challenger);
            expect(this.game.currentConflict.attackers).not.toContain(this.challenger);

            this.player2.clickCard(this.sd);
            this.player2.clickPrompt('Initiate Conflict');

            this.player1.clickCard(this.kageyu);
            expect(this.game.currentConflict.defenders).toContain(this.kageyu);
            this.player1.clickCard(this.sadako);
            expect(this.game.currentConflict.defenders).toContain(this.sadako);
            this.player1.clickCard(this.diplomat);
            expect(this.game.currentConflict.defenders).not.toContain(this.diplomat);

            this.player1.clickPrompt('Done');
        });

        it('should not mess up conflict declaration on subsequent conflicts', function () {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.diplomat],
                defenders: [],
                type: 'political',
                ring: 'void'
            });

            this.noMoreActions();
            this.player1.clickCard(this.uji);
            this.player2.clickCard(this.retribution);
            this.player2.clickCard(this.uji);

            this.player2.clickRing('earth');
            this.player2.clickCard(this.sd);
            this.player2.clickPrompt('Initiate Conflict');

            this.player1.clickCard(this.kageyu);
            this.player1.clickPrompt('Done');

            this.uji.bow();
            this.noMoreActions();

            this.uji.ready();

            this.noMoreActions(); // players2's conflict opportunity!  Back to back
            this.initiateConflict({
                attackers: [this.challenger, this.adept],
                defenders: [],
                type: 'military',
                ring: 'air'
            });

            expect(this.game.currentConflict.attackers).not.toContain(this.uji);
            expect(this.game.currentConflict.attackers).toContain(this.challenger);
            expect(this.game.currentConflict.attackers).toContain(this.adept);
        });
    });
});
