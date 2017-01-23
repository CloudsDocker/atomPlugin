'use babel';

import AtomDateTimesView from './atom-date-times-view';
import { CompositeDisposable } from 'atom';

export default {

  atomDateTimesView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    this.atomDateTimesView = new AtomDateTimesView(state.atomDateTimesViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.atomDateTimesView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'atom-date-times:getNowInLocaleStyle': () => this.getNowInLocaleStyle(),
      'atom-date-times:getNowInNYT': () => this.getNowInNYT()
    }));
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.atomDateTimesView.destroy();
  },

  serialize() {
    return {
      atomDateTimesViewState: this.atomDateTimesView.serialize()
    };
  },

  getNowInLocaleStyle() {
    console.log('AtomDateTimes was toggled!');
    let editor=atom.workspace.getActiveTextEditor()
    editor.insertText(new Date().toLocaleString())
  },

  getNowInNYT() {
    let editor=atom.workspace.getActiveTextEditor()
    editor.insertText(this.getNewDate(-5)+" (NewYork Time)")
  },

  getNewDate(offset){
    var dtNow = new Date();
    var dtUTC = dtNow.getTime() + dtNow.getTimezoneOffset() * 60000; // get local timezone offset and convert to utc time
    // getTimezoneOffset returned value in 'minutes', so multiply 60*1000 , e.g. to milliseconds
    var newDate = new Date(dtUTC + (3600000*(offset))); // get new date
    return outStr=newDate.getFullYear() + "-" + ("0"+(newDate.getMonth()+1)).slice(-2) + "-" + ("0" + (newDate.getDate())).slice(-2)  + " " + ("0" + newDate.getHours()).slice(-2) + ":" + ("0" + newDate.getMinutes()).slice(-2);
  }

};
