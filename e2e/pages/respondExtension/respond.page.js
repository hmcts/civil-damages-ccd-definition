const {I} = inject();

module.exports = {

  fields: {
    extensionAccepted: {
      id: '#respondentSolicitor1claimResponseExtensionAccepted',
      options: {
        yes: 'Yes',
        no: 'No'
      }
    }
  },

  async selectDoNotAccept() {
    I.waitForElement(this.fields.extensionAccepted.id);
    await within(this.fields.extensionAccepted.id, () => {
      I.click(this.fields.extensionAccepted.options.no);
    });

    await I.clickContinue();
  }
};

