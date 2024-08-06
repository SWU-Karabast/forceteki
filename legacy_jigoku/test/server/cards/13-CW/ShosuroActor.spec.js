describe('Shosuro Actor - Triggering Conditions & Targeting Restrictions', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['shosuro-actor', 'bayushi-collector']
                },
                player2: {
                    inPlay: ['doji-whisperer', 'doji-challenger', 'kakita-yoshi']
                }
            });

            this.actor = this.player1.findCardByName('shosuro-actor');
            this.collector = this.player1.findCardByName('bayushi-collector');
            this.yoshi = this.player2.findCardByName('kakita-yoshi');
            this.dojiWhisperer = this.player2.findCardByName('doji-whisperer');
            this.challenger = this.player2.findCardByName('doji-challenger');
        });

        it('should not work outside of conflicts', function() {
            expect(this.player1).toHavePrompt('Action Window');
            this.player1.clickCard(this.actor);
            expect(this.player1).toHavePrompt('Action Window');
        });

        it('should allow you to choose a non-unique character controlled by your opponent', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.actor],
                defenders: [this.dojiWhisperer],
                type: 'military'
            });

            this.player2.pass();
            this.player1.clickCard(this.actor);
            expect(this.player1).toHavePrompt('Choose a character');
            expect(this.player1).not.toBeAbleToSelect(this.actor);
            expect(this.player1).not.toBeAbleToSelect(this.collector);
            expect(this.player1).toBeAbleToSelect(this.dojiWhisperer);
            expect(this.player1).toBeAbleToSelect(this.challenger);
            expect(this.player1).not.toBeAbleToSelect(this.yoshi);
        });

        it('should not work if not participating', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.collector],
                defenders: [this.dojiWhisperer],
                type: 'military'
            });

            this.player2.pass();
            expect(this.player1).toHavePrompt('Conflict Action Window');
            this.player1.clickCard(this.actor);
            expect(this.player1).toHavePrompt('Conflict Action Window');
        });

        it('should not work if no opponent characters are valid', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.actor],
                defenders: [],
                type: 'military'
            });

            this.player2.moveCard(this.dojiWhisperer, 'dynasty discard pile');
            this.player2.moveCard(this.challenger, 'dynasty discard pile');

            this.player2.pass();
            expect(this.player1).toHavePrompt('Conflict Action Window');
            this.player1.clickCard(this.actor);
            expect(this.player1).toHavePrompt('Conflict Action Window');
        });
    });
});

describe('Shosuro Actor - Copying Business', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['shosuro-actor'],
                    hand: ['way-of-the-scorpion', 'fine-katana', 'way-of-the-dragon'],
                    dynastyDiscard: ['shosuro-actress']
                },
                player2: {
                    hand: ['assassination'],
                    inPlay: ['doomed-shugenja', 'kitsuki-investigator', 'kitsu-spiritcaller', 'implacable-magistrate', 'akodo-gunso', 'niten-master', 'ikoma-ujiaki', 'matsu-berserker']
                }
            });

            this.actor = this.player1.findCardByName('shosuro-actor');
            this.actress = this.player1.findCardByName('shosuro-actress');
            this.kitsuSpiritcaller = this.player2.findCardByName('kitsu-spiritcaller');
            this.implacableMagistrate = this.player2.findCardByName('implacable-magistrate');
            this.akodoGunso = this.player2.findCardByName('akodo-gunso');
            this.nitenMaster = this.player2.findCardByName('niten-master');
            this.ikomaUjiaki = this.player2.findCardByName('ikoma-ujiaki');
            this.matsuBerserker = this.player2.findCardByName('matsu-berserker');
            this.doomedShugenja = this.player2.findCardByName('doomed-shugenja');
            this.dragon = this.player1.findCardByName('way-of-the-dragon');
            this.player1.playAttachment(this.dragon, this.actor);

            this.noMoreActions();
            this.initiateConflict({
                type: 'political',
                attackers: [this.actor],
                defenders: [this.doomedShugenja]
            });
            this.player2.pass();
        });

        it('should copy all attributes (except uniqueness) of the chosen card', function() {
            this.player1.clickCard(this.actor);
            expect(this.player1).toHavePrompt('Choose a character');
            expect(this.player1).toBeAbleToSelect(this.kitsuSpiritcaller);
            expect(this.player1).toBeAbleToSelect(this.implacableMagistrate);
            expect(this.player1).toBeAbleToSelect(this.akodoGunso);
            expect(this.player1).toBeAbleToSelect(this.nitenMaster);
            expect(this.player1).not.toBeAbleToSelect(this.ikomaUjiaki);
            this.player1.clickCard(this.kitsuSpiritcaller);
            expect(this.player2).toHavePrompt('Conflict Action Window');
            expect(this.actor.name).toBe(this.kitsuSpiritcaller.name);
            expect(this.actor.getCost()).toBe(this.kitsuSpiritcaller.getCost());
            expect(this.actor.getBaseMilitarySkill()).toBe(this.kitsuSpiritcaller.printedMilitarySkill);
            expect(this.actor.getBasePoliticalSkill()).toBe(this.kitsuSpiritcaller.printedPoliticalSkill);
            expect(this.actor.getTraits()).toContain('shugenja');
            expect(this.actor.getTraits()).toContain('water');
        });

        it('should expire at the end of the conflict', function() {
            this.player1.clickCard(this.actor);
            this.player1.clickCard(this.kitsuSpiritcaller);
            this.noMoreActions();
            this.player1.clickPrompt('Don\'t Resolve');
            expect(this.player1).toHavePrompt('Action Window');
            expect(this.actor.name).toBe(this.actor.printedName);
            expect(this.actor.getCost()).toBe(this.actor.printedCost);
            expect(this.actor.getBaseMilitarySkill()).toBe(this.actor.printedMilitarySkill);
            expect(this.actor.getBasePoliticalSkill()).toBe(this.actor.printedPoliticalSkill);
            expect(this.actor.getTraits()).toContain('actor');
            expect(this.actor.getTraits()).toContain('shinobi');
        });

        it('should remove any action abilities, and copy them from the target', function() {
            this.player1.clickCard(this.actor);
            this.player1.clickCard(this.kitsuSpiritcaller);
            this.player2.pass();
            this.player1.clickCard(this.actor);
            expect(this.player1).toHavePrompt('Kitsu Spiritcaller');
            expect(this.player1).toBeAbleToSelect('shosuro-actress');
            this.shosuroActress = this.player1.clickCard('shosuro-actress');
            expect(this.shosuroActress.location).toBe('play area');
        });

        it('should copy clan alignment from the target', function() {
            this.player1.clickCard(this.actor);
            this.player1.clickCard(this.nitenMaster);
            this.player2.pass();
            this.player1.clickCard('way-of-the-scorpion');
            expect(this.player1).toHavePrompt('Way of the Scorpion');
            expect(this.player1).toBeAbleToSelect(this.actor);
        });

        it('should copy reactions from the target', function() {
            this.player1.clickCard(this.actor);
            this.player1.clickCard(this.nitenMaster);
            this.actor.bowed = true;
            this.player2.pass();
            this.player1.playAttachment('fine-katana', this.actor);
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.actor);
            this.player1.clickCard(this.actor);
            expect(this.actor.bowed).toBe(false);
        });

        it('should copy dash skills', function() {
            this.player1.clickCard(this.actor);
            this.player1.clickCard(this.matsuBerserker);
            expect(this.actor.hasDash('political')).toBe(true);
            expect(this.actor.bowed).toBe(true);
            expect(this.actor.isParticipating()).toBe(false);
        });
    });
});
