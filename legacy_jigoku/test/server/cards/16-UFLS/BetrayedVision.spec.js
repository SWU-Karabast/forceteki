describe('Betrayed Vision', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['bayushi-liar', 'bayushi-kachiko', 'young-rumormonger', 'alibi-artist', 'shosuro-sadako', 'sinister-soshi'],
                    honor: 5,
                    hand: ['betrayed-vision', 'way-of-the-scorpion', 'fine-katana', 'bayushi-kachiko', 'assassination'],
                    dynastyDiscard: ['shosuro-actress']
                },
                player2: {
                    hand: ['assassination'],
                    inPlay: ['doomed-shugenja', 'kitsuki-investigator', 'kitsu-spiritcaller', 'implacable-magistrate', 'akodo-gunso', 'niten-master', 'ikoma-ujiaki', 'matsu-berserker']
                }
            });

            this.soshi = this.player1.findCardByName('sinister-soshi');
            this.bayushiLiar = this.player1.findCardByName('bayushi-liar');
            this.bayushiKachiko = this.player1.findCardByName('bayushi-kachiko');
            this.youngRumormonger = this.player1.findCardByName('young-rumormonger');
            this.alibiArtist = this.player1.findCardByName('alibi-artist');
            this.shosuroSadako = this.player1.findCardByName('shosuro-sadako');
            this.kitsuSpiritcaller = this.player2.findCardByName('kitsu-spiritcaller');
            this.implacableMagistrate = this.player2.findCardByName('implacable-magistrate');
            this.akodoGunso = this.player2.findCardByName('akodo-gunso');
            this.nitenMaster = this.player2.findCardByName('niten-master');
            this.ikomaUjiaki = this.player2.findCardByName('ikoma-ujiaki');
            this.matsuBerserker = this.player2.findCardByName('matsu-berserker');
            this.doomedShugenja = this.player2.findCardByName('doomed-shugenja');

            this.vision = this.player1.findCardByName('betrayed-vision');
            this.assassination = this.player1.findCardByName('assassination');

            this.shosuroSadako.dishonor();
        });

        it('should copy all attributes (except uniqueness) of the chosen card', function() {
            this.noMoreActions();
            this.initiateConflict({
                type: 'political',
                attackers: ['bayushi-liar', 'bayushi-kachiko', 'young-rumormonger', 'shosuro-sadako'],
                defenders: [this.doomedShugenja, this.ikomaUjiaki]
            });
            this.player2.pass();
            this.player1.clickCard(this.vision);
            expect(this.player1).toHavePrompt('Choose a character to copy');
            expect(this.player1).toBeAbleToSelect(this.kitsuSpiritcaller);
            expect(this.player1).toBeAbleToSelect(this.implacableMagistrate);
            expect(this.player1).toBeAbleToSelect(this.akodoGunso);
            expect(this.player1).toBeAbleToSelect(this.nitenMaster);
            expect(this.player1).not.toBeAbleToSelect(this.ikomaUjiaki);
            expect(this.player1).toBeAbleToSelect(this.bayushiLiar);
            expect(this.player1).not.toBeAbleToSelect(this.bayushiKachiko);
            expect(this.player1).toBeAbleToSelect(this.youngRumormonger);
            expect(this.player1).not.toBeAbleToSelect(this.shosuroSadako);
            expect(this.player1).toBeAbleToSelect(this.alibiArtist);
            this.player1.clickCard(this.kitsuSpiritcaller);
            expect(this.player1).toHavePrompt('Choose a character to turn into the copy');
            expect(this.player1).not.toBeAbleToSelect(this.kitsuSpiritcaller);
            expect(this.player1).not.toBeAbleToSelect(this.implacableMagistrate);
            expect(this.player1).not.toBeAbleToSelect(this.akodoGunso);
            expect(this.player1).not.toBeAbleToSelect(this.nitenMaster);
            expect(this.player1).toBeAbleToSelect(this.ikomaUjiaki);
            expect(this.player1).not.toBeAbleToSelect(this.bayushiLiar);
            expect(this.player1).not.toBeAbleToSelect(this.bayushiKachiko);
            expect(this.player1).not.toBeAbleToSelect(this.youngRumormonger);
            expect(this.player1).not.toBeAbleToSelect(this.shosuroSadako);
            expect(this.player1).not.toBeAbleToSelect(this.alibiArtist);
            expect(this.player1).toBeAbleToSelect(this.doomedShugenja);
            this.player1.clickCard(this.ikomaUjiaki);
            expect(this.player2).toHavePrompt('Conflict Action Window');
            expect(this.ikomaUjiaki.name).toBe(this.kitsuSpiritcaller.name);
            expect(this.ikomaUjiaki.getCost()).toBe(this.kitsuSpiritcaller.getCost());
            expect(this.ikomaUjiaki.getBaseMilitarySkill()).toBe(this.kitsuSpiritcaller.printedMilitarySkill);
            expect(this.ikomaUjiaki.getPoliticalSkill()).toBe(this.kitsuSpiritcaller.printedPoliticalSkill);
            expect(this.ikomaUjiaki.getTraits()).toContain('shugenja');
            expect(this.ikomaUjiaki.getTraits()).toContain('water');
            expect(this.ikomaUjiaki.isUnique()).toBe(true);

            expect(this.getChatLogs(5)).toContain('player1 plays Betrayed Vision to make Ikoma Ujiaki into a copy of Kitsu Spiritcaller');
        });

        it('should expire at the end of the conflict', function() {
            this.noMoreActions();
            this.initiateConflict({
                type: 'political',
                attackers: ['bayushi-liar', 'bayushi-kachiko', 'young-rumormonger', 'shosuro-sadako'],
                defenders: [this.doomedShugenja, this.ikomaUjiaki]
            });
            this.player2.pass();
            this.player1.clickCard(this.vision);
            this.player1.clickCard(this.kitsuSpiritcaller);
            this.player1.clickCard(this.ikomaUjiaki);
            this.noMoreActions();
            this.player1.clickPrompt('No');
            this.player1.clickPrompt('Don\'t Resolve');
            expect(this.player1).toHavePrompt('Action Window');
            expect(this.ikomaUjiaki.name).toBe(this.ikomaUjiaki.printedName);
            expect(this.ikomaUjiaki.getCost()).toBe(this.ikomaUjiaki.printedCost);
            expect(this.ikomaUjiaki.getBaseMilitarySkill()).toBe(this.ikomaUjiaki.printedMilitarySkill);
            expect(this.ikomaUjiaki.getPoliticalSkill()).toBe(this.ikomaUjiaki.printedPoliticalSkill);
            expect(this.ikomaUjiaki.getTraits()).toContain('courtier');
            expect(this.ikomaUjiaki.getTraits()).not.toContain('shugenja');
            expect(this.ikomaUjiaki.isUnique()).toBe(true);
        });

        it('should not let you select something to copy if it would be forced to turn into a copy of itself', function() {
            this.noMoreActions();
            this.initiateConflict({
                type: 'political',
                attackers: ['bayushi-liar', 'bayushi-kachiko', 'young-rumormonger', 'shosuro-sadako'],
                defenders: [this.doomedShugenja]
            });
            this.player2.pass();
            this.player1.clickCard(this.vision);
            expect(this.player1).toHavePrompt('Choose a character to copy');
            expect(this.player1).not.toBeAbleToSelect(this.doomedShugenja);
        });

        it('should not let you turn something into a copy of itself', function() {
            this.noMoreActions();
            this.initiateConflict({
                type: 'political',
                attackers: ['bayushi-liar', 'bayushi-kachiko', 'young-rumormonger', 'shosuro-sadako'],
                defenders: [this.doomedShugenja, this.ikomaUjiaki]
            });
            this.player2.pass();
            this.player1.clickCard(this.vision);
            expect(this.player1).toHavePrompt('Choose a character to copy');
            expect(this.player1).toBeAbleToSelect(this.doomedShugenja);
            this.player1.clickCard(this.doomedShugenja);
            expect(this.player1).toHavePrompt('Choose a character to turn into the copy');
            expect(this.player1).not.toBeAbleToSelect(this.doomedShugenja);
            expect(this.player1).toBeAbleToSelect(this.ikomaUjiaki);
        });

        it('should not be playable without a shugenja', function() {
            this.player1.moveCard(this.soshi, 'dynasty discard pile');
            this.noMoreActions();
            this.initiateConflict({
                type: 'political',
                attackers: ['bayushi-liar', 'bayushi-kachiko', 'young-rumormonger', 'shosuro-sadako'],
                defenders: [this.doomedShugenja, this.ikomaUjiaki]
            });
            this.player2.pass();
            this.player1.clickCard(this.vision);
            expect(this.player1).toHavePrompt('Conflict Action Window');
        });

        it('should work with dashes and cost (should not copy cost as virtually all abilities refer to printed cost)', function() {
            this.noMoreActions();
            this.initiateConflict({
                type: 'political',
                attackers: ['bayushi-liar', 'bayushi-kachiko', 'young-rumormonger', 'shosuro-sadako'],
                defenders: [this.doomedShugenja, this.ikomaUjiaki]
            });
            this.player2.pass();
            this.player1.clickCard(this.vision);
            expect(this.player1).toHavePrompt('Choose a character to copy');
            this.player1.clickCard(this.soshi);
            expect(this.player1).toHavePrompt('Choose a character to turn into the copy');
            this.player1.clickCard(this.ikomaUjiaki);
            expect(this.ikomaUjiaki.isParticipating()).toBe(false);
            expect(this.ikomaUjiaki.bowed).toBe(true);

            expect(this.getChatLogs(5)).toContain('Sinister Soshi cannot participate in the conflict any more and is sent home bowed');
            this.player2.pass();
            this.player1.clickCard(this.assassination);
            expect(this.player1).not.toBeAbleToSelect(this.ikomaUjiaki);
        });
    });
});
