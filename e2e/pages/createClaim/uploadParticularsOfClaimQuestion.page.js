const { I } = inject();

module.exports = {

  fields: {
    uploadQuestion: {
      id: '#uploadParticularsOfClaim',
      options: {
        yes: 'Yes',
        no: 'No'
      }
    },
  },

  async chooseIfUploadParticularsOfClaim(uploadParticularsOfClaimOption) {
    if (!this.fields.uploadQuestion.options.hasOwnProperty(uploadParticularsOfClaimOption)) {
      throw new Error(`Respondent represented option: ${uploadParticularsOfClaimOption} does not exist`);
    }
    I.waitForElement(this.fields.uploadQuestion.id);
    await within(this.fields.uploadQuestion.id, () => {
      I.click(this.fields.uploadQuestion.options[uploadParticularsOfClaimOption]);
    });
    await I.clickContinue();
  },
};

